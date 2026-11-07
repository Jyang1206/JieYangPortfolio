import { CAP_INDEX, COMPOSITE, VERTEX, WORLD_FRAGMENTS } from "./shaders";
import HUB, { HUB_UNIFORMS } from "./hubShader";

export type FrameState =
  | { kind: "steady"; world: number }
  | { kind: "crossing"; from: number; to: number; t: number; mode: number };

type Target = { fbo: WebGLFramebuffer; tex: WebGLTexture; width: number; height: number };

/** One frame of the hub: the worlds `0..count-1` cut into slices. */
export type HubState = {
  count: number;
  /** Slice drawn live at higher resolution and brighter; -1 for none. */
  hovered: number;
  /** Relative width of each slice; normalised here. Ignored when `bounds` is given. */
  weights: ArrayLike<number>;
  /** Explicit slice edges as fractions of the turn, height or width, length count + 1 (band and strip layouts). */
  bounds?: ArrayLike<number>;
  /** 0: wedges around the centre. 1: horizontal bands. */
  layout: 0 | 1 | 2;
  /** Paper colour for the seams and the centre disc, 0..1 RGB. */
  seam: [number, number, number];
  /** Radius of the paper disc in the middle, in device pixels (wedge layout only). */
  disc: number;
  /** 0..1: how far the lens cap's aperture has opened onto the hub. 1 draws the hub alone. */
  reveal: number;
  /** Turn offset, 0..1: rotates the whole pizza (wedge layout only). */
  rotate?: number;
};

