"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

// Drives the ST Engineering world shader (components/worlds/shaders/st.ts). Renders nothing: each of
// the three projects plays its story on a loop, and the content cards pick which one.
// uParams.x = project (0 downward view, 1 calibration and surround view, 2 multi-camera stitching),
//             animated between integers so the shader dissolves between neighbouring projects.
// uParams.y = that project's story, 0..1, looped: ramp on, hold, ramp off, pause, repeat.
//             0: stitch the road under the car. 1: 0..0.6 calibration, 0.6..1 surround view settles.
//             2: warp, seam and blend the three cameras into one panorama.
//             With reduced motion it holds at 1, the finished state.

export type STModeId = 0 | 1 | 2;

let currentMode: STModeId = 0;
const listeners = new Set<(mode: STModeId) => void>();

/** Shared project for the ST world, so the content cards and the shader driver stay in step. */
export const stMode = {
  get(): STModeId {
    return currentMode;
  },
  set(mode: STModeId) {
    if (mode === currentMode) return;
    currentMode = mode;
    listeners.forEach((fn) => fn(mode));
  },
  subscribe(fn: (mode: STModeId) => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Time for a change of project, in ms. */
const MODE_MS = 600;

/** Story loop per project, in ms. Calibration and surround view has two acts, so it runs longer. */
const LOOPS: Record<STModeId, { delay: number; on: number; hold: number; off: number; pause: number }> = {
  0: { delay: 700, on: 2000, hold: 3500, off: 1200, pause: 1300 },
  1: { delay: 700, on: 4000, hold: 3500, off: 1200, pause: 1300 },
  2: { delay: 700, on: 2500, hold: 3500, off: 1200, pause: 1300 },
};

/** One full pass of a project's story, in ms. */
export const loopMs = (mode: STModeId) => {
  const { delay, on, hold, off, pause } = LOOPS[mode];
  return MODE_MS + delay + on + hold + off + pause;
};

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - ((-2 * k + 2) * (-2 * k + 2)) / 2);

/** Story value at `ms` into a project's loop: wait, ramp on, hold, ramp off, pause, repeat. */
function storyAt(mode: STModeId, ms: number): number {
  const { delay, on, hold, off, pause } = LOOPS[mode];
  if (ms < delay) return 0;
  const t = (ms - delay) % (on + hold + off + pause);
  if (t < on) return ease(t / on);
  if (t < on + hold) return 1;
  if (t < on + hold + off) return 1 - ease((t - on - hold) / off);
  return 0;
}

export function STControls({
  setParams,
  still,
}: {
  setParams: (values: Partial<Record<0 | 1 | 2 | 3, number>>) => void;
  still: boolean;
}) {
  const mode = useSyncExternalStore(stMode.subscribe, stMode.get, () => 0 as STModeId);
  const setRef = useRef(setParams);
  const value = useRef({ x: stMode.get() as number, y: still ? 1 : 0 });

  useEffect(() => {
    setRef.current = setParams;
  }, [setParams]);

  useEffect(() => {
    if (still) {
      value.current = { x: mode, y: 1 };
      setRef.current({ 0: mode, 1: 1 });
      return;
    }
    // Restart the loop on every change of project: x eases to the new project while the story
    // value fades out, then the new project's story starts from the beginning.
    const fromX = value.current.x;
    const fromY = value.current.y;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const ms = now - start;
      const k = Math.min(1, ms / MODE_MS);
      const x = fromX + (mode - fromX) * ease(k);
      const y = ms < MODE_MS ? fromY * (1 - ease(k)) : storyAt(mode, ms - MODE_MS);
      value.current = { x, y };
      setRef.current({ 0: x, 1: y });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, still]);

  return null;
}
