"use client";
import * as THREE from "three";

/**
 * WHITE SIGNATURE SHIRT — premium cotton, 220 GSM
 * Procedural placeholder with distinct silhouette: fitted, 5 buttons, structured collar.
 * Production: replace with useGLTF('/models/outfits/white-shirt.glb')
 *   const { scene } = useGLTF('/models/outfits/white-shirt.glb')
 *   return <primitive object={scene} />
 * Keep same group refs/scale so GarmentController timeline stays valid.
 */
export function WhiteShirt({
  leftRef,
  rightRef,
  sleeveLRef,
  sleeveRRef,
  collarRef,
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
        <capsuleGeometry args={[0.335, 0.60, 8, 18]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.88} metalness={0} transparent />
      </mesh>
      <mesh ref={leftRef} position={[-0.18, 1.08, 0.09]}>
        <boxGeometry args={[0.33, 0.62, 0.042]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent />
      </mesh>
      <mesh ref={rightRef} position={[0.18, 1.08, 0.09]}>
        <boxGeometry args={[0.33, 0.62, 0.042]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent />
      </mesh>
      <group position={[0, 1.08, 0.125]}>
        {[0.22, 0.11, 0, -0.11, -0.22].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <sphereGeometry args={[0.011, 10, 10]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.45} metalness={0.15} transparent />
          </mesh>
        ))}
      </group>
      <mesh ref={collarRef} position={[0, 1.38, 0.12]} rotation={[0.16, 0, 0]}>
        <torusGeometry args={[0.132, 0.020, 10, 28, Math.PI * 1.26]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent />
      </mesh>
      <mesh position={[-0.10, 1.38, 0.15]} rotation={[0.44, 0, 0.32]}>
        <boxGeometry args={[0.095, 0.068, 0.012]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent />
      </mesh>
      <mesh position={[0.10, 1.38, 0.15]} rotation={[0.44, 0, -0.32]}>
        <boxGeometry args={[0.095, 0.068, 0.012]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent />
      </mesh>
      <mesh ref={sleeveLRef} position={[-0.46, 1.02, 0]} rotation={[0, 0, 0.07]}>
        <capsuleGeometry args={[0.102, 0.52, 6, 14]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent />
      </mesh>
      <mesh ref={sleeveRRef} position={[0.46, 1.02, 0]} rotation={[0, 0, -0.07]}>
        <capsuleGeometry args={[0.102, 0.52, 6, 14]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent />
      </mesh>
      <mesh position={[-0.50, 0.74, 0.02]} rotation={[0, 0, 0.07]}>
        <cylinderGeometry args={[0.090, 0.090, 0.055, 16]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.82} transparent />
      </mesh>
      <mesh position={[0.50, 0.74, 0.02]} rotation={[0, 0, -0.07]}>
        <cylinderGeometry args={[0.090, 0.090, 0.055, 16]} />
        <meshStandardMaterial color="#fafaf8" roughness={0.82} transparent />
      </mesh>
    </group>
  );
}
