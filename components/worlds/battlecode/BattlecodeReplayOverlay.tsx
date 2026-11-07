"use client";

import { useEffect, useRef, useState } from "react";
import { TEAM, boardRect, drawBoard, drawRound, indexMatch, type Indexed, type Match } from "./draw";

const SRC = "/battlecode/match.json";
const ROUNDS_PER_SECOND = 4;
const HOLD_END = 3; // seconds on the final round before the match starts again
const STILL_ROUND = 289; // 594 all: both teams out on the map, mid-match
const MAX_DPR = 2;

let cache: Promise<Match> | null = null;
const loadMatch = () => (cache ??= fetch(SRC).then((r) => (r.ok ? (r.json() as Promise<Match>) : Promise.reject(new Error(String(r.status))))));

/**
 * A real Battlecode 2026 match (Rows, OneTap as side A), decoded from the team's replay and drawn on a transparent
 * canvas over the world shader. `active` false stops drawing; `still` holds one representative round.
 */
export function BattlecodeReplayOverlay({ active, still }: { active: boolean; still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roundRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<[HTMLSpanElement | null, HTMLSpanElement | null]>([null, null]);
  const [match, setMatch] = useState<Match | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active || match) return;
    let live = true;
    loadMatch().then(
      (m) => live && setMatch(m),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [active, match]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !match || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ix: Indexed = indexMatch(match);
    const board = document.createElement("canvas");
    let cssW = 0, cssH = 0, dpr = 1;
    let rect = boardRect(1, 1);

    const resize = () => {
      cssW = canvas.clientWidth;
      cssH = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      board.width = canvas.width;
      board.height = canvas.height;
      rect = boardRect(cssW, cssH);
      const bctx = board.getContext("2d");
      if (bctx) {
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawBoard(bctx, match, rect);
      }
    };

    let shown = -1;
    const hud = (round: number) => {
      if (round === shown) return;
      shown = round;
      if (roundRef.current) roundRef.current.textContent = String(round);
      const s = match.frames[round].s;
      scoreRef.current.forEach((el, t) => {
        if (el) el.textContent = String(s[t]);
      });
    };

    const frame = (t: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(board, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRound(ctx, match, ix, rect, t);
      hud(Math.min(match.rounds - 1, Math.floor(t + 0.5)));
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (still) frame(STILL_ROUND);
    });
    observer.observe(canvas);

    if (still) {
      frame(STILL_ROUND);
      return () => observer.disconnect();
    }

    const last = match.rounds - 1;
    const loop = last / ROUNDS_PER_SECOND + HOLD_END;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const s = ((now - start) / 1000) % loop;
      frame(Math.min(last, s * ROUNDS_PER_SECOND));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [match, active, still]);

  if (failed) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!match}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      {match && (
        <figure className="absolute left-3 right-3 top-3 rounded-lg bg-[#0c0f0b]/80 px-3 py-2 text-[#f2efe8] backdrop-blur-sm sm:left-auto sm:right-6 sm:top-[88px] sm:max-w-[19rem] sm:px-3.5 sm:py-2.5">
          <p className="flex items-baseline justify-between gap-4 font-mono text-[11px] tabular-nums text-[#f2efe8]/70">
            <span>
              Round <span ref={roundRef} className="text-[#f2efe8]">0</span> / {match.rounds - 1}
            </span>
            <span>{match.source.map}</span>
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] tabular-nums">
            <span className="size-2 rounded-full" style={{ background: TEAM[0] }} aria-hidden="true" />
            <span className="font-semibold">{match.teams[0]}</span>
            <span ref={(el) => void (scoreRef.current[0] = el)}>0</span>
            <span className="text-[#f2efe8]/40">to</span>
            <span ref={(el) => void (scoreRef.current[1] = el)}>0</span>
            <span className="text-[#f2efe8]/70">{match.teams[1]}</span>
            <span className="size-2 rounded-full" style={{ background: TEAM[1] }} aria-hidden="true" />
          </p>
          <figcaption className="mt-1.5 hidden text-[11.5px] leading-snug text-[#f2efe8]/75 sm:block">
            Replay of a real match, rendered for this page. Gems tributed, first to 1,000 wins.
          </figcaption>
        </figure>
      )}
    </div>
  );
}
