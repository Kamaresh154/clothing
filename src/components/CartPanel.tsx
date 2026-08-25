"use client";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPanel() {
  const cart = useStore((s) => s.cart);
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const updateQty = useStore((s) => s.updateQty);
  const remove = useStore((s) => s.removeFromCart);
  const total = cart.reduce((a, b) => a + b.product.price * b.qty, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[440px] bg-[#0f0f11] border-l border-white/10 flex flex-col"
          >
            <div className="h-[68px] flex items-center justify-between px-6 border-b border-white/10">
              <span className="mono text-[11px] tracking-[0.2em]">CART — {cart.length} ITEMS</span>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white hover:text-black transition-colors">✕</button>
            </div>

            <div className="flex-1 overflow-auto">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-8 text-center">
                  <div className="display text-[32px] leading-none">YOUR CART IS EMPTY</div>
                  <p className="mono text-[11px] text-white/50 mt-3">Add a signature piece to begin.</p>
                  <button onClick={() => setOpen(false)} className="mt-8 mono text-[11px] border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-colors">CONTINUE SHOPPING</button>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 p-5">
                      <div className="w-[92px] h-[116px] bg-[#1a1a1e] overflow-hidden shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="text-[13px] tracking-wide font-medium leading-tight">{item.product.name}</div>
                        <div className="mono text-[10px] text-white/45 mt-1">{item.product.subtitle} • {item.size} • {item.color}</div>
                        <div className="mono text-[11px] mt-2">₹{item.product.price.toLocaleString("en-IN")}</div>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="flex items-center border border-white/15 rounded-full">
                            <button onClick={() => updateQty(item.product.id, item.size, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full">−</button>
                            <span className="mono text-[11px] w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.product.id, item.size, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full">+</button>
                          </div>
                          <button onClick={() => remove(item.product.id, item.size)} className="mono text-[10px] text-white/50 underline underline-offset-4 hover:text-white">REMOVE</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-white/10 p-6 bg-[#0a0a0c]">
                <div className="flex justify-between mono text-[11px]">
                  <span className="text-white/60">SUBTOTAL</span>
                  <span className="text-[14px]">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="mono text-[10px] text-white/40 mt-1">Shipping calculated at checkout • Duties included</div>
                <button className="w-full mt-5 bg-white text-black py-4 mono text-[11px] tracking-[0.18em] hover:bg-[#c9b99a] transition-colors">PROCEED TO CHECKOUT →</button>
                <button onClick={() => setOpen(false)} className="w-full mt-3 border border-white/15 py-3 mono text-[11px] hover:bg-white/5">CONTINUE SHOPPING</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
