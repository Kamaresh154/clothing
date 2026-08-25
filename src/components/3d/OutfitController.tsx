"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { outfits } from "@/data/outfits";
import { clamp, easeInOutCubic, easeInOutQuad, easeOutExpo, lerp } from "./utils";
import { WhiteShirt } from "./garments/WhiteShirt";
import { BlackSilkShirt } from "./garments/BlackSilkShirt";
import { BeigeJacket } from "./garments/BeigeJacket";
import { DarkSuit } from "./garments/DarkSuit";

/**
 * OutfitController — owns 4 independent garment groups (not color swaps).
 * Each outfit has its own geometry silhouette. Transitions are physical:
 * rotation/translation/scale/sleeve offsets/panel separation, opacity only at end.
 */
export default function OutfitController({ progress }: { progress: number }) {
  const gWhite = useRef<THREE.Group>(null);
  const gSilk = useRef<THREE.Group>(null);
  const gJacket = useRef<THREE.Group>(null);
  const gSuit = useRef<THREE.Group>(null);

  const wLeft = useRef<THREE.Mesh>(null), wRight = useRef<THREE.Mesh>(null), wSleeveL = useRef<THREE.Mesh>(null), wSleeveR = useRef<THREE.Mesh>(null), wCollar = useRef<THREE.Mesh>(null);
  const sLeft = useRef<THREE.Mesh>(null), sRight = useRef<THREE.Mesh>(null), sSleeveL = useRef<THREE.Mesh>(null), sSleeveR = useRef<THREE.Mesh>(null), sCollar = useRef<THREE.Mesh>(null);
  const jLeft = useRef<THREE.Mesh>(null), jRight = useRef<THREE.Mesh>(null), jSleeveL = useRef<THREE.Mesh>(null), jSleeveR = useRef<THREE.Mesh>(null), jCollar = useRef<THREE.Group>(null);
  const suitLeft = useRef<THREE.Mesh>(null), suitRight = useRef<THREE.Mesh>(null), suitSleeveL = useRef<THREE.Mesh>(null), suitSleeveR = useRef<THREE.Mesh>(null), suitCollar = useRef<THREE.Group>(null);

  const total = outfits.length;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const breath = reduced ? 0 : Math.sin(t * 0.52) * 0.012;
    const sway = reduced ? 0 : Math.sin(t * 0.26) * 0.012;
    const groups: Array<THREE.Group | null> = [gWhite.current, gSilk.current, gJacket.current, gSuit.current];
    const panelPairs: Array<[THREE.Mesh | null, THREE.Mesh | null]> = [[wLeft.current, wRight.current],[sLeft.current, sRight.current],[jLeft.current, jRight.current],[suitLeft.current, suitRight.current]];
    const sleevePairs: Array<[THREE.Mesh | null, THREE.Mesh | null]> = [[wSleeveL.current, wSleeveR.current],[sSleeveL.current, sSleeveR.current],[jSleeveL.current, jSleeveR.current],[suitSleeveL.current, suitSleeveR.current]];
    const collars: Array<THREE.Object3D | null> = [wCollar.current, sCollar.current, jCollar.current, suitCollar.current];

    for (let i = 0; i < total; i++) {
      const g = groups[i];
      if (!g) continue;
      const seg = 1 / (total - 1);
      const start = i * seg;
      const tpLeave = clamp((progress - start) / seg, -2, 2);
      const tpEnter = clamp((progress - (start - seg)) / seg, -2, 2);
      const dist = progress - start;

      let opacity = 0, gx = 0, gy = 0, gz = 0, gRotY = 0, gRotX = 0, gRotZ = 0, gScale = 1, gap = 0, sleeveOff = 0;

      if (reduced) {
        const d = Math.abs(dist);
        opacity = clamp(1 - d / 0.20, 0, 1);
      } else {
        if (tpLeave >= 0 && tpLeave < 0.08) { opacity = 1; }
        else if (tpLeave >= 0.08 && tpLeave < 0.15) { opacity = 1; }
        else if (tpLeave >= 0.15 && tpLeave < 0.22) { opacity = 1; gap = easeInOutQuad(clamp((tpLeave - 0.15) / 0.07)) * 0.018; }
        else if (tpLeave >= 0.22 && tpLeave < 0.30) {
          opacity = 1; const p = clamp((tpLeave - 0.22) / 0.08);
          gap = lerp(0.018, i >=2 ? 0.18 : 0.15, easeInOutCubic(p)); gScale = lerp(1, 1.015, p); gz = lerp(0, 0.03, p);
        } else if (tpLeave >= 0.30 && tpLeave < 0.40) {
          opacity = 1; const p = clamp((tpLeave - 0.30) / 0.10);
          gap = lerp(i>=2?0.18:0.15, i>=2?0.24:0.20, easeInOutCubic(p)); sleeveOff = lerp(0,0.14,easeInOutCubic(p)); gy = lerp(0,0.04,p); gz = lerp(0.03,0.06,p);
        } else if (tpLeave >= 0.40 && tpLeave < 0.48) {
          opacity = 1; const p = clamp((tpLeave - 0.40)/0.08); const e = easeInOutCubic(p);
          gap = lerp(i>=2?0.24:0.20, i>=2?0.26:0.22, e); sleeveOff = lerp(0.14,0.18,e); gz = lerp(0.06,0.62,e); gy = lerp(0.04,0.18,e); gx = lerp(0,(i%2===0?0.32:-0.32),e); gRotY = lerp(0,(i%2===0?0.68:-0.68),e); gRotX = lerp(0,-0.38,e); gRotZ = lerp(0,0.20,e); gScale = lerp(1.015, i>=2?1.9:1.78, easeOutExpo(p)); if (p>0.70) opacity = lerp(1,0,clamp((p-0.70)/0.30));
        } else if (tpLeave >= 0.48 && tpLeave < 1.0) {
          if (tpLeave < 0.54) { opacity = lerp(1,0,clamp((tpLeave-0.48)/0.06)); gz=0.62; gScale=i>=2?1.9:1.78; gap=0.26; } else { opacity=0; gz=0.62; gScale=1.9; }
        } else if (dist <0 && dist > -seg) {
          const tp = tpEnter;
          if (tp <0.48) { opacity=0; gy=0.72 - tp*0.2; gz=-0.38; gScale=0.84; }
          else if (tp <0.54) { const p=clamp((tp-0.48)/0.06); opacity=lerp(0,0.15,p); gy=lerp(0.62,0.35,easeOutExpo(p)); gz=lerp(-0.38,-0.10,p); gScale=lerp(0.84,0.96,p); }
          else if (tp <0.62) { const p=clamp((tp-0.54)/0.08); const e=easeOutExpo(p); opacity=lerp(0.15,0.85,e); gy=lerp(0.35,0.12,e); gz=lerp(-0.10,0.16,e); gScale=lerp(0.96,1.10,e); gap=lerp(0.10,0.06,e); sleeveOff=lerp(0.16,0.08,e); }
          else if (tp <0.70) { const p=clamp((tp-0.62)/0.08); const e=easeOutExpo(p); opacity=lerp(0.85,1,e); gy=lerp(0.12,0.04,e); gz=lerp(0.16,0.05,e); gScale=lerp(1.10,1.02,e); gap=lerp(0.06,0.02,e); sleeveOff=lerp(0.08,0.02,e); }
          else if (tp <0.80) { const p=clamp((tp-0.70)/0.10); const e=easeInOutQuad(p); opacity=1; gap=lerp(0.02,0,e); sleeveOff=lerp(0.02,0,e); gy=lerp(0.04,0,e); gz=lerp(0.05,0,e); gScale=lerp(1.02,1,e); }
          else if (tp <0.88) { opacity=1; gap=0; sleeveOff=0; gy=0; gz=0; gScale=1; } else { opacity=1; }
        } else if (Math.abs(dist) <0.08) { opacity=1; } else { opacity=0; }
      }

      // base offset -0.95 + breath to align with body; sway affects rotation
      g.position.set(gx + sway * 0.3, gy - 0.95 + breath, gz);
      g.rotation.set(gRotX, gRotY + sway * 0.5, gRotZ);
      g.scale.setScalar(gScale);
      g.visible = opacity > 0.015;

      const [pl, pr] = panelPairs[i] || [null,null];
      if (pl) { const base = i>=2?0.22:0.18; pl.position.x = -base - gap; pl.rotation.y = -gap*0.9; (pl.material as THREE.MeshStandardMaterial).opacity = opacity; (pl.material as THREE.MeshStandardMaterial).transparent = true; pl.visible = opacity>0.015; }
      if (pr) { const base = i>=2?0.22:0.18; pr.position.x = base + gap; pr.rotation.y = gap*0.9; (pr.material as THREE.MeshStandardMaterial).opacity = opacity; (pr.material as THREE.MeshStandardMaterial).transparent = true; pr.visible = opacity>0.015; }
      const [sl, sr] = sleevePairs[i] || [null,null];
      if (sl) { const baseX = i>=2 ? -0.52 : -0.46; sl.position.x = baseX - sleeveOff; (sl.material as THREE.MeshStandardMaterial).opacity = opacity; (sl.material as THREE.MeshStandardMaterial).transparent = true; sl.visible = opacity>0.015; }
      if (sr) { const baseX = i>=2 ? 0.52 : 0.46; sr.position.x = baseX + sleeveOff; (sr.material as THREE.MeshStandardMaterial).opacity = opacity; (sr.material as THREE.MeshStandardMaterial).transparent = true; sr.visible = opacity>0.015; }
      const collar = collars[i];
      if (collar) {
        collar.position.z = gap*0.14;
        if ((collar as THREE.Group).scale) (collar as THREE.Group).scale.set(1+gap*0.28,1,1);
        collar.traverse((o)=>{ if((o as THREE.Mesh).isMesh){ const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial; m.transparent=true; m.opacity=opacity; (o as THREE.Mesh).visible=opacity>0.015; }});
        collar.visible = opacity>0.015;
      }
      g.traverse((o)=>{ if((o as THREE.Mesh).isMesh){ const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial; if(o!==pl && o!==pr && o!==sl && o!==sr && !collar?.children.includes(o as any)){ m.transparent=true; m.opacity=Math.min(m.opacity??1, opacity); (o as THREE.Mesh).visible=opacity>0.015; } }});
      g.traverse((o)=>{ if((o as THREE.Mesh).isMesh){ const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial; if(m.roughness!==undefined){ const baseR=outfits[i].garment.roughness; m.roughness=baseR+gap*0.18; } }});
    }
  });

  return (
    <>
      <group ref={gWhite}><WhiteShirt leftRef={wLeft} rightRef={wRight} sleeveLRef={wSleeveL} sleeveRRef={wSleeveR} collarRef={wCollar as any} /></group>
      <group ref={gSilk}><BlackSilkShirt leftRef={sLeft} rightRef={sRight} sleeveLRef={sSleeveL} sleeveRRef={sSleeveR} collarRef={sCollar as any} /></group>
      <group ref={gJacket}><BeigeJacket leftRef={jLeft} rightRef={jRight} sleeveLRef={jSleeveL} sleeveRRef={jSleeveR} collarRef={jCollar as any} /></group>
      <group ref={gSuit}><DarkSuit leftRef={suitLeft} rightRef={suitRight} sleeveLRef={suitSleeveL} sleeveRRef={suitSleeveR} collarRef={suitCollar as any} /></group>
    </>
  );
}
