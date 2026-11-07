"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { loopMs, stMode, type STModeId } from "./STControls";

const PROJECTS: { id: STModeId; label: string }[] = [
  { id: 0, label: "Downward view" },
  { id: 1, label: "Calibration + surround view" },
  { id: 2, label: "Multi-camera stitching" },
];

/** Pick one of the three ST projects. Until the visitor picks, it moves on after each project's story. */
export function STPanel({ still }: { still: boolean }) {
  const mode = useSyncExternalStore(stMode.subscribe, stMode.get, () => 0 as STModeId);
  const picked = useRef(false);

  useEffect(() => {
    if (still || picked.current) return;
    const id = window.setTimeout(() => {
      if (!picked.current) stMode.set(((mode + 1) % 3) as STModeId);
    }, loopMs(mode));
    return () => window.clearTimeout(id);
  }, [mode, still]);

  return (
    <div className="nb-world-tabs" role="group" aria-label="ST Engineering projects">
      {PROJECTS.map((project) => (
        <button
          key={project.id}
          type="button"
          aria-pressed={mode === project.id}
          onClick={() => {
            picked.current = true;
            stMode.set(project.id);
          }}
        >
          <span className="num">{project.id + 1}</span>
          {project.label}
        </button>
      ))}
    </div>
  );
}
