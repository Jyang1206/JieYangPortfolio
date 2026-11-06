"use client";

import { INSTRUMENT_SCALE, SHAPES, shapeBounds, type Primitive, type Tone } from "./shapes";
import { useLoopPanelState } from "./store";
import { BY_ID, PICK_ORDER, STEPS, TRAY, type Instrument, type InstrumentKind } from "./timeline";

const INK = "#111111";
const INDIGO = "#2b2fd4";
const BOARD = "#e9e9e6";

// The wrist camera at the survey pose looks straight down: image up is away from the arm (+x), image right is
// the arm's right (-y). One SVG unit is one millimetre, centred on the tray.
const VIEW_W = TRAY.depth * 1000;
const VIEW_H = TRAY.width * 1000;

const round = (v: number) => Math.round(v * 1000) / 1000;

function toImage(x: number, y: number): [number, number] {
  return [-(y - TRAY.y) * 1000, -(x - TRAY.x) * 1000];
}

/** SVG transform taking an instrument's own millimetre frame onto the image. */
function placement(instrument: Instrument): string {
  const [ix, iy] = toImage(instrument.x, instrument.y);
  // Rounded so the server and client render identical strings.
  const c = round(Math.cos(instrument.yaw) * INSTRUMENT_SCALE);
  const s = round(Math.sin(instrument.yaw) * INSTRUMENT_SCALE);
  // Robot x' = (c, s) maps to image (-s, -c); robot y' = (-s, c) maps to image (-c, s).
  return `matrix(${-s} ${-c} ${-c} ${s} ${round(ix)} ${round(iy)})`;
}

const FILL: Record<Tone, string> = { steel: "#d9dde1", dark: "#9aa0a6", gold: "#d2b264" };

function Silhouette({ primitives }: { primitives: Primitive[] }) {
  return (
    <>
      {primitives.map((p, i) => {
        const fill = FILL[p.tone ?? "steel"];
        if (p.shape === "bar") {
          const dx = p.b[0] - p.a[0];
          const dy = p.b[1] - p.a[1];
          const length = Math.hypot(dx, dy);
          const nx = -dy / length;
          const ny = dx / length;
          const w0 = p.w0 / 2;
          const w1 = (p.w1 ?? p.w0) / 2;
          const points = [
            [p.a[0] + nx * w0, p.a[1] + ny * w0],
            [p.b[0] + nx * w1, p.b[1] + ny * w1],
            [p.b[0] - nx * w1, p.b[1] - ny * w1],
            [p.a[0] - nx * w0, p.a[1] - ny * w0],
          ];
          return <polygon key={i} points={points.map((pt) => pt.map(round).join(",")).join(" ")} fill={fill} stroke="#3c4146" strokeWidth={0.5} />;
        }
        if (p.shape === "ring") {
          return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.r} fill="none" stroke={fill} strokeWidth={p.tube * 2} />;
        }
        return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.r} fill={fill} stroke="#3c4146" strokeWidth={0.5} />;
      })}
    </>
  );
}

// Instruments that rest on another are drawn last, so the drawing matches what the camera sees.
const DRAW_ORDER = [...PICK_ORDER].sort((a, b) => BY_ID[a].lift - BY_ID[b].lift);

const LABEL_H = 21;
const PAD = 4;

const labelWidth = (id: InstrumentKind) => BY_ID[id].label.length * 7.6 + LABEL_H + 10;

/** The detection box of an instrument in image coordinates (axis-aligned around its rotated outline). */
function imageBox(id: InstrumentKind) {
  const instrument = BY_ID[id];
  const b = shapeBounds(id);
  const [cx, cy] = toImage(instrument.x, instrument.y);
  const c = Math.cos(instrument.yaw) * INSTRUMENT_SCALE;
  const s = Math.sin(instrument.yaw) * INSTRUMENT_SCALE;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of [[b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY]]) {
    xs.push(cx - s * x - c * y);
    ys.push(cy - c * x + s * y);
  }
  return { cx, cy, left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
}

type Rect = { x: number; y: number; w: number; h: number };
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w + 3 && b.x < a.x + a.w + 3 && a.y < b.y + b.h + 3 && b.y < a.y + a.h + 3;

