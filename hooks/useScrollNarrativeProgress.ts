"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollNarrativeProgress(stepCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;

        const element = containerRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const viewport = window.innerHeight;
        const scrollable = Math.max(1, element.offsetHeight - viewport);
        const nextProgress = Math.min(1, Math.max(0, -rect.top / scrollable));
        const maxIndex = Math.max(0, stepCount - 1);
        const nextIndex = Math.min(maxIndex, Math.max(0, Math.round(nextProgress * maxIndex)));

        setProgress((current) => (current === nextProgress ? current : nextProgress));
        setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [stepCount]);

  return { containerRef, progress, activeIndex };
}
