/* Canvas2D scene for the hero arch: the green arch from the reference poster (fine wavy contour
   lines, a white four-point sparkle) behind the photo. Each moment picks a scene:
   - calm:  contour lines drift, the sparkle breathes;
   - drums: a white line-art kit flanks the photo and plays a rock groove, beat rings leave from
            behind the photo;
   - stage: festival light beams sweep the arch on the same groove.
   Drawing is laid out around `hole`, the photo's rectangle, so nothing important hides behind it.
   Pure drawing, no React. */

export type StageScene = "calm" | "drums" | "stage";

export type Hole = { x: number; y: number; w: number; h: number };

type Inst = "hat" | "kick" | "snare" | "crash";

/* One bar is eight eighth-note steps at 112 BPM. */
const BPM = 112;
const STEP = 60 / BPM / 2;
const STEPS_PER_BAR = 8;
/* Hats on every eighth, kick on 1, 3 and the "and" of 3, snare on 2 and 4. */
const PATTERN: Record<Exclude<Inst, "crash">, number[]> = {
  hat: [0, 1, 2, 3, 4, 5, 6, 7],
  kick: [0, 4, 5],
  snare: [2, 6],
};
/* The crash lands on beat 1 of every fourth bar. */
const CRASH_EVERY_BARS = 4;

const WHITE = "rgba(255,255,255,0.92)";
const WHITE_SOFT = "rgba(255,255,255,0.5)";
const CYAN = "rgba(150,236,255,";
const CONTOUR = "rgba(196,232,208,";
const HEAD_FILL = "rgba(14,48,37,0.9)";

function plays(inst: Inst, step: number): boolean {
  const inBar = ((step % STEPS_PER_BAR) + STEPS_PER_BAR) % STEPS_PER_BAR;
  if (inst === "crash") return inBar === 0 && Math.floor(step / STEPS_PER_BAR) % CRASH_EVERY_BARS === 0;
  return PATTERN[inst].includes(inBar);
}

/* Seconds since the instrument last sounded (Infinity if not within the crash cycle). */
function sinceHit(inst: Inst, t: number): number {
  const step = Math.floor(t / STEP);
  for (let s = step; s > step - STEPS_PER_BAR * CRASH_EVERY_BARS && s >= 0; s -= 1) {
    if (plays(inst, s)) return t - s * STEP;
  }
  return Infinity;
}

/* Exponential decay of a hit: 1 on impact, near 0 a quarter second later at the default rate. */
const env = (dt: number, rate = 9) => (Number.isFinite(dt) ? Math.exp(-dt * rate) : 0);

/* Stick height: 0 on impact, 1 halfway between its hits. */
function lift(t: number, period: number, offset: number): number {
  const steps = t / STEP - offset;
  const frac = (((steps % period) + period) % period) / period;
  return Math.sin(Math.PI * frac);
}

type Pt = { x: number; y: number };

function line(ctx: CanvasRenderingContext2D, a: Pt, b: Pt) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, alpha: number) {
  if (alpha <= 0.01 || r <= 0.5) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.15);
  glow.addColorStop(0, `rgba(255,255,255,${0.45 * alpha})`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  /* Four-point star with concave sides. */
  const k = r * 0.12;
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(k, -k, r, 0);
  ctx.quadraticCurveTo(k, k, 0, r);
  ctx.quadraticCurveTo(-k, k, -r, 0);
  ctx.quadraticCurveTo(-k, -k, 0, -r);
  ctx.fill();
  ctx.restore();
}

