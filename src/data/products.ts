export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  material: string;
  category: "JACKETS" | "SHIRTS" | "TROUSERS" | "T-SHIRTS" | "OUTERWEAR" | "ACCESSORIES";
  colors: { name: string; hex: string }[];
  sizes: string[];
  image: string;
  image2: string;
  badge?: string;
};

export const products: Product[] = [
  {
    id: "p-01",
    name: "SIGNATURE WOOL JACKET",
    subtitle: "ITALIAN WOOL • RELAXED TAILORING",
    price: 24900,
    material: "Loro Piana Super 130s",
    category: "JACKETS",
    colors: [{ name: "Camel", hex: "#c9b99a" }, { name: "Charcoal", hex: "#2a2d32" }, { name: "Ivory", hex: "#f5f1e8" }],
    sizes: ["XS","S","M","L","XL"],
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=800&q=80&auto=format&fit=crop",
    badge: "BESTSELLER",
  },
  {
    id: "p-02",
    name: "HEAVY COTTON TEE",
    subtitle: "420 GSM • GARMENT DYED",
    price: 5900,
    material: "Japanese Loopwheel Cotton",
    category: "T-SHIRTS",
    colors: [{ name: "Bone", hex: "#e8e2d6" }, { name: "Black", hex: "#0a0a0c" }, { name: "Slate", hex: "#5a5e66" }],
    sizes: ["S","M","L","XL"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "p-03",
    name: "TAILORED WOOL TROUSERS",
    subtitle: "RELAXED TAPER • PLEATED",
    price: 14900,
    material: "Italian Wool Twill",
    category: "TROUSERS",
    colors: [{ name: "Charcoal", hex: "#222326" }, { name: "Stone", hex: "#8d887e" }],
    sizes: ["28","30","32","34","36"],
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "p-04",
    name: "DOUBLE-FACE OVERCOAT",
    subtitle: "ARCHITECTURAL • HAND PRESSED",
    price: 45900,
    originalPrice: 52000,
    material: "Double-Face Wool",
    category: "OUTERWEAR",
    colors: [{ name: "Camel", hex: "#c9b99a" }, { name: "Noir", hex: "#0a0a0c" }],
    sizes: ["S","M","L"],
    image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80&auto=format&fit=crop",
    badge: "LIMITED",
  },
  {
    id: "p-05",
    name: "ESSENTIAL SHIRT",
    subtitle: "STRUCTURED SILHOUETTE",
    price: 8900,
    material: "Premium Cotton Poplin",
    category: "SHIRTS",
    colors: [{ name: "White", hex: "#fafaf8" }, { name: "Slate", hex: "#6b6f76" }, { name: "Black", hex: "#0a0a0c" }],
    sizes: ["S","M","L","XL"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "p-06",
    name: "CASHMERE TURTLENECK",
    subtitle: "BRUSHED • MIDNIGHT",
    price: 18900,
    material: "Wool Cashmere Blend",
    category: "SHIRTS",
    colors: [{ name: "Noir", hex: "#0a0a0c" }, { name: "Charcoal", hex: "#2a2d32" }],
    sizes: ["S","M","L"],
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "p-07",
    name: "LEATHER BELT — BRUSHED",
    subtitle: "ITALIAN LEATHER • MINIMAL BUCKLE",
    price: 5900,
    material: "Full-Grain Leather",
    category: "ACCESSORIES",
    colors: [{ name: "Black", hex: "#0a0a0c" }, { name: "Cognac", hex: "#8b5a2b" }],
    sizes: ["S","M","L"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80&auto=format&fit=crop",
  },
  {
    id: "p-08",
    name: "SUEDE LOAFER",
    subtitle: "HAND STITCHED",
    price: 16900,
    material: "Italian Suede",
    category: "ACCESSORIES",
    colors: [{ name: "Sand", hex: "#d9d0bf" }, { name: "Noir", hex: "#0a0a0c" }],
    sizes: ["7","8","9","10","11"],
    image: "https://images.unsplash.com/photo-1614253429381-4d0ae31b19cf?w=800&q=80&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80&auto=format&fit=crop",
  },
];

export const categories = ["ALL","JACKETS","SHIRTS","TROUSERS","T-SHIRTS","OUTERWEAR","ACCESSORIES"] as const;
