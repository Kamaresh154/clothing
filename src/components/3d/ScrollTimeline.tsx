"use client";
import { outfits } from "@/data/outfits";

/**
 * Deterministic scroll timeline — no autoplay, no random.
 * Normalized progress 0..1 controls every beat; backward reverses naturally.
 */
export function getBeatLabel(progress: number) {
  const total = outfits.length;
  const seg = 1 / (total - 1);
  if (progress < 0.04) return { label: "INTRO", pct: "0%", desc: "MODEL STANDS — DARK STUDIO" };
  if (progress < 0.09) return { label: "PUSH-IN", pct: "10%", desc: "CAMERA APPROACHES" };
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

export function getProgressForOutfit(index: number) {
  const total = outfits.length;
  return index / (total - 1);
}

export function getOutfitIndex(progress: number) {
  return Math.min(outfits.length - 1, Math.floor(progress * outfits.length));
}
