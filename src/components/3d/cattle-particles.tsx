"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

function ParticleField({ trend = "up" }: { trend?: "up" | "down" | "neutral" }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);

  const color = trend === "up" ? "#92C020" : trend === "down" ? "#DC2626" : "#A0A0A0";

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

function ParticleFallback({ trend }: { trend?: "up" | "down" | "neutral" }) {
  const bg = trend === "up" ? "from-green-500/10" : trend === "down" ? "from-red-500/10" : "from-gray-500/10";
  return (
    <div className={cn("w-full h-full bg-gradient-to-br", bg, "to-transparent flex items-center justify-center")}>
      <div className="w-3 h-3 bg-primary/30 animate-pulse" />
    </div>
  );
}

interface CattleParticlesProps {
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function CattleParticles({ trend = "up", className }: CattleParticlesProps) {
  const supportsWebGL = typeof window !== "undefined" && !!document.createElement("canvas").getContext("webgl2");
  
  if (!supportsWebGL) {
    return <ParticleFallback trend={trend} />;
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <Suspense fallback={<ParticleFallback trend={trend} />}>
        <Canvas
          frameloop="demand"
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        >
          <ambientLight intensity={0.5} />
          <ParticleField trend={trend} />
        </Canvas>
      </Suspense>
    </div>
  );
}