/** Places labels next to their detections inside the frame, greedily avoiding labels already placed. */
function placeLabels(ids: InstrumentKind[]): Map<InstrumentKind, Rect> {
  const placed = new Map<InstrumentKind, Rect>();
  const inset = 6;
  const clamp = (r: Rect): Rect => ({
    ...r,
    x: Math.min(Math.max(r.x, -VIEW_W / 2 + inset), VIEW_W / 2 - inset - r.w),
    y: Math.min(Math.max(r.y, -VIEW_H / 2 + inset), VIEW_H / 2 - inset - 20 - r.h),
  });
  for (const id of ids) {
    const box = imageBox(id);
    const w = labelWidth(id);
    const h = LABEL_H;
    const candidates: Rect[] = [
      { x: box.cx - w / 2, y: box.top - h - 4, w, h },
      { x: box.cx - w / 2, y: box.bottom + 4, w, h },
      { x: box.right + 4, y: box.cy - h / 2, w, h },
      { x: box.left - w - 4, y: box.cy - h / 2, w, h },
      { x: box.cx - w / 2, y: box.cy - h / 2, w, h },
    ].map(clamp);
    const free = candidates.find((r) => [...placed.values()].every((o) => !overlaps(r, o)));
    placed.set(id, free ?? candidates[0]);
  }
  return placed;
}

