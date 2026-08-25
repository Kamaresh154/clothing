"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { outfits } from "@/data/outfits";
import { _cA, easeInOutCubic } from "./utils";

export default function EnvironmentRoom({ progress }: { progress: number }) {
  const fogRef = useRef<THREE.FogExp2>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const fogA = useMemo(() => new THREE.Color(), []);
  const fogB = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    if (!fogRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    fogA.set(cur.light.fog); fogB.set(nxt.light.fog);
    _cA.copy(fogA).lerp(fogB, easeInOutCubic(t));
    fogRef.current.color.copy(_cA);
    if (floorRef.current) {
      (floorRef.current.material as THREE.MeshStandardMaterial).color.copy(_cA).lerp(new THREE.Color("#0a0a0c"), 0.35);
    }
  });
  return (
    <>
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.16} metalness={0.26} />
      </mesh>
      <gridHelper args={[16, 36, "#1c1c20", "#121316"]} position={[0, -0.945, 0]} />
      <mesh position={[0, 1.25, -2.35]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0f0f11" roughness={0.93} />
      </mesh>
      <mesh position={[-4.6, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#131315" roughness={0.96} />
      </mesh>
      <mesh position={[4.6, 1.25, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#131315" roughness={0.96} />
      </mesh>
      <mesh position={[0, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1a1a1c" emissive="#1e1e20" emissiveIntensity={0.28} roughness={1} />
      </mesh>
      <mesh position={[0, 1.4, -2.30]}>
        <planeGeometry args={[0.02, 2.2]} />
        <meshStandardMaterial color="#c9b99a" emissive="#c9b99a" emissiveIntensity={0.85} />
      </mesh>
      <fogExp2 attach="fog" args={["#0a0a0c", 0.072]} ref={fogRef as any} />
    </>
  );
}