function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number, drift: number, pulse: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#2c6f57");
  bg.addColorStop(0.55, "#1d5c48");
  bg.addColorStop(1, "#103a2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  /* Fine wavy contour lines; the kick swells them. */
  const n = 22;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i += 1) {
    const y0 = h * 0.06 + (i / (n - 1)) * h * 0.96;
    const amp = 3 + i * 0.15 + pulse * 8 * (0.4 + 0.6 * Math.sin(i * 1.7) ** 2);
    const phase = i * 0.9 + drift;
    ctx.strokeStyle = `${CONTOUR}${0.16 + 0.12 * pulse})`;
    ctx.beginPath();
    for (let x = -4; x <= w + 4; x += 6) {
      const y = y0 + amp * Math.sin(x * 0.021 + phase) + 2.2 * Math.sin(x * 0.057 - phase * 1.3);
      if (x === -4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drum(ctx: CanvasRenderingContext2D, c: Pt, rx: number, ry: number, depth: number, hit: number) {
  ctx.fillStyle = HEAD_FILL;
  ctx.beginPath();
  ctx.moveTo(c.x - rx, c.y);
  ctx.lineTo(c.x - rx, c.y + depth);
  ctx.ellipse(c.x, c.y + depth, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(c.x + rx, c.y);
  ctx.ellipse(c.x, c.y, rx, ry, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.45 * hit})`;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y + hit * ry * 0.3, rx, ry * (1 + hit * 0.35), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function cymbal(ctx: CanvasRenderingContext2D, c: Pt, rx: number, tilt: number, shake: number, shimmer: number) {
  const ry = rx * 0.2;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(tilt + shake);
  ctx.fillStyle = `rgba(255,255,255,${0.1 + 0.35 * shimmer})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -ry * 0.2, rx * 0.18, ry * 0.45, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  if (shimmer > 0.05) {
    sparkle(ctx, c.x + Math.cos(tilt) * rx * 0.75, c.y + Math.sin(tilt) * rx * 0.75 - ry, rx * 0.18 * shimmer, 0.3, shimmer);
  }
}

function stick(ctx: CanvasRenderingContext2D, hand: Pt, tip: Pt, width: number) {
  ctx.save();
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  line(ctx, hand, tip);
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, width * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* The groove's envelopes at time t (all zero for a still frame). */
function groove(t: number, still: boolean) {
  const at = (inst: Inst, rate?: number) => (still ? 0 : env(sinceHit(inst, t), rate));
  return {
    kick: at("kick", 7),
    snare: at("snare", 8),
    hat: at("hat", 14),
    crash: at("crash", 2.6),
    crashDt: still ? Infinity : sinceHit("crash", t),
    kickDt: still ? Infinity : sinceHit("kick", t),
  };
}

/* A kit split either side of the photo; the sticks come out from behind it as if the drummer
   sits behind the print. */
function kit(ctx: CanvasRenderingContext2D, w: number, h: number, hole: Hole, t: number, still: boolean, alpha: number) {
  const g = groove(t, still);
  const left = hole.x;
  const right = w - (hole.x + hole.w);
  /* Size from the narrower gutter; cymbals may tuck behind the photo edge. */
  const s = Math.max(30, Math.min(left, right, w * 0.2) * 1.15);
  const lx = left * 0.5;
  const rx = hole.x + hole.w + right * 0.5;
  const floor = h - 4;

  const hat = { x: lx + s * 0.05, y: hole.y + hole.h * 0.22 };
  const snare = { x: lx + s * 0.1, y: hole.y + hole.h * 0.58 };
  const crash = { x: lx + s * 0.15, y: Math.max(h * 0.2, hole.y - s * 0.25) };
  const ride = { x: rx - s * 0.1, y: hole.y + hole.h * 0.14 };
  const floorTom = { x: rx - s * 0.05, y: hole.y + hole.h * 0.6 };
  const rackTom = { x: rx - s * 0.15, y: hole.y + hole.h * 0.36 };

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineWidth = Math.max(1.2, s * 0.025);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  /* Beat rings leave from behind the photo on each kick. */
  if (!still) {
    const cx = hole.x + hole.w / 2;
    const cy = hole.y + hole.h / 2;
    const r = Math.max(hole.w, hole.h) * 0.55 + g.kickDt * w * 0.7;
    const a = 0.6 * env(g.kickDt, 3.5);
    if (a > 0.02) {
      ctx.strokeStyle = `${CYAN}${a})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * (hole.w / hole.h) * 0.9, r * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = Math.max(1.2, s * 0.025);
    }
  }

  ctx.strokeStyle = WHITE_SOFT;
  line(ctx, hat, { x: hat.x, y: floor });
  line(ctx, { x: snare.x, y: snare.y + s * 0.2 }, { x: snare.x, y: floor });
  line(ctx, { x: snare.x, y: floor - s * 0.25 }, { x: snare.x - s * 0.3, y: floor });
  line(ctx, crash, { x: crash.x - s * 0.2, y: floor });
  line(ctx, ride, { x: ride.x + s * 0.2, y: floor });
  line(ctx, { x: floorTom.x - s * 0.4, y: floorTom.y + s * 0.6 }, { x: floorTom.x - s * 0.45, y: floor });
  line(ctx, { x: floorTom.x + s * 0.4, y: floorTom.y + s * 0.6 }, { x: floorTom.x + s * 0.45, y: floor });

  ctx.strokeStyle = WHITE;
  drum(ctx, rackTom, s * 0.36, s * 0.11, s * 0.3, 0);
  drum(ctx, floorTom, s * 0.48, s * 0.14, s * 0.7, 0);
  drum(ctx, snare, s * 0.45, s * 0.13, s * 0.22, g.snare);

  const gap = s * 0.08 * (1 - g.hat * 0.6);
  cymbal(ctx, { x: hat.x, y: hat.y - gap }, s * 0.48, 0, 0, g.hat * 0.5);
  cymbal(ctx, hat, s * 0.48, 0, 0, 0);
  const shake = Number.isFinite(g.crashDt) ? 0.12 * g.crash * Math.sin(g.crashDt * 26) : 0;
  cymbal(ctx, crash, s * 0.62, -0.2, shake, g.crash);
  cymbal(ctx, ride, s * 0.62, 0.18, 0, 0);

  /* Sticks: one on the snare backbeat, one riding the hats; both start behind the photo. */
  const lLift = still ? 0.7 : lift(t, 4, 2);
  const rLift = still ? 0.5 : lift(t, 1, 0);
  const sw = Math.max(2, s * 0.05);
  stick(ctx, { x: hole.x + s * 0.4, y: snare.y - s * 0.9 }, { x: snare.x + s * 0.12, y: snare.y - lLift * s * 0.6 }, sw);
  stick(ctx, { x: hole.x + s * 0.4, y: hat.y - s * 0.75 }, { x: hat.x + s * 0.2, y: hat.y - gap - rLift * s * 0.45 }, sw);

  ctx.restore();
  return g;
}

/* Festival light beams that sweep across the arch, brightening on the kick. */
function beams(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, still: boolean, alpha: number) {
  const g = groove(t, still);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "lighter";
  const sources = [0.12, 0.5, 0.88];
  sources.forEach((fx, i) => {
    const ox = w * fx;
    const angle = (still ? 0.25 * (i - 1) : Math.sin(t * 0.7 + i * 2.1) * 0.38) + (fx - 0.5) * -0.4;
    const len = h * 1.15;
    const spread = 0.13;
    const tipL = { x: ox + Math.sin(angle - spread) * len, y: Math.cos(angle - spread) * len };
    const tipR = { x: ox + Math.sin(angle + spread) * len, y: Math.cos(angle + spread) * len };
    const grad = ctx.createLinearGradient(ox, 0, ox + Math.sin(angle) * len, Math.cos(angle) * len);
    const a = 0.16 + 0.22 * g.kick;
    grad.addColorStop(0, i === 1 ? `rgba(255,255,255,${a + 0.08})` : `rgba(170,255,210,${a})`);
    grad.addColorStop(1, "rgba(170,255,210,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ox, -2);
    ctx.lineTo(tipL.x, tipL.y);
    ctx.lineTo(tipR.x, tipR.y);
    ctx.closePath();
    ctx.fill();
  });
  /* Small lamp glints along the top truss. */
  for (let i = 0; i < 7; i += 1) {
    const x = w * (0.2 + i * 0.1);
    const flicker = still ? 0.6 : 0.45 + 0.55 * Math.abs(Math.sin(t * 3 + i * 1.3));
    sparkle(ctx, x, h * 0.05 + Math.abs(i - 3) * h * 0.025, Math.min(w, h) * 0.012, 0, flicker * 0.8);
  }
  ctx.restore();
  return g;
}

export type FrameInput = {
  w: number;
  h: number;
  /* The photo's rectangle in canvas pixels. */
  hole: Hole;
  /* Seconds since the stage started. */
  t: number;
  /* Seconds since this scene was chosen, for its fade-in. */
  sinceScene: number;
  scene: StageScene;
  /* One frame with no movement and no pulses (reduced motion or paused). */
  still: boolean;
};

export function drawFrame(ctx: CanvasRenderingContext2D, f: FrameInput) {
  const { w, h, hole, t, scene, still } = f;
  const beat = scene !== "calm" && !still;
  const pulse = beat ? env(sinceHit("kick", t), 6) : 0;
  const drift = still ? 0 : t * (scene === "calm" ? 0.25 : 0.5);
  backdrop(ctx, w, h, drift, pulse);

  const alpha = still ? 1 : Math.min(1, f.sinceScene / 0.45);
  let flare = 0;
  if (scene === "drums") flare = kit(ctx, w, h, hole, t, still, alpha).crash;
  else if (scene === "stage") flare = beams(ctx, w, h, t, still, alpha).kick * 0.5;

  /* The sparkle sits centred in the space above the photo, clear of any text. */
  const room = Math.max(0, hole.y);
  const r = Math.min(w * 0.08, room * 0.32, 44) * (1 + 0.6 * flare);
  const breathe = scene === "calm" && !still ? 1 + 0.08 * Math.sin(t * 1.6) : 1;
  if (room > 24) sparkle(ctx, w / 2, room * 0.52, r * breathe, still ? 0 : t * 0.12, 1);
}
