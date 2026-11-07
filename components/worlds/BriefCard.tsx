"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Brief } from "../../data/briefs";

type BriefCardProps = {
  brief: Brief;
  /** Chip, name and role line: stays put while the sections change below it. */
  header: ReactNode;
  /** Repository and site links, shown under every section. */
  links: ReactNode;
};

/** Wheel distance that turns one section, and the pause before the next turn. */
const WHEEL_STEP = 40;
const WHEEL_REST_MS = 650;

/**
 * The project card: an overview first, then the brief's extra sections one at a time in the same box.
 * Tabs, the arrows, arrow keys or scrolling over the card change the section; the world behind never changes.
 */
export function BriefCard({ brief, header, links }: BriefCardProps) {
  const sections = [{ title: "Overview" }, ...(brief.more ?? [])];
  const [index, setIndex] = useState(0);
  const count = sections.length;
  const bodyRef = useRef<HTMLDivElement>(null);
  const wheel = useRef({ sum: 0, until: 0 });
  const indexRef = useRef(0);

  // Scrolling over the card turns the sections; at the first or last one the page scrolls as usual.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || count < 2) return;
    const onWheel = (event: WheelEvent) => {
      const dir = Math.sign(event.deltaY);
      if (!dir || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      // Decide synchronously: preventDefault only works inside the event, not in a state updater.
      const i = indexRef.current;
      const next = i + dir;
      if (next < 0 || next >= count) return;
      event.preventDefault();
      const now = performance.now();
      if (now < wheel.current.until) return;
      wheel.current.sum += Math.abs(event.deltaY);
      if (wheel.current.sum < WHEEL_STEP) return;
      wheel.current = { sum: 0, until: now + WHEEL_REST_MS };
      indexRef.current = next;
      setIndex(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [count]);

  const go = (i: number) => {
    const next = Math.max(0, Math.min(count - 1, i));
    indexRef.current = next;
    setIndex(next);
  };
  const section = sections[index];

  return (
    <article
      className="nb-brief-card"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
    >
      {header}

      {count > 1 && (
        <div className="nb-brief-tabs" role="tablist" aria-label="Sections">
          {sections.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div ref={bodyRef} className="nb-brief-body" role="tabpanel" aria-label={section.title}>
        <div key={index} className="nb-brief-page">
          {index === 0 ? (
            <>
              <p className="nb-brief-what">{brief.what}</p>
              <h2 className="nb-brief-h">What I did</h2>
              <ul className="nb-brief-did">
                {brief.did.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              {"text" in section && section.text && <p className="nb-brief-what">{section.text}</p>}
              {"points" in section && section.points && (
                <ul className="nb-brief-did">
                  {section.points.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      <div className="nb-brief-foot">
        {links}
        {count > 1 && (
          <div className="nb-brief-arrows">
            <button type="button" aria-label="Previous section" disabled={index === 0} onClick={() => go(index - 1)}>
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="count">
              {index + 1} / {count}
            </span>
            <button type="button" aria-label="Next section" disabled={index === count - 1} onClick={() => go(index + 1)}>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
