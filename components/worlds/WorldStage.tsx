"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { World } from "../../data/worlds";
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
 * The live world at the top of a project page: its shader on a full-screen stage, the overlay the world
 * registers (IRIS arm, Battlecode replay) and the invisible driver some worlds steer the shader with.
 * The story's write-up follows below it.
 */
export function WorldStage({ worlds, index }: WorldStageProps) {
  const world = worlds[index];
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);
  const [still, setStill] = useState(false);
  const paramsRef = useRef<number[]>([0, 0, 0, 0]);
  const [setParams] = useState(() => (values: ParamValues) => {
    for (const [k, v] of Object.entries(values)) paramsRef.current[Number(k)] = v;
  });
  const extras = WORLD_EXTRAS[world.id];
  const Overlay = extras?.Overlay;
  const Driver = extras?.Controls;

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

  return (
    <section ref={stageRef} className="nb-stage" data-world={world.id} aria-label={`${world.name}: the world, rendered live`}>
      <canvas ref={canvasRef} className="nb-stage-canvas" aria-hidden="true" hidden={!webgl} />
      {webgl && Overlay && (
        <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
          <Overlay active still={still} />
        </div>
      )}
      {Driver && (
        <div hidden>
          <Driver setParams={setParams} still={still} />
        </div>
      )}
      {world.id === "iris" && <IrisDetectionsPanel still={still} className="nb-stage-panel" />}
      <div className="nb-stage-lead">
        <div className="nb-card">
          <span className="nb-chip" data-category={category}>
            {categoryLabel(world.id)}
          </span>
          <span className="name">{shortName(world.name)}</span>
          <p className="nb-meta">{world.place}</p>
          <ProjectLinks worldId={world.id} />
          <a href="#story" className="nb-pill nb-stage-down">
            <span className="dot" aria-hidden="true" />
            Read the story
            <ArrowDown size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
