"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function TerrainMesh({ data }: { data: number[] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const width = 6;
  const height = 3;
  const segW = Math.min(data.length - 1, 30);
  const segH = 10;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segW, segH);
    const pos = geo.attributes.position;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    for (let i = 0; i <= segW; i++) {
      const normalized = (data[Math.min(i, data.length - 1)] - min) / range;
      for (let j = 0; j <= segH; j++) {
        const idx = i * (segH + 1) + j;
        const falloff = 1 - Math.abs(j / segH - 0.5) * 2;
        (pos.array as Float32Array)[idx * 3 + 2] = normalized * 0.8 * falloff;
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [data, segW, segH]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -0.6 + Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-0.6, 0, 0]}>
      <meshBasicMaterial color="#92C020" wireframe opacity={0.6} transparent />
    </mesh>
  );
}

function TerrainFallback() {
  return (
    <div className="w-full h-full bg-gradient-to-t from-primary/5 to-transparent flex items-center justify-center">
      <div className="w-full h-px bg-primary/20" />
    </div>
  );
}

interface DataTerrainProps {
  data: number[];
  className?: string;
}

export function DataTerrain({ data, className }: DataTerrainProps) {
  if (typeof window === "undefined" || data.length < 2) {
    return <TerrainFallback />;
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <Suspense fallback={<TerrainFallback />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 1, 4], fov: 40 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        >
          <TerrainMesh data={data} />
        </Canvas>
      </Suspense>
    </div>
  );
}
