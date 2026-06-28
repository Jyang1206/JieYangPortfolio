"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Project } from "../../data/projects";
import { useScrollNarrativeProgress } from "../../hooks/useScrollNarrativeProgress";
import { MjswanProjectEmbed } from "./MjswanProjectEmbed";
import { NarrativePanel } from "./NarrativePanel";
import { ThreeCanvasShell } from "../three/ThreeCanvasShell";
import { XArmScene } from "../three/scenes/XArmScene";
import { SeerFleetScene } from "../three/scenes/SeerFleetScene";
import { GuitarVisualizerScene } from "../three/scenes/GuitarVisualizerScene";
import { VehicleBevScene } from "../three/scenes/VehicleBevScene";
import { DeploymentScene } from "../three/scenes/DeploymentScene";

type ProjectStoryLayoutProps = {
  project: Project;
};

export function ProjectStoryLayout({ project }: ProjectStoryLayoutProps) {
  const { containerRef, progress, activeIndex } = useScrollNarrativeProgress(
    project.storySteps.length,
  );

  const Scene = useMemo(() => {
    switch (project.sceneType) {
      case "xarm":
        return XArmScene;
      case "seer":
        return SeerFleetScene;
      case "guitar":
        return GuitarVisualizerScene;
      case "vehicle":
        return VehicleBevScene;
      case "deployment":
      default:
        return DeploymentScene;
    }
  }, [project.sceneType]);

  const activeStep = project.storySteps[activeIndex];

  return (
    <main className="fine-grid min-h-screen bg-slate-100 text-slate-950">
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200/80 bg-white/80 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-slate-500 md:inline">
            {project.role}
          </span>
        </div>
      </header>

      <section className="px-5 pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Project Story
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 md:text-6xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{project.longDescription}</p>
          {(project.company || project.concepts?.length) && (
            <div className="mt-8 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              {project.company && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Organization
                  </p>
                  <p className="mt-3 text-lg font-semibold text-slate-950">{project.company}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.role}</p>
                </div>
              )}
              {project.concepts?.length ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    System Concepts
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.concepts.map((concept) => (
                      <span
                        key={concept}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <span
                key={technology}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
              >
                {technology}
              </span>
            ))}
          </div>
        </div>
      </section>

      {project.artifactImage && <ProjectArtifact project={project} />}
      <MjswanProjectEmbed project={project} />

      <section
        ref={containerRef}
        className="relative mt-12 min-h-[520vh] pb-24 lg:min-h-[620vh]"
      >
        <div className="sticky top-0 z-10 h-screen overflow-hidden bg-slate-50 shadow-inner shadow-slate-200/80">
          <ThreeCanvasShell
            label={`${project.title} interactive 3D story`}
            fallback={
              <div className="flex h-full items-center justify-center bg-slate-50 p-6 text-center text-slate-600">
                3D story unavailable. The written project narrative remains available below.
              </div>
            }
          >
            <Scene
              project={project}
              progress={progress}
              activeStep={activeStep}
              activeIndex={activeIndex}
            />
          </ThreeCanvasShell>
          <div className="pointer-events-none absolute left-5 top-20 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur">
            Scroll-linked scene
          </div>
          {project.sceneType === "xarm" && (
            <XArmTraceDashboard project={project} progress={progress} activeIndex={activeIndex} />
          )}
        </div>

        <div className="pointer-events-none relative z-20 -mt-[100vh] min-h-[520vh] px-5 lg:min-h-[620vh]">
          <div className="mx-auto grid max-w-7xl items-start lg:grid-cols-[minmax(0,1fr)_430px]">
            <div aria-hidden="true" />
            <div className="space-y-[62vh] pt-[44vh]">
              {project.storySteps.map((step, index) => (
                <div key={step.id} className="pointer-events-auto min-h-[46vh]">
                  <NarrativePanel project={project} step={step} activeIndex={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function XArmTraceDashboard({
  project,
  progress,
  activeIndex,
}: {
  project: Project;
  progress: number;
  activeIndex: number;
}) {
  const currentStep = project.storySteps[activeIndex];
  const phase = currentStep?.id.replace(/-/g, " ") ?? "overview";
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-20 grid gap-3 text-white md:right-auto md:w-[420px]">
      <div className="border border-white/12 bg-slate-950/78 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
            xArm trace
          </p>
          <p className="font-mono text-xs text-slate-300">{progressPercent}%</p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${progressPercent}%`, backgroundColor: project.accentColor }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          {["vision", "tf", "execution"].map((label, index) => (
            <div
              key={label}
              className={`border px-3 py-2 ${
                activeIndex >= index + 1
                  ? "border-cyan-200/40 bg-cyan-200/10 text-cyan-50"
                  : "border-white/10 bg-white/[0.03] text-slate-400"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium capitalize text-white">{phase}</p>
      </div>
    </div>
  );
}

function ProjectArtifact({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const artifactImage = project.artifactImage;

  if (!artifactImage) {
    return null;
  }

  return (
    <section className="px-5 pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Work Artifact
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Fleet management and trolley inventory UI
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              A whole-page product screenshot belongs here as evidence of the operational surface,
              separate from the simplified homepage teleop demo.
            </p>
          </div>

          {failed ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Screenshot placeholder</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Add the fleet UI screenshot at{" "}
                  <code className="rounded bg-white px-1 py-0.5 text-slate-800">
                    public/images/fleet-management-ui.png
                  </code>{" "}
                  and this section will render it automatically.
                </p>
              </div>
            </div>
          ) : (
            <Image
              src={artifactImage}
              alt={`${project.title} dashboard screenshot`}
              width={1600}
              height={1000}
              onError={() => setFailed(true)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
            />
          )}
        </div>
      </div>
    </section>
  );
}
