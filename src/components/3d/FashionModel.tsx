"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real GLB male base model.
 * The clothing system remains separate so scroll can swap the garments over
 * the same human figure instead of rebuilding a mannequin for every look.
 *
 * Source model: CC0 male base mesh published by Siddu7077/3D-model.
 * We normalize its bounds at runtime so the existing garment coordinates keep
 * their alignment across the page experience.
 */
const MODEL_URL = "https://raw.githubusercontent.com/Siddu7077/3D-model/main/rbb.glb";

function RealMaleModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const height = Math.max(size.y, 0.001);
    const targetHeight = 2.9;
    const scale = targetHeight / height;

    clone.scale.setScalar(scale);
    clone.position.x -= center.x * scale;
    clone.position.z -= center.z * scale;
    clone.position.y -= box.min.y * scale;

    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const material = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        if (material) {
          material.roughness = Math.max(material.roughness ?? 0.65, 0.45);
          material.envMapIntensity = 0.9;
        }
      }
    });

    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetY = -0.95 + (reduced ? 0 : Math.sin(t * 0.52) * 0.008);
    const targetRot = progress * 0.075 + (reduced ? 0 : Math.sin(t * 0.22) * 0.012);

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.08);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      reduced ? 0 : Math.sin(t * 0.28) * 0.004,
      0.08,
    );
  });

  return <primitive ref={groupRef} object={model} />;
}

function ModelFallback() {
  return (
    <group position={[0, -0.95, 0]}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <capsuleGeometry args={[0.28, 1.1, 12, 24]} />
        <meshStandardMaterial color="#8d6b58" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow>
        <sphereGeometry args={[0.24, 24, 20]} />
        <meshStandardMaterial color="#b9896c" roughness={0.78} />
      </mesh>
    </group>
  );
}

export default function FashionModel({ progress }: { progress: number }) {
  return (
    <Suspense fallback={<ModelFallback />}>
      <RealMaleModel progress={progress} />
    </Suspense>
  );
}

useGLTF.preload(MODEL_URL);
