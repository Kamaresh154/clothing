"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, easeInOutCubic, easeInOutQuad, easeOutExpo, lerp } from "./utils";
import { outfits } from "@/data/outfits";

const skin = "#c99f7a";
const skinLight = "#d8b08b";
const hair = "#171312";
const eye = "#f3eee7";
const iris = "#463328";
const lip = "#8f5e52";

/**
 * Editorial male figure built as a high-detail procedural base.
 * This is deliberately more anatomical than the original mannequin: neck,
 * clavicles, chest/abdomen, pelvis, separated legs, hands, ears, eyes, nose,
 * lips and layered hair. A production scan/GLB can replace this component later
 * without changing the outfit/scroll architecture.
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
      let yaw = Math.sin(t * 0.18) * 0.035;
      let pitch = Math.sin(t * 0.22) * 0.018;
      for (let i = 0; i < outfits.length - 1; i++) {
        const seg = 1 / (outfits.length - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp > 0.28 && tp < 0.52) {
          const p = clamp((tp - 0.28) / 0.14);
          yaw = lerp(yaw, -0.28, easeInOutQuad(p));
          pitch = lerp(pitch, 0.07, easeInOutQuad(p));
        }
      }
      headRef.current.rotation.y = yaw;
      headRef.current.rotation.x = pitch;
    }

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
          RShoulderX = lerp(-0.04, 0.74, e); RShoulderZ = lerp(0.06, -0.44, e); RShoulderY = lerp(0, -0.36, e);
          RElbowX = lerp(0.08, 1.88, e); LShoulderX = lerp(-0.04, 0.26, e * 0.55);
        }
        if (tp >= 0.22 && tp < 0.30) { RShoulderX = 0.74; RShoulderZ = -0.44; RShoulderY = -0.36; RElbowX = 1.88; LShoulderX = 0.26; }
        if (tp >= 0.30 && tp < 0.42) {
          const p = clamp((tp - 0.30) / 0.12); const e = easeInOutCubic(p);
          RShoulderX = lerp(0.74, -0.30, e); RShoulderZ = lerp(-0.44, -0.78, e); RShoulderY = lerp(-0.36, -0.88, e);
          RElbowX = lerp(1.88, 0.30, e); LShoulderX = lerp(0.26, 0.58, e);
        }
        if (tp >= 0.40 && tp < 0.52) {
          const p = clamp((tp - 0.40) / 0.12);
          RShoulderX = lerp(-0.30, -0.12, p); RShoulderZ = lerp(-0.78, -0.18, p); RShoulderY = lerp(-0.88, -0.10, p);
          RElbowX = lerp(0.30, 0.22, p); LShoulderX = lerp(0.58, 0.10, p);
        }
        if (tp >= 0.48 && tp < 0.58) {
          const p = clamp((tp - 0.48) / 0.10);
          RShoulderX = lerp(-0.12, 0.12, p); RShoulderZ = lerp(-0.18, 0.0, p); RShoulderY = lerp(-0.10, 0.08, p);
          RElbowX = lerp(0.22, 0.38, p); LShoulderX = lerp(0.10, 0.12, p);
        }
        if (tp >= 0.54 && tp < 0.66) {
          const p = clamp((tp - 0.54) / 0.12); const e = easeOutExpo(p);
          RShoulderX = lerp(0.12, 0.18, e); RShoulderZ = 0; RShoulderY = lerp(0.08, 0.10, e);
          RElbowX = lerp(0.38, 0.48, e); LShoulderX = lerp(0.12, 0.14, e);
        }
        if (tp >= 0.70 && tp < 0.88) {
          const p = clamp((tp - 0.70) / 0.18); const wob = Math.sin(p * Math.PI * 2.2) * 0.05 * (1 - p);
          RElbowX = 0.48 + wob; RShoulderX = 0.18 + wob * 0.35;
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

  const skinMat = <meshPhysicalMaterial color={skin} roughness={0.72} metalness={0} clearcoat={0.04} clearcoatRoughness={0.8} />;
  const skinLightMat = <meshPhysicalMaterial color={skinLight} roughness={0.7} metalness={0} clearcoat={0.04} />;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* head and face */}
      <group ref={headRef} position={[0, 1.82, 0]}>
        <mesh scale={[0.93, 1.10, 0.91]} castShadow>{<sphereGeometry args={[0.205, 40, 32]} />}{skinMat}</mesh>
        <mesh position={[0, 0.115, -0.025]} scale={[1.02, 0.72, 0.98]}>
          <sphereGeometry args={[0.213, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.60]} />
          <meshStandardMaterial color={hair} roughness={0.86} />
        </mesh>
        {/* hairline / sideburns */}
        <mesh position={[-0.16, 0.055, 0.0]} scale={[0.30, 0.24, 0.12]} rotation={[0, 0.18, -0.22]}><sphereGeometry args={[0.12, 20, 16]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
        <mesh position={[0.16, 0.055, 0.0]} scale={[0.30, 0.24, 0.12]} rotation={[0, -0.18, 0.22]}><sphereGeometry args={[0.12, 20, 16]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
        {/* ears */}
        <mesh position={[-0.205, -0.005, 0]} scale={[0.45, 0.82, 0.55]}>{<sphereGeometry args={[0.075, 20, 16]} />}{skinLightMat}</mesh>
        <mesh position={[0.205, -0.005, 0]} scale={[0.45, 0.82, 0.55]}>{<sphereGeometry args={[0.075, 20, 16]} />}{skinLightMat}</mesh>
        {/* eyes */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.072, 0.015, 0.190]}>
            <mesh scale={[1.15, 0.62, 0.35]}><sphereGeometry args={[0.034, 20, 12]} /><meshStandardMaterial color={eye} roughness={0.35} /></mesh>
            <mesh position={[s * 0.004, 0, 0.028]}><sphereGeometry args={[0.014, 16, 12]} /><meshStandardMaterial color={iris} roughness={0.25} /></mesh>
            <mesh position={[s * 0.004, 0, 0.040]}><sphereGeometry args={[0.005, 12, 8]} /><meshBasicMaterial color="#111111" /></mesh>
          </group>
        ))}
        {/* brows */}
        <mesh position={[-0.072, 0.072, 0.192]} rotation={[0, 0, -0.10]}><boxGeometry args={[0.075, 0.009, 0.010]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
        <mesh position={[0.072, 0.072, 0.192]} rotation={[0, 0, 0.10]}><boxGeometry args={[0.075, 0.009, 0.010]} /><meshStandardMaterial color={hair} roughness={0.9} /></mesh>
        {/* nose bridge + tip */}
        <mesh position={[0, -0.035, 0.205]} scale={[0.52, 1.35, 0.70]}>{<capsuleGeometry args={[0.027, 0.055, 5, 12]} />}{skinLightMat}</mesh>
        <mesh position={[0, -0.078, 0.218]} scale={[1.15, 0.62, 0.80]}><sphereGeometry args={[0.028, 18, 12]} />{skinLightMat}</mesh>
        {/* lips */}
        <mesh position={[0, -0.112, 0.205]} scale={[1.15, 0.35, 0.45]}><sphereGeometry args={[0.035, 20, 12]} /><meshStandardMaterial color={lip} roughness={0.52} /></mesh>
      </group>

      {/* neck and upper torso anatomy */}
      <mesh position={[0, 1.58, 0]} castShadow>{<cylinderGeometry args={[0.082, 0.105, 0.20, 24]} />}{skinMat}</mesh>
      <mesh position={[0, 1.30, 0]} scale={[1.04, 1.12, 0.72]} castShadow>{<sphereGeometry args={[0.30, 36, 24]} />}{<meshPhysicalMaterial color="#d6b99b" roughness={0.84} />}</mesh>
      {/* clavicles */}
      <mesh position={[-0.14, 1.40, 0.23]} rotation={[0, 0.25, -0.28]} scale={[1.0, 0.45, 0.45]}><capsuleGeometry args={[0.032, 0.18, 6, 12]} />{skinLightMat}</mesh>
      <mesh position={[0.14, 1.40, 0.23]} rotation={[0, -0.25, 0.28]} scale={[1.0, 0.45, 0.45]}><capsuleGeometry args={[0.032, 0.18, 6, 12]} />{skinLightMat}</mesh>

      {/* left arm */}
      <group ref={leftShoulderRef} position={[-0.38, 1.34, 0]}>
        <mesh position={[0, -0.24, 0]} scale={[1.05, 1, 1]} castShadow>{<capsuleGeometry args={[0.082, 0.44, 8, 18]} />}{skinMat}</mesh>
        <group ref={leftElbowRef} position={[0, -0.47, 0]}>
          <mesh position={[0, -0.20, 0.02]} rotation={[0.10, 0, 0]} castShadow>{<capsuleGeometry args={[0.070, 0.38, 8, 18]} />}{skinMat}</mesh>
          <mesh position={[0, -0.42, 0.04]} scale={[1.05, 0.88, 0.72]} castShadow>{<sphereGeometry args={[0.078, 20, 16]} />}{skinLightMat}</mesh>
          <mesh position={[0, -0.51, 0.04]} scale={[0.82, 1.18, 0.64]} castShadow>{<capsuleGeometry args={[0.078, 0.14, 6, 14]} />}{skinMat}</mesh>
        </group>
      </group>

      {/* right arm */}
      <group ref={rightShoulderRef} position={[0.38, 1.34, 0]}>
        <mesh position={[0, -0.24, 0]} scale={[1.05, 1, 1]} castShadow>{<capsuleGeometry args={[0.082, 0.44, 8, 18]} />}{skinMat}</mesh>
        <group ref={rightElbowRef} position={[0, -0.47, 0]}>
          <mesh position={[0, -0.20, 0.02]} rotation={[0.08, 0, 0]} castShadow>{<capsuleGeometry args={[0.070, 0.38, 8, 18]} />}{skinMat}</mesh>
          <mesh position={[0, -0.42, 0.04]} scale={[1.05, 0.88, 0.72]} castShadow>{<sphereGeometry args={[0.078, 20, 16]} />}{skinLightMat}</mesh>
          <mesh position={[0, -0.51, 0.04]} scale={[0.82, 1.18, 0.64]} castShadow>{<capsuleGeometry args={[0.078, 0.14, 6, 14]} />}{skinMat}</mesh>
        </group>
      </group>
    </group>
  );
}
