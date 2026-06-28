"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/projects";
import { ThreeCanvasShell } from "../three/ThreeCanvasShell";
import { GalleryPreviewScene } from "../three/scenes/GalleryPreviewScene";
import { useHorizontalScrollSection } from "../../hooks/useHorizontalScrollSection";

type ProjectGalaxyProps = {
  projects: Project[];
};

const TECHNICAL_LINE_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ProjectGalaxy({ projects }: ProjectGalaxyProps) {
  const { sectionRef, trackRef, activeIndex } = useHorizontalScrollSection(projects.length);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative bg-white text-slate-950"
      style={{ minHeight: `${projects.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 mission-grid opacity-70" aria-hidden="true" />
        <div className="absolute bottom-8 left-6 text-[15vw] font-semibold leading-none tracking-normal text-slate-100/80">
          WORK
        </div>

        <div className="absolute left-6 right-6 top-5 z-30 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Experience / Projects
            </p>
            <p className="mt-1 hidden text-sm text-slate-500 md:block">
              Professional experience first, selected projects after.
            </p>
          </div>
          <div className="hidden max-w-[56vw] gap-2 overflow-x-auto md:flex">
            {projects.map((project, index) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className={`whitespace-nowrap border bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                  index === activeIndex
                    ? "border-slate-950 text-slate-950"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {String(index + 1).padStart(2, "0")} {projectLabel(project)}
              </Link>
            ))}
          </div>
        </div>

        <div ref={trackRef} className="flex h-full will-change-transform">
          {projects.map((project, index) => (
            <ProjectPanel
              key={project.slug}
              project={project}
              index={index}
              total={projects.length}
              active={index === activeIndex}
              preload={Math.abs(index - activeIndex) <= 1}
              startsCategory={index === 0 || projects[index - 1].category !== project.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const ProjectPanel = memo(function ProjectPanel({
  project,
  index,
  total,
  active,
  preload,
  startsCategory,
}: {
  project: Project;
  index: number;
  total: number;
  active: boolean;
  preload: boolean;
  startsCategory: boolean;
}) {
  return (
    <article className="relative h-screen w-screen shrink-0 overflow-hidden px-6 py-16">
      <div className="absolute inset-0 opacity-60" aria-hidden="true">
        <div className="absolute left-[5%] top-20 h-px w-[90%] bg-slate-200" />
        <div className="absolute bottom-10 left-[5%] h-px w-[90%] bg-slate-200" />
        <div className="absolute left-[5%] top-20 h-[calc(100%-7.5rem)] w-px bg-slate-200" />
        <div className="absolute right-[5%] top-20 h-[calc(100%-7.5rem)] w-px bg-slate-200" />
      </div>

      <div className="relative mx-auto h-full max-w-7xl">
        <div className="pointer-events-none absolute left-0 top-14 z-20 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {projectCategoryLabel(project)} · {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </p>
          {startsCategory && (
            <p className="mt-3 w-fit border border-slate-300 bg-white/85 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm">
              {project.category === "experience" ? "Professional Experience" : "Selected Projects"}
            </p>
          )}
          <h2 className="mt-4 text-5xl font-semibold leading-[0.92] tracking-normal text-slate-950 md:text-7xl">
            {project.title}
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">{project.subtitle}</p>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          aria-label={`Open project story for ${project.title}`}
          className="group absolute inset-x-0 top-[14vh] z-10 mx-auto block h-[60vh] min-h-[430px] max-w-5xl rounded-md outline-none focus:ring-2 focus:ring-sky-300 md:h-[72vh]"
        >
          <div className="absolute inset-x-[18%] bottom-[8%] h-24 rounded-[50%] bg-slate-300/35 blur-3xl transition group-hover:bg-sky-200/75" />
          <div className="absolute inset-0 transition duration-500 group-hover:scale-[1.035] group-focus-visible:scale-[1.035]">
            {preload ? (
              <ThreeCanvasShell
                active={active}
                label={`${project.title} centered rendered model`}
                fallback={
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                    3D model unavailable. Open the project story for the written case study.
                  </div>
                }
              >
                <GalleryPreviewScene
                  project={project}
                  index={index}
                  presentation="showcase"
                  active={active}
                />
              </ThreeCanvasShell>
            ) : (
              <div className="flex h-full items-center justify-center text-[12vw] font-semibold leading-none text-slate-100">
                {projectLabel(project)}
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute right-4 top-24 max-w-xs translate-y-3 border border-slate-200 bg-white/92 p-4 opacity-0 shadow-xl shadow-slate-200/80 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Select
              </p>
              <ArrowUpRight size={16} className="text-slate-500" aria-hidden="true" />
            </div>
            <p className="text-sm leading-6 text-slate-700">{project.shortDescription}</p>
            {project.company && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {project.company}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>

        <div className="absolute bottom-8 left-0 z-20 w-full lg:w-[42%]">
          <TechnicalSketch project={project} />
        </div>

        <div className="absolute bottom-12 right-0 z-20 hidden max-w-xs border-l border-slate-200 pl-5 text-xs uppercase tracking-[0.18em] text-slate-500 lg:block">
          {project.company && (
            <div className="mb-4 flex items-center gap-3 normal-case tracking-normal text-slate-700">
              <CompanyMark project={project} />
              <span className="text-sm font-medium">{project.company}</span>
            </div>
          )}
          <p>{project.role}</p>
          <div className="mt-5 flex flex-wrap gap-2 normal-case tracking-normal">
            {project.technologies.slice(0, 6).map((technology) => (
              <span key={technology} className="border border-slate-200 bg-white/80 px-2 py-1 text-xs text-slate-600">
                {technology}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
});

function CompanyMark({ project }: { project: Project }) {
  if (project.companyLogo) {
    return (
      <Image
        src={project.companyLogo}
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-md border border-slate-200 bg-white object-contain p-1"
      />
    );
  }

  return (
    <span className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-[11px] font-semibold uppercase text-slate-600">
      {companyInitials(project.company ?? project.title)}
    </span>
  );
}

function companyInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

function projectCategoryLabel(project: Project) {
  return project.category === "experience" ? "Professional Experience" : "Selected Project";
}

function projectLabel(project: Project) {
  if (project.slug === "seer-fleet-management") return "Fleet App";
  if (project.slug === "st-engineering-bev-motion") return "ST Engineering";
  if (project.slug === "xarm-vision-to-pick") return "xArm";
  return "Guitar CV";
}

function TechnicalSketch({ project }: { project: Project }) {
  return (
    <div className="relative overflow-hidden border border-slate-200 bg-slate-50/75 p-4">
      <div className="absolute inset-0 fine-grid opacity-80" aria-hidden="true" />
      <div className="relative grid gap-4 md:grid-cols-[1fr_180px] md:items-end">
        <svg
          viewBox="0 0 420 220"
          className="h-44 w-full text-slate-800 md:h-52"
          role="img"
          aria-label={`${project.title} technical sketch`}
        >
          <TechnicalShape sceneType={project.sceneType} accentColor={project.accentColor} />
        </svg>
        <div className="relative hidden border-l border-slate-300 pl-4 md:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tech Stack
          </p>
          <ul className="mt-4 space-y-3 text-xs leading-5 text-slate-600">
            {project.technologies.slice(0, 5).map((technology) => (
              <li key={technology} className="border-b border-slate-200 pb-2">
                {technology}
              </li>
            ))}
          </ul>
          {project.concepts && (
            <p className="mt-4 text-xs leading-5 text-slate-500">
              {project.concepts.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TechnicalShape({
  sceneType,
  accentColor,
}: {
  sceneType: Project["sceneType"];
  accentColor: string;
}) {
  if (sceneType === "xarm") {
    return (
      <>
        <path {...TECHNICAL_LINE_PROPS} d="M64 184h112M92 184V134M92 134h52M144 134l58-76M202 58h52M254 58l48 44M302 102v42" />
        <circle {...TECHNICAL_LINE_PROPS} cx="92" cy="134" r="20" />
        <circle {...TECHNICAL_LINE_PROPS} cx="202" cy="58" r="18" />
        <circle {...TECHNICAL_LINE_PROPS} cx="302" cy="102" r="17" />
        <path {...TECHNICAL_LINE_PROPS} d="M286 144h34M292 144l-10 26M314 144l10 26" />
        <path d="M54 196h286" stroke={accentColor} strokeWidth="4" />
        <path {...TECHNICAL_LINE_PROPS} d="M38 52h70M38 52v70M346 44h38v28h-38zM346 82l-32 34" opacity="0.45" />
      </>
    );
  }

  if (sceneType === "seer") {
    return (
      <>
        <rect {...TECHNICAL_LINE_PROPS} x="52" y="108" width="128" height="58" rx="10" />
        <rect {...TECHNICAL_LINE_PROPS} x="82" y="82" width="68" height="32" rx="6" />
        <circle {...TECHNICAL_LINE_PROPS} cx="82" cy="172" r="12" />
        <circle {...TECHNICAL_LINE_PROPS} cx="150" cy="172" r="12" />
        <rect {...TECHNICAL_LINE_PROPS} x="228" y="122" width="96" height="40" rx="6" />
        <path {...TECHNICAL_LINE_PROPS} d="M256 122v-26h44v26M356 152l20-32 18 32M376 120v-24" />
        <path d="M70 62c52 18 89 29 142 25 47-4 73 8 118 34" stroke={accentColor} strokeWidth="4" fill="none" />
        <path {...TECHNICAL_LINE_PROPS} d="M60 196h304M210 72h34M274 72h34M338 72h34" opacity="0.5" />
      </>
    );
  }

  if (sceneType === "guitar") {
    return (
      <>
        <path {...TECHNICAL_LINE_PROPS} d="M52 118h286M74 92v52M126 92v52M178 92v52M230 92v52M282 92v52" />
        <path {...TECHNICAL_LINE_PROPS} d="M52 98h286M52 112h286M52 126h286M52 140h286" opacity="0.58" />
        <rect {...TECHNICAL_LINE_PROPS} x="310" y="52" width="62" height="38" rx="6" />
        <circle {...TECHNICAL_LINE_PROPS} cx="329" cy="71" r="8" />
        <path d="M118 112h62M218 126h58M280 98h42" stroke={accentColor} strokeWidth="5" strokeLinecap="round" />
        <path {...TECHNICAL_LINE_PROPS} d="M328 90l-84 42M42 174h330" opacity="0.45" />
      </>
    );
  }

  return (
    <>
      <rect {...TECHNICAL_LINE_PROPS} x="92" y="88" width="190" height="58" rx="10" />
      <path {...TECHNICAL_LINE_PROPS} d="M136 88l22-32h78l24 32M86 148h204" />
      <circle {...TECHNICAL_LINE_PROPS} cx="130" cy="156" r="18" />
      <circle {...TECHNICAL_LINE_PROPS} cx="244" cy="156" r="18" />
      <path d="M58 190h304M70 66c54 14 104 19 152 12 42-6 75 0 112 20" stroke={accentColor} strokeWidth="4" fill="none" />
      <path {...TECHNICAL_LINE_PROPS} d="M56 118h26M296 118h56M180 48v132" opacity="0.45" />
    </>
  );
}
