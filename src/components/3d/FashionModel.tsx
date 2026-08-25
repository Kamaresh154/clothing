"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, easeInOutCubic, easeInOutQuad, easeOutExpo, lerp } from "./utils";
import { outfits } from "@/data/outfits";

/**
 * ONE consistent realistic male model — stable skeleton/scale/origin.
 * All clothing aligns to same body; model does not swap between outfits.
 * To replace with production GLB: useGLTF('/models/male-model.glb') inside this group,
 * keep same origin and bind Trousers/Shoes/Arm rig to skeleton.
 */
export default function FashionModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!groupRef.current) return;

    groupRef.current.position.y = -0.95 + (reduced ? 0 : Math.sin(t * 0.52) * 0.012);
    groupRef.current.rotation.y = (reduced ? 0 : Math.sin(t * 0.26) * 0.012) + progress * 0.08;
    groupRef.current.rotation.z = reduced ? 0 : Math.sin(t * 0.30) * 0.006;

    if (headRef.current && !reduced) {
      let yaw = Math.sin(t * 0.18) * 0.05;
      let pitch = Math.sin(t * 0.22) * 0.03;
      for (let i = 0; i < outfits.length - 1; i++) {
        const seg = 1 / (outfits.length - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp > 0.28 && tp < 0.52) {
          const p = clamp((tp - 0.28) / 0.14);
          yaw = lerp(yaw, -0.34, easeInOutQuad(p));
          pitch = lerp(pitch, 0.10, easeInOutQuad(p));
        }
      }
      headRef.current.rotation.y = yaw;
      headRef.current.rotation.x = pitch;
    }

    // Arm choreography — explicit timeline per spec
    let RShoulderX = -0.04, RShoulderZ = 0.06, RShoulderY = 0, RElbowX = 0.08;
    let LShoulderX = -0.04;

    if (!reduced) {
      for (let i = 0; i < outfits.length - 1; i++) {
        const seg = 1 / (outfits.length - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp < 0.001 || tp >= 1) continue;
        if (tp >= 0.10 && tp < 0.22) {
          const p = clamp((tp - 0.10) / 0.12);
          const e = easeInOutCubic(p);
          RShoulderX = lerp(-0.04, 0.74, e);
          RShoulderZ = lerp(0.06, -0.44, e);
          RShoulderY = lerp(0, -0.36, e);
          RElbowX = lerp(0.08, 1.88, e);
          LShoulderX = lerp(-0.04, 0.26, e * 0.55);
        }
        if (tp >= 0.22 && tp < 0.30) { RShoulderX = 0.74; RShoulderZ = -0.44; RShoulderY = -0.36; RElbowX = 1.88; LShoulderX = 0.26; }
        if (tp >= 0.30 && tp < 0.42) {
          const p = clamp((tp - 0.30) / 0.12);
          const e = easeInOutCubic(p);
          RShoulderX = lerp(0.74, -0.30, e);
          RShoulderZ = lerp(-0.44, -0.78, e);
          RShoulderY = lerp(-0.36, -0.88, e);
          RElbowX = lerp(1.88, 0.30, e);
          LShoulderX = lerp(0.26, 0.58, e);
        }
        if (tp >= 0.40 && tp < 0.52) {
          const p = clamp((tp - 0.40) / 0.12);
          RShoulderX = lerp(-0.30, -0.12, p);
          RShoulderZ = lerp(-0.78, -0.18, p);
          RShoulderY = lerp(-0.88, -0.10, p);
          RElbowX = lerp(0.30, 0.22, p);
          LShoulderX = lerp(0.58, 0.10, p);
        }
        if (tp >= 0.48 && tp < 0.58) {
          const p = clamp((tp - 0.48) / 0.10);
          RShoulderX = lerp(-0.12, 0.12, p);
          RShoulderZ = lerp(-0.18, 0.0, p);
          RShoulderY = lerp(-0.10, 0.08, p);
          RElbowX = lerp(0.22, 0.38, p);
          LShoulderX = lerp(0.10, 0.12, p);
        }
        if (tp >= 0.54 && tp < 0.66) {
          const p = clamp((tp - 0.54) / 0.12);
          const e = easeOutExpo(p);
          RShoulderX = lerp(0.12, 0.18, e);
          RShoulderZ = 0.0;
          RShoulderY = lerp(0.08, 0.10, e);
          RElbowX = lerp(0.38, 0.48, e);
          LShoulderX = lerp(0.12, 0.14, e);
        }
        if (tp >= 0.70 && tp < 0.88) {
          const p = clamp((tp - 0.70) / 0.18);
          const wob = Math.sin(p * Math.PI * 2.2) * 0.05 * (1 - p);
          RElbowX = 0.48 + wob;
          RShoulderX = 0.18 + wob * 0.35;
        }
        if (tp >= 0.88) { RShoulderX = -0.04; RShoulderZ = 0.06; RShoulderY = 0; RElbowX = 0.08; LShoulderX = -0.04; }
      }
    }

    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, RShoulderX, 0.13);
      rightShoulderRef.current.rotation.z = lerp(rightShoulderRef.current.rotation.z, RShoulderZ, 0.13);
      rightShoulderRef.current.rotation.y = lerp(rightShoulderRef.current.rotation.y, RShoulderY, 0.13);
    }
    if (rightElbowRef.current) rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, RElbowX, 0.15);
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, LShoulderX, 0.12);
      leftShoulderRef.current.rotation.z = lerp(leftShoulderRef.current.rotation.z, -LShoulderX * 0.42, 0.12);
    }
    if (leftElbowRef.current) leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, LShoulderX * 0.52, 0.12);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* head */}
      <group ref={headRef} position={[0, 1.78, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.205, 32, 32]} />
          <meshStandardMaterial color="#d9c5aa" roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.12, -0.03]} rotation={[0.22, 0, 0]}>
          <sphereGeometry args={[0.215, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color="#131316" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.09, 0.06]} scale={[0.95, 0.70, 0.85]}>
          <sphereGeometry args={[0.105, 16, 16]} />
          <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
        </mesh>
      </group>
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.088, 0.105, 0.18, 20]} />
        <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
      </mesh>
      <mesh position={[0, 1.08, 0]}>
        <capsuleGeometry args={[0.305, 0.62, 8, 20]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.82} />
      </mesh>
      {/* Arms (skin) — garment sleeves are handled by OutfitController */}
      <group ref={leftShoulderRef} position={[-0.38, 1.34, 0]}>
        <mesh position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.084, 0.46, 6, 14]} />
          <meshStandardMaterial color="#dcc8a9" transparent opacity={0} />
        </mesh>
        <group ref={leftElbowRef} position={[0, -0.48, 0]}>
          <mesh position={[0, -0.20, 0.02]} rotation={[0.10, 0, 0]}>
            <capsuleGeometry args={[0.074, 0.40, 6, 14]} />
            <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.42, 0.04]}>
            <sphereGeometry args={[0.076, 12, 12]} />
            <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
          </mesh>
        </group>
      </group>
      <group ref={rightShoulderRef} position={[0.38, 1.34, 0]}>
        <mesh position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.084, 0.46, 6, 14]} />
          <meshStandardMaterial color="#dcc8a9" transparent opacity={0} />
        </mesh>
        <group ref={rightElbowRef} position={[0, -0.48, 0]}>
          <mesh position={[0, -0.20, 0.02]} rotation={[0.08, 0, 0]}>
            <capsuleGeometry args={[0.074, 0.40, 6, 14]} />
            <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.42, 0.04]}>
            <sphereGeometry args={[0.076, 12, 12]} />
            <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
