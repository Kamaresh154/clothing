"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { outfits } from "@/data/outfits";

/** Shared tailored trousers + leather shoes. The legs are separated to give the figure a believable human stance. */
export function Trousers({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Mesh>(null);
  const rightLeg = useRef<THREE.Mesh>(null);
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
    const scaled = progress * (total - 1);
    const idx = Math.min(total - 1, Math.floor(scaled));
    const ti = Math.min(1, scaled - idx);
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    cA.set(cur.palette.bottom); cB.set(nxt.palette.bottom);
    col.copy(cA).lerp(cB, ti);
    [leftLeg.current, rightLeg.current].forEach((m) => {
      if (m) (m.material as THREE.MeshStandardMaterial).color.copy(col);
    });
    if (shoesRef.current) {
      shoesRef.current.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).color.copy(col);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* tailored pelvis */}
      <mesh position={[0, 0.86, 0]} scale={[1.02, 0.72, 0.78]} castShadow receiveShadow>
        <sphereGeometry args={[0.32, 28, 18]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.82} />
      </mesh>
      {/* separate trouser legs */}
      <mesh ref={leftLeg} position={[-0.17, 0.32, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.135, 0.72, 8, 18]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.84} />
      </mesh>
      <mesh ref={rightLeg} position={[0.17, 0.32, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.135, 0.72, 8, 18]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.84} />
      </mesh>
      {/* pressed crease lines */}
      <mesh position={[-0.17, 0.34, 0.138]} scale={[0.012, 0.35, 0.008]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b3d40" roughness={0.72} />
      </mesh>
      <mesh position={[0.17, 0.34, 0.138]} scale={[0.012, 0.35, 0.008]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b3d40" roughness={0.72} />
      </mesh>
      <group ref={shoesRef} position={[0, -0.16, 0.055]}>
        <mesh position={[-0.17, 0.04, 0.05]} rotation={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.10, 0.18, 6, 14]} />
          <meshStandardMaterial color="#171515" roughness={0.28} metalness={0.02} />
        </mesh>
        <mesh position={[0.17, 0.04, 0.05]} castShadow>
          <capsuleGeometry args={[0.10, 0.18, 6, 14]} />
          <meshStandardMaterial color="#171515" roughness={0.28} metalness={0.02} />
        </mesh>
      </group>
    </group>
  );
}