function Detection({ id, order, label, showOrder, target }: { id: InstrumentKind; order: number; label: Rect | null; showOrder: boolean; target: boolean }) {
  const instrument = BY_ID[id];
  const box = shapeBounds(id);
  const [cx, cy] = toImage(instrument.x, instrument.y);
  return (
    <g>
      <g transform={placement(instrument)}>
        <rect
          x={box.minX - PAD}
          y={box.minY - PAD}
          width={box.maxX - box.minX + PAD * 2}
          height={box.maxY - box.minY + PAD * 2}
          fill={target ? "rgba(43,47,212,0.25)" : "none"}
          stroke={target ? "#ffffff" : "#c9cbff"}
          strokeWidth={(target ? 3 : 1.6) / INSTRUMENT_SCALE}
          strokeDasharray={target ? undefined : "5 3"}
        />
      </g>
      {label && (
        <g transform={`translate(${round(label.x)} ${round(label.y)})`}>
          <line x1={label.w / 2} y1={LABEL_H / 2} x2={round(cx - label.x)} y2={round(cy - label.y)} stroke="#ffffff" strokeWidth={1} opacity={0.6} />
          <rect x={0} y={0} width={label.w} height={LABEL_H} fill={target ? INDIGO : BOARD} />
          <rect x={0} y={0} width={LABEL_H} height={LABEL_H} fill={target ? "#ffffff" : INK} />
          <text x={LABEL_H / 2} y={15.5} textAnchor="middle" fontSize={15} fontWeight={800} fill={target ? INDIGO : "#ffffff"}>
            {showOrder ? order : "?"}
          </text>
          <text x={LABEL_H + 5} y={15.2} fontSize={14.5} fontWeight={600} fill={target ? "#ffffff" : INK}>
            {instrument.label}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * The wrist camera's survey frame for the simulated loop the arm overlay runs: detections on the tray, identities,
 * topmost-first pick order, the current pipeline step and a log line. Same clock as the arm, so they stay in step.
 */
export function IrisDetectionsPanel({ still = false, className = "" }: { still?: boolean; className?: string }) {
  const state = useLoopPanelState(still);
  const visible = new Set(state.onTray.map((d) => d.id));
  const orderOf = new Map(state.onTray.map((d) => [d.id, d.order]));
  const pickNumber = Math.min(state.pick + 1, PICK_ORDER.length);
  const shown = DRAW_ORDER.filter((id) => visible.has(id));
  // Labels are placed in pick order, so the next pick gets the best spot.
  const labels = state.showLabels ? placeLabels(PICK_ORDER.filter((id) => visible.has(id))) : new Map<InstrumentKind, Rect>();

  return (
    <figure
      className={`w-[320px] max-w-full bg-[#e9e9e6] text-[#111] shadow-[0_24px_60px_-22px_rgba(0,0,0,0.6)] ${className}`}
      style={{ borderTop: `3px solid ${INK}` }}
      aria-label="Simulated IRIS wrist-camera detections, in step with the animated arm"
    >
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
        <p className="text-[10.5px] font-extrabold uppercase italic tracking-[0.02em]" style={{ color: INDIGO }}>
          Simulation of the pipeline
        </p>
        <p className="text-[10.5px] font-semibold uppercase tabular-nums text-[#444]">
          {state.step === -1 ? `${state.sorted}/${PICK_ORDER.length} sorted` : `Pick ${pickNumber}/${PICK_ORDER.length}`}
        </p>
      </div>
      <h3 className="px-4 font-[family-name:var(--font-iris)] text-[30px] uppercase leading-[1.05]">Wrist camera</h3>

      <div className="relative mx-4 mt-2 bg-[#0d2f2a]">
        <svg viewBox={`${-VIEW_W / 2} ${-VIEW_H / 2} ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full" role="img" aria-label={trayDescription(state.onTray.map((d) => d.id))}>
          <defs>
            <linearGradient id="iris-drape" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1f5f55" />
              <stop offset="1" stopColor="#164a42" />
            </linearGradient>
          </defs>
          <rect x={-VIEW_W / 2} y={-VIEW_H / 2} width={VIEW_W} height={VIEW_H} fill="url(#iris-drape)" />
          {/* Drape folds, as on the real tray. */}
          {[-70, 10, 85].map((y) => (
            <line key={y} x1={-VIEW_W / 2} y1={y} x2={VIEW_W / 2} y2={y + 6} stroke="#0f3d36" strokeWidth={5} opacity={0.5} />
          ))}
          {shown.map((id) => (
            <g key={id} transform={placement(BY_ID[id])}>
              <Silhouette primitives={SHAPES[id]} />
            </g>
          ))}
          {state.showOutlines &&
            shown.map((id) => (
              <Detection
                key={id}
                id={id}
                order={orderOf.get(id) ?? 0}
                label={labels.get(id) ?? null}
                showOrder={state.showOrder}
                target={state.step >= 4 && state.target === id}
              />
            ))}
          {/* Viewfinder corners and frame caption. */}
          <g stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.8}>
            <path d={`M ${-VIEW_W / 2 + 8} ${-VIEW_H / 2 + 26} v -18 h 18`} />
            <path d={`M ${VIEW_W / 2 - 26} ${-VIEW_H / 2 + 8} h 18 v 18`} />
            <path d={`M ${-VIEW_W / 2 + 8} ${VIEW_H / 2 - 26} v 18 h 18`} />
            <path d={`M ${VIEW_W / 2 - 26} ${VIEW_H / 2 - 8} h 18 v -18`} />
          </g>
          <text x={-VIEW_W / 2 + 14} y={VIEW_H / 2 - 14} fontSize={11} fill="#ffffff" opacity={0.85} fontFamily="var(--font-geist-mono), ui-monospace, monospace">
            {state.kind === "survey" ? "● capturing survey frame" : state.step === -1 ? "tray reset" : "survey frame · RGB-D"}
          </text>
        </svg>
      </div>

      <ol className="mx-4 mt-3 grid grid-cols-3 gap-px bg-[#c9c9c4] text-[10.5px] font-semibold uppercase leading-tight">
        {STEPS.map((step, i) => {
          const current = state.step === i;
          const done = state.step > i || state.step === -1;
          return (
            <li
              key={step}
              aria-current={current ? "step" : undefined}
              className="flex min-h-[34px] items-center gap-1.5 px-2 py-1.5"
              style={{ background: current ? INDIGO : BOARD, color: current ? "#ffffff" : done ? INK : "#8a8a85" }}
            >
              <span className="tabular-nums opacity-70">{i + 1}</span>
              <span>{step}</span>
            </li>
          );
        })}
      </ol>

      <p className="mx-4 mb-4 mt-3 min-h-[2.6em] border-l-2 pl-2 font-mono text-[11px] leading-[1.3] text-[#222]" style={{ borderColor: INDIGO }}>
        {state.log}
      </p>
    </figure>
  );
}

function trayDescription(ids: InstrumentKind[]): string {
  if (ids.length === 0) return "Simulated wrist-camera view: the tray is empty.";
  return `Simulated wrist-camera view of the tray with ${ids.map((id) => BY_ID[id].label).join(", ")}.`;
}
