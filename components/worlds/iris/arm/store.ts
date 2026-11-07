"use client";

import { useSyncExternalStore } from "react";
import { STILL_TIME, panelStateAt, type PanelState } from "./timeline";

/**
 * The one clock both halves read. The 3D arm samples it every frame; the detections panel subscribes to a
 * 10 Hz ticker that only notifies when what the panel shows changes. Neither half depends on the other
 * being mounted, and both always agree on where the loop is.
 */
let origin: number | null = null;

export function loopTime(): number {
  const now = typeof performance === "undefined" ? 0 : performance.now();
  origin ??= now;
  return (now - origin) / 1000;
}

const listeners = new Set<() => void>();
let snapshot: PanelState | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  const next = panelStateAt(loopTime());
  if (snapshot && next.key === snapshot.key && next.log === snapshot.log) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  timer ??= setInterval(tick, 100);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function getSnapshot(): PanelState {
  snapshot ??= panelStateAt(loopTime());
  return snapshot;
}

const STILL_STATE = panelStateAt(STILL_TIME);
const getStill = () => STILL_STATE;

/** Panel state for the current point of the loop; with `still`, the representative frame the arm holds. */
export function useLoopPanelState(still: boolean): PanelState {
  const live = useSyncExternalStore(still ? noopSubscribe : subscribe, still ? getStill : getSnapshot, getStill);
  return still ? STILL_STATE : live;
}

function noopSubscribe() {
  return () => {};
}
