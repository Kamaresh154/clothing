"use client";
import { useState } from "react";
import { products, categories, type Product } from "@/data/products";
import { useStore } from "@/store/useStore";

export default function ShopGrid() {
  const [active, setActive] = useState<(typeof categories)[number]>("ALL");
  const setProduct = useStore((s) => s.setProductOpen);
  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);

  const filtered = active === "ALL" ? products : products.filter((p) => p.category === active);

  return (
    <section id="shop" className="bg-[#f5f1e8] text-[#0a0a0c] py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/10 pb-8">
          <div>
            <div className="mono text-[10px] tracking-[0.2em] text-black/50">SHOP — A/W 2026</div>
            <h2 className="display text-[48px] md:text-[72px] leading-none mt-2">THE COLLECTION</h2>
          </div>
          <div className="mono text-[11px] leading-relaxed text-black/60 max-w-[420px]">
            Eight archetypes. Italian fabrics. Architectural silhouettes.
            <br />Designed to be worn for a decade, not a season.
          </div>
        </div>

        <div className="flex gap-2 overflow-auto py-6 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`mono text-[11px] px-5 py-2.5 rounded-full border whitespace-nowrap transition-colors ${active === c ? "bg-black text-white border-black" : "border-black/15 hover:border-black/40 text-black/70"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black/10 border border-black/10">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={setProduct} onAdd={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <div className="mono text-[10px] text-black/40">SHOWING {filtered.length} OF {products.length} — ALL PIECES MADE IN LIMITED RUNS</div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onOpen, onAdd, wishlist, toggleWishlist }: { product: Product; onOpen: (p: Product) => void; onAdd: any; wishlist: string[]; toggleWishlist: any }) {
  const [hover, setHover] = useState(false);
  const isWish = wishlist.includes(product.id);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="bg-[#fcfaf7] p-3 group flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#ecebe8] cursor-pointer" onClick={() => onOpen(product)}>
        <img
          src={hover ? product.image2 : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <div className="absolute left-3 top-3 mono text-[10px] bg-black text-white px-2.5 py-1 tracking-widest">{product.badge}</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`absolute right-3 top-3 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md transition-colors ${isWish ? "bg-black text-white border-black" : "bg-white/80 border-black/10 hover:bg-white"}`}
        >
          <span className="text-[13px]">{isWish ? "♥" : "♡"}</span>
        </button>
        <div className={`absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-300 ${hover ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <button onClick={() => onOpen(product)} className="flex-1 bg-white/90 backdrop-blur text-black mono text-[10px] py-3 hover:bg-white transition-colors">QUICK VIEW</button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product, product.sizes[1] ?? product.sizes[0], product.colors[0].name, 1); }}
            className="w-12 bg-black text-white flex items-center justify-center hover:bg-[#c9b99a] hover:text-black transition-colors"
          >
            +
          </button>
        </div>
        {/* color dots */}
        <div className="absolute left-3 bottom-3 hidden group-hover:hidden md:flex gap-1.5">
          {/* placeholder - shown when not hover */}
        </div>
      </div>

      <div className="pt-4 pb-2 flex-1 flex flex-col">
        <div className="mono text-[10px] text-black/45">{product.category}</div>
        <div className="text-[13px] tracking-wide font-medium leading-tight mt-1">{product.name}</div>
        <div className="mono text-[10px] text-black/50 mt-1">{product.subtitle}</div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[14px] font-medium">₹{product.price.toLocaleString("en-IN")}</span>
          {product.originalPrice && <span className="mono text-[10px] line-through text-black/40">₹{product.originalPrice.toLocaleString("en-IN")}</span>}
          <span className="ml-auto flex gap-1">
            {product.colors.map((c) => (
              <span key={c.name} className="w-3 h-3 rounded-full border border-black/10" style={{ background: c.hex }} title={c.name} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
