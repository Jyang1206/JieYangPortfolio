"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/projects";
import { ThreeCanvasShell } from "../three/ThreeCanvasShell";
import { GalleryPreviewScene } from "../three/scenes/GalleryPreviewScene";

type SystemsShowcaseProps = {
  projects: Project[];
};

const systemNarratives = [
  {
    sceneType: "xarm",
    eyebrow: "Perception to action",
    title: "A camera observation becomes a robot-safe pick.",
    body: "The work is not just detection. It is calibration, frame transforms, reachable poses, dry-run gates, and a motion sequence that can be trusted around real tools.",
    surface: "bg-white text-[#1d1d1f]",
  },
  {
    sceneType: "seer",
    eyebrow: "Fleet orchestration",
    title: "Robots need software that understands the building.",
    body: "Dispatch only matters when it connects to lifts, secure doors, RFID events, inventory state, operator recovery, and the awkward edge cases that appear during deployment.",
    surface: "bg-[#272729] text-white",
  },
  {
    sceneType: "vehicle",
    eyebrow: "Motion estimation",
    title: "Feature tracks become a recovered view of the road.",
    body: "The ADAS work is about stable motion signals under real-time constraints: OpenCV, CUDA, VPI KLT tracking, filtering, warping, and stitching into a usable BEV/downward view.",
    surface: "bg-[#f5f5f7] text-[#1d1d1f]",
  },
] as const;

export function SystemsShowcase({ projects }: SystemsShowcaseProps) {
  const fallbackProject = projects[0];

  return (
    <section id="systems" className="bg-[#f5f5f7]">
      {systemNarratives.map((narrative, index) => {
        const project =
          projects.find((item) => item.sceneType === narrative.sceneType) ?? fallbackProject;
        const dark = narrative.surface.includes("272729");

        return (
          <article
            key={narrative.sceneType}
            className={`relative min-h-screen overflow-hidden px-6 py-20 ${narrative.surface}`}
          >
            <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative z-10 max-w-xl">
                <p className={`text-[21px] font-semibold leading-tight tracking-normal ${dark ? "text-white/72" : "text-[#333333]"}`}>
                  {narrative.eyebrow}
                </p>
                <h2 className="mt-3 text-4xl font-semibold leading-[1.06] tracking-normal sm:text-5xl lg:text-6xl">
                  {narrative.title}
                </h2>
                <p className={`mt-5 text-[17px] leading-[1.55] tracking-normal ${dark ? "text-white/68" : "text-[#333333]"}`}>
                  {narrative.body}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {project.technologies.slice(0, 5).map((technology) => (
                    <span
                      key={technology}
                      className={`rounded-full px-3 py-1 text-sm ${
                        dark
                          ? "border border-white/14 text-white/72"
                          : "border border-black/10 bg-white text-[#333333]"
                      }`}
                    >
                      {technology}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/projects/${project.slug}`}
                  className={`mt-8 inline-flex items-center gap-1 rounded-full px-[22px] py-[11px] text-[17px] leading-none transition active:scale-95 ${
                    dark
                      ? "border border-[#2997ff] text-[#2997ff] hover:border-white hover:text-white"
                      : "bg-[#0066cc] text-white hover:bg-[#0071e3]"
                  }`}
                >
                  View story
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>

              <div className="relative h-[50vh] min-h-[340px] lg:h-[68vh]">
                <div
                  className={`absolute inset-x-[16%] bottom-[10%] h-24 rounded-[50%] blur-3xl ${
                    dark ? "bg-black/45" : "bg-black/20"
                  }`}
                />
                <ThreeCanvasShell
                  label={`${project.title} system model`}
                  fallback={
                    <div className={`flex h-full items-center justify-center text-center text-sm ${dark ? "text-white/55" : "text-[#7a7a7a]"}`}>
                      3D model preview unavailable. The written project story is still available.
                    </div>
                  }
                >
                  <GalleryPreviewScene
                    project={project}
                    index={index + 1}
                    presentation="showcase"
                    active
                  />
                </ThreeCanvasShell>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
