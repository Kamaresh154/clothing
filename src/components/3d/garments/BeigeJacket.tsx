"use client";
import * as THREE from "three";

/**
 * BEIGE STRUCTURED JACKET — wool, wider shoulders, lapels, pockets
 * Distinct: 0.40/0.70, shoulder 0.54, + lapels
 * GLB: '/models/outfits/beige-jacket.glb'
 */
export function BeigeJacket({
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
      {/* base tee under jacket for layer contrast */}
      <mesh position={[0, 1.08, -0.07]}>
        <capsuleGeometry args={[0.32, 0.62, 8, 18]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent />
      </mesh>
      <mesh position={[0, 1.06, -0.05]}>
        <capsuleGeometry args={[0.40, 0.70, 8, 20]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent />
      </mesh>
      <mesh ref={leftRef} position={[-0.22, 1.06, 0.10]}>
        <boxGeometry args={[0.40, 0.70, 0.055]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent />
      </mesh>
      <mesh ref={rightRef} position={[0.22, 1.06, 0.10]}>
        <boxGeometry args={[0.40, 0.70, 0.055]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent />
      </mesh>
      <group ref={collarRef} position={[0, 1.37, 0.13]}>
        <mesh position={[-0.12, -0.04, 0.04]} rotation={[0.35, 0, 0.55]}>
          <boxGeometry args={[0.13, 0.28, 0.014]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.78} transparent />
        </mesh>
        <mesh position={[0.12, -0.04, 0.04]} rotation={[0.35, 0, -0.55]}>
          <boxGeometry args={[0.13, 0.28, 0.014]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.78} transparent />
        </mesh>
      </group>
      <mesh position={[-0.14, 1.05, 0.135]}>
        <boxGeometry args={[0.12, 0.13, 0.018]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.84} transparent />
      </mesh>
      <mesh position={[0.14, 1.05, 0.135]}>
        <boxGeometry args={[0.12, 0.13, 0.018]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.84} transparent />
      </mesh>
      <group position={[0, 1.06, 0.145]}>
        {[0.14, 0.02, -0.10].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.010, 16]} />
            <meshStandardMaterial color="#2a241e" roughness={0.65} transparent />
          </mesh>
        ))}
      </group>
      <mesh ref={sleeveLRef} position={[-0.52, 1.00, 0]} rotation={[0, 0, 0.06]}>
        <capsuleGeometry args={[0.115, 0.58, 6, 14]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent />
      </mesh>
      <mesh ref={sleeveRRef} position={[0.52, 1.00, 0]} rotation={[0, 0, -0.06]}>
        <capsuleGeometry args={[0.115, 0.58, 6, 14]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent />
      </mesh>
      <mesh position={[-0.56, 0.70, 0.02]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.104, 0.104, 0.075, 16]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.80} transparent />
      </mesh>
      <mesh position={[0.56, 0.70, 0.02]} rotation={[0, 0, -0.06]}>
        <cylinderGeometry args={[0.104, 0.104, 0.075, 16]} />
        <meshStandardMaterial color="#cbbca0" roughness={0.80} transparent />
      </mesh>
    </group>
  );
}
