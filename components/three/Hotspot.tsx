"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh, Vector3Tuple } from "three";
import { AdditiveBlending } from "three";

type HotspotProps = {
  id: string;
  label: string;
  position: Vector3Tuple;
  activeHotspot?: string;
  color?: string;
};

export function Hotspot({ id, label, position, activeHotspot, color = "#5eead4" }: HotspotProps) {
  const active = activeHotspot === id;
  const pulseRef = useRef(0);
  const ringRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!ringRef.current) return;

    if (active) {
      pulseRef.current += delta * 2; // Pulse speed
      const pulse = Math.sin(pulseRef.current) * 0.2 + 1;
      ringRef.current.scale.setScalar(pulse);
      return;
    }

    pulseRef.current = 0;
    ringRef.current.scale.setScalar(1);
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[active ? 0.09 : 0.06, 18, 18]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? color : "#000000"}
          emissiveIntensity={active ? 0.8 : 0}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.6 : 0}
          blending={AdditiveBlending}
        />
      </mesh>
      <Html distanceFactor={8} position={[0.14, 0.12, 0]} center>
        <div
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-lg backdrop-blur ${
            active
              ? "border-sky-200 bg-white text-slate-950"
              : "border-slate-200 bg-white/80 text-slate-600"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}
