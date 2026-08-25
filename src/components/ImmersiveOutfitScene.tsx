"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, PerspectiveCamera } from "@react-three/drei";
import { outfits } from "@/data/outfits";

const clamp = (v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(v:number)=>v<0.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2;
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

function Material({color,roughness=0.7}:{color:string;roughness?:number}){
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />;
}

function Body({progress}:{progress:number}){
  const body=useRef<THREE.Group>(null); const head=useRef<THREE.Group>(null);
  const rArm=useRef<THREE.Group>(null); const lArm=useRef<THREE.Group>(null);
  useFrame((s)=>{
    const t=s.clock.elapsedTime;
    if(body.current){body.current.rotation.y=Math.sin(t*.22)*.018+progress*.12;body.current.position.y=-.94+Math.sin(t*.5)*.008;}
    const phase=(progress*3)%1;
    const reach=phase<.22?ease(phase/.22):phase<.46?1-ease((phase-.22)/.24):0;
    if(rArm.current){rArm.current.rotation.z=lerp(.06,-.58,reach);rArm.current.rotation.x=lerp(0,.72,reach);}
    if(lArm.current){lArm.current.rotation.z=lerp(-.06,.42,reach*.75);lArm.current.rotation.x=lerp(0,.38,reach*.75);}
    if(head.current) head.current.rotation.y=Math.sin(t*.18)*.035-(reach*.16);
  });
  return <group ref={body}>
    <mesh position={[0,1.05,0]} castShadow><capsuleGeometry args={[.31,.78,10,24]}/><Material color="#bfae93" roughness={.62}/></mesh>
    <group ref={head} position={[0,1.78,.01]}><mesh castShadow><sphereGeometry args={[.23,24,24]}/><Material color="#c9b99a" roughness={.7}/></mesh></group>
    <group ref={rArm} position={[.36,1.3,0]}><mesh position={[.12,-.28,0]} rotation={[0,0,-.08]} castShadow><capsuleGeometry args={[.09,.52,8,16]}/><Material color="#c9b99a"/></mesh></group>
    <group ref={lArm} position={[-.36,1.3,0]}><mesh position={[-.12,-.28,0]} rotation={[0,0,.08]} castShadow><capsuleGeometry args={[.09,.52,8,16]}/><Material color="#c9b99a"/></mesh></group>
    <mesh position={[-.15,.12,.02]} castShadow><boxGeometry args={[.16,.10,.30]}/><Material color="#111114" roughness={.45}/></mesh>
    <mesh position={[.15,.12,.02]} castShadow><boxGeometry args={[.16,.10,.30]}/><Material color="#111114" roughness={.45}/></mesh>
  </group>;
}

function Shirt({kind,progress}:{kind:'white'|'silk';progress:number}){
  const g=useRef<THREE.Group>(null);
  const idx=kind==='white'?0:1; const seg=1/3; const center=idx*seg;
  useFrame(()=>{if(!g.current)return; const local=(progress-center)/seg; let op=0, x=0,z=0,scale=1;
    if(local>=0&&local<.54){op=1;const p=clamp((local-.22)/.32);x=lerp(0,.16,ease(p));z=lerp(0,.12,ease(p));scale=lerp(1,1.18,ease(p));}
    else if(local<.8){const p=clamp((local-.54)/.26);op=lerp(0,1,ease(p));x=lerp(-.34,0,ease(p));z=lerp(.28,0,ease(p));scale=lerp(.82,1,ease(p));}
    g.current.visible=op>.01;g.current.position.set(x,0,z);g.current.scale.setScalar(scale);g.current.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;m.transparent=op<1;m.opacity=op;}});
  });
  const c=kind==='white'?'#f5f3ed':'#09090b'; const r=kind==='white'?.82:.24;
  return <group ref={g} position={[0,0,0]}>
    <mesh position={[0,1.08,.34]} castShadow><boxGeometry args={[.72,.72,.14]}/><Material color={c} roughness={r}/></mesh>
    <mesh position={[-.43,1.08,.01]} rotation={[0,0,.05]} castShadow><capsuleGeometry args={[.11,.58,8,16]}/><Material color={c} roughness={r}/></mesh>
    <mesh position={[.43,1.08,.01]} rotation={[0,0,-.05]} castShadow><capsuleGeometry args={[.11,.58,8,16]}/><Material color={c} roughness={r}/></mesh>
    <mesh position={[0,1.47,.42]} rotation={[.18,0,0]}><torusGeometry args={[.14,.024,8,24,Math.PI*1.3]}/><Material color={c} roughness={r}/></mesh>
    {[1.25,1.12,.99,.86].map(y=><mesh key={y} position={[0,y, .415]}><sphereGeometry args={[.018,8,8]}/><Material color={kind==='white'?'#17171a':'#d9d1c2'} roughness={.35}/></mesh>)}
  </group>;
}

