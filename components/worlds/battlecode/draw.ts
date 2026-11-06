// Canvas2D drawing of one decoded Battlecode match (public/battlecode/match.json), lightly isometric:
// the board is a trapezoid, narrower at the far (top) edge, with raised stone walls, after the official visualiser.
// Art is drawn here from shapes; no official sprites are used.

export type Match = {
  v: 1;
  source: { match: string; map: string; date: string; kind: string; side: string; decoded: string; notes: string };
  w: number;
  h: number;
  /** Row y = 0 first. "." floor, "#" wall, "o" hole, '"' bush, "A" altar. */
  terrain: string[];
  altars: [number, number][];
  spawns: [number, number, number, number][];
  teams: [string, string];
  /** [team, champion] per unit id. */
  units: [number, string][];
  /** [x, y, group, kind]: kind 0 wolf, 1 elk, 2 gem cluster, 3 gold cluster, 4 monolith. */
  camps: [number, number, number, number][];
  final: [number, number];
  rounds: number;
  /** u: [x, y, hp %, gems] per unit; c: camp hp % (0 dead); s: scores; k: per group [team, timer] while capturing. */
  frames: { u: [number, number, number, number][]; c: number[]; s: [number, number]; k: 0 | (0 | [number, number])[] }[];
  /** [r, 0, unit, 0 camp | 1 champion, target] attack; [r, 1, group, team] capture; [r, 2, unit, altar, gems] tribute. */
  events: number[][];
};

export const TEAM = ["#4ea4ff", "#ff5a4f"] as const;
const TEAM_DARK = ["#16263d", "#3a1714"] as const;
const GOLD = "#f2c14e";
const GEM = "#8fd8ff";

export type Board = {
  /** Screen corners of the board: far left/right at y0, near left/right at y1. */
  cx: number;
  y0: number;
  y1: number;
  farW: number;
  nearW: number;
  tile: number;
};

/** Where the board sits in a canvas of css size w x h. Right of centre on wide screens (see shaders/battlecode.ts). */
export function boardRect(w: number, h: number): Board {
  const wide = w / h >= 1.15 && w >= 900;
  const cx = wide ? w * 0.66 : w * 0.5;
  const maxNear = wide ? Math.min(w * 0.56, h * 0.98) : Math.min(w * 0.96, h * 0.9);
  const nearW = maxNear;
  const farW = nearW * 0.8;
  const depth = nearW * 0.7;
  const mid = wide ? h * 0.5 : h * 0.44;
  return { cx, y0: mid - depth / 2, y1: mid + depth / 2, farW, nearW, tile: nearW / 50 };
}

/** Board point (x right, y up, in tiles from the bottom-left corner of a map of size n) to screen. */
export function project(b: Board, n: number, x: number, y: number): [number, number, number] {
  const t = 1 - y / n; // 0 far edge, 1 near edge
  const width = b.farW + (b.nearW - b.farW) * t;
  const sx = b.cx + (x / n - 0.5) * width;
  const sy = b.y0 + (b.y1 - b.y0) * t;
  return [sx, sy, width / b.nearW];
}

