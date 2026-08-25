import * as THREE from "three";

export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
export function clamp(v: number, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
export function easeInOutCubic(x: number) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
export function easeOutExpo(x: number) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
export function easeInOutQuad(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

// Reusable pools to avoid per-frame GC
export const _cA = new THREE.Color();
export const _cB = new THREE.Color();
export const _v3a = new THREE.Vector3();

export function isReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