function Jacket({progress}:{progress:number}){
  const g=useRef<THREE.Group>(null); const center=2/3; const seg=1/3;
  useFrame(()=>{if(!g.current)return;const local=(progress-center)/seg;let op=0,x=0,z=0,rot=0,sc=1;
    if(local>=0&&local<.54){op=1;const p=clamp((local-.2)/.34);x=lerp(0,.24,ease(p));z=lerp(0,.1,ease(p));rot=lerp(0,.08,ease(p));sc=lerp(1,1.12,ease(p));}
    else if(local<.82){const p=clamp((local-.54)/.28);op=lerp(0,1,ease(p));x=lerp(-.5,0,ease(p));z=lerp(.38,0,ease(p));sc=lerp(.78,1,ease(p));}
    g.current.visible=op>.01;g.current.position.set(x,0,z);g.current.rotation.y=rot;g.current.scale.setScalar(sc);g.current.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;m.transparent=op<1;m.opacity=op;}});
  });
  return <group ref={g}><mesh position={[0,1.08,.39]} castShadow><boxGeometry args={[.88,.78,.18]}/><Material color="#c9b99b" roughness={.82}/></mesh>
    <mesh position={[-.51,1.1,.02]} rotation={[0,0,.04]} castShadow><capsuleGeometry args={[.125,.64,8,16]}/><Material color="#c9b99b" roughness={.82}/></mesh>
    <mesh position={[.51,1.1,.02]} rotation={[0,0,-.04]} castShadow><capsuleGeometry args={[.125,.64,8,16]}/><Material color="#c9b99b" roughness={.82}/></mesh>
    <mesh position={[-.17,1.36,.50]} rotation={[0,0,.28]}><boxGeometry args={[.22,.42,.035]}/><Material color="#b09e82" roughness={.8}/></mesh>
    <mesh position={[.17,1.36,.50]} rotation={[0,0,-.28]}><boxGeometry args={[.22,.42,.035]}/><Material color="#b09e82" roughness={.8}/></mesh>
    {[1.27,1.10,.93].map(y=><mesh key={y} position={[0,y,.50]}><sphereGeometry args={[.022,8,8]}/><Material color="#201d19" roughness={.32}/></mesh>)}
  </group>;
}

function Suit({progress}:{progress:number}){
  const g=useRef<THREE.Group>(null); const center=1; const seg=1/3;
  useFrame(()=>{if(!g.current)return;const local=(progress-center)/seg;let op=0,x=0,z=0,sc=1;
    if(local>=0&&local<.54){op=1;const p=clamp((local-.2)/.34);x=lerp(0,.22,ease(p));z=lerp(0,.08,ease(p));sc=lerp(1,1.1,ease(p));}
    else if(local<.84){const p=clamp((local-.54)/.30);op=lerp(0,1,ease(p));x=lerp(-.45,0,ease(p));z=lerp(.32,0,ease(p));sc=lerp(.8,1,ease(p));}
    g.current.visible=op>.01;g.current.position.set(x,0,z);g.current.scale.setScalar(sc);g.current.traverse(o=>{if((o as THREE.Mesh).isMesh){const m=(o as THREE.Mesh).material as THREE.MeshStandardMaterial;m.transparent=op<1;m.opacity=op;}});
  });
  return <group ref={g}><mesh position={[0,1.08,.41]} castShadow><boxGeometry args={[.9,.80,.19]}/><Material color="#111116" roughness={.62}/></mesh>
    <mesh position={[-.52,1.1,.02]} rotation={[0,0,.04]} castShadow><capsuleGeometry args={[.12,.64,8,16]}/><Material color="#111116" roughness={.62}/></mesh>
    <mesh position={[.52,1.1,.02]} rotation={[0,0,-.04]} castShadow><capsuleGeometry args={[.12,.64,8,16]}/><Material color="#111116" roughness={.62}/></mesh>
    <mesh position={[-.17,1.36,.52]} rotation={[0,0,.30]}><boxGeometry args={[.24,.44,.04]}/><Material color="#25252a" roughness={.56}/></mesh>
    <mesh position={[.17,1.36,.52]} rotation={[0,0,-.30]}><boxGeometry args={[.24,.44,.04]}/><Material color="#25252a" roughness={.56}/></mesh>
    {[1.28,1.10].map(y=><mesh key={y} position={[0,y,.53]}><sphereGeometry args={[.022,8,8]}/><Material color="#c9b99a" roughness={.28}/></mesh>)}
  </group>;
}

function Scene({progress}:{progress:number}){
  const cam=useRef<THREE.PerspectiveCamera>(null);
  useFrame((_,d)=>{if(!cam.current)return;const seg=1/3;const i=Math.min(2,Math.floor(progress/seg));const t=(progress-i*seg)/seg;const positions=[[0,1.48,4.4],[1.1,1.55,3.65],[-1.05,1.35,3.9],[0,1.45,4.8]];const a=positions[i],b=positions[Math.min(3,i+1)];cam.current.position.lerp(new THREE.Vector3(lerp(a[0],b[0],ease(t)),lerp(a[1],b[1],ease(t)),lerp(a[2],b[2],ease(t))),1-Math.pow(.001,d*60));cam.current.lookAt(0,1.05,0);});
  return <><PerspectiveCamera ref={cam} makeDefault fov={35} position={[0,1.48,4.4]}/><ambientLight intensity={.38}/><directionalLight position={[3,5,4]} intensity={1.8} color="#fff3df" castShadow/><pointLight position={[-3,2,2]} intensity={1.1} color="#8c86b8"/><Environment preset="studio"/><ContactShadows position={[0,-.98,0]} opacity={.5} scale={5} blur={2}/><Body progress={progress}/><Shirt kind="white" progress={progress}/><Shirt kind="silk" progress={progress}/><Jacket progress={progress}/><Suit progress={progress}/></>;
}

export default function ImmersiveOutfitScene({progress}:{progress:number}){
  return <Canvas shadows dpr={[1,1.7]} gl={{antialias:true,powerPreference:'high-performance'}} style={{position:'absolute',inset:0}}><Scene progress={progress}/></Canvas>;
}
