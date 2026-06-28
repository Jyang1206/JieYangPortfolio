"use client";

import { Grid, Html, Line } from "@react-three/drei";
import type { Project, StoryStep } from "../../../data/projects";
import { PlaceholderRobot } from "./shared";

type PlaceholderSceneProps = {
  project: Project;
  activeStep: StoryStep;
  progress?: number;
  activeIndex?: number;
};

export function DeploymentScene({ project, activeStep }: PlaceholderSceneProps) {
  return (
    <>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 5, 4]} intensity={1.45} />
      <Grid infiniteGrid cellSize={0.5} sectionSize={2.5} fadeDistance={7} />
      <PlaceholderRobot color={project.accentColor} position={[-0.9, 0.22, 0]} />
      <PlaceholderRobot color="#5eead4" position={[0.85, 0.22, 0.45]} scale={0.75} />
      <Line points={[[-1.6, 0.04, -1], [-0.4, 0.04, -0.3], [0.85, 0.04, 0.45]]} color={project.accentColor} lineWidth={2} />
      <Html position={[0, 1.32, 0]} center>
        <div className="rounded-md border border-slate-200 bg-white/85 px-4 py-3 text-center text-xs text-slate-700 shadow-sm backdrop-blur">
          Placeholder deployment scene · {activeStep.title}
        </div>
      </Html>
    </>
  );
}
