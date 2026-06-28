"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, ArrowUpRight } from "lucide-react";
import { getMjswanSceneUrl, mjswanSceneModes } from "../../data/mjswanScenes";

export function MjswanSimEmbed() {
  const [activeId, setActiveId] = useState(mjswanSceneModes[0].id);
  const [loadedScene, setLoadedScene] = useState<string | null>(null);
  const activeMode = mjswanSceneModes.find((mode) => mode.id === activeId) ?? mjswanSceneModes[0];
  const iframeSrc = useMemo(() => getMjswanSceneUrl(activeMode.sceneName), [activeMode.sceneName]);
  const isLoading = loadedScene !== iframeSrc;

  return (
    <section id="browser-sim" className="bg-[#08090b] px-4 py-16 text-white sm:px-6 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,0.48fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
              Browser-Native Simulation
            </p>
            <h2 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-normal text-white md:text-6xl">
              A MuJoCo-style demo belongs inside the portfolio, not behind a local ROS stack.
            </h2>
          </div>
          <div className="text-sm leading-6 text-slate-300">
            <p>
              This section embeds mjswan as a static MuJoCo WASM app. Pick a project mode
              to load the matching MJCF scene inside the same browser-native viewer.
            </p>
            <a
              href={iframeSrc}
              className="mt-4 inline-flex items-center gap-1 rounded-full border border-white/18 px-4 py-2 text-white transition hover:border-sky-300 hover:text-sky-200"
              target="_blank"
              rel="noreferrer"
            >
              Open full demo
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 border-y border-white/12 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {mjswanSceneModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setActiveId(mode.id);
                  setLoadedScene(null);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                  mode.id === activeMode.id
                    ? "border-sky-300 bg-sky-300 text-slate-950"
                    : "border-white/18 bg-white/[0.04] text-slate-200 hover:border-sky-300 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <div className="max-w-2xl text-sm leading-6 text-slate-300">
            <p className="font-medium text-white">{activeMode.sceneName}</p>
            <p className="mt-1">{activeMode.summary}</p>
            <Link
              href={`/projects/${activeMode.projectSlug}`}
              className="mt-2 inline-flex items-center gap-1 text-sky-200 transition hover:text-white"
            >
              Open project story
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#05070a] shadow-2xl shadow-black/40">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#05070a]/86 backdrop-blur-sm">
              <div className="flex items-center gap-3 border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">
                <Activity size={16} className="text-sky-200" aria-hidden="true" />
                Loading MuJoCo WASM scene
              </div>
            </div>
          )}
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={`${activeMode.sceneName} browser simulation`}
            className="h-[78vh] min-h-[620px] w-full border-0"
            loading="lazy"
            onLoad={() => setLoadedScene(iframeSrc)}
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-downloads"
          />
        </div>
      </div>
    </section>
  );
}
