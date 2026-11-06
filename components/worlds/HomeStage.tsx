"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { World } from "../../data/worlds";
import { CATEGORIES, categoryLabel, categoryOf, shortName, worldHref, type Category } from "./categories";
import { ProjectLinks } from "./notebook/ProjectLinks";
import { BattlecodeSlice } from "./hub/battlecodeSlice";
import { WorldRenderer } from "./WorldRenderer";

const STILL_TIME = 14; // shader clock used when the visitor prefers reduced motion
const MAX_PIXELS = 3_800_000; // render budget, roughly 2560 x 1480
const HOT = 1.4; // how much the hovered slice widens
const SPIN = 1 / 70; // turns per second while nothing is hovered
const SEAM: [number, number, number] = [0.945, 0.937, 0.918]; // --nb-paper

type HomeStageProps = {
  worlds: World[];
};

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const filterOf = (hash: string): Category | null => (hash === "experience" ? "experience" : hash === "projects" ? "project" : null);

/**
 * The hub: the six worlds cut like a pizza on one WebGL canvas, each slice a window onto exactly one world.
 * It turns slowly until a slice is hovered, can be spun by hand, and opens from the lens cap as the intro
 * above it scrolls away.
 */
export function HomeStage({ worlds }: HomeStageProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hubRef = useRef<HTMLElement>(null);
  const sliceRefs = useRef<(HTMLLIElement | null)[]>([]);
  const hoveredRef = useRef(-1);
  const rotRef = useRef({ turn: 0, velocity: 0, dragging: false, lastAngle: 0, lastTime: 0, moved: false });
  const [hovered, setHovered] = useState(-1);
  const [dragging, setDragging] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [readyMask, setReadyMask] = useState(0);
  const [filter, setFilter] = useState<Category | null>(null);
  const count = Math.min(worlds.length, 6);

  const hover = useCallback((i: number) => {
    if (hoveredRef.current === i) return;
    hoveredRef.current = i;
    setHovered(i);
  }, []);

  // Render loop: the lens cap's aperture opens onto the hub as it scrolls into view.
  useEffect(() => {
    const canvas = canvasRef.current;
    const hub = hubRef.current;
    if (!canvas || !hub) return;

    let renderer = WorldRenderer.create(canvas);
    if (!renderer) setWebgl(false);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    // Battlecode's match is drawn by its overlay, not its shader, so the hub draws the replay itself.
    const bcIndex = worlds.findIndex((world) => world.id === "battlecode");
    const bc = bcIndex >= 0 && bcIndex < count ? new BattlecodeSlice(motion.matches) : null;
    if (bc) renderer?.setStill(bcIndex, bc.canvas);
    const onLost = (event: Event) => {
      event.preventDefault();
      renderer = null;
    };
    const onRestored = () => {
      renderer = WorldRenderer.create(canvas);
      renderer?.resize(canvas.width, canvas.height);
      if (bc) renderer?.setStill(bcIndex, bc.canvas);
      setWebgl(Boolean(renderer));
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(hub);
    // Compile the six worlds while the hub is still a screen away.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) renderer?.prefetchHub(count);
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(hub);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / Math.max(w * h, 1)));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      renderer?.resize(canvas.width, canvas.height);
      bc?.resize(canvas.width / 2, canvas.height / 2);
    };
    resize();
    window.addEventListener("resize", resize);
    const onMotion = () => bc?.setStill(motion.matches);
    motion.addEventListener("change", onMotion);

    const clock = performance.now();
    const weights = new Float32Array(count).fill(1);
    const bounds = new Float32Array(count + 1);
    let mask = 0;
    let frame = 0;
    let last = clock;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!visible) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const reduce = motion.matches;
      const time = reduce ? STILL_TIME : (now - clock) / 1000;
      const bands = narrow.matches;

      // The aperture opens as the hub rises into view.
      const hubTop = hub.getBoundingClientRect().top;
      const reveal = clamp01(1 - hubTop / Math.max(vh, 1));

      // Rotation: a slow turn, paused while a slice is hovered; a flick keeps spinning and settles.
      const rot = rotRef.current;
      let hot = hoveredRef.current;
      if (!bands && !reduce && !rot.dragging) {
        if (Math.abs(rot.velocity) > 0.002) {
          rot.turn += rot.velocity * dt;
          rot.velocity *= Math.pow(0.15, dt);
        } else if (hot < 0) {
          rot.turn += SPIN * dt;
        }
        rot.turn = ((rot.turn % 1) + 1) % 1;
      }

      if (bands) {
        // Narrow screens: bands follow the rows on the page; the row at the middle of the screen is live.
        hot = -1;
        for (let i = 0; i < count; i++) {
          const el = sliceRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          bounds[i] = r.top / vh;
          if (i === count - 1) bounds[count] = r.bottom / vh;
          if (r.top <= vh * 0.5 && r.bottom > vh * 0.5) hot = i;
        }
      } else {
        for (let i = 0; i < count; i++) {
          const target = i === hot ? HOT : 1;
          weights[i] += (target - weights[i]) * (reduce ? 1 : 0.14);
        }
        // Place each slice's note at the middle of its wedge, upright, following the rotation.
        let sum = 0;
        for (let i = 0; i < count; i++) sum += weights[i];
        const R = Math.min(vw, vh) * 0.4;
        let acc = 0;
        for (let i = 0; i < count; i++) {
          const a = ((acc + weights[i] / 2) / sum + rot.turn) * Math.PI * 2;
          acc += weights[i];
          const el = sliceRefs.current[i];
          if (el) {
            el.style.setProperty("--x", `${vw / 2 + Math.sin(a) * R}px`);
            el.style.setProperty("--y", `${vh / 2 - Math.cos(a) * R}px`);
          }
        }
      }

      if (bc && renderer && reveal > 0 && bc.update(now)) renderer.touchStill(bcIndex);
      if (renderer) {
        if (reveal <= 0) {
          renderer.render({ kind: "steady", world: worlds.length }, time);
        } else {
          renderer.renderHub(
            {
              count,
              hovered: hot,
              weights,
              bounds: bands ? bounds : undefined,
              layout: bands ? 1 : 0,
              seam: SEAM,
              disc: Math.min(vw, vh) * 0.07 * (canvas.width / Math.max(vw, 1)),
              reveal: reduce ? (reveal > 0.5 ? 1 : 0) : reveal,
              rotate: rot.turn,
            },
            time,
          );
        }
        let m = 0;
        for (let i = 0; i < count; i++) if (reveal > 0 && renderer.ready(i)) m |= 1 << i;
        if (m !== mask) {
          mask = m;
          setReadyMask(m);
        }
      } else {
        canvas.parentElement!.style.background = "#101114";
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      near.disconnect();
      motion.removeEventListener("change", onMotion);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
    };
  }, [count, worlds]);

  // Keys 1-6 open a world; /#<world id> does the same; /#experience and /#projects filter the hub.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= worlds.length) {
        event.preventDefault();
        router.push(worldHref(worlds[n - 1].id));
      }
    };
    const onHash = () => {
      const hash = window.location.hash.slice(1);
      const f = filterOf(hash);
      setFilter(f);
      if (f || hash === "explore") hubRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    onHash();
    window.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("hashchange", onHash);
    };
  }, [router, worlds]);

  const angleAt = (event: React.PointerEvent<HTMLElement>) => {
    const r = hubRef.current!.getBoundingClientRect();
    const x = event.clientX - (r.left + r.width / 2);
    const y = event.clientY - (r.top + r.height / 2);
    return { f: (Math.atan2(x, -y) / (Math.PI * 2) + 1) % 1, d: Math.hypot(x, y), r };
  };

  // Pointer over the hub: the wedge under it is the hot one; a drag spins the pizza.
  const onHubMove = (event: React.PointerEvent<HTMLElement>) => {
    const hub = hubRef.current;
    if (!hub || window.matchMedia("(max-width: 767px)").matches) return;
    const { f, d, r } = angleAt(event);
    const rot = rotRef.current;
    if (rot.dragging) {
      let delta = f - rot.lastAngle;
      if (delta > 0.5) delta -= 1;
      if (delta < -0.5) delta += 1;
      const now = performance.now();
      rot.turn = (((rot.turn + delta) % 1) + 1) % 1;
      rot.velocity = delta / Math.max((now - rot.lastTime) / 1000, 0.016);
      rot.lastAngle = f;
      rot.lastTime = now;
      if (Math.abs(delta) > 0.002) rot.moved = true;
      hover(-1);
      return;
    }
    if (event.pointerType === "touch") return;
    if (d < Math.min(r.width, r.height) * 0.07) {
      hover(-1);
      return;
    }
    const local = (f - rot.turn + 1) % 1;
    const w = worlds.slice(0, count).map((_, i) => (i === hoveredRef.current ? HOT : 1));
    const sum = w.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let i = 0; i < count; i++) {
      acc += w[i] / sum;
      if (local < acc) {
        hover(i);
        return;
      }
    }
    hover(count - 1);
  };
  const onHubDown = (event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(max-width: 767px)").matches || (event.target as HTMLElement).closest("a")) return;
    const rot = rotRef.current;
    rot.dragging = true;
    rot.moved = false;
    rot.velocity = 0;
    rot.lastAngle = angleAt(event).f;
    rot.lastTime = performance.now();
    hubRef.current?.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const onHubUp = (event: React.PointerEvent<HTMLElement>) => {
    const rot = rotRef.current;
    if (!rot.dragging) return;
    rot.dragging = false;
    setDragging(false);
    hubRef.current?.releasePointerCapture(event.pointerId);
    if (performance.now() - rot.lastTime > 120) rot.velocity = 0;
  };

  const hubTitle = filter === "experience" ? "Professional experience" : filter === "project" ? "Projects and hackathons" : "Explore my experiences and projects";
  const shownBy = (world: World) => !filter || categoryOf(world.id) === filter || (filter === "project" && categoryOf(world.id) === "hackathon");

  return (
    <section
        ref={hubRef}
        id="explore"
        className={`nb-hub ${dragging ? "is-dragging" : ""}`}
        aria-labelledby="hub-title"
        onPointerMove={onHubMove}
        onPointerDown={onHubDown}
        onPointerUp={onHubUp}
        onPointerCancel={onHubUp}
        onPointerLeave={(event) => {
          onHubUp(event);
          hover(-1);
        }}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a") || rotRef.current.moved) return;
          if (hoveredRef.current >= 0) router.push(worldHref(worlds[hoveredRef.current].id));
        }}
      >
        <div className="nb-hub-title nb-paper">
          <h2 id="hub-title" className="nb-display">
            {hubTitle}
          </h2>
        </div>

        <div className="nb-hub-centre nb-paper" aria-hidden="true" />

        <div className="nb-hub-band">
          {/* The worlds, drawn only here: the canvas belongs to the hub, not the page. */}
          <canvas ref={canvasRef} className="nb-hub-canvas" aria-hidden="true" hidden={!webgl} />
          <ol className="nb-hub-slices">
            {worlds.slice(0, count).map((world, i) => {
              const category = categoryOf(world.id);
              const ready = (readyMask >> i) & 1;
              const dim = !shownBy(world);
              return (
                <li
                  key={world.id}
                  ref={(el) => {
                    sliceRefs.current[i] = el;
                  }}
                  className={`nb-slice ${hovered === i ? "is-hot" : ""} ${dim ? "is-dim" : ""}`}
                  data-world={world.id}
                >
                  <Link href={worldHref(world.id)} onFocus={() => hover(i)} onBlur={() => hover(-1)} onPointerEnter={() => hover(i)}>
                    <span className="head">
                      <span className="nb-mono num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="nb-chip" data-category={category}>
                        {categoryLabel(world.id)}
                      </span>
                    </span>
                    <span className="name">{shortName(world.name)}</span>
                    <span className="more">
                      <span className="excerpt">{world.excerpt}</span>
                      <span className="go nb-label">
                        Open <ArrowUpRight size={12} aria-hidden="true" />
                      </span>
                      {!ready && <span className="nb-mono waiting">world still loading</span>}
                    </span>
                  </Link>
                  {hovered === i && <ProjectLinks worldId={world.id} show="site" className="nb-slice-links" />}
                </li>
              );
            })}
          </ol>
        </div>

        <ul className="nb-hub-legend nb-paper" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link
                href={c.id === "experience" ? "/#experience" : "/#projects"}
                className={`nb-legend-item ${filter && filter !== c.id && !(filter === "project" && c.id === "hackathon") ? "is-off" : ""}`}
                data-category={c.id}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
  );
}
