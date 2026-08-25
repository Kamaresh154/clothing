"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { outfits } from "@/data/outfits";
import { clamp, easeInOutCubic, easeInOutQuad, easeOutExpo, lerp } from "./utils";

export default function CameraRig({ progress }: { progress: number }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const curPos = useRef(new THREE.Vector3(0, 1.55, 4.4));
  const curLook = useRef(new THREE.Vector3(0, 1.42, 0));
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!camRef.current) return;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = outfits.length;
    const seg = 1 / (total - 1);
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const bt = easeInOutCubic(t);
    targetPos.current.set(lerp(cur.camera.pos[0], nxt.camera.pos[0], bt), lerp(cur.camera.pos[1], nxt.camera.pos[1], bt), lerp(cur.camera.pos[2], nxt.camera.pos[2], bt));
    targetLook.current.set(lerp(cur.camera.look[0], nxt.camera.look[0], bt), lerp(cur.camera.look[1], nxt.camera.look[1], bt), lerp(cur.camera.look[2], nxt.camera.look[2], bt));

    if (!reduced) {
      let extraYaw = 0, extraPitch = 0, extraDolly = 0;
      if (progress < 0.09) {
        const p = progress / 0.09;
        extraDolly = lerp(0.45, 0, easeOutExpo(p));
      }
      for (let i = 0; i < total - 1; i++) {
        const tpSeg = clamp((progress - i * seg) / seg, 0, 1);
        if (tpSeg > 0.22 && tpSeg < 0.48) {
          const p = (tpSeg - 0.22) / 0.26;
          extraYaw = Math.sin(p * Math.PI) * (i % 2 === 0 ? 0.52 : -0.52);
          extraPitch = Math.sin(p * Math.PI) * 0.10;
          extraDolly = Math.sin(p * Math.PI) * -0.42; // medium/full-body: closer during removal but still see sleeves
        }
        if (tpSeg > 0.54 && tpSeg < 0.82) {
          const p = (tpSeg - 0.54) / 0.28;
          extraPitch = lerp(-0.06, 0.05, easeInOutQuad(p));
        }
        if (progress > 0.86) {
          const p = (progress - 0.86) / 0.14;
          extraYaw = Math.sin(p * Math.PI * 0.85) * 0.90;
        }
        if (tpSeg > 0.60 && tpSeg < 0.78) {
          const p = Math.sin(((tpSeg - 0.60) / 0.18) * Math.PI);
          extraDolly = lerp(extraDolly, -0.36 * p, 1); // macro for material detail
        }
      }
      targetPos.current.x += extraYaw;
      targetPos.current.y += extraPitch;
      targetPos.current.z += extraDolly;
      targetPos.current.x += state.pointer.x * 0.08;
      targetPos.current.y += state.pointer.y * 0.04;
    }

    const lerpFactor = 1 - Math.pow(0.0007, delta * 60);
    curPos.current.lerp(targetPos.current, lerpFactor * 0.52);
    curLook.current.lerp(targetLook.current, lerpFactor * 0.52);
    camRef.current.position.copy(curPos.current);
    camRef.current.lookAt(curLook.current);
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={36} near={0.1} far={50} position={[0, 1.55, 4.4]} />;
}