type Slot = {
  program: WebGLProgram;
  shaders: WebGLShader[];
  ready: boolean;
  failed: boolean;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

const WORLD_UNIFORMS = ["uRes", "uTime", "uParams"];
const COMPOSITE_UNIFORMS = ["uA", "uB", "uRes", "uT", "uMode"];
const COMPLETION_STATUS_KHR = 0x91b1;

/**
 * Owns one WebGL2 context. Steady frames draw a world straight to the screen; crossings render the
 * outgoing and incoming worlds into two textures and let the composite shader mix them.
 *
 * World programs compile lazily, on first need or when prefetched, and in the background where the
 * browser offers KHR_parallel_shader_compile. Compiling every world up front froze the page on load.
 */
export class WorldRenderer {
  private gl: WebGL2RenderingContext;
  private parallel: unknown;
  private slots: (Slot | null)[] = WORLD_FRAGMENTS.map(() => null);
  private composite: Slot | null = null;
  private hub: Slot | null = null;
  private vao: WebGLVertexArrayObject;
  private targets: Target[] = [];
  /** Reduced-resolution frame of each world for the hub, refreshed one per frame in turn. */
  private slices: Target[] = [];
  /** The hovered hub slice, at half resolution, refreshed every frame. */
  private live: Target | null = null;
  private turn = 0;
  /** Still images standing in for a world on the hub, by world index. */
  private stills = new Map<number, HTMLImageElement | HTMLCanvasElement>();
  private stillUploaded = new Set<number>();
  private liveStill = -1;
  private buffer: WebGLBuffer;
  private width = 0;
  private height = 0;

  static create(canvas: HTMLCanvasElement): WorldRenderer | null {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    if (!gl || gl.isContextLost()) return null;
    try {
      return new WorldRenderer(gl);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.parallel = gl.getExtension("KHR_parallel_shader_compile");
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    if (!vao || !buffer) throw new Error("WebGL buffers unavailable");
    this.vao = vao;
    this.buffer = buffer;
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.prefetch([CAP_INDEX, 0]);
    this.composite = this.start(COMPOSITE);
  }

  /** Start compiling and linking without waiting for the result. */
  private start(fragment: string): Slot {
    const gl = this.gl;
    const program = gl.createProgram();
    if (!program) throw new Error("Program allocation failed");
    const sources: [number, string][] = [
      [gl.VERTEX_SHADER, VERTEX],
      [gl.FRAGMENT_SHADER, fragment],
    ];
    const shaders = sources.map(([type, source]) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Shader allocation failed");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      gl.attachShader(program, shader);
      return shader;
    });
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    return { program, shaders, ready: false, failed: false, uniforms: {} };
  }

  /** True once the slot can draw. Without the parallel extension this blocks on first call, per program. */
  private check(slot: Slot | null, names: string[]) {
    if (!slot || slot.failed) return false;
    if (slot.ready) return true;
    const gl = this.gl;
    if (this.parallel && !gl.getProgramParameter(slot.program, COMPLETION_STATUS_KHR)) return false;
    if (!gl.getProgramParameter(slot.program, gl.LINK_STATUS)) {
      slot.failed = true;
      if (!gl.isContextLost()) {
        console.error(
          "World shader failed:",
          gl.getProgramInfoLog(slot.program),
          ...slot.shaders.map((sh) => gl.getShaderInfoLog(sh)),
        );
      }
      return false;
    }
    for (const name of names) slot.uniforms[name] = gl.getUniformLocation(slot.program, name);
    slot.ready = true;
    return true;
  }

  /** Begin compiling these worlds so they are ready by the time the visitor reaches them. */
  prefetch(indices: number[]) {
    for (const i of indices) {
      if (i >= 0 && i < this.slots.length && !this.slots[i]) this.slots[i] = this.start(WORLD_FRAGMENTS[i]);
    }
  }

  /** True once this world's program has linked (or a still stands in for it); the hub shows a placeholder until then. */
  ready(index: number) {
    const still = this.stills.get(index);
    if (still) return this.loaded(still);
    this.prefetch([index]);
    return this.check(this.slots[index], WORLD_UNIFORMS);
  }

  private clear(target: Target | null, shade: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.fbo ?? null);
    gl.viewport(0, 0, target?.width ?? this.width, target?.height ?? this.height);
    gl.clearColor(shade, shade, shade * 1.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  private world(index: number) {
    this.prefetch([index]);
    const slot = this.slots[index];
    if (this.check(slot, WORLD_UNIFORMS)) return slot;
    const cap = this.slots[CAP_INDEX];
    return this.check(cap, WORLD_UNIFORMS) ? cap : null;
  }

  private makeTarget(width: number, height: number): Target {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fbo, tex, width, height };
  }

  private freeTargets(targets: Target[]) {
    for (const target of targets) {
      this.gl.deleteFramebuffer(target.fbo);
      this.gl.deleteTexture(target.tex);
    }
  }

  resize(width: number, height: number) {
    if (width === this.width && height === this.height) return;
    this.width = width;
    this.height = height;
    this.freeTargets(this.targets);
    this.targets = [0, 1].map(() => this.makeTarget(width, height));
    // Hub textures follow the new size the next time the hub draws.
    this.freeTargets(this.slices);
    this.slices = [];
    if (this.live) this.freeTargets([this.live]);
    this.live = null;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private drawWorld(index: number, time: number, target: Target | null, params?: ArrayLike<number>) {
    const gl = this.gl;
    const width = target?.width ?? this.width;
    const height = target?.height ?? this.height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.fbo ?? null);
    gl.viewport(0, 0, width, height);
    const slot = this.world(index);
    if (!slot) {
      gl.clearColor(0.024, 0.024, 0.027, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    const u = slot.uniforms;
    gl.useProgram(slot.program);
    gl.uniform2f(u.uRes, width, height);
    gl.uniform1f(u.uTime, time);
    gl.uniform4f(u.uParams, params?.[0] ?? 0, params?.[1] ?? 0, params?.[2] ?? 0, params?.[3] ?? 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private drawComposite(a: Target, b: Target, t: number, mode: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    const c = this.composite!;
    const u = c.uniforms;
    gl.useProgram(c.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, b.tex);
    gl.uniform1i(u.uA, 0);
    gl.uniform1i(u.uB, 1);
    gl.uniform2f(u.uRes, this.width, this.height);
    gl.uniform1f(u.uT, t);
    gl.uniform1i(u.uMode, mode);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** `params[i]` holds the four control values for world shader i (see shaders/*.ts). */
  render(state: FrameState, time: number, params?: ArrayLike<number>[]) {
    if (!this.width || !this.height) return;
    if (state.kind === "steady" || !this.check(this.composite, COMPOSITE_UNIFORMS)) {
      const w = state.kind === "steady" ? state.world : state.t < 0.5 ? state.from : state.to;
      this.drawWorld(w, time, null, params?.[w]);
      return;
    }
    this.drawWorld(state.from, time, this.targets[0], params?.[state.from]);
    this.drawWorld(state.to, time, this.targets[1], params?.[state.to]);
    this.drawComposite(this.targets[0], this.targets[1], state.t, state.mode);
  }

  /** Show this image in the hub instead of the world's shader (for worlds whose scene is drawn by an overlay). */
  setStill(index: number, image: HTMLImageElement | HTMLCanvasElement | null) {
    if (image) this.stills.set(index, image);
    else this.stills.delete(index);
    this.touchStill(index);
  }

  /** The still's pixels changed (an animated canvas): upload it again on the next hub frame. */
  touchStill(index: number) {
    this.stillUploaded.delete(index);
    if (this.liveStill === index) this.liveStill = -2;
  }

  private loaded(image: HTMLImageElement | HTMLCanvasElement) {
    return image instanceof HTMLCanvasElement ? image.width > 1 : image.complete && image.naturalWidth > 0;
  }

  private upload(target: Target, image: HTMLImageElement | HTMLCanvasElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  /** Start compiling the hub shader and every world it shows. */
  prefetchHub(count: number) {
    if (!this.hub) this.hub = this.start(HUB);
    this.prefetch(Array.from({ length: count }, (_, i) => i));
  }

  /**
   * The hub. Each world keeps a quarter-resolution frame that is refreshed in turn, one world per
   * call; the hovered world is drawn every call at half resolution. The hub shader then cuts them
   * into slices. While `reveal` < 1 the hub is drawn behind the lens cap's opening aperture.
   */
  renderHub(hub: HubState, time: number, params?: ArrayLike<number>[]) {
    if (!this.width || !this.height) return;
    const gl = this.gl;
    const count = Math.min(hub.count, 6);
    this.prefetchHub(count);
    if (!this.check(this.hub, HUB_UNIFORMS)) {
      this.drawWorld(CAP_INDEX, time, null);
      return;
    }
    if (this.slices.length !== count) {
      this.freeTargets(this.slices);
      const w = Math.max(1, Math.round(this.width / 4));
      const h = Math.max(1, Math.round(this.height / 4));
      this.slices = Array.from({ length: count }, () => this.makeTarget(w, h));
      this.turn = 0;
      this.stillUploaded.clear();
      for (let i = 0; i < count; i++) this.clear(this.slices[i], 0.07);
    }
    if (!this.live) this.live = this.makeTarget(Math.max(1, Math.round(this.width / 2)), Math.max(1, Math.round(this.height / 2)));

    // Stills are uploaded once; a still hovered slice gets its image in the live texture too.
    for (const [i, image] of this.stills) {
      if (i < count && !this.stillUploaded.has(i) && this.loaded(image)) {
        this.upload(this.slices[i], image);
        this.stillUploaded.add(i);
      }
    }
    const hoveredStill = this.stills.get(hub.hovered);
    if (hoveredStill) {
      if (this.liveStill !== hub.hovered && this.loaded(hoveredStill)) {
        this.upload(this.live, hoveredStill);
        this.liveStill = hub.hovered;
      }
    } else if (this.liveStill !== -1) {
      // The live texture held an image; give it back its framebuffer-sized storage.
      this.freeTargets([this.live]);
      this.live = this.makeTarget(Math.max(1, Math.round(this.width / 2)), Math.max(1, Math.round(this.height / 2)));
      this.liveStill = -1;
    }

    // Refresh one resting slice per frame and the hovered one every frame.
    let next = this.turn % count;
    if (next === hub.hovered) next = (next + 1) % count;
    this.turn = next + 1;
    if (!this.stills.has(next) && this.ready(next)) this.drawWorld(next, time, this.slices[next], params?.[next]);
    if (hub.hovered >= 0 && hub.hovered < count && !hoveredStill) {
      if (this.ready(hub.hovered)) this.drawWorld(hub.hovered, time, this.live, params?.[hub.hovered]);
      else this.clear(this.live, 0.09);
    }

    const reveal = Math.min(Math.max(hub.reveal, 0), 1);
    const composite = reveal < 1 && this.check(this.composite, COMPOSITE_UNIFORMS);
    if (composite) this.drawWorld(CAP_INDEX, time, this.targets[0]);

    // Slice bounds, explicit or from the weights.
    const bounds = new Float32Array(7);
    if (hub.bounds) {
      for (let i = 0; i <= count; i++) bounds[i] = hub.bounds[i] ?? 1;
      for (let i = count + 1; i < 7; i++) bounds[i] = 1;
    } else {
      let sum = 0;
      for (let i = 0; i < count; i++) sum += Math.max(hub.weights[i] ?? 1, 0.01);
      let acc = 0;
      for (let i = 0; i < count; i++) {
        bounds[i] = acc;
        acc += Math.max(hub.weights[i] ?? 1, 0.01) / sum;
      }
      for (let i = count; i < 7; i++) bounds[i] = 1;
    }

    const target = composite ? this.targets[1] : null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target?.fbo ?? null);
    gl.viewport(0, 0, this.width, this.height);
    const h = this.hub!;
    const u = h.uniforms;
    gl.useProgram(h.program);
    for (let i = 0; i < 6; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, this.slices[Math.min(i, count - 1)].tex);
      gl.uniform1i(u[`uS${i}`], i);
    }
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, this.live.tex);
    gl.uniform1i(u.uLive, 6);
    gl.uniform2f(u.uRes, this.width, this.height);
    gl.uniform1i(u.uCount, count);
    gl.uniform1i(u.uHover, hub.hovered);
    gl.uniform1fv(u.uBounds, bounds);
    gl.uniform1i(u.uLayout, hub.layout);
    gl.uniform3f(u.uGap, hub.seam[0], hub.seam[1], hub.seam[2]);
    gl.uniform1f(u.uDisc, hub.disc);
    gl.uniform1f(u.uRotate, hub.rotate ?? 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // The IRIS aperture (composite mode 0) opening from the cap onto the hub.
    if (composite) this.drawComposite(this.targets[0], this.targets[1], 0.5 + reveal * 0.5, 0);
  }

  /**
   * Frees GPU resources but keeps the context alive: the canvas hands back this same context on the
   * next mount (React dev mode mounts twice), and a force-lost context cannot compile shaders.
   */
  dispose() {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    for (const slot of [...this.slots, this.composite, this.hub]) {
      if (!slot) continue;
      for (const sh of slot.shaders) gl.deleteShader(sh);
      gl.deleteProgram(slot.program);
    }
    this.freeTargets([...this.targets, ...this.slices, ...(this.live ? [this.live] : [])]);
    gl.deleteVertexArray(this.vao);
    gl.deleteBuffer(this.buffer);
    this.targets = [];
    this.slices = [];
    this.live = null;
  }
}
