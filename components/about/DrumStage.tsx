"use client";

import { useEffect, useRef, type RefObject } from "react";
import { drawFrame, type Hole, type StageScene } from "./drumScene";

type DrumStageProps = {
  scene: StageScene;
  /* Reduced motion or paused: draw one still frame and stop. */
  still: boolean;
  /* The photo frame; the scene arranges itself around this element's rectangle. */
  holeRef: RefObject<HTMLElement | null>;
  className?: string;
};

/* The canvas inside the arch. It animates only while not still, on screen and in a visible tab;
   otherwise it holds a single drawn frame. */
export function DrumStage({ scene, still, holeRef, className }: DrumStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* A scene fades in when newly chosen, not when the animation resumes. */
  const lastScene = useRef<StageScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fadeIn = lastScene.current !== null && lastScene.current !== scene;
    lastScene.current = scene;
    const startedAt = performance.now();
    let w = 0;
    let h = 0;
    let hole: Hole = { x: 0, y: 0, w: 0, h: 0 };
    let raf = 0;
    let onScreen = false;

    const render = (now: number) => {
      if (w === 0 || h === 0) return;
      const t = (now - startedAt) / 1000;
      drawFrame(ctx, { w, h, hole, t, sinceScene: fadeIn ? t : Infinity, scene, still });
    };
    const tick = (now: number) => {
      render(now);
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      const run = !still && onScreen && document.visibilityState === "visible";
      if (run && !raf) raf = requestAnimationFrame(tick);
      if (!run && raf) stop();
    };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const box = holeRef.current?.getBoundingClientRect();
      hole = box
        ? { x: box.left - rect.left, y: box.top - rect.top, w: box.width, h: box.height }
        : { x: w * 0.15, y: h * 0.2, w: w * 0.7, h: h * 0.8 };
      render(performance.now());
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    if (holeRef.current) ro.observe(holeRef.current);
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [scene, still, holeRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
