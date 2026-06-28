"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils } from "three";
import type { Project, StoryStep } from "../../../data/projects";
import { ModelWithFallback } from "../ModelWithFallback";

type PlaceholderSceneProps = {
  project: Project;
  activeStep: StoryStep;
  progress?: number;
  activeIndex?: number;
};

export function VehicleBevScene({
  project,
  activeStep,
  progress = 0,
  activeIndex = 0,
}: PlaceholderSceneProps) {
  const vehicleRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!vehicleRef.current) return;

    vehicleRef.current.position.x = MathUtils.lerp(
      vehicleRef.current.position.x,
      MathUtils.lerp(-0.95, 0.72, progress),
      Math.min(1, delta * 2.4),
    );
    vehicleRef.current.rotation.y = MathUtils.lerp(
      vehicleRef.current.rotation.y,
      -0.12 + progress * 0.22,
      Math.min(1, delta * 2.4),
    );
  });

  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 5, 3]} intensity={1.55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[5, 3]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      <group ref={vehicleRef} position={[-0.95, 0.34, 0]} scale={0.96}>
        <ModelWithFallback
          modelPath={project.modelPath}
          fallback={
            <group>
              <mesh>
                <boxGeometry args={[1.7, 0.46, 0.9]} />
                <meshStandardMaterial color="#e5edf6" transparent opacity={0.88} />
              </mesh>
              <mesh position={[0.15, 0.38, 0]}>
                <boxGeometry args={[0.8, 0.32, 0.68]} />
                <meshStandardMaterial color="#8fb6cf" transparent opacity={0.62} />
              </mesh>
            </group>
          }
        />
      </group>
      {[-1.6, -0.8, 0, 0.8, 1.6].map((x) => (
        <Line key={x} points={[[x, 0.02, -1.1], [x + 0.34, 0.02, -0.82]]} color={project.accentColor} lineWidth={2} />
      ))}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.28, 0.82]} />
        <meshBasicMaterial color={project.accentColor} transparent opacity={activeIndex >= 1 ? 0.26 : 0.12} />
      </mesh>
      <Html position={[0, 1.35, 0]} center>
        <div className="rounded-md border border-slate-200 bg-white/85 px-4 py-3 text-center text-xs text-slate-700 shadow-sm backdrop-blur">
          BEV scene · {activeStep.title}
        </div>
      </Html>
    </>
  );
}
