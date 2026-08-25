"use client";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { outfits } from "@/data/outfits";

// ---------- helpers (no per-frame allocations) ----------
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function easeInOutCubic(x: number) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function easeOutExpo(x: number) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
function easeInOutQuad(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

// Reusable vectors/colors to avoid GC
const _v3a = new THREE.Vector3();
const _cA = new THREE.Color();
const _cB = new THREE.Color();

// Mantle for reduced motion
function useReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ================= FashionModel (base body, shared skeleton) =================
function FashionModel({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const reduced = useRef(false);

  // garment whole groups: 0 white, 1 silk, 2 beige jacket, 3 suit
  const gWhite = useRef<THREE.Group>(null);
  const gSilk = useRef<THREE.Group>(null);
  const gJacket = useRef<THREE.Group>(null);
  const gSuit = useRef<THREE.Group>(null);

  // white panels/sleeves
  const wLeft = useRef<THREE.Mesh>(null);
  const wRight = useRef<THREE.Mesh>(null);
  const wSleeveL = useRef<THREE.Mesh>(null);
  const wSleeveR = useRef<THREE.Mesh>(null);
  const wCollar = useRef<THREE.Mesh>(null);
  // silk
  const sLeft = useRef<THREE.Mesh>(null);
  const sRight = useRef<THREE.Mesh>(null);
  const sSleeveL = useRef<THREE.Mesh>(null);
  const sSleeveR = useRef<THREE.Mesh>(null);
  const sCollar = useRef<THREE.Mesh>(null);
  // jacket
  const jLeft = useRef<THREE.Mesh>(null);
  const jRight = useRef<THREE.Mesh>(null);
  const jSleeveL = useRef<THREE.Mesh>(null);
  const jSleeveR = useRef<THREE.Mesh>(null);
  const jCollar = useRef<THREE.Group>(null);
  const jLapelL = useRef<THREE.Mesh>(null);
  const jLapelR = useRef<THREE.Mesh>(null);
  // suit
  const suitLeft = useRef<THREE.Mesh>(null);
  const suitRight = useRef<THREE.Mesh>(null);
  const suitSleeveL = useRef<THREE.Mesh>(null);
  const suitSleeveR = useRef<THREE.Mesh>(null);
  const suitCollar = useRef<THREE.Group>(null);
  const suitLapelL = useRef<THREE.Mesh>(null);
  const suitLapelR = useRef<THREE.Mesh>(null);

  const total = outfits.length;

  // cache materials not to allocate colors per frame
  const trouserColor = useMemo(() => new THREE.Color(), []);
  const shoeColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    reduced.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!groupRef.current) return;

    // Body subtly acting (editorial)
    const breath = reduced.current ? 0 : Math.sin(t * 0.52) * 0.012;
    const sway = reduced.current ? 0 : Math.sin(t * 0.26) * 0.012;
    groupRef.current.position.y = -0.95 + breath;
    groupRef.current.rotation.y = sway + progress * 0.08;
    groupRef.current.rotation.z = reduced.current ? 0 : Math.sin(t * 0.30) * 0.006;

    // head micro acting
    if (headRef.current && !reduced.current) {
      let yaw = Math.sin(t * 0.18) * 0.05;
      let pitch = Math.sin(t * 0.22) * 0.03;
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
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

    // ------- Arm choreography (explicit timeline per prompt) -------
    // neutral -> right hand collar -> left assists -> elbows rise -> sleeves pull -> extend -> return -> sleeves enter -> wrists settle
    let RShoulderX = -0.04, RShoulderZ = 0.06, RShoulderY = 0, RElbowX = 0.08;
    let LShoulderX = -0.04, LElbowX = 0.08;

    if (!reduced.current) {
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp < 0.001 || tp >= 1) continue;

        // 0.00 stable
        // 0.08 camera push -> arms still neutral (handled by camera)
        // 0.15 hand reaches collar
        if (tp >= 0.10 && tp < 0.22) {
          const p = clamp((tp - 0.10) / 0.12);
          const e = easeInOutCubic(p);
          RShoulderX = lerp(-0.04, 0.74, e);
          RShoulderZ = lerp(0.06, -0.44, e);
          RShoulderY = lerp(0, -0.36, e);
          RElbowX = lerp(0.08, 1.88, e);
          LShoulderX = lerp(-0.04, 0.26, e * 0.55);
        }
        // 0.22 garment opens (hands hold)
        if (tp >= 0.22 && tp < 0.30) {
          RShoulderX = 0.74;
          RShoulderZ = -0.44;
          RShoulderY = -0.36;
          RElbowX = 1.88;
          LShoulderX = 0.26;
        }
        // 0.30 sleeve removal
        if (tp >= 0.30 && tp < 0.42) {
          const p = clamp((tp - 0.30) / 0.12);
          const e = easeInOutCubic(p);
          RShoulderX = lerp(0.74, -0.30, e);
          RShoulderZ = lerp(-0.44, -0.78, e);
          RShoulderY = lerp(-0.36, -0.88, e);
          RElbowX = lerp(1.88, 0.30, e);
          LShoulderX = lerp(0.26, 0.58, e);
        }
        // 0.40 garment leaves body
        if (tp >= 0.40 && tp < 0.52) {
          const p = clamp((tp - 0.40) / 0.12);
          RShoulderX = lerp(-0.30, -0.12, p);
          RShoulderZ = lerp(-0.78, -0.18, p);
          RShoulderY = lerp(-0.88, -0.10, p);
          RElbowX = lerp(0.30, 0.22, p);
          LShoulderX = lerp(0.58, 0.10, p);
        }
        // 0.48 body exposed (arms slightly out)
        if (tp >= 0.48 && tp < 0.58) {
          const p = clamp((tp - 0.48) / 0.10);
          RShoulderX = lerp(-0.12, 0.12, p);
          RShoulderZ = lerp(-0.18, 0.0, p);
          RShoulderY = lerp(-0.10, 0.08, p);
          RElbowX = lerp(0.22, 0.38, p);
          LShoulderX = lerp(0.10, 0.12, p);
        }
        // 0.54 new garment appears -> shoulders enter
        if (tp >= 0.54 && tp < 0.66) {
          const p = clamp((tp - 0.54) / 0.12);
          const e = easeOutExpo(p);
          RShoulderX = lerp(0.12, 0.18, e);
          RShoulderZ = 0.0;
          RShoulderY = lerp(0.08, 0.10, e);
          RElbowX = lerp(0.38, 0.48, e);
          LShoulderX = lerp(0.12, 0.14, e);
        }
        // 0.70 sleeves settle + 0.80 collar settles
        if (tp >= 0.70 && tp < 0.88) {
          const p = clamp((tp - 0.70) / 0.18);
          const wob = Math.sin(p * Math.PI * 2.2) * 0.05 * (1 - p);
          RElbowX = 0.48 + wob;
          RShoulderX = 0.18 + wob * 0.35;
        }
        if (tp >= 0.88) {
          RShoulderX = -0.04; RShoulderZ = 0.06; RShoulderY = 0; RElbowX = 0.08;
          LShoulderX = -0.04; LElbowX = 0.08;
        }
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

    // Trousers color lerp (reusable colors)
    {
      const idx = Math.min(total - 1, Math.floor(progress * (total - 1)));
      const ti = progress * (total - 1) - idx;
      const cur = outfits[Math.min(idx, total - 1)];
      const nxt = outfits[Math.min(idx + 1, total - 1)];
      _cA.set(cur.palette.bottom); _cB.set(nxt.palette.bottom);
      trouserColor.copy(_cA).lerp(_cB, ti);
      shoeColor.copy(_cA).lerp(_cB, ti);
      // apply to meshes via traversing? we do via direct refs later; for now store on userData
      if (groupRef.current) groupRef.current.userData.trouserColor = trouserColor.clone();
    }

    // -------- Garment system (4 independent garments, not color swap) --------
    // Each garment has its own geometry silhouette; we animate whole group + inner panels
    const groups: Array<THREE.Group | null> = [gWhite.current, gSilk.current, gJacket.current, gSuit.current];
    const panelPairs: Array<[THREE.Mesh | null, THREE.Mesh | null]> = [
      [wLeft.current, wRight.current],
      [sLeft.current, sRight.current],
      [jLeft.current, jRight.current],
      [suitLeft.current, suitRight.current],
    ];
    const sleevePairs: Array<[THREE.Mesh | null, THREE.Mesh | null]> = [
      [wSleeveL.current, wSleeveR.current],
      [sSleeveL.current, sSleeveR.current],
      [jSleeveL.current, jSleeveR.current],
      [suitSleeveL.current, suitSleeveR.current],
    ];
    const collars: Array<THREE.Object3D | null> = [wCollar.current, sCollar.current, jCollar.current, suitCollar.current];

    for (let i = 0; i < total; i++) {
      const g = groups[i];
      if (!g) continue;
      const seg = 1 / (total - 1);
      const start = i * seg;
      const tpLeave = clamp((progress - start) / seg, -2, 2);
      const tpEnter = clamp((progress - (start - seg)) / seg, -2, 2);
      // Dist to center
      const center = start;
      const dist = progress - center;

      let opacity = 0;
      let gx = 0, gy = 0, gz = 0;
      let gRotY = 0, gRotX = 0, gRotZ = 0;
      let gScale = 1;
      let gap = 0;
      let sleeveOff = 0;

      // Reduced motion: simple crossfade
      if (reduced.current) {
        const c = center;
        const d = Math.abs(progress - c);
        const w = 0.20;
        opacity = clamp(1 - d / w, 0, 1);
        gap = 0;
        gx = 0; gy = 0; gz = 0; gScale = 1;
      } else {
        // Normal cinematic timeline per prompt
        // Old garment leaving (tpLeave 0..1)
        if (tpLeave >= 0 && tpLeave < 0.08) {
          // stable
          opacity = 1; gap = 0;
        } else if (tpLeave >= 0.08 && tpLeave < 0.15) {
          // camera push, still stable
          opacity = 1;
        } else if (tpLeave >= 0.15 && tpLeave < 0.22) {
          // hand reaches collar (no garment move)
          opacity = 1; gap = easeInOutQuad(clamp((tpLeave - 0.15) / 0.07)) * 0.018;
        } else if (tpLeave >= 0.22 && tpLeave < 0.30) {
          // garment opens
          opacity = 1;
          const p = clamp((tpLeave - 0.22) / 0.08);
          gap = lerp(0.018, i === 2 || i === 3 ? 0.18 : 0.15, easeInOutCubic(p));
          gScale = lerp(1, 1.015, p);
          gz = lerp(0, 0.03, p);
        } else if (tpLeave >= 0.30 && tpLeave < 0.40) {
          // sleeve removal
          opacity = 1;
          const p = clamp((tpLeave - 0.30) / 0.10);
          gap = lerp(i === 2 || i === 3 ? 0.18 : 0.15, i === 2 || i === 3 ? 0.24 : 0.20, easeInOutCubic(p));
          sleeveOff = lerp(0, 0.14, easeInOutCubic(p));
          gy = lerp(0, 0.04, p);
          gz = lerp(0.03, 0.06, p);
        } else if (tpLeave >= 0.40 && tpLeave < 0.48) {
          // garment leaves body (physical: rotation/translation/scale)
          opacity = 1;
          const p = clamp((tpLeave - 0.40) / 0.08);
          const e = easeInOutCubic(p);
          gap = lerp(i === 2 || i === 3 ? 0.24 : 0.20, i === 2 || i === 3 ? 0.26 : 0.22, e);
          sleeveOff = lerp(0.14, 0.18, e);
          gz = lerp(0.06, 0.62, e);
          gy = lerp(0.04, 0.18, e);
          gx = lerp(0, (i % 2 === 0 ? 0.32 : -0.32), e);
          gRotY = lerp(0, (i % 2 === 0 ? 0.68 : -0.68), e);
          gRotX = lerp(0, -0.38, e);
          gRotZ = lerp(0, 0.20, e);
          gScale = lerp(1.015, i === 2 || i === 3 ? 1.9 : 1.78, easeOutExpo(p));
          if (p > 0.70) opacity = lerp(1, 0, clamp((p - 0.70) / 0.30));
        } else if (tpLeave >= 0.48 && tpLeave < 1.0) {
          // removed, hidden (unless entering as new)
          // check if this is also entering from previous? for tpLeave >0.54 new garment takes over, old stays hidden
          if (tpLeave < 0.54) {
            opacity = lerp(1, 0, clamp((tpLeave - 0.48) / 0.06));
            gz = 0.62; gScale = i === 2 || i === 3 ? 1.9 : 1.78; gap = 0.26;
          } else {
            opacity = 0; gz = 0.62; gScale = 1.9;
          }
        } else if (dist < 0 && dist > -seg) {
          // ENTERING (tpEnter 0..1 where 0 at prev center, 1 at this center)
          const tp = tpEnter;
          if (tp < 0.48) {
            opacity = 0; gy = 0.72 - tp * 0.2; gz = -0.38; gScale = 0.84;
          } else if (tp < 0.54) {
            // appears behind
            const p = clamp((tp - 0.48) / 0.06);
            opacity = lerp(0, 0.15, p);
            gy = lerp(0.62, 0.35, easeOutExpo(p));
            gz = lerp(-0.38, -0.10, p);
            gScale = lerp(0.84, 0.96, p);
          } else if (tp < 0.62) {
            // shoulders enter
            const p = clamp((tp - 0.54) / 0.08);
            const e = easeOutExpo(p);
            opacity = lerp(0.15, 0.85, e);
            gy = lerp(0.35, 0.12, e);
            gz = lerp(-0.10, 0.16, e);
            gScale = lerp(0.96, 1.10, e);
            gap = lerp(0.10, 0.06, e);
            sleeveOff = lerp(0.16, 0.08, e);
          } else if (tp < 0.70) {
            // sleeves settle
            const p = clamp((tp - 0.62) / 0.08);
            const e = easeOutExpo(p);
            opacity = lerp(0.85, 1, e);
            gy = lerp(0.12, 0.04, e);
            gz = lerp(0.16, 0.05, e);
            gScale = lerp(1.10, 1.02, e);
            gap = lerp(0.06, 0.02, e);
            sleeveOff = lerp(0.08, 0.02, e);
          } else if (tp < 0.80) {
            // torso wraps / front panels close
            const p = clamp((tp - 0.70) / 0.10);
            const e = easeInOutQuad(p);
            opacity = 1;
            gap = lerp(0.02, 0, e);
            sleeveOff = lerp(0.02, 0, e);
            gy = lerp(0.04, 0, e);
            gz = lerp(0.05, 0, e);
            gScale = lerp(1.02, 1.0, e);
          } else if (tp < 0.88) {
            // collar settles
            opacity = 1; gap = 0; sleeveOff = 0; gy = 0; gz = 0; gScale = 1;
          } else {
            opacity = 1;
          }
        } else if (Math.abs(dist) < 0.08) {
          opacity = 1;
        } else {
          opacity = 0;
        }
      }

      // apply
      g.position.set(gx, gy, gz);
      g.rotation.set(gRotX, gRotY, gRotZ);
      g.scale.setScalar(gScale);
      g.visible = opacity > 0.015;

      // panels
      const [pl, pr] = panelPairs[i] || [null, null];
      if (pl) {
        const base = i === 2 || i === 3 ? 0.22 : 0.18;
        pl.position.x = -base - gap;
        pl.rotation.y = -gap * 0.9;
        (pl.material as THREE.MeshStandardMaterial).opacity = opacity;
        (pl.material as THREE.MeshStandardMaterial).transparent = true;
        pl.visible = opacity > 0.015;
      }
      if (pr) {
        const base = i === 2 || i === 3 ? 0.22 : 0.18;
        pr.position.x = base + gap;
        pr.rotation.y = gap * 0.9;
        (pr.material as THREE.MeshStandardMaterial).opacity = opacity;
        (pr.material as THREE.MeshStandardMaterial).transparent = true;
        pr.visible = opacity > 0.015;
      }
      const [sl, sr] = sleevePairs[i] || [null, null];
      if (sl) {
        const baseX = i === 2 || i === 3 ? -0.52 : -0.46;
        sl.position.x = baseX - sleeveOff;
        (sl.material as THREE.MeshStandardMaterial).opacity = opacity;
        (sl.material as THREE.MeshStandardMaterial).transparent = true;
        sl.visible = opacity > 0.015;
      }
      if (sr) {
        const baseX = i === 2 || i === 3 ? 0.52 : 0.46;
        sr.position.x = baseX + sleeveOff;
        (sr.material as THREE.MeshStandardMaterial).opacity = opacity;
        (sr.material as THREE.MeshStandardMaterial).transparent = true;
        sr.visible = opacity > 0.015;
      }
      const collar = collars[i];
      if (collar) {
        collar.position.z = gap * 0.14;
        // scale collar slightly with gap
        if ((collar as THREE.Group).scale) (collar as THREE.Group).scale.set(1 + gap * 0.28, 1, 1);
        // handle mesh vs group opacity
        collar.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
            m.transparent = true; m.opacity = opacity;
            (o as THREE.Mesh).visible = opacity > 0.015;
          }
        });
        collar.visible = opacity > 0.015;
      }
      // propagate opacity to all meshes in group (for back panel etc)
      g.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
          // don't override panel/sleeve which already set, but ensure back panel etc
          if (o !== pl && o !== pr && o !== sl && o !== sr && !collar?.children.includes(o as any)) {
            m.transparent = true;
            // lerp existing opacity? ensure not exceed garment opacity
            m.opacity = Math.min(m.opacity ?? 1, opacity);
            (o as THREE.Mesh).visible = opacity > 0.015;
          }
        }
      });
      // slight roughness shift with gap (stretch)
      g.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) {
          const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m.roughness !== undefined) {
            const baseR = outfits[i].garment.roughness;
            m.roughness = baseR + gap * 0.18;
          }
        }
      });
    }
  });

  // Trousers + shoes are separate but we update color via group userData each frame inside loop above? instead do direct
  const trouserMeshRef = useRef<THREE.Mesh>(null);
  const shoesGroupRef = useRef<THREE.Group>(null);
  // we hook trouser color in same frame via extra useFrame? reuse above but add second hook to apply
  useFrame(() => {
    if (trouserMeshRef.current && groupRef.current) {
      const c = groupRef.current.userData.trouserColor as THREE.Color | undefined;
      if (c) (trouserMeshRef.current.material as THREE.MeshStandardMaterial).color.copy(c);
    }
    if (shoesGroupRef.current && groupRef.current) {
      const c = groupRef.current.userData.trouserColor as THREE.Color | undefined;
      if (c) {
        shoesGroupRef.current.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).color.copy(c);
        });
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
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

      {/* undershirt base: visible when between outfits */}
      <mesh position={[0, 1.08, 0]}>
        <capsuleGeometry args={[0.305, 0.62, 8, 20]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.82} />
      </mesh>

      {/* Trousers + shoes (shared, color lerps) */}
      <mesh ref={trouserMeshRef} position={[0, 0.42, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.325, 0.98, 8, 20]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.88} />
      </mesh>
      <group ref={shoesGroupRef} position={[0, -0.08, 0]}>
        <mesh position={[-0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.52} />
        </mesh>
        <mesh position={[0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.52} />
        </mesh>
      </group>

      {/* Arms (skin) — garment sleeves are part of outfit groups so arms stay skin when exposed */}
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

      {/* ================= OUTFIT 01: WHITE SHIRT ================= */}
      <group ref={gWhite} position={[0, 0, 0]}>
        {/* back */}
        <mesh position={[0, 1.08, -0.06]}>
          <capsuleGeometry args={[0.335, 0.60, 8, 18]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.88} metalness={0} transparent opacity={1} />
        </mesh>
        <mesh ref={wLeft} position={[-0.18, 1.08, 0.09]}>
          <boxGeometry args={[0.33, 0.62, 0.042]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent opacity={1} />
        </mesh>
        <mesh ref={wRight} position={[0.18, 1.08, 0.09]}>
          <boxGeometry args={[0.33, 0.62, 0.042]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent opacity={1} />
        </mesh>
        {/* buttons 5 */}
        <group position={[0, 1.08, 0.125]}>
          {[0.22, 0.11, 0, -0.11, -0.22].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <sphereGeometry args={[0.011, 10, 10]} />
              <meshStandardMaterial color="#1a1a1e" roughness={0.45} metalness={0.15} transparent opacity={1} />
            </mesh>
          ))}
        </group>
        <mesh ref={wCollar as any} position={[0, 1.38, 0.12]} rotation={[0.16, 0, 0]}>
          <torusGeometry args={[0.132, 0.020, 10, 28, Math.PI * 1.26]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.10, 1.38, 0.15]} rotation={[0.44, 0, 0.32]}>
          <boxGeometry args={[0.095, 0.068, 0.012]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent opacity={1} />
        </mesh>
        <mesh position={[0.10, 1.38, 0.15]} rotation={[0.44, 0, -0.32]}>
          <boxGeometry args={[0.095, 0.068, 0.012]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent opacity={1} />
        </mesh>
        <mesh ref={wSleeveL} position={[-0.46, 1.02, 0]} rotation={[0, 0, 0.07]}>
          <capsuleGeometry args={[0.102, 0.52, 6, 14]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent opacity={1} />
        </mesh>
        <mesh ref={wSleeveR} position={[0.46, 1.02, 0]} rotation={[0, 0, -0.07]}>
          <capsuleGeometry args={[0.102, 0.52, 6, 14]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.88} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.50, 0.74, 0.02]} rotation={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.090, 0.090, 0.055, 16]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.82} transparent opacity={1} />
        </mesh>
        <mesh position={[0.50, 0.74, 0.02]} rotation={[0, 0, -0.07]}>
          <cylinderGeometry args={[0.090, 0.090, 0.055, 16]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.82} transparent opacity={1} />
        </mesh>
      </group>

      {/* ================= OUTFIT 02: BLACK SILK SHIRT ================= */}
      <group ref={gSilk} position={[0, 0, 0]}>
        <mesh position={[0, 1.08, -0.06]}>
          <capsuleGeometry args={[0.33, 0.62, 8, 18]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.04} transparent opacity={1} />
        </mesh>
        <mesh ref={sLeft} position={[-0.175, 1.08, 0.095]}>
          <boxGeometry args={[0.325, 0.64, 0.038]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent opacity={1} />
        </mesh>
        <mesh ref={sRight} position={[0.175, 1.08, 0.095]}>
          <boxGeometry args={[0.325, 0.64, 0.038]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent opacity={1} />
        </mesh>
        <group position={[0, 1.08, 0.128]}>
          {[0.20, 0.08, -0.06, -0.18].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <sphereGeometry args={[0.010, 10, 10]} />
              <meshStandardMaterial color="#ece6da" roughness={0.32} metalness={0.18} transparent opacity={1} />
            </mesh>
          ))}
        </group>
        {/* camp collar, slightly open */}
        <mesh ref={sCollar as any} position={[0, 1.385, 0.13]} rotation={[0.18, 0, 0]}>
          <torusGeometry args={[0.140, 0.018, 10, 26, Math.PI * 1.35]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.30} metalness={0.06} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.11, 1.385, 0.155]} rotation={[0.48, 0, 0.38]}>
          <boxGeometry args={[0.11, 0.072, 0.010]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.30} transparent opacity={1} />
        </mesh>
        <mesh position={[0.11, 1.385, 0.155]} rotation={[0.48, 0, -0.38]}>
          <boxGeometry args={[0.11, 0.072, 0.010]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.30} transparent opacity={1} />
        </mesh>
        <mesh ref={sSleeveL} position={[-0.46, 1.02, 0]} rotation={[0, 0, 0.07]}>
          <capsuleGeometry args={[0.098, 0.56, 6, 14]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent opacity={1} />
        </mesh>
        <mesh ref={sSleeveR} position={[0.46, 1.02, 0]} rotation={[0, 0, -0.07]}>
          <capsuleGeometry args={[0.098, 0.56, 6, 14]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} metalness={0.06} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.50, 0.72, 0.02]} rotation={[0, 0, 0.07]}>
          <cylinderGeometry args={[0.088, 0.088, 0.052, 16]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} transparent opacity={1} />
        </mesh>
        <mesh position={[0.50, 0.72, 0.02]} rotation={[0, 0, -0.07]}>
          <cylinderGeometry args={[0.088, 0.088, 0.052, 16]} />
          <meshStandardMaterial color="#0c0c0e" roughness={0.28} transparent opacity={1} />
        </mesh>
      </group>

      {/* ================= OUTFIT 03: BEIGE JACKET (overshirt) ================= */}
      <group ref={gJacket} position={[0, 0, 0]}>
        {/* inner shirt visible under jacket? we keep base white tee underneath for contrast */}
        <mesh position={[0, 1.08, -0.07]}>
          <capsuleGeometry args={[0.32, 0.62, 8, 18]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.86} transparent opacity={1} />
        </mesh>
        {/* jacket back */}
        <mesh position={[0, 1.06, -0.05]}>
          <capsuleGeometry args={[0.40, 0.70, 8, 20]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent opacity={1} />
        </mesh>
        <mesh ref={jLeft} position={[-0.22, 1.06, 0.10]}>
          <boxGeometry args={[0.40, 0.70, 0.055]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent opacity={1} />
        </mesh>
        <mesh ref={jRight} position={[0.22, 1.06, 0.10]}>
          <boxGeometry args={[0.40, 0.70, 0.055]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent opacity={1} />
        </mesh>
        {/* lapels */}
        <group ref={jCollar as any} position={[0, 1.37, 0.13]}>
          <mesh ref={jLapelL} position={[-0.12, -0.04, 0.04]} rotation={[0.35, 0, 0.55]}>
            <boxGeometry args={[0.13, 0.28, 0.014]} />
            <meshStandardMaterial color="#cbbca0" roughness={0.78} transparent opacity={1} />
          </mesh>
          <mesh ref={jLapelR} position={[0.12, -0.04, 0.04]} rotation={[0.35, 0, -0.55]}>
            <boxGeometry args={[0.13, 0.28, 0.014]} />
            <meshStandardMaterial color="#cbbca0" roughness={0.78} transparent opacity={1} />
          </mesh>
        </group>
        {/* chest pockets */}
        <mesh position={[-0.14, 1.05, 0.135]}>
          <boxGeometry args={[0.12, 0.13, 0.018]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.84} transparent opacity={1} />
        </mesh>
        <mesh position={[0.14, 1.05, 0.135]}>
          <boxGeometry args={[0.12, 0.13, 0.018]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.84} transparent opacity={1} />
        </mesh>
        {/* buttons 3 */}
        <group position={[0, 1.06, 0.145]}>
          {[0.14, 0.02, -0.10].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.010, 16]} />
              <meshStandardMaterial color="#2a241e" roughness={0.65} transparent opacity={1} />
            </mesh>
          ))}
        </group>
        <mesh ref={jSleeveL} position={[-0.52, 1.00, 0]} rotation={[0, 0, 0.06]}>
          <capsuleGeometry args={[0.115, 0.58, 6, 14]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent opacity={1} />
        </mesh>
        <mesh ref={jSleeveR} position={[0.52, 1.00, 0]} rotation={[0, 0, -0.06]}>
          <capsuleGeometry args={[0.115, 0.58, 6, 14]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.82} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.56, 0.70, 0.02]} rotation={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.104, 0.104, 0.075, 16]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.80} transparent opacity={1} />
        </mesh>
        <mesh position={[0.56, 0.70, 0.02]} rotation={[0, 0, -0.06]}>
          <cylinderGeometry args={[0.104, 0.104, 0.075, 16]} />
          <meshStandardMaterial color="#cbbca0" roughness={0.80} transparent opacity={1} />
        </mesh>
      </group>

      {/* ================= OUTFIT 04: DARK LUXURY SUIT ================= */}
      <group ref={gSuit} position={[0, 0, 0]}>
        <mesh position={[0, 1.08, -0.07]}>
          <capsuleGeometry args={[0.32, 0.62, 8, 18]} />
          <meshStandardMaterial color="#0e0e10" roughness={0.72} transparent opacity={1} />
        </mesh>
        {/* suit back structured */}
        <mesh position={[0, 1.05, -0.05]}>
          <capsuleGeometry args={[0.42, 0.74, 8, 20]} />
          <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent opacity={1} />
        </mesh>
        <mesh ref={suitLeft} position={[-0.22, 1.05, 0.105]}>
          <boxGeometry args={[0.42, 0.74, 0.058]} />
          <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent opacity={1} />
        </mesh>
        <mesh ref={suitRight} position={[0.22, 1.05, 0.105]}>
          <boxGeometry args={[0.42, 0.74, 0.058]} />
          <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent opacity={1} />
        </mesh>
        {/* peaked lapels */}
        <group ref={suitCollar as any} position={[0, 1.38, 0.135]}>
          <mesh ref={suitLapelL} position={[-0.13, -0.05, 0.04]} rotation={[0.30, 0, 0.62]}>
            <boxGeometry args={[0.15, 0.32, 0.015]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.62} transparent opacity={1} />
          </mesh>
          <mesh ref={suitLapelR} position={[0.13, -0.05, 0.04]} rotation={[0.30, 0, -0.62]}>
            <boxGeometry args={[0.15, 0.32, 0.015]} />
            <meshStandardMaterial color="#1a1a1e" roughness={0.62} transparent opacity={1} />
          </mesh>
          {/* pocket square */}
          <mesh position={[0.11, -0.14, 0.045]} rotation={[0, 0, -0.12]}>
            <planeGeometry args={[0.07, 0.045]} />
            <meshStandardMaterial color="#c9b99a" roughness={0.82} side={THREE.DoubleSide} transparent opacity={1} />
          </mesh>
        </group>
        {/* buttons 2 */}
        <group position={[0, 1.05, 0.15]}>
          {[0.08, -0.04].map((y, i) => (
            <mesh key={i} position={[0.02, y, 0]}>
              <sphereGeometry args={[0.013, 12, 12]} />
              <meshStandardMaterial color="#c9b99a" roughness={0.42} metalness={0.22} transparent opacity={1} />
            </mesh>
          ))}
        </group>
        <mesh ref={suitSleeveL} position={[-0.54, 1.00, 0]} rotation={[0, 0, 0.05]}>
          <capsuleGeometry args={[0.112, 0.57, 6, 14]} />
          <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent opacity={1} />
        </mesh>
        <mesh ref={suitSleeveR} position={[0.54, 1.00, 0]} rotation={[0, 0, -0.05]}>
          <capsuleGeometry args={[0.112, 0.57, 6, 14]} />
          <meshStandardMaterial color="#131316" roughness={0.64} metalness={0.04} transparent opacity={1} />
        </mesh>
        <mesh position={[-0.58, 0.70, 0.02]} rotation={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.102, 0.102, 0.068, 16]} />
          <meshStandardMaterial color="#131316" roughness={0.62} transparent opacity={1} />
        </mesh>
        <mesh position={[0.58, 0.70, 0.02]} rotation={[0, 0, -0.05]}>
          <cylinderGeometry args={[0.102, 0.102, 0.068, 16]} />
          <meshStandardMaterial color="#131316" roughness={0.62} transparent opacity={1} />
        </mesh>
        {/* belt */}
        <mesh position={[0, 0.70, 0.02]}>
          <cylinderGeometry args={[0.335, 0.335, 0.035, 32]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.45} metalness={0.08} transparent opacity={1} />
        </mesh>
        <mesh position={[0, 0.70, 0.18]}>
          <boxGeometry args={[0.045, 0.035, 0.022]} />
          <meshStandardMaterial color="#c9b99a" roughness={0.38} metalness={0.35} transparent opacity={1} />
        </mesh>
      </group>
    </group>
  );
}

