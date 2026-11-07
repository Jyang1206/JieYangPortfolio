"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { World } from "../../data/worlds";
import { briefs } from "../../data/briefs";
import { nextProject, projects } from "../../data/projects";
import { WORLD_EXTRAS, type ParamValues } from "./panels";
import { categoryLabel, categoryOf, shortName } from "./categories";
import { ProjectLinks } from "./notebook/ProjectLinks";
import { IrisDetectionsPanel } from "./iris/arm";
import { WorldRenderer } from "./WorldRenderer";

const STILL_TIME = 14;
const MAX_PIXELS = 3_800_000;

type WorldStageProps = {
  worlds: World[];
  index: number;
};

/**
 * A project page: the live world on a full-screen stage (its shader, the overlay the world registers,
 * the invisible driver some worlds steer the shader with) with the short brief around it: what it is,
 * what I did, the stack and the skills.
 */
export function WorldStage({ worlds, index }: WorldStageProps) {
  const world = worlds[index];
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [still, setStill] = useState(false);
  // IRIS: the 3D arm cell brings its own tray, so the shader draws only the drape behind it.
  const paramsRef = useRef<number[]>([world.id === "iris" ? 1 : 0, 0, 0, 0]);
  const [setParams] = useState(() => (values: ParamValues) => {
    for (const [k, v] of Object.entries(values)) paramsRef.current[Number(k)] = v;
  });
  const extras = WORLD_EXTRAS[world.id];
  const Overlay = extras?.Overlay;
  const Driver = extras?.Controls;
  const Panel = extras?.Panel;
  const Extra = extras?.Extra;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let renderer = WorldRenderer.create(canvas);
    if (!renderer) setWebgl(false);
    renderer?.prefetch([index]);
    const onLost = (event: Event) => {
      event.preventDefault();
      renderer = null;
    };
    const onRestored = () => {
      renderer = WorldRenderer.create(canvas);
      renderer?.resize(canvas.width, canvas.height);
      setWebgl(Boolean(renderer));
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(stage);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / Math.max(w * h, 1)));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      renderer?.resize(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = performance.now();
    let frame = 0;
    const all: number[][] = [];
    all[index] = paramsRef.current;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const time = motion.matches ? STILL_TIME : (now - clock) / 1000;
      if (renderer) renderer.render({ kind: "steady", world: index }, time, all);
      else canvas.parentElement!.style.background = world.fallback;
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
    };
  }, [index, world.fallback]);

  const category = categoryOf(world.id);
  const brief = briefs[world.id];
  const project = projects.find((p) => p.worldId === world.id);
  const next = project ? nextProject(project.slug) : undefined;

  return (
    <main className="nb-project" data-world={world.id}>
      <section ref={stageRef} className="nb-stage" aria-labelledby="project-name">
        <div className="nb-stage-view">
          <canvas ref={canvasRef} className="nb-stage-canvas" aria-hidden="true" hidden={!webgl} />
          {webgl && Overlay && (
            <div className="nb-stage-overlay" aria-hidden="true">
              <Overlay active still={still} />
            </div>
          )}
          {Driver && (
            <div hidden>
              <Driver setParams={setParams} still={still} />
            </div>
          )}
          {world.id === "iris" && <IrisDetectionsPanel still={still} className="nb-stage-panel" />}
          {world.id === "iris" && webgl && <p className="nb-stage-hint">Drag to look around the cell</p>}
          {Panel && (
            <div className="nb-stage-controls">
              <Panel setParams={setParams} still={still} />
            </div>
          )}
        </div>
        {Extra && (
          <div className="nb-stage-extra">
            <Extra />
          </div>
        )}

        <div className="nb-brief">
          <Link href="/#explore" className="nb-brief-back">
            <ArrowLeft size={14} aria-hidden="true" />
            All work
          </Link>
          <article className="nb-brief-card">
            <span className="nb-chip" data-category={category}>
              {categoryLabel(world.id)}
            </span>
            <h1 id="project-name" className="nb-brief-name">
              {shortName(world.name)}
              {brief?.badge && <span className="nb-brief-badge">({brief.badge})</span>}
            </h1>
            {project && (
              <p className="nb-brief-meta">
                {project.role} · {project.dates}
              </p>
            )}
            {brief && (
              <>
                <p className="nb-brief-what">{brief.what}</p>
                <h2 className="nb-brief-h">What I did</h2>
                <ul className="nb-brief-did">
                  {brief.did.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </>
            )}
            <ProjectLinks worldId={world.id} />
          </article>
        </div>

        {brief && (
          <div className="nb-brief-strip">
            <div>
              <h2 className="nb-brief-h">Stack</h2>
              <ul className="nb-brief-tags">
                {brief.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="nb-brief-h">Skills</h2>
              <ul className="nb-brief-tags is-skills">
                {brief.skills.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {next && (
              <Link href={`/projects/${next.slug}`} className="nb-brief-next">
                <span className="nb-brief-h">Next</span>
                <span className="name">
                  {next.title}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
