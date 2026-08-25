"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { outfits } from "@/data/outfits";

/**
 * Trousers + Shoes — shared across outfits, color lerps per outfit.
 * Production: '/models/trousers.glb' and '/models/shoes.glb'
 * Keep same origin/scale as body so OutfitController stays aligned.
 */
export function Trousers({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const shoesRef = useRef<THREE.Group>(null);
  const col = useMemo(() => new THREE.Color(), []);
  const cA = useMemo(() => new THREE.Color(), []);
  const cB = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const breath = reduced ? 0 : Math.sin(t * 0.52) * 0.012;
    if (groupRef.current) {
      groupRef.current.position.y = -0.95 + breath;
      groupRef.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.26) * 0.012) + progress * 0.08;
    }
    const total = outfits.length;
    const idx = Math.min(total - 1, Math.floor(progress * (total - 1)));
    const ti = progress * (total - 1) - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    cA.set(cur.palette.bottom); cB.set(nxt.palette.bottom);
    col.copy(cA).lerp(cB, ti);
    if (meshRef.current) (meshRef.current.material as THREE.MeshStandardMaterial).color.copy(col);
    if (shoesRef.current) {
      shoesRef.current.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).color.copy(col);
      });
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[0, 0.42, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.325, 0.98, 8, 20]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.88} />
      </mesh>
      <group ref={shoesRef} position={[0, -0.08, 0]}>
        <mesh position={[-0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.52} />
        </mesh>
        <mesh position={[0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.52} />
        </mesh>
      </group>
    </group>
  );
}
