"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Activity, ArrowDown, ArrowUpRight, Cpu, Radar, Route, ShieldCheck } from "lucide-react";
import type { Project } from "../../data/projects";
import { ThreeCanvasShell } from "../three/ThreeCanvasShell";
import { GalleryPreviewScene } from "../three/scenes/GalleryPreviewScene";

type LandingHeroProps = {
  copy: string;
  featuredProject: Project;
};

const telemetryItems = [
  { label: "Vision", value: "RGB-D lock", icon: Radar },
  { label: "Planner", value: "6 waypoints", icon: Route },
  { label: "Safety", value: "Dry-run gate", icon: ShieldCheck },
];

const bootLines = [
  "camera.extrinsics: verified",
  "tf_chain: camera -> base",
  "workspace: bounded",
  "pick_trace: ready",
];

export function LandingHero({ copy, featuredProject }: LandingHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const entrance = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: "easeOut" as const },
      };
  const previewEntrance = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.15, duration: 0.7, ease: "easeOut" as const },
      };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative flex min-h-[106vh] flex-col overflow-hidden bg-[#06080d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_42%,rgba(94,234,212,0.22),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(251,113,133,0.16),transparent_24%),linear-gradient(180deg,#06080d_0%,#09101a_72%,#f5f5f7_72%,#f5f5f7_100%)]" />
        <div className="absolute inset-0 hero-grid opacity-55" aria-hidden="true" />
        <div className="hero-scan absolute inset-x-0 top-0 h-full opacity-80" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-[9%] h-[72vh] w-[72vh] -translate-x-1/2 rounded-full border border-cyan-300/10" />

        <div className="absolute left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#05070a]/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 text-sm">
            <span className="font-medium tracking-normal text-white/92">Jie Yang</span>
            <nav className="flex items-center gap-5 text-xs text-white/64" aria-label="Portfolio sections">
              <a className="transition hover:text-white" href="#browser-sim">Simulation</a>
              <a className="transition hover:text-white" href="#projects">Projects</a>
              <a className="transition hover:text-white" href="#systems">Systems</a>
              <a className="transition hover:text-white" href="#contact">Contact</a>
            </nav>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-8 px-6 pb-28 pt-24 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pt-20">
          <m.div {...entrance} className="relative z-20 max-w-2xl">
            <div className="mb-6 flex w-fit items-center gap-3 border border-cyan-300/24 bg-cyan-300/8 px-3 py-2 text-xs uppercase tracking-[0.22em] text-cyan-100">
              <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.9)]" />
              Human-centered robotics
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-[82px]">
              Robots, vision, and deployment stories in motion.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] font-normal leading-[1.65] tracking-normal text-slate-300 sm:text-xl">
              {copy}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#browser-sim"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-[22px] py-[12px] text-[16px] font-semibold leading-none text-slate-950 transition hover:bg-white active:scale-95"
              >
                <Activity size={17} aria-hidden="true" />
                Run simulation
              </a>
              <Link
                href={`/projects/${featuredProject.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-[22px] py-[12px] text-[16px] leading-none text-white transition hover:border-cyan-200 hover:text-cyan-100 active:scale-95"
              >
                Open model story
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
              {telemetryItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <m.div
                    key={item.label}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.08, duration: 0.5, ease: "easeOut" }}
                    className="border border-white/12 bg-white/[0.045] p-3 shadow-2xl shadow-black/25 backdrop-blur-md"
                  >
                    <Icon size={16} className="mb-3 text-cyan-200" aria-hidden="true" />
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-medium text-white">{item.value}</p>
                  </m.div>
                );
              })}
            </div>
          </m.div>

          <m.div
            {...previewEntrance}
            className="relative h-[56vh] min-h-[420px] w-full lg:h-[78vh]"
            aria-label={`${featuredProject.title} animated model preview`}
          >
            <div className="absolute inset-x-[9%] bottom-[8%] h-28 rounded-[50%] bg-cyan-300/12 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[68vh] max-h-[760px] w-[68vh] max-w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" />
            <div className="absolute left-1/2 top-1/2 h-[48vh] max-h-[560px] w-[48vh] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-200/10" />
            <div className="absolute inset-0 model-stage-drift">
              <ThreeCanvasShell
                label={`${featuredProject.title} hero model`}
                fallback={
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
                    3D model preview unavailable. Project stories remain available below.
                  </div>
                }
              >
                <GalleryPreviewScene
                  project={featuredProject}
                  index={0}
                  presentation="showcase"
                  active
                />
              </ThreeCanvasShell>
            </div>

            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: "easeOut" }}
              className="absolute right-0 top-[12%] hidden w-64 border border-white/12 bg-[#061018]/76 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl md:block"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Trace</p>
                <Cpu size={16} className="text-cyan-200" aria-hidden="true" />
              </div>
              <div className="space-y-2 font-mono text-[11px] leading-5 text-slate-300">
                {bootLines.map((line) => (
                  <p key={line} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-300" />
                    {line}
                  </p>
                ))}
              </div>
            </m.div>

            <m.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: -22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
              className="absolute bottom-[15%] left-0 hidden w-72 border border-white/12 bg-[#090b10]/78 p-4 shadow-2xl shadow-black/35 backdrop-blur-xl sm:block"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-100">Featured cell</p>
              <p className="mt-2 text-lg font-semibold leading-6 text-white">{featuredProject.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{featuredProject.subtitle}</p>
            </m.div>
          </m.div>
        </div>

        <a
          href="#browser-sim"
          className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-300 transition hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          Continue
          <ArrowDown size={18} aria-hidden="true" />
        </a>
      </section>
    </LazyMotion>
  );
}
