"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

const STATES = [
  { name: "SP", lat: -23.55, lon: -46.63, volume: 0.9 },
  { name: "MT", lat: -12.64, lon: -55.42, volume: 0.8 },
  { name: "MS", lat: -20.44, lon: -54.65, volume: 0.7 },
  { name: "GO", lat: -15.83, lon: -49.25, volume: 0.75 },
  { name: "MG", lat: -18.51, lon: -44.08, volume: 0.65 },
];

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  const statePositions = useMemo(() =>
    STATES.map(s => ({
      ...s,
      position: latLonToVec3(s.lat, s.lon, 1.02),
    })), []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[1, 32, 32]}>
        <meshBasicMaterial color="#92C020" wireframe opacity={0.15} transparent />
      </Sphere>
      {statePositions.map((s) => (
        <mesh key={s.name} position={s.position}>
          <sphereGeometry args={[0.03 + s.volume * 0.02, 8, 8]} />
          <meshBasicMaterial color="#A3D824" opacity={0.9} transparent />
        </mesh>
      ))}
    </group>
  );
}

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-24 h-24 border border-primary/20 rounded-full flex items-center justify-center">
        <span className="text-micro text-muted-foreground">BR</span>
      </div>
    </div>
  );
}

interface GlobeBrazilProps {
  className?: string;
}

export function GlobeBrazil({ className }: GlobeBrazilProps) {
  if (typeof window === "undefined") {
    return <GlobeFallback />;
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <Suspense fallback={<GlobeFallback />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0.5, 3], fov: 35 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        >
          <ambientLight intensity={0.3} />
          <GlobeScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
