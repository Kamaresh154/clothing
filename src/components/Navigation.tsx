"use client";
import { useStore } from "@/store/useStore";

export default function Navigation({ onShopClick }: { onShopClick: () => void }) {
  const count = useStore((s) => s.cart.reduce((a, b) => a + b.qty, 0));
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setMobileMenu = useStore((s) => s.setMobileMenu);
  const mobileMenu = useStore((s) => s.mobileMenu);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-40 mix-blend-difference">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="#" className="display text-[22px] tracking-[0.14em] font-light text-white">ATELIER NOIR</a>
            <div className="hidden lg:flex items-center gap-8 mono text-[10px] text-white/70">
              <button onClick={onShopClick} className="hover:text-white transition-colors cursor-pointer">SHOP</button>
              <a href="#collection" className="hover:text-white transition-colors">COLLECTION</a>
              <a href="#craft" className="hover:text-white transition-colors">CRAFT</a>
              <a href="#story" className="hover:text-white transition-colors">ATELIER</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 mono text-[10px] text-white/60">
              <span className="hidden lg:inline">SEARCH</span>
              <span className="hidden lg:inline">ACCOUNT</span>
              <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 text-white hover:text-white transition-colors cursor-pointer">
                CART <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-medium leading-none">{count}</span>
              </button>
            </div>
            <button onClick={() => setCartOpen(true)} className="md:hidden mono text-[11px] text-white flex items-center gap-2">
              CART <span className="bg-white text-black px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5">
              <span className={`block w-5 h-px bg-white transition-all ${mobileMenu ? "rotate-45 translate-y-[3.5px]" : ""}`} />
              <span className={`block w-5 h-px bg-white transition-all ${mobileMenu ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
            </button>
          </div>
        </div>
        {/* bottom hairline */}
        <div className="h-px bg-white/[0.08] mx-6 md:mx-10" />
      </nav>

      {/* mobile menu */}
      <div className={`fixed inset-0 z-30 bg-[#08080a]/95 backdrop-blur-xl lg:hidden transition-all duration-500 ${mobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="pt-[88px] px-6 flex flex-col gap-1">
          {[
            { label: "SHOP", action: onShopClick },
            { label: "COLLECTION", href: "#collection" },
            { label: "CRAFT", href: "#craft" },
            { label: "ATELIER", href: "#story" },
          ].map((item) => (
            <a
              key={item.label}
              href={(item as any).href}
              onClick={(e) => {
                if ((item as any).action) { e.preventDefault(); (item as any).action(); setMobileMenu(false); }
                else setMobileMenu(false);
              }}
              className="display text-[46px] leading-none py-3 border-b border-white/10 tracking-tight"
            >
              {item.label}
            </a>
          ))}
          <div className="mono text-[10px] text-white/50 pt-6">A/W 2026 — THE NEW STANDARD</div>
        </div>
      </div>
    </>
  );
}
