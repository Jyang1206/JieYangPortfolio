"use client";

import { Environment, Grid, Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils } from "three";
import type { Project, StoryStep } from "../../../data/projects";
import { ModelWithFallback } from "../ModelWithFallback";
import { PlaceholderRobot } from "./shared";

type PlaceholderSceneProps = {
  project: Project;
  activeStep: StoryStep;
  progress?: number;
  activeIndex?: number;
};

export function SeerFleetScene({
  project,
  activeStep,
  progress = 0,
  activeIndex = 0,
}: PlaceholderSceneProps) {
  const robotRef = useRef<Group>(null);
  const uiVisible = activeIndex >= 3;

  useFrame((_, delta) => {
    if (!robotRef.current) return;

    robotRef.current.position.z = MathUtils.lerp(
      robotRef.current.position.z,
      MathUtils.lerp(-2.2, 0, Math.min(1, progress * 1.4)),
      Math.min(1, delta * 3),
    );
    robotRef.current.rotation.y = MathUtils.lerp(
      robotRef.current.rotation.y,
      -0.18 + progress * 0.36,
      Math.min(1, delta * 2.2),
    );
  });

  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <Environment preset="city" />
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 2]} intensity={1.5} />
      <Grid infiniteGrid cellSize={0.6} sectionSize={3} fadeDistance={8} fadeStrength={1.4} />
      <group ref={robotRef} position={[0, 0.25, -2.2]} scale={1.08}>
        <ModelWithFallback
          modelPath={project.modelPath}
          fallback={<PlaceholderRobot color={project.accentColor} />}
        />
      </group>
      {project.additionalModelPaths?.[0] && (
        <group position={[1.3, 0.18, 0.95]} rotation={[0, -0.45, 0]} scale={0.72}>
          <ModelWithFallback
            modelPath={project.additionalModelPaths[0]}
            fallback={<PlaceholderRobot color="#94a3b8" scale={0.72} />}
          />
        </group>
      )}
      <Line
        points={[
          [-2.4, 0.04, -1.2],
          [-0.9, 0.04, -0.4],
          [0, 0.04, 0],
          [1.6, 0.04, 0.9],
        ]}
        color={project.accentColor}
        lineWidth={2}
      />
      {uiVisible && (
        <Html position={[1.25, 1.35, -0.15]} transform distanceFactor={5}>
          <div className="w-56 rounded-md border border-slate-200 bg-white/90 p-3 text-xs text-slate-700 shadow-xl backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-[0.18em] text-slate-500">FMS</span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">Live</span>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-full w-2/3 rounded-full bg-sky-400" />
              </div>
              <p>Task queue, robot state, and site integrations converge here.</p>
            </div>
          </div>
        </Html>
      )}
      <Html position={[0, 1.45, 0]} center>
        <div className="rounded-md border border-slate-200 bg-white/85 px-4 py-3 text-center text-xs text-slate-700 shadow-sm backdrop-blur">
          Fleet scene · {activeStep.title}
        </div>
      </Html>
    </>
  );
}