function CameraRig({ progress }: { progress: number }) {
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
          extraDolly = Math.sin(p * Math.PI) * -0.42;
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
          extraDolly = lerp(extraDolly, -0.36 * p, 1);
        }
      }
      targetPos.current.x += extraYaw;
      targetPos.current.y += extraPitch;
      targetPos.current.z += extraDolly;
      // mouse parallax subtle
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

function LightingRig({ progress }: { progress: number }) {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    if (!dirRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const bt = easeInOutCubic(t);
    colA.set(cur.light.color); colB.set(nxt.light.color);
    dirRef.current.intensity = lerp(cur.light.intensity, nxt.light.intensity, bt) * 1.55;
    dirRef.current.color.copy(colA).lerp(colB, bt);
    if (fillRef.current) fillRef.current.intensity = lerp(0.32, 0.55, bt);
    if (spotRef.current) {
      spotRef.current.intensity = lerp(0.72, 1.08, Math.sin(progress * Math.PI));
      let mask = 0;
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp > 0.38 && tp < 0.58) mask = Math.max(mask, Math.sin(((tp - 0.38) / 0.20) * Math.PI));
      }
      spotRef.current.intensity += mask * 0.42;
    }
  });
  return (
    <>
      <ambientLight intensity={0.42} color="#f5f1e8" />
      <directionalLight
        ref={dirRef}
        position={[3.8, 5.2, 2.8]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00018}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight ref={fillRef} position={[-3.2, 3.5, -2.2]} intensity={0.38} color="#c9b99a" />
      <spotLight ref={spotRef} position={[0, 4.6, 0.8]} intensity={0.88} angle={0.42} penumbra={0.82} color="#fff3dd" />
      <pointLight position={[0, 1.15, 2.0]} intensity={0.52} color="#ffe9c8" distance={3.8} decay={2} />
    </>
  );
}

