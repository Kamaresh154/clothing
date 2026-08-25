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
    type: "shirt";
    color: string;
    roughness: number;
    metalness: number;
    sheen: number;
    description: string;
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
    garment: {
      type: "shirt",
      color: "#fafaf8",
      roughness: 0.85,
      metalness: 0.0,
      sheen: 0.22,
      description: "Crisp • Structured • Slightly rough",
    },
    palette: {
      top: "#fafaf8",
      top2: "#ece9e2",
      outer: "#fafaf8",
      outer2: "#ece9e2",
      bottom: "#1a1c1e",
      shoes: "#ece6da",
      skin: "#c9b99a",
    },
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
    garment: {
      type: "shirt",
      color: "#0c0c0e",
      roughness: 0.32,
      metalness: 0.08,
      sheen: 0.85,
      description: "Fluid • Reflective • Soft",
    },
    details: ["Pure Silk", "Relaxed Structure", "Signature Cut"],
    palette: {
      top: "#0c0c0e",
      top2: "#1a1a1e",
      outer: "#0c0c0e",
      outer2: "#1a1a1e",
      bottom: "#0e0e10",
      shoes: "#0a0a0c",
      skin: "#c9b99a",
    },
    camera: { pos: [1.1, 1.6, 3.2], look: [0, 1.46, 0] },
    light: { intensity: 0.92, color: "#8a7dff", fog: "#07070a" },
  },
  {
    id: "shirt-03",
    name: "THE EVERYDAY ICON",
    subtitle: "LOOK 03 — THE EVERYDAY ICON",
    headline: "THE\nEVERYDAY\nICON",
    sub: "Textured cotton / Oversized fit / Garment dyed",
    price: 12900,
    material: "Textured Cotton • Slub Weave • Oversized",
    garment: {
      type: "shirt",
      color: "#cbbca0",
      roughness: 0.92,
      metalness: 0.0,
      sheen: 0.12,
      description: "Textured • Naturally wrinkled • Dense",
    },
    details: ["Textured Cotton", "Oversized Fit", "Garment Dyed"],
    palette: {
      top: "#cbbca0",
      top2: "#b8a88c",
      outer: "#cbbca0",
      outer2: "#b8a88c",
      bottom: "#222326",
      shoes: "#ece6da",
      skin: "#c9b99a",
    },
    camera: { pos: [-1.05, 1.2, 3.9], look: [0, 1.02, 0] },
    light: { intensity: 1.22, color: "#ffe0b8", fog: "#0f0e0c" },
  },
  {
    id: "look-final",
    name: "DRESS DIFFERENT.",
    subtitle: "FINAL LOOK — THE STATEMENT",
    headline: "DRESS\nDIFFERENT.",
    sub: "Crafted for the man who doesn't need to explain his style",
    price: 45900,
    material: "Double-Face Wool • Hand Pressed • Limited 120 pcs",
    garment: {
      type: "shirt",
      color: "#c9b99a",
      roughness: 0.68,
      metalness: 0.04,
      sheen: 0.3,
      description: "Dense • Matte • Structured",
    },
    details: ["Architectural Cut", "Double-Face Wool", "Atelier Made"],
    palette: {
      top: "#0f0f12",
      top2: "#1e1e22",
      outer: "#c9b99a",
      outer2: "#a8987a",
      bottom: "#141518",
      shoes: "#0f0f12",
      skin: "#c9b99a",
    },
    camera: { pos: [0, 1.35, 5.0], look: [0, 1.32, 0] },
    light: { intensity: 1.35, color: "#ffe8c8", fog: "#0a0a0c" },
  },
];

export const scrollStops = [0, 0.22, 0.48, 0.72, 1];
