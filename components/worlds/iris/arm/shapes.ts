import type { InstrumentKind } from "./timeline";

/**
 * Instrument outlines in millimetres, drawn once and used twice: extruded into steel in the 3D scene and
 * traced as silhouettes in the wrist-camera panel. Local frame: long axis along +x, centred at the origin,
 * lying flat with the underside at z = 0.
 */
/** Drawn a little larger than life so the steel reads at portfolio scale next to an 850 mm arm. */
export const INSTRUMENT_SCALE = 1.25;

export type Tone = "steel" | "dark" | "gold";

export type Primitive =
  /** A flat tapered strip from `a` to `b`, `w0` wide at `a` and `w1` at `b`, `t` thick. */
  | { shape: "bar"; a: [number, number]; b: [number, number]; w0: number; w1?: number; t: number; tone?: Tone }
  /** A finger ring lying flat. */
  | { shape: "ring"; c: [number, number]; r: number; tube: number; tone?: Tone }
  /** A round boss, such as a scissor screw. */
  | { shape: "disc"; c: [number, number]; r: number; t: number; tone?: Tone };

function mirrored(p: Primitive): Primitive {
  if (p.shape === "bar") return { ...p, a: [p.a[0], -p.a[1]], b: [p.b[0], -p.b[1]] };
  return { ...p, c: [p.c[0], -p.c[1]] };
}

const pair = (p: Primitive): Primitive[] => [p, mirrored(p)];

export const SHAPES: Record<InstrumentKind, Primitive[]> = {
  // Haemostat: two rings, ratcheted shanks, box lock and long serrated jaws.
  "artery-forceps": [
    ...pair({ shape: "ring", c: [-56, 12.5], r: 9.5, tube: 1.6 }),
    ...pair({ shape: "bar", a: [-48, 9.5], b: [-7, 2.1], w0: 3.4, w1: 3, t: 3 }),
    ...pair({ shape: "bar", a: [-43, 6.2], b: [-35, 4.4], w0: 2.2, t: 3.4, tone: "dark" }),
    { shape: "bar", a: [-9, 0], b: [2, 0], w0: 7, t: 4 },
    { shape: "bar", a: [2, 0], b: [70, 0], w0: 4.2, w1: 1.8, t: 3.2 },
  ],
  // Gold-handled needle holder: short, wide tungsten-carbide jaws.
  "needle-holder": [
    ...pair({ shape: "ring", c: [-52, 12.5], r: 9, tube: 1.8, tone: "gold" }),
    ...pair({ shape: "bar", a: [-44, 9.6], b: [-7, 2.3], w0: 3.6, w1: 3.2, t: 3.2 }),
    { shape: "bar", a: [-9, 0], b: [3, 0], w0: 7.6, t: 4.2 },
    { shape: "bar", a: [3, 0], b: [40, 0], w0: 6, w1: 3.4, t: 3.6 },
    { shape: "bar", a: [26, 0], b: [40, 0], w0: 4.4, w1: 3, t: 3.9, tone: "dark" },
  ],
  // Fine iris scissors: rings, a screw and two crossing blades.
  "iris-scissors": [
    ...pair({ shape: "ring", c: [-44, 10.5], r: 8, tube: 1.4 }),
    ...pair({ shape: "bar", a: [-37, 8.2], b: [-4, 1.6], w0: 3, w1: 2.8, t: 2.6 }),
    { shape: "bar", a: [-4, 1.2], b: [56, -1.4], w0: 4.2, w1: 0.9, t: 1.6 },
    { shape: "bar", a: [-4, -1.2], b: [56, 1.4], w0: 4.2, w1: 0.9, t: 1.6 },
    { shape: "disc", c: [0, 0], r: 2.8, t: 3.6, tone: "dark" },
  ],
  // No. 3 scalpel handle: flat body, knurled grip and the blade fitting.
  "scalpel-handle": [
    { shape: "disc", c: [-56, 0], r: 5.5, t: 2.6 },
    { shape: "bar", a: [-56, 0], b: [52, 0], w0: 11, w1: 8, t: 2.6 },
    { shape: "bar", a: [-30, 0], b: [16, 0], w0: 8.8, w1: 7.8, t: 3, tone: "dark" },
    { shape: "bar", a: [52, 0], b: [65, 0], w0: 4, w1: 3.2, t: 2 },
  ],
  // Dressing forceps: two sprung arms joined at the back.
  "tissue-forceps": [
    { shape: "bar", a: [-61, 0], b: [-50, 0], w0: 5.2, w1: 6, t: 2.2 },
    ...pair({ shape: "bar", a: [-52, 1.6], b: [58, 2.8], w0: 4.2, w1: 1.4, t: 1.7 }),
    ...pair({ shape: "bar", a: [-30, 2.2], b: [-8, 2.6], w0: 3.6, w1: 3.4, t: 2.1, tone: "dark" }),
  ],
};

/** Axis-aligned extent of an instrument in its own frame (mm), for detection boxes. */
export function shapeBounds(kind: InstrumentKind) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x: number, y: number, pad: number) => {
    minX = Math.min(minX, x - pad);
    maxX = Math.max(maxX, x + pad);
    minY = Math.min(minY, y - pad);
    maxY = Math.max(maxY, y + pad);
  };
  for (const p of SHAPES[kind]) {
    if (p.shape === "bar") {
      add(p.a[0], p.a[1], p.w0 / 2);
      add(p.b[0], p.b[1], (p.w1 ?? p.w0) / 2);
    } else {
      add(p.c[0], p.c[1], p.shape === "ring" ? p.r + p.tube : p.r);
    }
  }
  return { minX, minY, maxX, maxY };
}
