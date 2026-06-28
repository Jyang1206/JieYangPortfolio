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

export function GuitarVisualizerScene({
  project,
  activeStep,
  progress = 0,
}: PlaceholderSceneProps) {
  const cameraRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    cameraRef.current.rotation.y = MathUtils.lerp(
      cameraRef.current.rotation.y,
      0.75 + progress * 1.2,
      Math.min(1, delta * 2.4),
    );
    cameraRef.current.position.x = MathUtils.lerp(
      cameraRef.current.position.x,
      MathUtils.lerp(-1.75, -1.25, progress),
      Math.min(1, delta * 2.4),
    );
  });

  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.76} />
      <directionalLight position={[3, 4, 3]} intensity={1.45} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.12, 0.62]} />
        <meshStandardMaterial color="#d6a45f" roughness={0.48} />
      </mesh>
      {[-1.2, -0.72, -0.24, 0.24, 0.72, 1.2].map((x) => (
        <Line key={x} points={[[x, 0.08, -0.34], [x, 0.08, 0.34]]} color="#6b4423" lineWidth={1} />
      ))}
      {[-0.22, 0, 0.22].map((z) => (
        <Line key={z} points={[[-1.58, 0.1, z], [1.58, 0.1, z]]} color="#f8fafc" lineWidth={1} />
      ))}
      {[-0.48, 0.14, 0.74].map((x) => (
        <mesh key={x} position={[x, 0.16, -0.04]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial color={project.accentColor} emissive={project.accentColor} emissiveIntensity={0.4} />
        </mesh>
      ))}
      <group ref={cameraRef} position={[-1.75, 0.62, 0]} rotation={[0.18, 0.75, 0]} scale={0.72}>
        <ModelWithFallback
          modelPath={project.modelPath}
          fallback={
            <mesh>
              <boxGeometry args={[0.52, 0.36, 0.36]} />
              <meshStandardMaterial color="#dbeafe" />
            </mesh>
          }
        />
      </group>
      <Html position={[0, 1.05, 0]} center>
        <div className="rounded-md border border-slate-200 bg-white/85 px-4 py-3 text-center text-xs text-slate-700 shadow-sm backdrop-blur">
          Scale visualizer · {activeStep.title}
        </div>
      </Html>
    </>
  );
}
