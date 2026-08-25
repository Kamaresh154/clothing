"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real rigged male base model.
 * The garment components remain separate so the scroll controller can change
 * menswear over the same human figure.
 *
 * Source: orange-juice-games male base mesh, CC0 1.0, rehosted by
 * BoQsc/Godot-3D-Male-Base-Mesh.
 */
const MODEL_URL = "https://raw.githubusercontent.com/BoQsc/Godot-3D-Male-Base-Mesh/main/Original/male_base_mesh.glb";

function RealMaleModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const height = Math.max(size.y, 0.001);
    const scale = 2.9 / height;

    clone.scale.setScalar(scale);
    clone.position.x -= center.x * scale;
    clone.position.z -= center.z * scale;
    clone.position.y -= box.min.y * scale;

    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const material = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
      if (material) material.envMapIntensity = 0.9;
    });

    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      -0.95 + (reduced ? 0 : Math.sin(t * 0.52) * 0.008),
      0.08,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      progress * 0.075 + (reduced ? 0 : Math.sin(t * 0.22) * 0.012),
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
