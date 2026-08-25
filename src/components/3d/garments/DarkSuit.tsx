"use client";
import * as THREE from "three";

/**
 * DARK LUXURY SUIT — dense wool, peaked lapels, belt, pocket square
 * Distinct: 0.42/0.74, tailored, structured
 * GLB: '/models/outfits/dark-suit.glb'
 */
export function DarkSuit({
  leftRef, rightRef, sleeveLRef, sleeveRRef, collarRef,
}: {
  leftRef: React.RefObject<THREE.Mesh | null>;
  rightRef: React.RefObject<THREE.Mesh | null>;
  sleeveLRef: React.RefObject<THREE.Mesh | null>;
  sleeveRRef: React.RefObject<THREE.Mesh | null>;
  collarRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group>
      <mesh position={[0, 1.08, -0.07]}>
        <capsuleGeometry args={[0.32, 0.62, 8, 18]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.72} transparent />
      </mesh>
      <mesh position={[0, 1.05, -0.05]}>
        <capsuleGeometry args={[0.42, 0.74, 8, 20]} />
        <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent />
      </mesh>
      <mesh ref={leftRef} position={[-0.22, 1.05, 0.105]}>
        <boxGeometry args={[0.42, 0.74, 0.058]} />
        <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent />
      </mesh>
      <mesh ref={rightRef} position={[0.22, 1.05, 0.105]}>
        <boxGeometry args={[0.42, 0.74, 0.058]} />
        <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent />
      </mesh>
      <group ref={collarRef} position={[0, 1.38, 0.135]}>
        <mesh position={[-0.13, -0.05, 0.04]} rotation={[0.30, 0, 0.62]}>
          <boxGeometry args={[0.15, 0.32, 0.015]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.62} transparent />
        </mesh>
        <mesh position={[0.13, -0.05, 0.04]} rotation={[0.30, 0, -0.62]}>
          <boxGeometry args={[0.15, 0.32, 0.015]} />
          <meshStandardMaterial color="#1a1a1e" roughness={0.62} transparent />
        </mesh>
        <mesh position={[0.11, -0.14, 0.045]} rotation={[0, 0, -0.12]}>
          <planeGeometry args={[0.07, 0.045]} />
          <meshStandardMaterial color="#c9b99a" roughness={0.82} side={THREE.DoubleSide} transparent />
        </mesh>
      </group>
      <group position={[0, 1.05, 0.15]}>
        {[0.08, -0.04].map((y, i) => (
          <mesh key={i} position={[0.02, y, 0]}>
            <sphereGeometry args={[0.013, 12, 12]} />
            <meshStandardMaterial color="#c9b99a" roughness={0.42} metalness={0.22} transparent />
          </mesh>
        ))}
      </group>
      <mesh ref={sleeveLRef} position={[-0.54, 1.00, 0]} rotation={[0, 0, 0.05]}>
        <capsuleGeometry args={[0.112, 0.57, 6, 14]} />
        <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent />
      </mesh>
      <mesh ref={sleeveRRef} position={[0.54, 1.00, 0]} rotation={[0, 0, -0.05]}>
        <capsuleGeometry args={[0.112, 0.57, 6, 14]} />
        <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent />
      </mesh>
      <mesh position={[-0.58, 0.70, 0.02]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.102, 0.102, 0.068, 16]} />
        <meshStandardMaterial color="#131316" roughness={0.62} transparent />
      </mesh>
      <mesh position={[0.58, 0.70, 0.02]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.102, 0.102, 0.068, 16]} />
        <meshStandardMaterial color="#131316" roughness={0.62} transparent />
      </mesh>
      <mesh position={[0, 0.70, 0.02]}>
        <cylinderGeometry args={[0.335, 0.335, 0.035, 32]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.45} metalness={0.08} transparent />
      </mesh>
      <mesh position={[0, 0.70, 0.18]}>
        <boxGeometry args={[0.045, 0.035, 0.022]} />
        <meshStandardMaterial color="#c9b99a" roughness={0.38} metalness={0.35} transparent />
      </mesh>
    </group>
  );
}
