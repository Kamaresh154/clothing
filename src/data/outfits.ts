export type GarmentType = "shirt" | "silk-shirt" | "overshirt" | "jacket" | "suit";

export type Outfit = {
  id: string;
  name: string;
  subtitle: string;
  headline: string;
  sub: string;
  price: number;
  material: string;
  details: string[];
  garment: { type: GarmentType; color: string; roughness: number; metalness: number; sheen: number; description: string; asset: string };
  layers: { base: boolean; outer: boolean; trousers: boolean; accessories: boolean };
  silhouette: { shoulderWidth: number; torsoHeight: number; torsoWidth: number; sleeveRadius: number; sleeveLength: number; hasLapels: boolean; hasPockets: boolean; buttonCount: number };
  palette: { top: string; top2: string; outer: string; outer2: string; bottom: string; shoes: string; skin: string };
  camera: { pos: [number, number, number]; look: [number, number, number] };
  light: { intensity: number; color: string; fog: string };
};

export const outfits: Outfit[] = [
  {
    id: "shirt-01",
    name: "CHARCOAL RELAXED TAILORING",
    subtitle: "LOOK 01 — THE NEW TAILOR",
    headline: "THE NEW\nTAILOR",
    sub: "Relaxed charcoal blazer / Textured knit polo / Wide-leg trousers",
    price: 32900,
    material: "Soft Wool Blend • Relaxed Construction • 2026 Silhouette",
    details: ["Relaxed Shoulder", "Textured Knit Polo", "Wide-Leg Trouser"],
    garment: { type: "jacket", color: "#25262a", roughness: 0.76, metalness: 0, sheen: 0.2, description: "Soft • Structured • Relaxed", asset: "/models/charcoal-tailoring.glb" },
    layers: { base: true, outer: true, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.52, torsoHeight: 0.72, torsoWidth: 0.40, sleeveRadius: 0.112, sleeveLength: 0.58, hasLapels: true, hasPockets: true, buttonCount: 2 },
    palette: { top: "#18191c", top2: "#292a2e", outer: "#25262a", outer2: "#36373c", bottom: "#17181b", shoes: "#08090a", skin: "#b98f73" },
    camera: { pos: [0, 1.5, 4.5], look: [0, 1.35, 0] },
    light: { intensity: 1.15, color: "#efe5d6", fog: "#08090b" },
  },
  {
    id: "shirt-02",
    name: "BLACK SILK SHIRT",
    subtitle: "LOOK 02 — LIQUID BLACK",
    headline: "LIQUID\nBLACK",
    sub: "Pure silk / Fluid drape / Relaxed collar",
    price: 18900,
    material: "Pure Mulberry Silk • 19 Momme • Fluid Drape",
    details: ["Pure Silk", "Fluid Drape", "Relaxed Collar"],
    garment: { type: "silk-shirt", color: "#08090b", roughness: 0.20, metalness: 0.02, sheen: 0.9, description: "Fluid • Reflective • Soft", asset: "/models/black-silk-shirt.glb" },
    layers: { base: true, outer: false, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.49, torsoHeight: 0.64, torsoWidth: 0.35, sleeveRadius: 0.10, sleeveLength: 0.56, hasLapels: false, hasPockets: false, buttonCount: 5 },
    palette: { top: "#08090b", top2: "#1a1b20", outer: "#08090b", outer2: "#1a1b20", bottom: "#111216", shoes: "#050608", skin: "#b98f73" },
    camera: { pos: [1.05, 1.55, 3.6], look: [0, 1.35, 0] },
    light: { intensity: 1.0, color: "#aaa5c8", fog: "#07080b" },
  },
  {
    id: "jacket-03",
    name: "OLIVE UTILITY JACKET",
    subtitle: "LOOK 03 — FIELD / FORM",
    headline: "FIELD /\nFORM",
    sub: "Olive utility jacket / Structured pockets / Roomy trousers",
    price: 27900,
    material: "Washed Cotton Nylon • Utility Weave • Structured",
    details: ["Utility Pockets", "Washed Texture", "Roomy Silhouette"],
    garment: { type: "overshirt", color: "#3d4435", roughness: 0.86, metalness: 0.01, sheen: 0.12, description: "Dry • Textured • Utility", asset: "/models/olive-utility-jacket.glb" },
    layers: { base: true, outer: true, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.55, torsoHeight: 0.72, torsoWidth: 0.42, sleeveRadius: 0.12, sleeveLength: 0.60, hasLapels: false, hasPockets: true, buttonCount: 4 },
    palette: { top: "#171a16", top2: "#252a22", outer: "#3d4435", outer2: "#59604d", bottom: "#1d211b", shoes: "#111210", skin: "#b98f73" },
    camera: { pos: [-1.0, 1.38, 4.0], look: [0, 1.28, 0] },
    light: { intensity: 1.18, color: "#d7c8a9", fog: "#0b0d0a" },
  },
  {
    id: "suit-final",
    name: "DEEP NAVY RELAXED SUIT",
    subtitle: "FINAL LOOK — AFTER DARK",
    headline: "AFTER\nDARK",
    sub: "Relaxed double-breasted tailoring / Deep navy / Wide trouser",
    price: 45900,
    material: "Dense Merino Wool • Soft Tailoring • Limited Run",
    details: ["Soft Shoulder", "Double-Breasted", "Wide Trouser"],
    garment: { type: "suit", color: "#111a2b", roughness: 0.60, metalness: 0.02, sheen: 0.30, description: "Dense • Matte • Tailored", asset: "/models/deep-navy-suit.glb" },
    layers: { base: true, outer: true, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.57, torsoHeight: 0.76, torsoWidth: 0.43, sleeveRadius: 0.115, sleeveLength: 0.58, hasLapels: true, hasPockets: true, buttonCount: 4 },
    palette: { top: "#080d16", top2: "#172238", outer: "#111a2b", outer2: "#243653", bottom: "#0a101c", shoes: "#050609", skin: "#b98f73" },
    camera: { pos: [0, 1.45, 4.9], look: [0, 1.35, 0] },
    light: { intensity: 1.32, color: "#dce6ff", fog: "#070a12" },
  },
];

export const scrollStops = [0, 0.22, 0.48, 0.72, 1];
