import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/projects";
import { getMjswanSceneMode, getMjswanSceneUrl } from "../../data/mjswanScenes";

export function MjswanProjectEmbed({ project }: { project: Project }) {
  const mode = getMjswanSceneMode(project.sceneType);

  if (!mode) {
    return null;
  }

  const iframeSrc = getMjswanSceneUrl(mode.sceneName);

  return (
    <section className="px-5 pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col gap-3 border-y border-slate-200 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Browser Simulation
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
              {mode.sceneName}
            </h2>
          </div>
          <div className="max-w-2xl text-sm leading-6 text-slate-600">
            <p>{mode.summary}</p>
            <a
              href={iframeSrc}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-medium text-sky-700 transition hover:text-slate-950"
            >
              Open full simulation
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#05070a] shadow-xl shadow-slate-200/80">
          <iframe
            src={iframeSrc}
            title={`${project.title} MuJoCo browser simulation`}
            className="h-[70vh] min-h-[560px] w-full border-0"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-downloads"
          />
        </div>
      </div>
    </section>
  );
}
