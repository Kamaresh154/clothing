"use client";
import * as THREE from "three";

/**
 * BLACK SILK SHIRT — 19 momme, fluid
 * Distinct silhouette: slightly longer, camp collar, tapered sleeves, low roughness.
 * GLB: '/models/outfits/black-silk-shirt.glb'
 */
export function BlackSilkShirt({
  leftRef, rightRef, sleeveLRef, sleeveRRef, collarRef,
}: {
  leftRef: React.RefObject<THREE.Mesh | null>;
  rightRef: React.RefObject<THREE.Mesh | null>;
  sleeveLRef: React.RefObject<THREE.Mesh | null>;
  sleeveRRef: React.RefObject<THREE.Mesh | null>;
  collarRef: React.RefObject<THREE.Mesh | null>;
}) {
  return (
    <group>
      <mesh position={[0, 1.08, -0.06]}>
        <capsuleGeometry args={[0.33, 0.62, 8, 18]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.04} transparent />
      </mesh>
      <mesh ref={leftRef} position={[-0.175, 1.08, 0.095]}>
        <boxGeometry args={[0.325, 0.64, 0.038]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent />
      </mesh>
      <mesh ref={rightRef} position={[0.175, 1.08, 0.095]}>
        <boxGeometry args={[0.325, 0.64, 0.038]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent />
      </mesh>
      <group position={[0, 1.08, 0.128]}>
        {[0.20, 0.08, -0.06, -0.18].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <sphereGeometry args={[0.010, 10, 10]} />
            <meshStandardMaterial color="#ece6da" roughness={0.32} metalness={0.18} transparent />
          </mesh>
        ))}
      </group>
      <mesh ref={collarRef} position={[0, 1.385, 0.13]} rotation={[0.18, 0, 0]}>
        <torusGeometry args={[0.140, 0.018, 10, 26, Math.PI * 1.35]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.30} metalness={0.06} transparent />
      </mesh>
      <mesh position={[-0.11, 1.385, 0.155]} rotation={[0.48, 0, 0.38]}>
        <boxGeometry args={[0.11, 0.072, 0.010]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.30} transparent />
      </mesh>
      <mesh position={[0.11, 1.385, 0.155]} rotation={[0.48, 0, -0.38]}>
        <boxGeometry args={[0.11, 0.072, 0.010]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.30} transparent />
      </mesh>
      <mesh ref={sleeveLRef} position={[-0.46, 1.02, 0]} rotation={[0, 0, 0.07]}>
        <capsuleGeometry args={[0.098, 0.56, 6, 14]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent />
      </mesh>
      <mesh ref={sleeveRRef} position={[0.46, 1.02, 0]} rotation={[0, 0, -0.07]}>
        <capsuleGeometry args={[0.098, 0.56, 6, 14]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent />
      </mesh>
      <mesh position={[-0.50, 0.72, 0.02]} rotation={[0, 0, 0.07]}>
        <cylinderGeometry args={[0.088, 0.088, 0.052, 16]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} transparent />
      </mesh>
      <mesh position={[0.50, 0.72, 0.02]} rotation={[0, 0, -0.07]}>
        <cylinderGeometry args={[0.088, 0.088, 0.052, 16]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.28} transparent />
      </mesh>
    </group>
  );
}
