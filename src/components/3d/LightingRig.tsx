"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { outfits } from "@/data/outfits";
import { clamp, easeInOutCubic, lerp } from "./utils";

export default function LightingRig({ progress }: { progress: number }) {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    if (!dirRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const bt = easeInOutCubic(t);
    colA.set(cur.light.color); colB.set(nxt.light.color);
    dirRef.current.intensity = lerp(cur.light.intensity, nxt.light.intensity, bt) * 1.55;
    dirRef.current.color.copy(colA).lerp(colB, bt);
    if (fillRef.current) fillRef.current.intensity = lerp(0.32, 0.55, bt);
    if (spotRef.current) {
      spotRef.current.intensity = lerp(0.72, 1.08, Math.sin(progress * Math.PI));
      let mask = 0;
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp > 0.38 && tp < 0.58) mask = Math.max(mask, Math.sin(((tp - 0.38) / 0.20) * Math.PI));
      }
      spotRef.current.intensity += mask * 0.42;
    }
  });
  return (
    <>
      <ambientLight intensity={0.42} color="#f5f1e8" />
      <directionalLight
        ref={dirRef}
        position={[3.8, 5.2, 2.8]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00018}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight ref={fillRef} position={[-3.2, 3.5, -2.2]} intensity={0.38} color="#c9b99a" />
      <spotLight ref={spotRef} position={[0, 4.6, 0.8]} intensity={0.88} angle={0.42} penumbra={0.82} color="#fff3dd" />
      <pointLight position={[0, 1.15, 2.0]} intensity={0.52} color="#ffe9c8" distance={3.8} decay={2} />
    </>
  );
}
