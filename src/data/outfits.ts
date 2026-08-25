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
  garment: {
    type: GarmentType;
    color: string;
    roughness: number;
    metalness: number;
    sheen: number;
    description: string;
    asset: string;
  };
  layers: {
    base: boolean;
    outer: boolean;
    trousers: boolean;
    accessories: boolean;
  };
  silhouette: {
    shoulderWidth: number;
    torsoHeight: number;
    torsoWidth: number;
    sleeveRadius: number;
    sleeveLength: number;
    hasLapels: boolean;
    hasPockets: boolean;
    buttonCount: number;
  };
  palette: {
    top: string;
    top2: string;
    outer: string;
    outer2: string;
    bottom: string;
    shoes: string;
    skin: string;
  };
  camera: { pos: [number, number, number]; look: [number, number, number] };
  light: { intensity: number; color: string; fog: string };
};

export const outfits: Outfit[] = [
  {
    id: "shirt-01",
    name: "WHITE SIGNATURE SHIRT",
    subtitle: "LOOK 01 — THE WHITE SIGNATURE",
    headline: "THE WHITE\nSIGNATURE",
    sub: "Crisp white premium cotton / Relaxed structure / 220 GSM",
    price: 12900,
    material: "Premium Cotton Poplin • 220 GSM • Garment Washed",
    details: ["220 GSM Premium Cotton", "Mother-of-Pearl Buttons", "Structured Collar"],
    garment: { type: "shirt", color: "#fafaf8", roughness: 0.88, metalness: 0.0, sheen: 0.22, description: "Crisp • Structured • Slightly rough", asset: "/models/white-shirt.glb" },
    layers: { base: true, outer: false, trousers: true, accessories: false },
    silhouette: { shoulderWidth: 0.46, torsoHeight: 0.60, torsoWidth: 0.34, sleeveRadius: 0.102, sleeveLength: 0.52, hasLapels: false, hasPockets: false, buttonCount: 5 },
    palette: { top: "#fafaf8", top2: "#ece9e2", outer: "#fafaf8", outer2: "#ece9e2", bottom: "#1a1c1e", shoes: "#ece6da", skin: "#c9b99a" },
    camera: { pos: [0, 1.55, 4.4], look: [0, 1.42, 0] },
    light: { intensity: 1.15, color: "#fff8ec", fog: "#0a0a0c" },
  },
  {
    id: "shirt-02",
    name: "THE NIGHT SHIRT",
    subtitle: "LOOK 02 — THE NIGHT SHIRT",
    headline: "THE NIGHT\nSHIRT",
    sub: "Pure silk / Relaxed structure / Signature cut",
    price: 18900,
    material: "Pure Mulberry Silk • 19 Momme • Fluid Drape",
    details: ["Pure Silk", "Relaxed Structure", "Signature Cut"],
    garment: { type: "silk-shirt", color: "#0c0c0e", roughness: 0.28, metalness: 0.06, sheen: 0.85, description: "Fluid • Reflective • Soft", asset: "/models/black-silk-shirt.glb" },
    layers: { base: true, outer: false, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.48, torsoHeight: 0.62, torsoWidth: 0.335, sleeveRadius: 0.098, sleeveLength: 0.56, hasLapels: false, hasPockets: false, buttonCount: 4 },
    palette: { top: "#0c0c0e", top2: "#1a1a1e", outer: "#0c0c0e", outer2: "#1a1a1e", bottom: "#0a0a0c", shoes: "#0a0a0c", skin: "#c9b99a" },
    camera: { pos: [1.1, 1.6, 3.2], look: [0, 1.46, 0] },
    light: { intensity: 0.92, color: "#8a7dff", fog: "#07070a" },
  },
  {
    id: "jacket-03",
    name: "BEIGE OVERSHIRT JACKET",
    subtitle: "LOOK 03 — THE BEIGE JACKET",
    headline: "THE\nBEIGE\nJACKET",
    sub: "Structured wool overshirt / Wider shoulders / Lapels",
    price: 24900,
    material: "Wool Blend • Brushed • Structured",
    details: ["Structured Wool", "Wider Shoulders", "Lapels & Pockets"],
    garment: { type: "jacket", color: "#cbbca0", roughness: 0.82, metalness: 0.01, sheen: 0.18, description: "Structured • Wool • Higher roughness", asset: "/models/beige-jacket.glb" },
    layers: { base: true, outer: true, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.54, torsoHeight: 0.70, torsoWidth: 0.40, sleeveRadius: 0.115, sleeveLength: 0.58, hasLapels: true, hasPockets: true, buttonCount: 3 },
    palette: { top: "#cbbca0", top2: "#b8a88c", outer: "#cbbca0", outer2: "#b8a88c", bottom: "#222326", shoes: "#ece6da", skin: "#c9b99a" },
    camera: { pos: [-1.05, 1.2, 3.9], look: [0, 1.02, 0] },
    light: { intensity: 1.22, color: "#ffe0b8", fog: "#0f0e0c" },
  },
  {
    id: "suit-final",
    name: "DARK LUXURY SUIT",
    subtitle: "FINAL LOOK — THE STATEMENT SUIT",
    headline: "DRESS\nDIFFERENT.",
    sub: "Dense wool • Tailored • Premium dark",
    price: 45900,
    material: "Double-Face Wool • Hand Pressed • Limited 120 pcs",
    details: ["Architectural Cut", "Double-Face Wool", "Atelier Made"],
    garment: { type: "suit", color: "#131316", roughness: 0.64, metalness: 0.04, sheen: 0.28, description: "Dense • Matte • Structured", asset: "/models/statement-suit.glb" },
    layers: { base: true, outer: true, trousers: true, accessories: true },
    silhouette: { shoulderWidth: 0.56, torsoHeight: 0.74, torsoWidth: 0.42, sleeveRadius: 0.112, sleeveLength: 0.57, hasLapels: true, hasPockets: true, buttonCount: 2 },
    palette: { top: "#0f0f12", top2: "#1e1e22", outer: "#131316", outer2: "#1e1e22", bottom: "#0a0a0c", shoes: "#08080a", skin: "#c9b99a" },
    camera: { pos: [0, 1.35, 5.0], look: [0, 1.32, 0] },
    light: { intensity: 1.35, color: "#ffe8c8", fog: "#0a0a0c" },
  },
];

export const scrollStops = [0, 0.22, 0.48, 0.72, 1];
