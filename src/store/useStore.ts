"use client";
import { create } from "zustand";
import type { Product } from "@/data/products";

export type CartItem = {
  product: Product;
  size: string;
  color: string;
  qty: number;
};

type Store = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  productOpen: Product | null;
  mobileMenu: boolean;
  addToCart: (p: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  setCartOpen: (v: boolean) => void;
  setProductOpen: (p: Product | null) => void;
  setMobileMenu: (v: boolean) => void;
  cartCount: () => number;
  cartTotal: () => number;
};

export const useStore = create<Store>((set, get) => ({
  cart: [],
  wishlist: [],
  cartOpen: false,
  productOpen: null,
  mobileMenu: false,
  addToCart: (product, size, color, qty = 1) =>
    set((s) => {
      const idx = s.cart.findIndex((c) => c.product.id === product.id && c.size === size && c.color === color);
      if (idx >= 0) {
        const next = [...s.cart];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return { cart: next, cartOpen: true };
      }
      return { cart: [...s.cart, { product, size, color, qty }], cartOpen: true };
    }),
  removeFromCart: (id, size) => set((s) => ({ cart: s.cart.filter((c) => !(c.product.id === id && c.size === size)) })),
  updateQty: (id, size, qty) =>
    set((s) => ({
      cart: s.cart.map((c) => (c.product.id === id && c.size === size ? { ...c, qty: Math.max(1, qty) } : c)),
    })),
  toggleWishlist: (id) => set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id] })),
  setCartOpen: (v) => set({ cartOpen: v }),
  setProductOpen: (p) => set({ productOpen: p }),
  setMobileMenu: (v) => set({ mobileMenu: v }),
  cartCount: () => get().cart.reduce((a, b) => a + b.qty, 0),
  cartTotal: () => get().cart.reduce((a, b) => a + b.product.price * b.qty, 0),
}));
