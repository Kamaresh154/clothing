"use client";
import { useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { outfits } from "@/data/outfits";
import CameraRig from "./3d/CameraRig";
import LightingRig from "./3d/LightingRig";
import EnvironmentRoom from "./3d/Environment";
import FashionModel from "./3d/FashionModel";
import OutfitController from "./3d/OutfitController";
import { Trousers } from "./3d/garments/Trousers";
import { clamp } from "./3d/utils";

/**
 * FashionScene — composition root.
 * Delegates to modular controllers per spec:
 *   FashionModel (body/arms) + OutfitController (4 garments) + Trousers/Shoes + Camera/Lighting/Environment
 * Garments are independent GLB-ready groups (public/models/outfits/*) with physical removal/wear.
 */
export default function FashionScene({ progress }: { progress: number }) {
  const total = outfits.length;
  let fabricMask = 0;
  for (let i = 0; i < total - 1; i++) {
    const seg = 1 / (total - 1);
    const tp = clamp((progress - i * seg) / seg, 0, 1);
    if (tp > 0.38 && tp < 0.60) fabricMask = Math.max(fabricMask, Math.sin(((tp - 0.38) / 0.22) * Math.PI));
  }
  const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows={!isReduced && !isMobile}
        dpr={[1, isMobile ? 1.25 : 1.55]}
        gl={{ antialias: true, powerPreference: isReduced ? "low-power" : "high-performance", alpha: true }}
        style={{ background: "transparent" }}
      >
        <CameraRig progress={progress} />
        <LightingRig progress={progress} />
        <EnvironmentRoom progress={progress} />
        {/* Body + garments share same world origin via synchronized breath */}
        <FashionModel progress={progress} />
        <OutfitController progress={progress} />
        <Trousers progress={progress} />
        <ContactShadows position={[0, -0.94, 0]} opacity={isReduced ? 0.22 : 0.46 + fabricMask * 0.14} scale={5.2} blur={isMobile ? 1.6 : 2.4} far={2.6} color="#000000" />
        <Environment preset="studio" environmentIntensity={0.34} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(0,0,0,0.58)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-[#08080a]/55 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: isReduced ? fabricMask * 0.4 : fabricMask * 0.92,
          background: fabricMask > 0.02 ? `radial-gradient(ellipse at 50% 55%, ${outfits[Math.floor(clamp(progress * (total - 1), 0, total - 1))]?.garment.color ?? "#0a0a0c"} 0%, #08080a 72%)` : "transparent",
        }}
      />
      <div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ opacity: isReduced ? 0 : fabricMask * 0.16, backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)` }} />
    </div>
  );
}
