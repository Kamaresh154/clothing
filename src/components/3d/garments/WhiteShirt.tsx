"use client";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";

/** Editorial cotton shirt: layered torso, yoke, placket, collar, cuffs and tailored sleeves. */
export function WhiteShirt({ leftRef, rightRef, sleeveLRef, sleeveRRef, collarRef }: {
  leftRef: React.RefObject<THREE.Mesh | null>;
  rightRef: React.RefObject<THREE.Mesh | null>;
  sleeveLRef: React.RefObject<THREE.Mesh | null>;
  sleeveRRef: React.RefObject<THREE.Mesh | null>;
  collarRef: React.RefObject<THREE.Mesh | null>;
}) {
  const fabric = "#f5f3ee";
  const seam = "#dedbd3";
  return (
    <group>
      <RoundedBox args={[0.66, 0.66, 0.30]} radius={0.10} smoothness={4} position={[0, 1.08, -0.035]}>
        <meshPhysicalMaterial color={fabric} roughness={0.84} clearcoat={0.02} />
      </RoundedBox>
      {/* tailored shoulder yoke */}
      <RoundedBox args={[0.70, 0.16, 0.32]} radius={0.05} smoothness={3} position={[0, 1.36, -0.025]}>
        <meshStandardMaterial color={fabric} roughness={0.86} />
      </RoundedBox>
      {/* split front panels */}
      <mesh ref={leftRef} position={[-0.175, 1.08, 0.145]}>
        <boxGeometry args={[0.31, 0.62, 0.038]} />
        <meshStandardMaterial color={fabric} roughness={0.86} transparent />
      </mesh>
      <mesh ref={rightRef} position={[0.175, 1.08, 0.145]}>
        <boxGeometry args={[0.31, 0.62, 0.038]} />
        <meshStandardMaterial color={fabric} roughness={0.86} transparent />
      </mesh>
      {/* button placket */}
      <mesh position={[0, 1.08, 0.168]}>
        <boxGeometry args={[0.018, 0.54, 0.008]} />
        <meshStandardMaterial color={seam} roughness={0.72} />
      </mesh>
      {[0.22, 0.11, 0, -0.11, -0.22].map((y, i) => (
        <mesh key={i} position={[0, 1.08 + y, 0.178]}>
          <sphereGeometry args={[0.012, 12, 10]} />
          <meshStandardMaterial color="#34363a" roughness={0.35} metalness={0.05} />
        </mesh>
      ))}
      {/* spread collar */}
      <group ref={collarRef} position={[0, 1.405, 0.15]}>
        <mesh rotation={[0.18, 0, 0.30]} position={[-0.085, -0.015, 0]}>
          <boxGeometry args={[0.19, 0.075, 0.025]} />
          <meshStandardMaterial color={fabric} roughness={0.82} />
        </mesh>
        <mesh rotation={[0.18, 0, -0.30]} position={[0.085, -0.015, 0]}>
          <boxGeometry args={[0.19, 0.075, 0.025]} />
          <meshStandardMaterial color={fabric} roughness={0.82} />
        </mesh>
      </group>
      {/* sleeves */}
      <mesh ref={sleeveLRef} position={[-0.48, 1.03, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[0.105, 0.48, 8, 18]} />
        <meshStandardMaterial color={fabric} roughness={0.86} transparent />
      </mesh>
      <mesh ref={sleeveRRef} position={[0.48, 1.03, 0]} rotation={[0, 0, -0.08]}>
        <capsuleGeometry args={[0.105, 0.48, 8, 18]} />
        <meshStandardMaterial color={fabric} roughness={0.86} transparent />
      </mesh>
      {/* cuffs */}
      <mesh position={[-0.51, 0.75, 0.01]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.19, 0.075, 0.18]} />
        <meshStandardMaterial color={fabric} roughness={0.82} transparent />
      </mesh>
      <mesh position={[0.51, 0.75, 0.01]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.19, 0.075, 0.18]} />
        <meshStandardMaterial color={fabric} roughness={0.82} transparent />
      </mesh>
      {/* subtle seam lines */}
      <mesh position={[-0.325, 1.08, 0.151]}><boxGeometry args={[0.008, 0.53, 0.004]} /><meshStandardMaterial color={seam} roughness={0.9} /></mesh>
      <mesh position={[0.325, 1.08, 0.151]}><boxGeometry args={[0.008, 0.53, 0.004]} /><meshStandardMaterial color={seam} roughness={0.9} /></mesh>
    </group>
  );
}
