"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import CartPanel from "@/components/CartPanel";
import ProductModal from "@/components/ProductModal";
import ShopGrid from "@/components/ShopGrid";
import { outfits } from "@/data/outfits";
import { products } from "@/data/products";
import { useStore } from "@/store/useStore";

const FashionScene = dynamic(() => import("@/components/FashionScene"), { ssr: false });

function getBeatLabel(progress: number) {
  const total = outfits.length;
  const seg = 1 / (total - 1);
  // global timeline 0-1
  if (progress < 0.04) return { label: "INTRO", pct: "0%", desc: "MODEL STANDS — DARK STUDIO" };
  if (progress < 0.09) return { label: "PUSH-IN", pct: "10%", desc: "CAMERA APPROACHES" };
  // find segment
  for (let i = 0; i < total - 1; i++) {
    const start = i * seg;
    const tp = (progress - start) / seg;
    if (tp < 0 || tp > 1) continue;
    if (tp < 0.10) return { label: `HAND — LOOK 0${i + 1}→0${i + 2}`, pct: `${Math.round(start * 100 + tp * 10)}%`, desc: "HAND MOVES TO COLLAR" };
    if (tp < 0.18) return { label: "OPEN", pct: `${Math.round((start + tp) * 100)}%`, desc: "BUTTONS OPEN • FABRIC STRETCHES" };
    if (tp < 0.32) return { label: "REMOVAL", pct: `${Math.round((start + tp) * 100)}%`, desc: "SLEEVE SLIDES • SHIRT LEAVES BODY" };
    if (tp < 0.44) return { label: "FABRIC MASK", pct: `${Math.round((start + tp) * 100)}%`, desc: "GARMENT FILLS FRAME → TRANSITION" };
    if (tp < 0.58) return { label: "WEAR", pct: `${Math.round((start + tp) * 100)}%`, desc: "NEW SHIRT • ARMS INTO SLEEVES" };
    if (tp < 0.72) return { label: "SETTLE", pct: `${Math.round((start + tp) * 100)}%`, desc: "COLLAR FORMS • CUFF ADJUST" };
    if (tp < 0.88) return { label: "PRODUCT REVEAL", pct: `${Math.round((start + tp) * 100)}%`, desc: "HOTSPOTS • SHOP THIS LOOK" };
    return { label: "HOLD", pct: `${Math.round((start + tp) * 100)}%`, desc: "PAUSE • ABSORB THE LOOK" };
  }
  if (progress > 0.92) return { label: "FINAL LOOK", pct: "92%", desc: "180° ORBIT • HERO LIGHT" };
  return { label: "SHOP", pct: "100%", desc: "ENTER COLLECTION" };
}

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [cursor, setCursor] = useState({ x: 0, y: 0, hover: false, label: "" });
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const cinematicRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const addToCart = useStore((s) => s.addToCart);
  const setProduct = useStore((s) => s.setProductOpen);

  useEffect(() => {
    const t1 = setTimeout(() => setLoading(false), 1700);
    const t2 = setTimeout(() => setShowLoader(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    let raf = 0;
    let target = 0;
    let current = 0;
    const onScroll = () => {
      if (!cinematicRef.current) return;
      const rect = cinematicRef.current.getBoundingClientRect();
      const total = cinematicRef.current.offsetHeight - window.innerHeight;
      target = Math.min(1, Math.max(0, -rect.top / total));
    };
    const loop = () => {
      current += (target - current) * 0.08;
      // snap if very close
      if (Math.abs(target - current) < 0.0005) current = target;
      setProgress(current);
      raf = requestAnimationFrame(loop);
    };
    onScroll();
    loop();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursor((c) => ({ ...c, x: e.clientX, y: e.clientY }));
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToProgress = (p: number) => {
    if (!cinematicRef.current) return;
    const total = cinematicRef.current.offsetHeight - window.innerHeight;
    const top = cinematicRef.current.offsetTop + p * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const sceneIdx = Math.min(outfits.length - 1, Math.floor(progress * outfits.length));
  const scaled = progress * (outfits.length - 1);
  const idxFloor = Math.floor(scaled);
  const curOutfit = outfits[Math.min(idxFloor, outfits.length - 1)];
  const beat = getBeatLabel(progress);

  const getSceneOpacity = (i: number) => {
    const center = i / (outfits.length - 1);
    const dist = Math.abs(progress - center);
    // more precise window: 0.19
    const w = i === 0 || i === outfits.length - 1 ? 0.20 : 0.18;
    const o = 1 - dist / w;
    return Math.max(0, Math.min(1, o));
  };
  const getSceneStyle = (i: number) => {
    const o = getSceneOpacity(i);
    const y = (0.5 - o) * 14;
    return { opacity: o, transform: `translateY(${y}px)`, pointerEvents: o > 0.5 ? "auto" as const : "none" as const, visibility: o > 0.02 ? "visible" as const : "hidden" as const };
  };

  // fabric mask peak detection for subtle UI synchronisation
  const totalSeg = outfits.length;
  let fabricPeak = 0;
  for (let i = 0; i < totalSeg - 1; i++) {
    const seg = 1 / (totalSeg - 1);
    const tp = Math.max(0, Math.min(1, (progress - i * seg) / seg));
    if (tp > 0.38 && tp < 0.60) fabricPeak = Math.max(fabricPeak, Math.sin(((tp - 0.38) / 0.22) * Math.PI));
  }
  const isRevealPhase = (() => {
    for (let i = 0; i < totalSeg - 1; i++) {
      const seg = 1 / (totalSeg - 1);
      const tp = Math.max(0, Math.min(1, (progress - i * seg) / seg));
      if (tp > 0.68 && tp < 0.90) return true;
    }
    return progress > 0.88 && progress < 0.98;
  })();

  // product mapping for outfit -> product (supports GLB replacement later)
  const outfitProductMap: Record<string, string> = {
    "shirt-01": "p-05", // WHITE SIGNATURE SHIRT
    "shirt-02": "p-06", // THE NIGHT SHIRT (silk)
    "jacket-03": "p-01", // BEIGE JACKET -> Signature Wool Jacket (camel)
    "suit-final": "p-04", // DARK SUIT -> Double-Face Overcoat
  };

  return (
    <div className="relative bg-[#08080a] selection:bg-[#c9b99a] selection:text-black">
      {/* custom cursor */}
      <div
        className="hidden lg:flex fixed top-0 left-0 z-[60] pointer-events-none mix-blend-difference items-center justify-center -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) scale(${cursor.hover ? 1 : 0.65})` }}
      >
        <div className={`rounded-full border border-white flex items-center justify-center transition-all duration-200 ${cursor.hover ? "w-[76px] h-[76px] bg-white text-black border-white" : "w-2.5 h-2.5 bg-white border-white"}`}>
          {cursor.hover && <span className="mono text-[10px] tracking-[0.14em] font-medium">{cursor.label}</span>}
        </div>
      </div>

      {showLoader && (
        <div className={`fixed inset-0 z-[100] bg-[#08080a] flex flex-col items-center justify-center transition-opacity duration-700 ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="flex flex-col items-center">
            <div className="mono text-[10px] tracking-[0.3em] text-white/40 mb-6">ATELIER NOIR — PARIS • MUMBAI</div>
            <div className="display text-[46px] md:text-[68px] leading-none tracking-tight">ATELIER</div>
            <div className="display text-[46px] md:text-[68px] leading-none tracking-tight -mt-2 font-light italic">NOIR</div>
            <div className="mt-8 w-[220px] h-px bg-white/10 overflow-hidden">
              <div className={`h-full bg-[#c9b99a] transition-all duration-[1700ms] ease-[cubic-bezier(0.85,0,0.15,1)] ${loading ? "w-[42%]" : "w-full"}`} />
            </div>
            <div className="mono text-[10px] text-white/30 mt-4 tracking-[0.2em]">CRAFTING THE FILM — PRELOADING GARMENTS</div>
            <div className="mono text-[10px] text-white/20 mt-2 tracking-widest flex gap-2">
              <span className={loading ? "text-white/60" : "text-[#c9b99a]"}>LOOK 01</span>
              <span>•</span>
              <span className={!loading ? "text-[#c9b99a]" : "text-white/20"}>LOOK 02</span>
              <span>•</span>
              <span className={!loading ? "text-[#c9b99a]" : "text-white/20"}>LOOK 03</span>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 mono text-[10px] text-white/20 tracking-widest">0{Math.round((loading ? 42 : 100))} — PLEASE WAIT</div>
        </div>
      )}

      <Navigation onShopClick={scrollToShop} />
      <CartPanel />
      <ProductModal />

      <div className="fixed inset-0 pointer-events-none opacity-[0.025] z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

      {/* CINEMATIC */}
      <div ref={cinematicRef} className="relative h-[600vh] bg-[#08080a]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <FashionScene progress={progress} />

          {/* top bar */}
          <div className="absolute top-[74px] inset-x-0 px-6 md:px-10 flex justify-between mono text-[10px] tracking-[0.14em] text-white/45 pointer-events-none z-20">
            <span className="hidden md:inline">A/W 2026 — SCROLL TO DIRECT</span>
            <span className="md:hidden">A/W 2026</span>
            <span className="hidden md:inline">PARIS — MUMBAI — MILANO</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#c9b99a] animate-pulse" /> LIVE RUNWAY</span>
          </div>

          {/* vertical timeline: 01 02 03 04 */}
          <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4 z-20">
            <div className="mono text-[10px] tracking-[0.2em] text-white/25 rotate-90 whitespace-nowrap">SCROLL TO DIRECT</div>
            <div className="w-px h-[160px] bg-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-[#c9b99a] transition-none" style={{ height: `${progress * 100}%` }} />
              {/* beat markers */}
              {[0.09, 0.22, 0.38, 0.54, 0.72, 0.88].map((p) => (
                <div key={p} className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/30" style={{ top: `${p * 100}%` }} />
              ))}
            </div>
            <div className="mono text-[10px] text-white/60">0{sceneIdx + 1} <span className="text-white/20">/</span> 04</div>
            <div className="flex flex-col gap-2">
              {outfits.map((o, i) => {
                const isActive = sceneIdx === i;
                const isPast = progress > (i + 0.5) / (outfits.length - 1);
                return (
                  <button
                    key={o.id}
                    onClick={() => scrollToProgress(i / (outfits.length - 1))}
                    className={`group flex items-center gap-2 mono text-[10px] tracking-widest transition-colors ${isActive ? "text-[#c9b99a]" : isPast ? "text-white/50" : "text-white/20 hover:text-white/40"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? "bg-[#c9b99a]" : "bg-white/20 group-hover:bg-white/40"}`} />
                    <span className="hidden xl:inline">0{i + 1}</span>
                  </button>
                );
              })}
            </div>
            <div className="mono text-[9px] tracking-[0.14em] text-white/20 text-center leading-tight">
              {beat.label}<br />
              <span className="text-white/40">{beat.pct}</span>
            </div>
          </div>

          {/* look switcher minimal */}
          <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-20">
            <div className="mono text-[10px] tracking-[0.2em] text-white/30 mb-1">CHAPTERS</div>
            {outfits.map((o, i) => (
              <button
                key={o.id}
                onClick={() => scrollToProgress(i / (outfits.length - 1))}
                className={`text-left mono text-[11px] tracking-[0.12em] border-l-2 pl-3 py-1 transition-colors ${sceneIdx === i ? "border-[#c9b99a] text-white" : "border-white/10 text-white/35 hover:text-white/60 hover:border-white/20"}`}
              >
                LOOK 0{i + 1}
                <span className="block mono text-[9px] tracking-[0.14em] text-white/30">{o.name.replace("THE ", "").slice(0, 14)}</span>
              </button>
            ))}
          </div>

          {/* bottom center beat indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/55 backdrop-blur-md border border-white/10 px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9b99a] animate-pulse" />
              <span className="mono text-[10px] tracking-[0.14em] text-white/80">{beat.label}</span>
              <span className="mono text-[10px] text-white/30">—</span>
              <span className="mono text-[10px] tracking-[0.12em] text-white/50">{beat.desc}</span>
              <span className="mono text-[10px] text-white/20 ml-2">{beat.pct}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: outfits.length - 1 }).map((_, i) => {
                const seg = 1 / (outfits.length - 1);
                const tp = Math.max(0, Math.min(1, (progress - i * seg) / seg));
                const isActiveSeg = tp > 0 && tp < 1;
                return (
                  <div key={i} className="h-0.5 w-12 bg-white/10 overflow-hidden">
                    <div className="h-full bg-[#c9b99a] transition-none" style={{ width: `${isActiveSeg ? tp * 100 : tp >= 1 ? 100 : 0}%` }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* current look meta left bottom */}
          <div className="absolute left-6 md:left-10 bottom-10 z-20 hidden md:block pointer-events-none">
            <div className="mono text-[10px] tracking-[0.2em] text-white/30">NOW WEARING</div>
            <div className="mono text-[12px] text-white mt-1 font-medium tracking-wide">{curOutfit.name}</div>
            <div className="mono text-[10px] text-white/45 mt-0.5">{curOutfit.material.split("•")[0]}</div>
            <div className="mono text-[10px] text-[#c9b99a] mt-1">{curOutfit.garment.description}</div>
          </div>

          {/* SCENE OVERLAYS */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* INTRO */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={getSceneStyle(0)}>
              <div className="pointer-events-auto">
                <div className="mono text-[10px] tracking-[0.28em] text-[#c9b99a] mb-6">ATELIER NOIR PRESENTS — A FILM YOU DIRECT</div>
                <h1 className="display text-[52px] md:text-[88px] lg:text-[108px] leading-[0.85] tracking-[-0.03em]">
                  THE WHITE<br />
                  <span className="font-light italic">SIGNATURE</span>
                </h1>
                <div className="mono text-[10px] md:text-[11px] tracking-[0.18em] text-white/55 mt-6 max-w-[560px] mx-auto leading-relaxed">
                  ONE BODY. ONE CONTINUOUS TAKE. WATCH THE FABRIC LEAVE — NOT FADE.
                  <br className="hidden md:block" /> SCROLL IS YOUR CAMERA. THE SHIRT IS THE TRANSITION.
                </div>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="mono text-[10px] tracking-[0.2em] text-white/35">SCROLL TO BEGIN — HAND MOVES AT 18%</div>
                  <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
                  <div className="w-6 h-10 rounded-full border border-white/15 flex justify-center pt-2">
                    <div className="w-1 h-1.5 bg-white/60 rounded-full animate-bounce" />
                  </div>
                </div>
                {/* micro timeline */}
                <div className="mt-10 hidden md:flex justify-center gap-2 mono text-[9px] tracking-[0.14em] text-white/25">
                  <span>HAND</span><span className="text-white/10">•</span><span>OPEN</span><span className="text-white/10">•</span><span>REMOVE</span><span className="text-white/10">•</span><span className="text-[#c9b99a]/60">FABRIC MASK</span><span className="text-white/10">•</span><span>WEAR</span><span className="text-white/10">•</span><span>REVEAL</span>
                </div>
              </div>
            </div>

            {/* LOOK 02 — NIGHT SHIRT */}
            <div className="absolute inset-0 px-6 md:px-10 flex items-center" style={getSceneStyle(1)}>
              <div className="w-full max-w-[1600px] mx-auto grid md:grid-cols-12 gap-6 items-center pointer-events-auto">
                <div className="md:col-span-5">
                  <div className="mono text-[10px] tracking-[0.2em] text-[#c9b99a]">LOOK 02 — THE NIGHT SHIRT • PURE SILK</div>
                  <h2 className="display text-[44px] md:text-[64px] leading-[0.85] mt-3">
                    THE NIGHT<br />
                    <span className="font-light italic">SHIRT</span>
                  </h2>
                  <p className="mono text-[11px] leading-relaxed text-white/60 mt-4 max-w-[380px]">
                    He reaches to the collar — silk stretches, light catches the weave. Buttons open one by one. Sleeves slide back. Watch the back panel lift.
                  </p>
                  <div className="mt-5 mono text-[10px] leading-relaxed text-white/40 max-w-[380px] border-l border-white/10 pl-3">
                    15–20% HAND TO COLLAR<br />
                    20–25% OPEN • 25–32% REMOVAL<br />
                    <span className="text-[#c9b99a]">Fabric fills lens at 38% — next look behind it</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 mono text-[10px]">
                    {outfits[1].details.map((d) => (
                      <span key={d} className="px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur text-white/70">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex items-center gap-4">
                    <button
                      onMouseEnter={() => setCursor({ x: cursor.x, y: cursor.y, hover: true, label: "SHOP" })}
                      onMouseLeave={() => setCursor((c) => ({ ...c, hover: false, label: "" }))}
                      onClick={() => {
                        const prod = products.find((x) => x.id === outfitProductMap["shirt-02"]) ?? products.find((x) => x.category === "SHIRTS")!;
                        setProduct(prod);
                      }}
                      className="bg-white text-black px-7 py-3.5 mono text-[11px] tracking-[0.16em] hover:bg-[#c9b99a] transition-colors"
                    >
                      DISCOVER — ₹18,900
                    </button>
                    <span className="mono text-[10px] text-white/35">PURE SILK • 19 MOMME</span>
                  </div>
                </div>
                <div className="hidden md:block md:col-span-7" />
                {/* in-scene product card - appears during reveal */}
                <div className={`hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 transition-all duration-500 ${isRevealPhase && sceneIdx === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"}`}>
                  <div className="bg-[#0a0a0c]/75 backdrop-blur-xl border border-white/10 p-4 w-[300px] shadow-2xl">
                    <div className="mono text-[10px] tracking-[0.14em] text-white/40">IN SCENE — PURE SILK</div>
                    <div className="mt-2 h-[150px] bg-[#1a1c1e] overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80&auto=format&fit=crop" alt="silk" className="w-full h-full object-cover opacity-90" />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-1 mono text-[10px] text-white">FLUID • REFLECTIVE • SOFT</div>
                    </div>
                    <div className="mono text-[11px] mt-3 font-medium">THE NIGHT SHIRT — NOIR</div>
                    <div className="mono text-[10px] text-white/40">Mulberry silk • Relaxed • Model 185/M</div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const p = products.find((x) => x.id === outfitProductMap["shirt-02"])!;
                          addToCart(p, "M", "Noir", 1);
                        }}
                        className="flex-1 bg-white text-black py-2.5 mono text-[10px] tracking-[0.14em] hover:bg-[#c9b99a]"
                      >
                        ADD — ₹18,900
                      </button>
                      <button onClick={() => setProduct(products.find((x) => x.id === outfitProductMap["shirt-02"])!)} className="px-4 border border-white/15 mono text-[10px] text-white hover:bg-white/10">
                        VIEW
                      </button>
                    </div>
                    <div className="mt-3 mono text-[9px] tracking-[0.14em] text-white/25 text-center">S / M / L / XL • Ships 24h</div>
                  </div>
                  {/* hotspots */}
                  <div className="absolute -left-3 top-10 flex flex-col gap-3">
                    {[
                      { id: "collar", label: "STRUCTURED COLLAR", pos: "top-[20%]" },
                      { id: "cuff", label: "FRENCH CUFF — ITALIAN BUTTONS", pos: "top-[52%]" },
                      { id: "fabric", label: "19 MOMME SILK • 220 GSM", pos: "top-[78%]" },
                    ].map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
                        className={`group flex items-center gap-2 mono text-[10px] ${h.pos}`}
                      >
                        <span className={`w-2 h-2 rounded-full border flex items-center justify-center transition-colors ${activeHotspot === h.id ? "bg-[#c9b99a] border-[#c9b99a]" : "bg-black border-white/40 group-hover:border-white"}`}>
                          <span className="w-1 h-1 rounded-full bg-white/80" />
                        </span>
                        <span className={`px-2 py-1 border backdrop-blur text-left transition-all ${activeHotspot === h.id ? "bg-white text-black border-white opacity-100" : "bg-black/60 text-white/70 border-white/15 opacity-0 group-hover:opacity-100"}`}>
                          {h.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LOOK 03 — EVERYDAY ICON */}
            <div className="absolute inset-0 px-6 md:px-10 flex items-center" style={getSceneStyle(2)}>
              <div className="w-full max-w-[1600px] mx-auto pointer-events-auto">
                <div className="md:ml-auto md:max-w-[520px] text-left md:text-right">
                  <div className="mono text-[10px] tracking-[0.2em] text-[#c9b99a]">LOOK 03 — THE EVERYDAY ICON • TEXTURED COTTON</div>
                  <h2 className="display text-[46px] md:text-[66px] leading-[0.85] mt-3">
                    THE<br />
                    EVERYDAY<br />
                    <span className="font-light italic">ICON</span>
                  </h2>
                  <p className="mono text-[11px] leading-relaxed text-white/60 mt-4 md:ml-auto md:max-w-[420px]">
                    He turns, silk leaves. A warm wash follows the fabric. Slub cotton rises — thicker, brushed, oversized. The hem swings. You feel the weight.
                  </p>
                  <div className="mt-5 mono text-[10px] leading-relaxed text-white/35 md:text-right hidden md:block border-r md:border-l-0 border-white/10 pr-3">
                    CAMERA LOW • BEHIND SHOULDER<br />
                    TEXTURE MACRO AT 65%<br />
                    <span className="text-[#c9b99a]">Garment dictates environment</span>
                  </div>
                  <div className="mt-6 hidden md:flex justify-end gap-2 mono text-[10px]">
                    {outfits[2].details.map((d) => (
                      <span key={d} className="px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.04]">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex md:justify-end">
                    <button
                      onMouseEnter={() => setCursor({ x: cursor.x, y: cursor.y, hover: true, label: "SHOP" })}
                      onMouseLeave={() => setCursor((c) => ({ ...c, hover: false, label: "" }))}
                      onClick={() => {
                        const prod = products.find((x) => x.id === outfitProductMap["shirt-03"]) ?? products[1];
                        setProduct(prod);
                      }}
                      className="bg-[#c9b99a] text-black px-7 py-3.5 mono text-[11px] tracking-[0.16em] hover:bg-white"
                    >
                      SHOP THIS LOOK — ₹12,900
                    </button>
                  </div>
                </div>
                {/* product + hotspots left */}
                <div className={`hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 transition-all duration-500 ${isRevealPhase && sceneIdx === 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6 pointer-events-none"}`}>
                  <div className="bg-white text-black p-4 w-[300px] shadow-2xl">
                    <div className="mono text-[10px] tracking-[0.14em] text-black/40">IN SCENE — TEXTUREED</div>
                    <div className="text-[13px] font-medium mt-1">OVERSIZED SLUB SHIRT — SAND</div>
                    <div className="mono text-[10px] text-black/50 mt-1">TEXTURED COTTON • GARMENT DYED</div>
                    <div className="mt-3 h-[140px] bg-[#ecebe6] overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80&auto=format&fit=crop" alt="textured" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => addToCart(products.find((x) => x.id === outfitProductMap["shirt-03"])!, "L", "Sand", 1)} className="flex-1 bg-black text-white py-2.5 mono text-[10px] tracking-[0.14em] hover:bg-[#1a1a1e]">
                        ADD — ₹12,900
                      </button>
                      <button onClick={() => setProduct(products.find((x) => x.id === outfitProductMap["shirt-03"])!)} className="px-4 border border-black/15 mono text-[10px] hover:bg-black/5">
                        VIEW
                      </button>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block absolute left-10 bottom-[88px] pointer-events-none mono text-[10px] text-white/25">
                  <div>CAMERA — LOW ANGLE • 28MM • f/2.0</div>
                  <div className="w-[200px] h-px bg-white/10 mt-2" />
                  <div className="text-white/35 mt-1">FOCUS ON HEM & SLEEVE DRAPE</div>
                </div>
              </div>
            </div>

            {/* FINAL */}
            <div className="absolute inset-0 px-6 md:px-10 flex flex-col justify-center" style={getSceneStyle(3)}>
              <div className="w-full max-w-[1600px] mx-auto pointer-events-auto">
                <div className="text-center max-w-[780px] mx-auto">
                  <div className="mono text-[10px] tracking-[0.28em] text-[#c9b99a]">FINAL LOOK — THE STATEMENT</div>
                  <h2 className="display text-[50px] md:text-[82px] leading-[0.85] mt-4">
                    DRESS<br />
                    <span className="font-light italic">DIFFERENT.</span>
                  </h2>
                  <p className="mono text-[11px] leading-relaxed text-white/55 mt-4 max-w-[560px] mx-auto">
                    Crafted for the man who doesn&apos;t need to explain his style. The model holds — 180° orbit, strongest light. One continuous body, three shirts, zero cuts.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={scrollToShop} className="bg-[#c9b99a] text-black px-8 py-4 mono text-[11px] tracking-[0.16em] hover:bg-white">
                      SHOP THE COLLECTION
                    </button>
                    <button
                      onClick={() => {
                        const p = products.find((x) => x.id === outfitProductMap["look-final"])!;
                        setProduct(p);
                      }}
                      className="border border-white/20 text-white px-8 py-4 mono text-[11px] tracking-[0.16em] hover:bg-white hover:text-black backdrop-blur"
                    >
                      EXPLORE THE LOOK
                    </button>
                  </div>
                  <div className="mt-8 mono text-[10px] text-white/30 flex justify-center gap-3">
                    <span>DOUBLE-FACE WOOL</span>
                    <span className="text-white/15">•</span>
                    <span>HAND PRESSED</span>
                    <span className="text-white/15">•</span>
                    <span>LIMITED — 120</span>
                  </div>
                  <div className="mt-10 flex justify-center gap-2 mono text-[9px] tracking-[0.14em] text-white/20">
                    <span>BUY COMPLETE LOOK</span>
                    <span className="text-white/10">—</span>
                    <span>SHIRT + TROUSERS + SHOES</span>
                  </div>
                </div>
              </div>
              {/* final hotspot product */}
              <div className={`hidden lg:block absolute right-10 bottom-10 transition-all duration-500 ${sceneIdx === 3 && progress > 0.82 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}>
                <div className="bg-white text-black p-5 w-[320px] shadow-2xl pointer-events-auto">
                  <div className="mono text-[10px] tracking-[0.14em] text-black/50">HERO — ATELIER MADE</div>
                  <div className="text-[15px] font-medium mt-1">DOUBLE-FACE OVERCOAT — CAMEL</div>
                  <div className="mono text-[10px] text-black/50">ARCHITECTURAL CUT • 120 PCS</div>
                  <div className="flex items-baseline gap-3 mt-3">
                    <span className="text-[20px]">₹45,900</span>
                    <span className="mono text-[11px] line-through text-black/35">₹52,000</span>
                    <span className="ml-auto mono text-[10px] bg-black text-white px-2 py-1">LIMITED</span>
                  </div>
                  <button onClick={() => setProduct(products.find((x) => x.id === "p-04")!)} className="w-full mt-4 bg-black text-white py-3 mono text-[11px] tracking-[0.16em] hover:bg-[#1a1a1e]">
                    VIEW PRODUCT
                  </button>
                </div>
              </div>
              {/* complete look */}
              <div className={`hidden md:flex absolute left-10 bottom-10 gap-2 transition-opacity ${sceneIdx === 3 ? "opacity-100" : "opacity-0"}`}>
                <button
                  onClick={() => {
                    const p1 = products.find((x) => x.id === outfitProductMap["shirt-03"])!;
                    const p2 = products.find((x) => x.id === "p-03")!;
                    addToCart(p1, "M", "Sand", 1);
                    setTimeout(() => addToCart(p2, "32", "Charcoal", 1), 220);
                  }}
                  className="mono text-[10px] tracking-[0.14em] border border-white/15 text-white px-4 py-2 hover:bg-white hover:text-black backdrop-blur"
                >
                  BUY COMPLETE LOOK — ₹28,800
                </button>
              </div>
            </div>
          </div>

          {/* fabric peak flash hint */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" style={{ opacity: fabricPeak * 0.55 }}>
            {fabricPeak > 0.5 && <div className="mono text-[10px] tracking-[0.22em] text-white/60 border border-white/20 px-3 py-1 bg-black/30 backdrop-blur">FABRIC TRANSITION</div>}
          </div>

          <div className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08080a] to-transparent pointer-events-none z-10 transition-opacity ${progress > 0.96 ? "opacity-0" : "opacity-100"}`} />
        </div>
      </div>

      <div ref={shopRef}>
        <ShopGrid />
      </div>

      <section id="collection" className="bg-[#08080a] py-16 md:py-24 border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="mono text-[10px] tracking-[0.2em] text-white/40">EDITORIAL — A/W 2026 • THREE SHIRTS, ONE FILM</div>
              <h2 className="display text-[42px] md:text-[84px] leading-none mt-2">
                THE SHIRT<br />
                <span className="font-light italic text-[#c9b99a]">TRILOGY</span>
              </h2>
            </div>
            <div className="hidden md:block mono text-[11px] text-white/40 max-w-[380px] text-right leading-relaxed">
              Same body. Same studio. Three fabrics — cotton, silk, slub. Watch them leave and return. Then take them home.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-10">
            {[
              {
                k: "01",
                title: "WHITE SIGNATURE",
                sub: "Crisp • Structured • 220 GSM",
                cap: "Mother-of-pearl. Garment washed. The shirt that made the house.",
                img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&q=80&auto=format&fit=crop",
                prod: "p-05",
                price: "₹12,900",
              },
              {
                k: "02",
                title: "THE NIGHT SHIRT",
                sub: "Fluid • Reflective • Silk",
                cap: "19 momme mulberry. Moves like water under studio light.",
                img: "https://images.unsplash.com/photo-1614253429381-4d0ae31b19cf?w=900&q=80&auto=format&fit=crop",
                prod: "p-06",
                price: "₹18,900",
              },
              {
                k: "03",
                title: "EVERYDAY ICON",
                sub: "Textured • Brushed • Oversized",
                cap: "Slub cotton, heavy drape. For the daily uniform, elevated.",
                img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&auto=format&fit=crop",
                prod: "p-02",
                price: "₹12,900",
              },
            ].map((c) => (
              <div
                key={c.k}
                onMouseEnter={() => setCursor({ x: cursor.x, y: cursor.y, hover: true, label: "VIEW" })}
                onMouseLeave={() => setCursor((s) => ({ ...s, hover: false, label: "" }))}
                className="group relative aspect-[4/5] overflow-hidden bg-[#141518] cursor-pointer"
                onClick={() => setProduct(products.find((x) => x.id === c.prod)!)}
              >
                <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[1400ms]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-80" />
                <div className="absolute top-4 left-4 mono text-[10px] tracking-[0.2em] text-white/70 border border-white/20 px-2.5 py-1 bg-black/30 backdrop-blur">SHIRT {c.k}</div>
                <div className="absolute top-4 right-4 mono text-[10px] bg-[#c9b99a] text-black px-2.5 py-1">{c.price}</div>
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-7">
                  <div className="mono text-[10px] tracking-[0.18em] text-white/60">{c.sub}</div>
                  <div className="display text-[26px] leading-none mt-1">{c.title}</div>
                  <div className="mono text-[11px] text-white/60 mt-2 max-w-[300px] leading-relaxed">{c.cap}</div>
                  <div className="mt-4 mono text-[11px] tracking-[0.14em] inline-flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                    SHOP SHIRT <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="craft" className="bg-[#f5f1e8] text-[#0a0a0c] py-16 md:py-24 border-t border-black/10 overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start">
            <div className="md:col-span-6 lg:col-span-5">
              <div className="mono text-[10px] tracking-[0.2em] text-black/40">MATERIAL — OBSESSION</div>
              <h2 className="display text-[48px] md:text-[72px] leading-[0.85] mt-3">
                FABRIC<br />
                IS THE<br />
                <span className="font-light italic">STORY.</span>
              </h2>
              <p className="mono text-[11px] leading-relaxed text-black/60 mt-6 max-w-[420px]">
                Each shirt has its own physics. Cotton holds. Silk flows. Slub drags. We chose them so you could see the difference at 60fps, not just feel it.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6 border-y border-black/10 py-6">
                {[
                  { v: "220", k: "GSM • COTTON" },
                  { v: "19", k: "MOMME • SILK" },
                  { v: "SLUB", k: "TEXTURE" },
                ].map((s) => (
                  <div key={s.k}>
                    <div className="display text-[26px] leading-none">{s.v}</div>
                    <div className="mono text-[10px] text-black/40 mt-1 tracking-widest">{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="mono text-[10px] leading-relaxed text-black/45 mt-6 border-l border-black/10 pl-3">
                PBR: baseColor + roughness + normal + anisotropy<br />
                Silk: roughness 0.32 • Cotton: 0.85 • Slub: 0.92
              </div>
              <button onClick={scrollToShop} className="mt-8 mono text-[11px] tracking-[0.16em] border border-black px-8 py-4 hover:bg-black hover:text-white transition-colors">
                MEET THE FABRICS →
              </button>
            </div>

            <div className="md:col-span-6 lg:col-span-7">
              <div className="grid grid-cols-12 gap-3 auto-rows-[160px] md:auto-rows-[200px]">
                <div className="col-span-7 row-span-2 relative overflow-hidden bg-[#e9e6e0]">
                  <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80&auto=format&fit=crop" alt="wool texture" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute bottom-3 left-3 bg-white px-3 py-2 mono text-[10px]">COTTON POPLIN — MACRO • 220 GSM</div>
                </div>
                <div className="col-span-5 relative overflow-hidden bg-[#0a0a0c]">
                  <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80&auto=format&fit=crop" alt="silk" className="absolute inset-0 w-full h-full object-cover opacity-95" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute bottom-3 left-3 mono text-[10px] text-white tracking-widest">SILK — FLUID DRAPE</div>
                </div>
                <div className="col-span-5 relative overflow-hidden bg-[#d9d0bf]">
                  <img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80&auto=format&fit=crop" alt="cotton" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute bottom-3 left-3 bg-black text-white px-3 py-1 mono text-[10px]">SLUB — HEAVY BRUSHED</div>
                </div>
                <div className="col-span-7 md:col-span-12 lg:col-span-7 relative overflow-hidden bg-[#0a0a0c] flex items-center p-6">
                  <div className="text-white">
                    <div className="mono text-[10px] tracking-[0.2em] text-white/50">ATELIER NOTE</div>
                    <div className="display text-[18px] leading-tight mt-2">“If you can’t see the shirt leave the body,<br />we’ve failed the choreography.”</div>
                    <div className="mono text-[10px] text-white/40 mt-3">— Creative Director</div>
                  </div>
                  <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80&auto=format&fit=crop" alt="atelier" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-15 hidden md:block" />
                </div>
                <div className="col-span-5 lg:col-span-5 relative overflow-hidden bg-[#c9b99a] hidden md:flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="display text-[44px] leading-none">0 CUTS</div>
                    <div className="mono text-[10px] tracking-widest mt-1">ONE TAKE<br />CONTINUOUS BODY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="relative bg-[#08080a] py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80&auto=format&fit=crop" alt="brand" className="w-full h-full object-cover opacity-[0.12]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-transparent to-[#08080a]" />
        </div>
        <div className="relative mx-auto max-w-[1600px] px-6 md:px-10">
          <div className="max-w-[900px]">
            <div className="mono text-[10px] tracking-[0.2em] text-white/40">MAISON — EST. 2019 • NO CUTS, ONE BODY</div>
            <h2 className="display text-[40px] md:text-[68px] leading-[0.88] mt-3">
              WE BUILD<br />
              <span className="font-light italic text-[#c9b99a]">GARMENT</span>
              <br />
              CHOREOGRAPHY.
            </h2>
            <p className="mono text-[11px] md:text-[12px] leading-relaxed text-white/55 mt-6 max-w-[560px]">
              Every button, every fold, every sleeve pull is authored. No image swaps. One mesh becomes the next via cloth-true deformation, skeletal performance, and a fabric mask you can feel.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button onClick={scrollToShop} className="bg-white text-black px-8 py-4 mono text-[11px] tracking-[0.16em] hover:bg-[#c9b99a]">
                SHOP THE TRILOGY
              </button>
              <button className="border border-white/15 text-white px-8 py-4 mono text-[11px] tracking-[0.16em] hover:bg-white hover:text-black backdrop-blur">VISIT ATELIER — MUMBAI</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0a0a0c] border-t border-white/10">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-12 md:py-16">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="display text-[28px] tracking-tight">ATELIER NOIR</div>
              <div className="mono text-[10px] tracking-[0.18em] text-white/40 mt-1">THE NEW STANDARD — A/W 2026</div>
              <p className="mono text-[11px] leading-relaxed text-white/45 mt-4 max-w-[360px]">One continuous body. Real garment removal. Scroll to direct.</p>
              <div className="mt-6 flex gap-2 max-w-[420px]">
                <input placeholder="YOUR EMAIL" className="flex-1 bg-white/5 border border-white/10 px-4 py-3 mono text-[11px] placeholder:text-white/30 focus:outline-none focus:border-[#c9b99a]" />
                <button className="bg-white text-black px-6 py-3 mono text-[11px] tracking-[0.14em] hover:bg-[#c9b99a]">JOIN</button>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8 mono text-[11px]">
              {[
                { h: "SHOP", links: ["Shirts", "Jackets", "Trousers", "Outerwear"] },
                { h: "ATELIER", links: ["Our Story", "Craft", "Materials", "Lookbook"] },
                { h: "SERVICE", links: ["Shipping", "Returns", "Care Guide", "Size Guide"] },
                { h: "FOLLOW", links: ["Instagram", "Journal", "Newsletter"] },
              ].map((col) => (
                <div key={col.h}>
                  <div className="text-white/30 tracking-[0.18em] text-[10px] mb-4">{col.h}</div>
                  <div className="flex flex-col gap-2.5 text-white/70">
                    {col.links.map((l) => (
                      <a key={l} href="#" className="hover:text-white">
                        {l}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 mono text-[10px] tracking-[0.14em] text-white/30">
            <span>© 2026 ATELIER NOIR — ALL RIGHTS RESERVED • ONE TAKE, ZERO CUTS</span>
            <span className="flex gap-6">
              <a href="#" className="hover:text-white">
                PRIVACY
              </a>
              <a href="#" className="hover:text-white">
                TERMS
              </a>
              <a href="#" className="hover:text-white">
                INDIA • EN / INR ₹
              </a>
            </span>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 inset-x-0 z-20 md:hidden pointer-events-none">
        <div className="mx-4 mb-4 bg-[#0a0a0c]/90 backdrop-blur border border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="mono text-[10px] tracking-[0.12em] text-white/70">
            {curOutfit.name} — ₹{curOutfit.price.toLocaleString("en-IN")}
          </div>
          <button onClick={scrollToShop} className="pointer-events-auto bg-white text-black mono text-[10px] tracking-[0.12em] px-4 py-2">
            SHOP
          </button>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
