import { boardRect, drawBoard, drawRound, indexMatch, type Indexed, type Match } from "../battlecode/draw";

const SRC = "/battlecode/match.json";
const ROUNDS_PER_SECOND = 4;
const HOLD_END = 3;
const STILL_ROUND = 289;
const FPS = 12;

let cache: Promise<Match> | null = null;
const loadMatch = () => (cache ??= fetch(SRC).then((r) => (r.ok ? (r.json() as Promise<Match>) : Promise.reject(new Error(String(r.status))))));

/**
 * The Battlecode replay drawn small for the hub: the same board and rounds as the world overlay, on an
 * offscreen 2D canvas the renderer uploads as that slice's texture. `update(now)` returns true when a new
 * frame was drawn (at most FPS times a second), so the caller re-uploads only then.
 */
export class BattlecodeSlice {
  readonly canvas = document.createElement("canvas");
  private ctx = this.canvas.getContext("2d");
  private board = document.createElement("canvas");
  private match: Match | null = null;
  private ix: Indexed | null = null;
  private rect = boardRect(1, 1);
  private lastDraw = -Infinity;
  private start = -1;
  private drawnStill = false;

  constructor(private still: boolean) {
    this.canvas.width = 1;
    this.canvas.height = 1;
    loadMatch().then(
      (m) => {
        this.match = m;
        this.ix = indexMatch(m);
        this.layout();
      },
      () => undefined,
    );
  }

  /** True once the first frame is on the canvas. */
  get ready() {
    return this.lastDraw > -Infinity;
  }

  setStill(still: boolean) {
    this.still = still;
    this.drawnStill = false;
  }

  /** Size the canvas like the slice textures (the full frame at reduced resolution, same aspect as the stage). */
  resize(width: number, height: number) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.layout();
  }

  private layout() {
    const m = this.match;
    if (!m) return;
    this.board.width = this.canvas.width;
    this.board.height = this.canvas.height;
    this.rect = boardRect(this.canvas.width, this.canvas.height);
    const bctx = this.board.getContext("2d");
    if (bctx) {
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.clearRect(0, 0, this.board.width, this.board.height);
      // The floor the world shader draws under the board: dark green, so the slice reads like the world page.
      bctx.fillStyle = "#0b100c";
      bctx.fillRect(0, 0, this.board.width, this.board.height);
      drawBoard(bctx, m, this.rect);
    }
    this.lastDraw = -Infinity;
    this.drawnStill = false;
  }

  /** Draw the round for `now` (ms) if it is time for a new frame. */
  update(now: number): boolean {
    const m = this.match;
    const ctx = this.ctx;
    if (!m || !ctx || !this.ix) return false;
    if (this.still) {
      if (this.drawnStill) return false;
      this.drawnStill = true;
      this.frame(STILL_ROUND);
      this.lastDraw = now;
      return true;
    }
    if (now - this.lastDraw < 1000 / FPS) return false;
    if (this.start < 0) this.start = now;
    const last = m.rounds - 1;
    const loop = last / ROUNDS_PER_SECOND + HOLD_END;
    const s = ((now - this.start) / 1000) % loop;
    this.frame(Math.min(last, s * ROUNDS_PER_SECOND));
    this.lastDraw = now;
    return true;
  }

  private frame(t: number) {
    const ctx = this.ctx!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.board, 0, 0);
    drawRound(ctx, this.match!, this.ix!, this.rect, t);
  }
}
