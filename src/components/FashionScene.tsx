"use client";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { outfits } from "@/data/outfits";

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function easeInOutCubic(x: number) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function easeOutExpo(x: number) { return x === 1 ? 1 : 1 - Math.pow(2, -10 * x); }
function easeInOutQuad(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }

// ---------- Shirt System ----------
function useShirtPhase(progress: number, index: number, total: number) {
  const seg = 1 / (total - 1);
  const start = index * seg;
  // transition progress between index and index+1: 0..1
  // for general wear state, we want to know if this shirt is the current one
  // current center = index * seg
  // dist to progress
  const center = start;
  // how far is progress from center in seg units
  const dist = progress - center;
  // For shirt index 0, worn when progress in [-seg/2, seg/2] etc.
  // Instead compute tp for transition where this shirt is old (leaving)
  const tpLeave = clamp((progress - start) / seg, 0, 1); // 0 at start, 1 at next outfit
  const tpEnter = clamp((progress - (start - seg)) / seg, 0, 1); // for entering
  return { tpLeave, tpEnter, center, dist, seg, start };
}

function Mannequin({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);

  // shirt groups: 4 shirts
  const shirtRefs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const shirtPanelLRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const shirtPanelRRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const shirtSleeveLRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const shirtSleeveRRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const shirtCollarRefs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];

  const total = outfits.length;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!groupRef.current) return;

    // Body acting: breathing + weight shift + subtle head tracking
    const breath = Math.sin(t * 0.55) * 0.012;
    const sway = Math.sin(t * 0.28) * 0.015;
    groupRef.current.position.y = -0.95 + breath;
    groupRef.current.rotation.y = sway + progress * 0.12; // slow drift with scroll
    groupRef.current.rotation.z = Math.sin(t * 0.33) * 0.007;

    if (headRef.current) {
      // head looks slightly away during removal, toward camera otherwise
      // determine nearest transition peak
      let lookYaw = Math.sin(t * 0.18) * 0.06;
      let lookPitch = Math.sin(t * 0.22) * 0.04;
      // find current transition progress
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        const inRemove = tp > 0.28 && tp < 0.55;
        if (inRemove) {
          lookYaw = lerp(lookYaw, -0.35, easeInOutQuad(clamp((tp - 0.28) / 0.15)));
          lookPitch = lerp(lookPitch, 0.12, easeInOutQuad(clamp((tp - 0.28) / 0.15)));
        }
      }
      headRef.current.rotation.y = lookYaw;
      headRef.current.rotation.x = lookPitch;
    }

    // Arm choreography tied to scroll
    // For each transition i, define arm target rotations for right arm reaching to collar/chest
    let targetRightShoulderX = -0.05; // neutral
    let targetRightShoulderZ = 0.08;
    let targetRightElbowX = 0.1;
    let targetRightShoulderY = 0;
    let targetLeftShoulderX = -0.05;
    // interpolate across transitions
    for (let i = 0; i < total - 1; i++) {
      const seg = 1 / (total - 1);
      const tp = clamp((progress - i * seg) / seg, 0, 1);
      // Phase A: 0.00-0.18 hand moves toward shirt (reach)
      if (tp > 0.02 && tp < 0.32) {
        const p = clamp((tp - 0.02) / 0.20);
        const e = easeInOutCubic(p);
        // right hand to collar
        targetRightShoulderX = lerp(-0.05, 0.72, e);
        targetRightShoulderZ = lerp(0.08, -0.42, e);
        targetRightShoulderY = lerp(0, -0.35, e);
        targetRightElbowX = lerp(0.1, 1.85, e);
        targetLeftShoulderX = lerp(-0.05, 0.32, e * 0.6);
      }
      // Phase B: 0.32-0.52 pull/ removal
      if (tp >= 0.32 && tp < 0.58) {
        const p = clamp((tp - 0.32) / 0.26);
        const e = easeInOutCubic(p);
        // pull outward and back
        targetRightShoulderX = lerp(0.72, -0.28, e);
        targetRightShoulderZ = lerp(-0.42, -0.75, e);
        targetRightShoulderY = lerp(-0.35, -0.85, e);
        targetRightElbowX = lerp(1.85, 0.35, e);
        targetLeftShoulderX = lerp(0.32, 0.55, e);
      }
      // Phase C: 0.58-0.82 new shirt on (sleeves over arms)
      if (tp >= 0.58 && tp < 0.88) {
        const p = clamp((tp - 0.58) / 0.30);
        const e = easeOutExpo(p);
        targetRightShoulderX = lerp(-0.28, 0.18, e);
        targetRightShoulderZ = lerp(-0.75, 0.0, e);
        targetRightShoulderY = lerp(-0.85, 0.12, e);
        targetRightElbowX = lerp(0.35, 0.45, e);
        targetLeftShoulderX = lerp(0.55, 0.12, e);
      }
      // Cuff adjust micro
      if (tp >= 0.82 && tp < 0.92) {
        const p = clamp((tp - 0.82) / 0.10);
        const wobble = Math.sin(p * Math.PI * 3) * 0.08;
        targetRightElbowX += wobble;
        targetRightShoulderX += wobble * 0.3;
      }
    }

    // apply with lerp smoothing
    if (rightShoulderRef.current) {
      rightShoulderRef.current.rotation.x = lerp(rightShoulderRef.current.rotation.x, targetRightShoulderX, 0.12);
      rightShoulderRef.current.rotation.z = lerp(rightShoulderRef.current.rotation.z, targetRightShoulderZ, 0.12);
      rightShoulderRef.current.rotation.y = lerp(rightShoulderRef.current.rotation.y, targetRightShoulderY, 0.12);
    }
    if (rightElbowRef.current) {
      rightElbowRef.current.rotation.x = lerp(rightElbowRef.current.rotation.x, targetRightElbowX, 0.14);
    }
    if (leftShoulderRef.current) {
      leftShoulderRef.current.rotation.x = lerp(leftShoulderRef.current.rotation.x, targetLeftShoulderX, 0.11);
      leftShoulderRef.current.rotation.z = lerp(leftShoulderRef.current.rotation.z, -targetLeftShoulderX * 0.4, 0.11);
    }
    if (leftElbowRef.current) {
      // left elbow subtle
      leftElbowRef.current.rotation.x = lerp(leftElbowRef.current.rotation.x, targetLeftShoulderX * 0.5, 0.11);
    }

    // ---- SHIRT SYSTEM ----
    for (let i = 0; i < total; i++) {
      const ref = shirtRefs[i].current;
      if (!ref) continue;
      const outfit = outfits[i];
      const seg = 1 / (total - 1);
      const center = i * seg;
      // Distance to progress: determines visibility window
      const dist = progress - center;
      // tpLeave: how far progress is past this shirt's center (0 at center, 1 at next center)
      const tpLeave = clamp(dist / seg, 0, 1);
      // tpEnter: how far progress is before reaching center (0 when 1 seg before, 1 at center)
      const tpEnter = clamp(1 - dist / seg, 0, 1); // not used same way
      // Alternate: compute entering transition from previous shirt
      const tpFromPrev = i > 0 ? clamp((progress - (center - seg)) / seg, 0, 1) : 1; // 0 at prev center, 1 at this center

      // Determine shirt state: worn, leaving, entering, hidden
      let opacity = 0;
      let posX = 0, posY = 1.08, posZ = 0;
      let rotY = 0, rotX = 0, rotZ = 0;
      let scale = 1;
      let gap = 0; // front panel gap for opening
      let sleeveOffset = 0;

      if (Math.abs(dist) < 0.001 && progress < 0.02) {
        // initial
        opacity = 1;
        gap = 0;
      } else if (tpLeave >= 0 && tpLeave < 0.18) {
        // still worn, but opening begins
        opacity = 1;
        const p = tpLeave / 0.18;
        // slight opening preparation
        gap = easeInOutQuad(p) * 0.015;
      } else if (tpLeave >= 0.18 && tpLeave < 0.32) {
        // opening: panels separate, gap increases
        opacity = 1;
        const p = clamp((tpLeave - 0.18) / 0.14);
        gap = lerp(0.015, 0.14, easeInOutCubic(p));
        // shirt stretches a bit
        scale = lerp(1, 1.02, p);
        posZ = lerp(0, 0.04, p);
      } else if (tpLeave >= 0.32 && tpLeave < 0.58) {
        // REMOVAL: shirt physically moves off body
        opacity = 1;
        const p = clamp((tpLeave - 0.32) / 0.26);
        const e = easeInOutCubic(p);
        // Gap full open
        gap = lerp(0.14, 0.22, e);
        // shirt moves forward and slightly up, rotates to fill screen, scales up
        posZ = lerp(0.04, 0.55, e);
        posY = lerp(1.08, 1.22, e);
        posX = lerp(0, (i % 2 === 0 ? 0.28 : -0.28) * e, 1);
        rotY = lerp(0, (i % 2 === 0 ? 0.6 : -0.6), e);
        rotX = lerp(0, -0.35, e);
        rotZ = lerp(0, 0.18, e);
        scale = lerp(1.02, 1.75, easeOutExpo(p) * 0.9 + e * 0.1);
        sleeveOffset = e * 0.12;
        // opacity fade as it becomes transition mask
        if (p > 0.72) opacity = lerp(1, 0, clamp((p - 0.72) / 0.28));
      } else if (tpLeave >= 0.58 && tpLeave <= 1.0) {
        // already removed, hidden
        opacity = 0;
        posZ = 0.55;
        scale = 1.75;
        gap = 0.22;
      } else if (dist < 0 && dist > -seg) {
        // entering phase: shirt comes onto body from above/offset
        const tp = tpFromPrev; // 0 at prev center, 1 at this center
        if (tp < 0.52) {
          // not yet visible (still behind mask)
          opacity = 0;
          posY = 1.08 + (1 - tp) * 0.65;
          posZ = -0.25;
          scale = 0.88;
        } else if (tp < 0.62) {
          // mask peak, still hidden
          opacity = clamp((tp - 0.52) / 0.05);
          posY = lerp(1.45, 1.18, easeOutExpo(clamp((tp - 0.52) / 0.10)));
          posZ = lerp(-0.25, 0.12, clamp((tp - 0.52) / 0.10));
          scale = lerp(0.88, 1.08, clamp((tp - 0.52) / 0.10));
        } else if (tp < 0.88) {
          // settling: sleeves slide over arms, collar forms
          opacity = 1;
          const p = clamp((tp - 0.62) / 0.26);
          const e = easeOutExpo(p);
          posY = lerp(1.18, 1.08, e);
          posZ = lerp(0.12, 0, e);
          scale = lerp(1.08, 1.0, e);
          gap = lerp(0.08, 0, e); // buttons close
          sleeveOffset = lerp(0.08, 0, e);
        } else {
          // worn stable
          opacity = 1;
          gap = 0;
          posY = 1.08;
          posZ = 0;
          scale = 1;
        }
      } else if (Math.abs(dist) < seg * 0.5) {
        // worn stable (for non-transition)
        opacity = 1;
        gap = 0;
      } else {
        opacity = 0;
      }

      // apply transforms
      ref.position.set(posX, posY, posZ);
      ref.rotation.set(rotX, rotY, rotZ);
      ref.scale.setScalar(scale);
      // material opacity handled via mesh materials
      const panelL = shirtPanelLRefs[i].current as THREE.Mesh | null;
      const panelR = shirtPanelRRefs[i].current as THREE.Mesh | null;
      const sleeveL = shirtSleeveLRefs[i].current as THREE.Mesh | null;
      const sleeveR = shirtSleeveRRefs[i].current as THREE.Mesh | null;
      const collar = shirtCollarRefs[i].current as THREE.Mesh | null;

      if (panelL) {
        panelL.position.x = -0.18 - gap;
        panelL.rotation.y = -gap * 0.9;
        (panelL.material as THREE.MeshStandardMaterial).opacity = opacity;
        (panelL.material as THREE.MeshStandardMaterial).transparent = true;
        panelL.visible = opacity > 0.02;
      }
      if (panelR) {
        panelR.position.x = 0.18 + gap;
        panelR.rotation.y = gap * 0.9;
        (panelR.material as THREE.MeshStandardMaterial).opacity = opacity;
        (panelR.material as THREE.MeshStandardMaterial).transparent = true;
        panelR.visible = opacity > 0.02;
      }
      // back panel always same opacity
      // sleeves
      if (sleeveL) {
        sleeveL.position.x = -0.46 - sleeveOffset;
        (sleeveL.material as THREE.MeshStandardMaterial).opacity = opacity;
        (sleeveL.material as THREE.MeshStandardMaterial).transparent = true;
        sleeveL.visible = opacity > 0.02;
      }
      if (sleeveR) {
        sleeveR.position.x = 0.46 + sleeveOffset;
        (sleeveR.material as THREE.MeshStandardMaterial).opacity = opacity;
        (sleeveR.material as THREE.MeshStandardMaterial).transparent = true;
        sleeveR.visible = opacity > 0.02;
      }
      if (collar) {
        (collar.material as THREE.MeshStandardMaterial).opacity = opacity;
        (collar.material as THREE.MeshStandardMaterial).transparent = true;
        collar.visible = opacity > 0.02;
        collar.position.z = gap * 0.15;
        collar.scale.set(1 + gap * 0.3, 1, 1);
      }
      ref.visible = opacity > 0.015;
      // also set group opacity via traversing? we set per mesh
      ref.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m.transparent) m.opacity = Math.min(m.opacity, opacity);
          // fabric roughness varies slightly during removal (stretch)
          if (m.roughness !== undefined) {
            m.roughness = outfit.garment.roughness + gap * 0.15;
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <group ref={headRef} position={[0, 1.78, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.205, 32, 32]} />
          <meshStandardMaterial color="#d9c5aa" roughness={0.58} metalness={0} />
        </mesh>
        <mesh position={[0, 0.12, -0.03]} rotation={[0.22, 0, 0]}>
          <sphereGeometry args={[0.215, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color="#151518" roughness={0.9} />
        </mesh>
        {/* jaw */}
        <mesh position={[0, -0.09, 0.06]} scale={[0.95, 0.7, 0.85]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#d9c5aa" roughness={0.6} />
        </mesh>
      </group>
      <mesh position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.088, 0.105, 0.18, 20]} />
        <meshStandardMaterial color="#d9c5aa" roughness={0.62} />
      </mesh>

      {/* undershirt / skin base (visible when shirts off) */}
      <mesh position={[0, 1.08, 0]}>
        <capsuleGeometry args={[0.305, 0.62, 8, 20]} />
        <meshStandardMaterial color="#dcc8a9" roughness={0.78} />
      </mesh>

      {/* Trousers + Shoes (static but color lerps via outfits? we keep per current) */}
      <Trousers progress={progress} />
      {/* ARMS */}
      <group ref={leftShoulderRef} position={[-0.38, 1.34, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.088, 0.46, 6, 14]} />
          <meshStandardMaterial color="#dcc8a9" roughness={0.65} transparent opacity={0.0} />
        </mesh>
        <group ref={leftElbowRef} position={[0, -0.48, 0]}>
          <mesh position={[0, -0.20, 0.02]} rotation={[0.1, 0, 0]}>
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
        <mesh position={[0, -0.26, 0]} castShadow>
          <capsuleGeometry args={[0.088, 0.46, 6, 14]} />
          <meshStandardMaterial color="#dcc8a9" roughness={0.65} transparent opacity={0.0} />
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

      {/* SHIRTS: 4 instances */}
      {outfits.map((outfit, i) => (
        <group key={outfit.id} ref={shirtRefs[i]} position={[0, 1.08, 0]}>
          {/* Back panel */}
          <mesh position={[0, 0, -0.06]} castShadow>
            <capsuleGeometry args={[0.34, 0.58, 8, 20]} />
            <meshStandardMaterial
              color={outfit.garment.color}
              roughness={outfit.garment.roughness}
              metalness={outfit.garment.metalness}
              transparent
              opacity={1}
            />
          </mesh>
          {/* Front left panel */}
          <mesh ref={shirtPanelLRefs[i]} position={[-0.18, 0, 0.09]} castShadow>
            <boxGeometry args={[0.34, 0.62, 0.04]} />
            <meshStandardMaterial
              color={outfit.garment.color}
              roughness={outfit.garment.roughness}
              metalness={outfit.garment.metalness}
              transparent
              opacity={1}
            />
          </mesh>
          {/* Front right panel */}
          <mesh ref={shirtPanelRRefs[i]} position={[0.18, 0, 0.09]} castShadow>
            <boxGeometry args={[0.34, 0.62, 0.04]} />
            <meshStandardMaterial
              color={outfit.garment.color}
              roughness={outfit.garment.roughness}
              metalness={outfit.garment.metalness}
              transparent
              opacity={1}
            />
          </mesh>
          {/* Buttons */}
          <group position={[0, 0, 0.125]}>
            {[0.18, 0.06, -0.06, -0.18].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color={outfit.garment.color === "#fafaf8" ? "#1a1a1e" : "#ece6da"} roughness={0.35} metalness={0.2} transparent opacity={0.95} />
              </mesh>
            ))}
          </group>
          {/* Collar */}
          <mesh ref={shirtCollarRefs[i]} position={[0, 0.30, 0.12]} rotation={[0.18, 0, 0]}>
            <torusGeometry args={[0.135, 0.022, 10, 28, Math.PI * 1.28]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness * 0.9} metalness={outfit.garment.metalness} transparent opacity={1} />
          </mesh>
          {/* Collar points */}
          <mesh position={[-0.10, 0.30, 0.15]} rotation={[0.45, 0, 0.35]}>
            <boxGeometry args={[0.10, 0.07, 0.012]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness} transparent opacity={1} />
          </mesh>
          <mesh position={[0.10, 0.30, 0.15]} rotation={[0.45, 0, -0.35]}>
            <boxGeometry args={[0.10, 0.07, 0.012]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness} transparent opacity={1} />
          </mesh>

          {/* Sleeves */}
          <mesh ref={shirtSleeveLRefs[i]} position={[-0.46, -0.06, 0]} rotation={[0, 0, 0.08]}>
            <capsuleGeometry args={[0.105, 0.52, 6, 14]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness} metalness={outfit.garment.metalness} transparent opacity={1} />
          </mesh>
          <mesh ref={shirtSleeveRRefs[i]} position={[0.46, -0.06, 0]} rotation={[0, 0, -0.08]}>
            <capsuleGeometry args={[0.105, 0.52, 6, 14]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness} metalness={outfit.garment.metalness} transparent opacity={1} />
          </mesh>
          {/* Sleeve cuffs */}
          <mesh position={[-0.50, -0.34, 0.02]} rotation={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.092, 0.092, 0.06, 16]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness * 0.85} transparent opacity={1} />
          </mesh>
          <mesh position={[0.50, -0.34, 0.02]} rotation={[0, 0, -0.08]}>
            <cylinderGeometry args={[0.092, 0.092, 0.06, 16]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness * 0.85} transparent opacity={1} />
          </mesh>
          {/* Side hem fabric fold hint */}
          <mesh position={[0, -0.30, 0]} scale={[1, 0.12, 1]}>
            <capsuleGeometry args={[0.335, 0.08, 6, 12]} />
            <meshStandardMaterial color={outfit.garment.color} roughness={outfit.garment.roughness} transparent opacity={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Trousers({ progress }: { progress: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const shoesRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const idx = Math.min(outfits.length - 1, Math.floor(progress * (outfits.length - 1)));
    const t = progress * (outfits.length - 1) - idx;
    const cur = outfits[Math.min(idx, outfits.length - 1)];
    const nxt = outfits[Math.min(idx + 1, outfits.length - 1)];
    const c = new THREE.Color(cur.palette.bottom).lerp(new THREE.Color(nxt.palette.bottom), t);
    (ref.current.material as THREE.MeshStandardMaterial).color.copy(c);
    if (shoesRef.current) {
      shoesRef.current.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).color.copy(c);
      });
    }
  });
  return (
    <>
      <mesh ref={ref} position={[0, 0.42, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.325, 0.98, 8, 20]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.88} />
      </mesh>
      <group ref={shoesRef} position={[0, -0.08, 0]}>
        <mesh position={[-0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.5} />
        </mesh>
        <mesh position={[0.15, 0.04, 0.05]} castShadow>
          <boxGeometry args={[0.155, 0.088, 0.31]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.5} />
        </mesh>
      </group>
    </>
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
    const total = outfits.length;
    const seg = 1 / (total - 1);
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const bt = easeInOutCubic(t);

    // base pos/look lerp
    targetPos.current.set(lerp(cur.camera.pos[0], nxt.camera.pos[0], bt), lerp(cur.camera.pos[1], nxt.camera.pos[1], bt), lerp(cur.camera.pos[2], nxt.camera.pos[2], bt));
    targetLook.current.set(lerp(cur.camera.look[0], nxt.camera.look[0], bt), lerp(cur.camera.look[1], nxt.camera.look[1], bt), lerp(cur.camera.look[2], nxt.camera.look[2], bt));

    // cinematic beats: orbit during removal, push-in at intro, macro during detail
    const tp = t; // within segment
    let extraYaw = 0, extraPitch = 0, extraDolly = 0;

    // 0.00-0.15 push-in (intro)
    if (progress < 0.12) {
      const p = progress / 0.12;
      extraDolly = lerp(0.45, 0, easeOutExpo(p));
    }
    // removal orbit: 0.22-0.38 shoulder orbit
    for (let i = 0; i < total - 1; i++) {
      const tpSeg = clamp((progress - i * seg) / seg, 0, 1);
      if (tpSeg > 0.22 && tpSeg < 0.52) {
        const p = (tpSeg - 0.22) / 0.30;
        extraYaw = Math.sin(p * Math.PI) * (i % 2 === 0 ? 0.55 : -0.55);
        extraPitch = Math.sin(p * Math.PI) * 0.12;
        extraDolly = Math.sin(p * Math.PI) * -0.45; // closer during removal
      }
      if (tpSeg > 0.55 && tpSeg < 0.88) {
        // low-angle reveal for new shirt
        const p = (tpSeg - 0.55) / 0.33;
        extraPitch = lerp(-0.08, 0.06, easeInOutQuad(p));
        extraYaw = lerp(extraYaw, 0, p);
      }
      if (progress > 0.86) {
        // final orbit 180
        const p = (progress - 0.86) / 0.14;
        extraYaw = Math.sin(p * Math.PI * 0.85) * 0.95;
      }
      // macro close-up at product reveal ~0.65 within each segment
      if (tpSeg > 0.60 && tpSeg < 0.78) {
        const p = Math.sin(((tpSeg - 0.60) / 0.18) * Math.PI);
        extraDolly = lerp(extraDolly, -0.38 * p, 1);
      }
    }

    targetPos.current.x += extraYaw;
    targetPos.current.y += extraPitch;
    targetPos.current.z += extraDolly;

    // mouse parallax
    targetPos.current.x += state.pointer.x * 0.10;
    targetPos.current.y += state.pointer.y * 0.05;

    // smooth damp
    const lerpFactor = 1 - Math.pow(0.0008, delta * 60);
    curPos.current.lerp(targetPos.current, lerpFactor * 0.55);
    curLook.current.lerp(targetLook.current, lerpFactor * 0.55);

    camRef.current.position.copy(curPos.current);
    camRef.current.lookAt(curLook.current);
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={36} near={0.1} far={50} position={[0, 1.55, 4.4]} />;
}

function LightingRig({ progress }: { progress: number }) {
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  useFrame(() => {
    if (!dirRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const bt = easeInOutCubic(t);
    dirRef.current.intensity = lerp(cur.light.intensity, nxt.light.intensity, bt) * 1.55;
    dirRef.current.color.set(cur.light.color).lerp(new THREE.Color(nxt.light.color), bt);
    if (fillRef.current) fillRef.current.intensity = lerp(0.32, 0.55, bt);
    if (spotRef.current) {
      spotRef.current.intensity = lerp(0.7, 1.1, Math.sin(progress * Math.PI));
      // spot follows removal: brighter during fabric mask
      let mask = 0;
      for (let i = 0; i < total - 1; i++) {
        const seg = 1 / (total - 1);
        const tp = clamp((progress - i * seg) / seg, 0, 1);
        if (tp > 0.38 && tp < 0.58) mask = Math.max(mask, Math.sin(((tp - 0.38) / 0.20) * Math.PI));
      }
      spotRef.current.intensity += mask * 0.45;
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
      <spotLight ref={spotRef} position={[0, 4.6, 0.8]} intensity={0.88} angle={0.42} penumbra={0.82} color="#fff3dd" castShadow={false} />
      <pointLight position={[0, 1.15, 2.0]} intensity={0.55} color="#ffe9c8" distance={3.8} decay={2} />
    </>
  );
}

function EnvironmentRoom({ progress }: { progress: number }) {
  const fogRef = useRef<THREE.FogExp2>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!fogRef.current) return;
    const total = outfits.length;
    const scaled = progress * (total - 1);
    const idx = Math.floor(scaled);
    const t = scaled - idx;
    const cur = outfits[Math.min(idx, total - 1)];
    const nxt = outfits[Math.min(idx + 1, total - 1)];
    const c = new THREE.Color(cur.light.fog).lerp(new THREE.Color(nxt.light.fog), easeInOutCubic(t));
    fogRef.current.color.copy(c);
    if (floorRef.current) {
      // floor slightly reflective color shift
      (floorRef.current.material as THREE.MeshStandardMaterial).color.copy(c).lerp(new THREE.Color("#0a0a0c"), 0.35);
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
      {/* soft ceiling */}
      <mesh position={[0, 3.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#1a1a1c" emissive="#1e1e20" emissiveIntensity={0.28} roughness={1} />
      </mesh>
      {/* vertical light slit */}
      <mesh position={[0, 1.4, -2.30]}>
        <planeGeometry args={[0.02, 2.2]} />
        <meshStandardMaterial color="#c9b99a" emissive="#c9b99a" emissiveIntensity={0.85} />
      </mesh>
      <fogExp2 attach="fog" args={["#0a0a0c", 0.072]} ref={fogRef as any} />
    </>
  );
}

export default function FashionScene({ progress }: { progress: number }) {
  // fabric mask opacity for HTML transition (computed here to also affect 3D fog)
  const total = outfits.length;
  let fabricMask = 0;
  for (let i = 0; i < total - 1; i++) {
    const seg = 1 / (total - 1);
    const tp = clamp((progress - i * seg) / seg, 0, 1);
    if (tp > 0.38 && tp < 0.60) {
      fabricMask = Math.max(fabricMask, Math.sin(((tp - 0.38) / 0.22) * Math.PI));
    }
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.65]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        style={{ background: "transparent" }}
      >
        <CameraRig progress={progress} />
        <LightingRig progress={progress} />
        <EnvironmentRoom progress={progress} />
        <Mannequin progress={progress} />
        <ContactShadows position={[0, -0.94, 0]} opacity={0.48 + fabricMask * 0.15} scale={5.2} blur={2.4} far={2.6} color="#000000" />
        <Environment preset="studio" environmentIntensity={0.34} />
      </Canvas>
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(0,0,0,0.58)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-[#08080a]/55 to-transparent" />
      {/* fabric as transition - fullscreen wash when garment fills camera */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: fabricMask * 0.92,
          background:
            fabricMask > 0.02
              ? `radial-gradient(ellipse at 50% 55%, ${outfits[Math.floor(progress * (total - 1))]?.garment.color ?? "#0a0a0c"} 0%, #08080a 72%)`
              : "transparent",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.08]"
        style={{
          opacity: fabricMask * 0.18,
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)`,
        }}
      />
    </div>
  );
}