function EnvironmentRoom({ progress }: { progress: number }) {
  const fogRef = useRef<THREE.FogExp2>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const fogA = useMemo(() => new THREE.Color(), []);
  const fogB = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    if (!fogRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    fogA.set(cur.light.fog); fogB.set(nxt.light.fog);
    _cA.copy(fogA).lerp(fogB, easeInOutCubic(t));
    fogRef.current.color.copy(_cA);
    if (floorRef.current) {
      (floorRef.current.material as THREE.MeshStandardMaterial).color.copy(_cA).lerp(new THREE.Color("#0a0a0c"), 0.35);
    }
  });
  return (
    <>
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.16} metalness={0.26} />
      </mesh>
      <gridHelper args={[16, 36, "#1c1c20", "#121316"]} position={[0, -0.945, 0]} />
      <mesh position={[0, 1.25, -2.35]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#0f0f11" roughness={0.93} />
      </mesh>
      <mesh position={[-4.6, 1.25, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#131315" roughness={0.96} />
      </mesh>
      <mesh position={[4.6, 1.25, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#131315" roughness={0.96} />
      </mesh>
      <mesh position={[0, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1a1a1c" emissive="#1e1e20" emissiveIntensity={0.28} roughness={1} />
      </mesh>
      <mesh position={[0, 1.4, -2.30]}>
        <planeGeometry args={[0.02, 2.2]} />
        <meshStandardMaterial color="#c9b99a" emissive="#c9b99a" emissiveIntensity={0.85} />
      </mesh>
      <fogExp2 attach="fog" args={["#0a0a0c", 0.072]} ref={fogRef as any} />
    </>
  );
}

export default function FashionScene({ progress }: { progress: number }) {
  const total = outfits.length;
  let fabricMask = 0;
  for (let i = 0; i < total - 1; i++) {
    const seg = 1 / (total - 1);
    const tp = clamp((progress - i * seg) / seg, 0, 1);
    if (tp > 0.38 && tp < 0.60) fabricMask = Math.max(fabricMask, Math.sin(((tp - 0.38) / 0.22) * Math.PI));
  }
  const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // lower dpr/shadows on mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows={!isReduced && !isMobile}
        dpr={[1, isMobile ? 1.25 : 1.55]}
        gl={{ antialias: true, powerPreference: isReduced ? "low-power" : "high-performance", alpha: true }}
        style={{ background: "transparent" }}
      >
        <CameraRig progress={progress} />
        <LightingRig progress={progress} />
        <EnvironmentRoom progress={progress} />
        <FashionModel progress={progress} />
        <ContactShadows position={[0, -0.94, 0]} opacity={isReduced ? 0.22 : 0.46 + fabricMask * 0.14} scale={5.2} blur={isMobile ? 1.6 : 2.4} far={2.6} color="#000000" />
        <Environment preset="studio" environmentIntensity={0.34} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(0,0,0,0.58)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-[#08080a]/55 to-transparent" />
      {/* fabric-as-transition */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: isReduced ? fabricMask * 0.4 : fabricMask * 0.92,
          background: fabricMask > 0.02 ? `radial-gradient(ellipse at 50% 55%, ${outfits[Math.floor(clamp(progress * (total - 1), 0, total - 1))]?.garment.color ?? "#0a0a0c"} 0%, #08080a 72%)` : "transparent",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ opacity: isReduced ? 0 : fabricMask * 0.16, backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)` }}
      />
    </div>
  );
}
