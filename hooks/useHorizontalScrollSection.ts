"use client";

import { useEffect, useRef, useState } from "react";

export function useHorizontalScrollSection(itemCount: number) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;

        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const sectionTop = section.offsetTop;
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / travel));
        const maxTranslate = Math.max(0, itemCount - 1) * window.innerWidth;
        const translate = -progress * maxTranslate;
        const nextIndex = Math.min(
          itemCount - 1,
          Math.max(0, Math.round(progress * Math.max(0, itemCount - 1))),
        );

        track.style.transform = `translate3d(${translate}px, 0, 0)`;
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
  }, [itemCount]);

  return { sectionRef, trackRef, activeIndex };
}
