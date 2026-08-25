"use client";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductModal() {
  const product = useStore((s) => s.productOpen);
  const setProduct = useStore((s) => s.setProductOpen);
  const addToCart = useStore((s) => s.addToCart);
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const activeSize = size || product.sizes[1] || product.sizes[0];
  const activeColor = color || product.colors[0].name;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProduct(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[1120px] max-h-[90vh] overflow-auto bg-[#0f0f11] border border-white/10 flex flex-col md:flex-row">
              <button onClick={() => setProduct(null)} className="absolute right-4 top-4 md:right-6 md:top-6 w-9 h-9 rounded-full bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors z-10">✕</button>

              <div className="md:w-[56%] bg-[#141518] p-3 md:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 aspect-[4/5] bg-[#1a1c1e] overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[4/5] bg-[#1a1c1e] overflow-hidden">
                    <img src={product.image2} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-[4/5] bg-[#1e2023] flex items-center justify-center p-6 text-center">
                    <div>
                      <div className="mono text-[10px] text-white/50">MATERIAL</div>
                      <div className="display text-[22px] mt-2 leading-none">{product.material}</div>
                      <div className="mono text-[10px] text-white/40 mt-3 leading-relaxed">Hand-finished details<br />Model is 185cm wearing size M<br />Made in Portugal</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-10 flex flex-col">
                <div className="mono text-[10px] tracking-[0.18em] text-[#c9b99a]">{product.category} — {product.badge ?? "ATELIER"}</div>
                <h2 className="display text-[32px] md:text-[40px] leading-[0.9] mt-3">{product.name}</h2>
                <div className="mono text-[11px] text-white/50 mt-2">{product.subtitle}</div>
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-[22px] tracking-wide">₹{product.price.toLocaleString("en-IN")}</span>
                  {product.originalPrice && <span className="mono text-[11px] line-through text-white/40">₹{product.originalPrice.toLocaleString("en-IN")}</span>}
                </div>

                <div className="h-px bg-white/10 my-6" />

                <div>
                  <div className="mono text-[10px] text-white/60 mb-3">COLOR — <span className="text-white">{activeColor}</span></div>
                  <div className="flex gap-2">
                    {product.colors.map((c) => (
                      <button key={c.name} onClick={() => setColor(c.name)} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${activeColor === c.name ? "border-white" : "border-white/15"}`}>
                        <span className="w-7 h-7 rounded-full" style={{ background: c.hex }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mono text-[10px] text-white/60 mb-3">SIZE — <span className="text-white">{activeSize}</span> <span className="ml-2 underline underline-offset-4 cursor-pointer text-white/50">SIZE GUIDE</span></div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button key={s} onClick={() => setSize(s)} className={`mono text-[11px] px-4 py-2.5 border rounded-full ${activeSize === s ? "bg-white text-black border-white" : "border-white/15 hover:border-white/40 text-white/80"}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center border border-white/15 rounded-full">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full">−</button>
                    <span className="mono text-[12px] w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full">+</button>
                  </div>
                  <span className="mono text-[10px] text-white/40">In stock • Ships in 24h</span>
                </div>

                <button
                  onClick={() => { addToCart(product, activeSize, activeColor, qty); setProduct(null); }}
                  className="mt-6 w-full bg-white text-black py-4 mono text-[11px] tracking-[0.2em] hover:bg-[#c9b99a] transition-colors"
                >
                  ADD TO CART — ₹{(product.price * qty).toLocaleString("en-IN")}
                </button>
                <div className="mono text-[10px] text-white/30 text-center mt-3">Free returns within 30 days • Complimentary garment bag</div>

                <div className="mt-8 space-y-4 mono text-[11px] leading-relaxed">
                  <div className="flex gap-6 border-t border-white/10 pt-4">
                    <span className="text-white/40 w-20">FABRIC</span><span className="text-white/80">{product.material}</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-white/40 w-20">FIT</span><span className="text-white/80">Relaxed • Model 185cm / Size M</span>
                  </div>
                  <div className="flex gap-6">
                    <span className="text-white/40 w-20">CARE</span><span className="text-white/80">Dry clean only • Store folded</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
