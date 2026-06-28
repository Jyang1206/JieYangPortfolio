"use client";

import type { AboutPanel } from "../../data/about";
import { useHorizontalScrollSection } from "../../hooks/useHorizontalScrollSection";

type AboutScrollerProps = {
  panels: AboutPanel[];
};

export function AboutScroller({ panels }: AboutScrollerProps) {
  const { sectionRef, trackRef, activeIndex } = useHorizontalScrollSection(panels.length);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative bg-slate-50"
      style={{ minHeight: `${panels.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 fine-grid opacity-70" aria-hidden="true" />
        <div className="absolute left-6 top-6 z-20 flex gap-2">
          {panels.map((panel, index) => (
            <span
              key={panel.id}
              className={`h-1.5 w-10 rounded-full transition ${
                index <= activeIndex ? "bg-slate-950" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
        <div ref={trackRef} className="flex h-full will-change-transform">
          {panels.map((panel, index) => (
            <article key={panel.id} className="relative h-screen w-screen shrink-0 px-6 py-20">
              <div className="mx-auto grid h-full max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {panel.eyebrow}
                  </p>
                  <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-slate-950 md:text-7xl">
                    {panel.title}
                  </h2>
                </div>
                <div className="relative border border-slate-200 bg-white/88 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
                  <div className="absolute right-6 top-6 text-8xl font-semibold leading-none text-slate-100">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="relative max-w-2xl text-lg leading-8 text-slate-700">{panel.body}</p>
                  <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
                    {panel.points.map((point) => (
                      <div key={point} className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
