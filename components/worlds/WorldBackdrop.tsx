"use client";

import { useEffect, useRef, useState } from "react";
import { WorldRenderer } from "./WorldRenderer";

const STILL_TIME = 14;
const MAX_PIXELS = 3_000_000;

type WorldBackdropProps = {
  /** Shader index of the world, matching data/worlds.ts order. */
  world: number;
  /** CSS background used when WebGL2 is unavailable. */
  fallback: string;
  className?: string;
};

/** One world, held steady and animated, for use behind a story page. */
export function WorldBackdrop({ world, fallback, className = "" }: WorldBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer = WorldRenderer.create(canvas);
    if (!renderer) setWebgl(false);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);

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

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible || !renderer) return;
      renderer.render({ kind: "steady", world }, motion.matches ? STILL_TIME : (now - start) / 1000);
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
  }, [world]);

  return (
    <div className={`absolute inset-0 ${className}`} style={webgl ? undefined : { background: fallback }} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" hidden={!webgl} />
    </div>
  );
}