function quad(ctx: CanvasRenderingContext2D, b: Board, n: number, x: number, y: number, lift = 0) {
  const p = [project(b, n, x, y + 1), project(b, n, x + 1, y + 1), project(b, n, x + 1, y), project(b, n, x, y)];
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1] - lift * p[0][2]);
  for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1] - lift * p[i][2]);
  ctx.closePath();
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** The static board: grass, grid, spawns, bushes, walls, altars. Drawn once per resize into an offscreen canvas. */
export function drawBoard(ctx: CanvasRenderingContext2D, m: Match, b: Board) {
  const n = m.w;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= n || y >= n ? "#" : m.terrain[y][x]);
  // Board edge: a soil slab under the grass, visible along the near edge.
  const slab = 0.55 * b.tile;
  const bl = project(b, n, 0, 0), br = project(b, n, n, 0);
  ctx.fillStyle = "#2c2414";
  ctx.beginPath();
  ctx.moveTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(br[0], br[1] + slab);
  ctx.lineTo(bl[0], bl[1] + slab);
  ctx.closePath();
  ctx.fill();
  const shadow = ctx.createRadialGradient(b.cx, b.y1 + slab, 0, b.cx, b.y1 + slab, b.nearW * 0.6);
  shadow.addColorStop(0, "rgba(0,0,0,0.45)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");

  for (let y = n - 1; y >= 0; y--) {
    for (let x = 0; x < n; x++) {
      const h = hash(x, y);
      const patch = 0.5 + 0.5 * Math.sin(x * 0.23 + Math.cos(y * 0.17) * 2) * Math.cos(y * 0.19 - x * 0.05);
      const g = 88 + patch * 34 + h * 9;
      ctx.fillStyle = `rgb(${Math.round(g * 0.6)}, ${Math.round(g * 0.84)}, ${Math.round(g * 0.3)})`;
      quad(ctx, b, n, x, y);
      ctx.fill();
    }
  }
  // Grid lines.
  ctx.strokeStyle = "rgba(20, 40, 8, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = project(b, n, i, 0), c = project(b, n, i, n);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(c[0], c[1]);
    const d = project(b, n, 0, i), e = project(b, n, n, i);
    ctx.moveTo(d[0], d[1]);
    ctx.lineTo(e[0], e[1]);
  }
  ctx.stroke();

  // Spawns: tinted pads with a dotted border, blue for OneTap and red for the opponent.
  m.spawns.forEach(([x0, y0, x1, y1], t) => {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        ctx.fillStyle = t === 0 ? "rgba(78,164,255,0.28)" : "rgba(255,70,60,0.38)";
        quad(ctx, b, n, x, y);
        ctx.fill();
      }
  });

  // Bushes: tall pale grass tufts.
  for (let y = n - 1; y >= 0; y--)
    for (let x = 0; x < n; x++) {
      if (at(x, y) !== '"') continue;
      ctx.fillStyle = "rgba(44, 84, 30, 0.55)";
      quad(ctx, b, n, x, y);
      ctx.fill();
      for (let k = 0; k < 4; k++) {
        const [px, py, s] = project(b, n, x + 0.2 + 0.2 * k + 0.1 * hash(x + k, y), y + 0.3 + 0.4 * hash(y, x + k));
        const hgt = b.tile * s * (0.9 + 0.5 * hash(x * 3 + k, y));
        ctx.strokeStyle = k % 2 ? "#c9dca6" : "#a9c483";
        ctx.lineWidth = Math.max(1, b.tile * 0.09);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(px - b.tile * 0.12, py - hgt * 0.6, px + b.tile * 0.08 * (k - 1.5), py - hgt);
        ctx.stroke();
      }
    }

  // Walls: raised grey blocks, far rows first so nearer blocks overlap.
  const lift = b.tile * 0.6;
  for (let y = n - 1; y >= 0; y--)
    for (let x = 0; x < n; x++) {
      if (at(x, y) !== "#") continue;
      const h = hash(x, y);
      if (at(x, y - 1) !== "#") {
        // Front face.
        const a = project(b, n, x, y), c = project(b, n, x + 1, y);
        ctx.fillStyle = "#4d4f52";
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(c[0], c[1] - lift * c[2]);
        ctx.lineTo(a[0], a[1] - lift * a[2]);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(a[0], a[1] - 1, c[0] - a[0], 1.5);
      }
      const v = Math.round(146 + h * 26);
      ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 6})`;
      quad(ctx, b, n, x, y, lift);
      ctx.fill();
      ctx.strokeStyle = "rgba(60, 62, 66, 0.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

  // Altars: a stone plinth with a ringed top.
  for (const [x, y] of m.altars) {
    const [sx, sy, s] = project(b, n, x + 0.5, y + 0.5);
    const r = b.tile * s * 0.8;
    ctx.fillStyle = "#6d6a64";
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b9b3a6";
    ctx.beginPath();
    ctx.ellipse(sx, sy - r * 0.35, r * 0.82, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.beginPath();
    ctx.ellipse(sx, sy - r * 0.35, r * 0.45, r * 0.26, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

const ease = (t: number) => t * t * (3 - 2 * t);

const LABEL: Record<string, string> = { Varg: "Va", Ryth: "Ry", Vendetta: "Ve", Cassi: "Ca", Issac: "Is", Stellar: "St", Tavi: "Ta" };

function token(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, ring: string, fillC: string, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.12, y + r * 0.85, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = fillC;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.22);
  ctx.strokeStyle = ring;
  ctx.stroke();
}

function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, frac: number, color: string) {
  const h = Math.max(2, w * 0.14);
  ctx.fillStyle = "rgba(10,10,10,0.75)";
  ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y, w * Math.max(0, Math.min(1, frac)), h);
}

function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.3);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r * 1.3);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

function coins(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  for (let k = 0; k < 3; k++) {
    const cy = y + r * 0.5 - k * r * 0.38;
    ctx.fillStyle = "#9a6b12";
    ctx.beginPath();
    ctx.ellipse(x, cy + r * 0.12, r * 0.7, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.ellipse(x, cy, r * 0.7, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export type Indexed = {
  /** Events by round. */
  byRound: Map<number, number[][]>;
  /** Centre of each camp group, in tiles. */
  groupCentre: Map<number, [number, number]>;
};

export function indexMatch(m: Match): Indexed {
  const byRound = new Map<number, number[][]>();
  for (const e of m.events) {
    const list = byRound.get(e[0]);
    if (list) list.push(e);
    else byRound.set(e[0], [e]);
  }
  const sums = new Map<number, [number, number, number]>();
  for (const [x, y, g] of m.camps) {
    const s = sums.get(g) ?? [0, 0, 0];
    sums.set(g, [s[0] + x, s[1] + y, s[2] + 1]);
  }
  const groupCentre = new Map<number, [number, number]>();
  sums.forEach(([x, y, c], g) => groupCentre.set(g, [x / c + 0.5, y / c + 0.5]));
  return { byRound, groupCentre };
}

/**
 * The moving layer at time `t` in rounds (round n = floor(t), moving towards n + 1).
 * Events stamped round n + 1 play out during the step from n to n + 1.
 */
export function drawRound(ctx: CanvasRenderingContext2D, m: Match, ix: Indexed, b: Board, t: number) {
  const n = m.w;
  const last = m.rounds - 1;
  const r0 = Math.max(0, Math.min(last, Math.floor(t)));
  const r1 = Math.min(last, r0 + 1);
  const f = Math.min(1, Math.max(0, t - r0));
  const F0 = m.frames[r0], F1 = m.frames[r1];
  const tile = b.tile;

  // Camps.
  m.camps.forEach(([x, y, , kind], k) => {
    const hp = (f < 0.5 ? F0 : F1).c[k];
    const [sx, sy, s] = project(b, n, x + 0.5, y + 0.5);
    const r = tile * s * 0.72;
    if (hp === 0) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "rgba(242,193,78,0.6)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(sx, sy - r * 0.4, r * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      return;
    }
    if (kind === 3) coins(ctx, sx, sy - r * 0.4, r * 1.05);
    else if (kind === 2) {
      diamond(ctx, sx - r * 0.4, sy - r * 0.2, r * 0.38, "#6d8cff");
      diamond(ctx, sx + r * 0.4, sy - r * 0.3, r * 0.38, "#b38cff");
      diamond(ctx, sx, sy - r * 0.7, r * 0.46, GEM);
    } else if (kind === 4) {
      ctx.fillStyle = "#2a2236";
      ctx.beginPath();
      ctx.moveTo(sx - r * 0.7, sy + r * 0.3);
      ctx.lineTo(sx - r * 0.35, sy - r * 2.4);
      ctx.lineTo(sx + r * 0.35, sy - r * 2.4);
      ctx.lineTo(sx + r * 0.7, sy + r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#9b7bff";
      ctx.fillRect(sx - r * 0.12, sy - r * 1.8, r * 0.24, r * 1.2);
    } else {
      token(ctx, sx, sy - r * 0.45, r * 0.95, GOLD, kind === 1 ? "#5a3b22" : "#3a3c42", 1);
      ctx.fillStyle = "#e9e2cf";
      ctx.beginPath();
      // Ears and snout: a wolf's head in two strokes.
      ctx.moveTo(sx - r * 0.45, sy - r * 0.8);
      ctx.lineTo(sx - r * 0.2, sy - r * 1.05);
      ctx.lineTo(sx, sy - r * 0.55);
      ctx.lineTo(sx + r * 0.2, sy - r * 1.05);
      ctx.lineTo(sx + r * 0.45, sy - r * 0.8);
      ctx.lineTo(sx, sy - r * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (hp < 100) bar(ctx, sx, sy - r * 2.1, r * 1.8, hp / 100, "#e9e2cf");
  });

  // Capture timers: a ring round the group that fills over the five capture rounds.
  const caps = (f < 0.5 ? F0 : F1).k;
  if (caps) {
    caps.forEach((c, g) => {
      if (!c) return;
      const centre = ix.groupCentre.get(g);
      if (!centre) return;
      const [sx, sy, s] = project(b, n, centre[0], centre[1]);
      const rad = tile * s * 1.6;
      const prog = Math.min(1, (6 - c[1]) / 5);
      ctx.strokeStyle = "rgba(0,0,0,0.45)";
      ctx.lineWidth = Math.max(2, tile * 0.22);
      ctx.beginPath();
      ctx.ellipse(sx, sy, rad, rad * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = TEAM[c[0]];
      ctx.beginPath();
      ctx.ellipse(sx, sy, rad, rad * 0.7, 0, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
      ctx.stroke();
    });
  }

  const unitPos = (i: number): [number, number, number] => {
    const a = F0.u[i], c = F1.u[i];
    const jump = Math.max(Math.abs(a[0] - c[0]), Math.abs(a[1] - c[1])) > 2;
    if (jump) return f < 0.5 ? [a[0], a[1], 1 - f * 2] : [c[0], c[1], f * 2 - 1];
    const e = ease(Math.min(1, f * 1.6));
    return [a[0] + (c[0] - a[0]) * e, a[1] + (c[1] - a[1]) * e, 1];
  };

  // Attacks during this step: a bolt from the attacker to its target in the team's colour.
  const evs = ix.byRound.get(r0 + 1) ?? [];
  for (const e of evs) {
    if (e[1] !== 0) continue;
    const [ux, uy, ua] = unitPos(e[2]);
    const team = m.units[e[2]][0];
    let tx: number, ty: number;
    if (e[3] === 0) [tx, ty] = [m.camps[e[4]][0], m.camps[e[4]][1]];
    else [tx, ty] = unitPos(e[4]);
    const a = project(b, n, ux + 0.5, uy + 0.5), c = project(b, n, tx + 0.5, ty + 0.5);
    const k = Math.min(1, Math.max(0, (f - 0.15) / 0.55));
    if (k <= 0 || k >= 1) continue;
    const lift = tile * 0.45;
    const hx = a[0] + (c[0] - a[0]) * k, hy = a[1] - lift + (c[1] - a[1]) * k;
    const back = Math.max(0, k - 0.35);
    const bx = a[0] + (c[0] - a[0]) * back, by = a[1] - lift + (c[1] - a[1]) * back;
    ctx.globalAlpha = ua;
    ctx.strokeStyle = TEAM[team];
    ctx.lineWidth = Math.max(1.5, tile * 0.16);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.fillStyle = "#fff6e0";
    ctx.beginPath();
    ctx.arc(hx, hy, Math.max(1.5, tile * 0.13), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Champions, far rows first.
  const order = m.units.map((_, i) => i).sort((i, j) => unitPos(j)[1] - unitPos(i)[1]);
  for (const i of order) {
    const [x, y, alpha] = unitPos(i);
    const [team, name] = m.units[i];
    const u = f < 0.5 ? F0.u[i] : F1.u[i];
    if (u[2] === 0) continue;
    const [sx, sy, s] = project(b, n, x + 0.5, y + 0.5);
    const r = tile * s * 0.95;
    const cy = sy - r * 0.75;
    token(ctx, sx, cy, r, TEAM[team], TEAM_DARK[team], alpha);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = `600 ${Math.round(r * 0.95)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(LABEL[name] ?? name.slice(0, 2), sx, cy + r * 0.05);
    bar(ctx, sx, cy - r * 1.55, r * 1.8, u[2] / 100, u[2] > 50 ? "#5fd16b" : u[2] > 25 ? "#f2c14e" : "#ff5a4f");
    if (u[3] > 0) {
      diamond(ctx, sx + r * 1.05, cy + r * 0.55, r * 0.32, GEM);
      ctx.fillStyle = "#e8f7ff";
      ctx.font = `600 ${Math.round(r * 0.62)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(String(u[3]), sx + r * 1.42, cy + r * 0.58);
    }
    ctx.globalAlpha = 1;
  }

  // Tributes and captures: gems flying to the altar, and the amount rising from where it happened.
  for (let age = 0; age < 8; age++) {
    const list = ix.byRound.get(r0 + 1 - age);
    if (!list) continue;
    const life = (age + f) / 8;
    for (const e of list) {
      if (e[1] === 0) continue;
      let px: number, py: number, team: number, label: string;
      if (e[1] === 2) {
        const al = m.altars[e[3]];
        [px, py] = [al[0] + 0.5, al[1] + 0.5];
        team = m.units[e[2]][0];
        label = `+${e[4]}`;
        if (age === 0) {
          const [ux, uy] = unitPos(e[2]);
          for (let k = 0; k < 4; k++) {
            const q = Math.min(1, Math.max(0, f * 1.4 - k * 0.12));
            const gx = ux + 0.5 + (px - ux - 0.5) * q, gy = uy + 0.5 + (py - uy - 0.5) * q;
            const [sx, sy, s] = project(b, n, gx, gy);
            diamond(ctx, sx, sy - tile * s * (0.6 + Math.sin(q * Math.PI) * 1.2), tile * s * 0.22, GEM);
          }
        }
      } else {
        const c = ix.groupCentre.get(e[2]);
        if (!c) continue;
        [px, py] = c;
        team = e[3];
        label = "captured";
      }
      const [sx, sy, s] = project(b, n, px, py);
      ctx.globalAlpha = Math.max(0, 1 - life) * (life < 0.08 ? life / 0.08 : 1);
      ctx.font = `700 ${Math.round(tile * s * (e[1] === 2 ? 1.25 : 0.85))}px ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(8,10,8,0.8)";
      const ty = sy - tile * s * (1.6 + life * 2.2);
      ctx.strokeText(label, sx, ty);
      ctx.fillStyle = e[1] === 2 ? TEAM[team] : "#f4f1ea";
      ctx.fillText(label, sx, ty);
      ctx.globalAlpha = 1;
    }
  }
}
