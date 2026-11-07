"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { World } from "../../data/worlds";
import { categoryOf, categoryShort, shortName, worldHref } from "./categories";
import { ProjectLinks } from "./notebook/ProjectLinks";
import { BattlecodeSlice } from "./hub/battlecodeSlice";
import { WorldRenderer } from "./WorldRenderer";

const STILL_TIME = 14; // shader clock used when the visitor prefers reduced motion
const MAX_PIXELS = 3_800_000; // render budget, roughly 2560 x 1480
const HOT = 1.4; // how much the hovered slice widens
const SPIN = 1 / 70; // turns per second while nothing is hovered
const PAN_SPEED = 38; // phones: CSS pixels per second the row of slices pans
const SEAM: [number, number, number] = [0.945, 0.937, 0.918]; // --nb-paper

type HomeStageProps = {
  worlds: World[];
};

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

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
  const count = Math.min(worlds.length, 6);
  // Phones: the row of slices pans by itself like a panorama; `centre` is the slice in the middle.
  const listRef = useRef<HTMLOListElement>(null);
  const centreRef = useRef(0);
  const [centre, setCentre] = useState(0);
  const panRef = useRef({ pos: -1, holdUntil: 0 });
  const rowDrag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  /** Stop the panorama for a while: the visitor is swiping or picked a slice. */
  const holdPan = useCallback((ms = 7000) => {
    panRef.current.holdUntil = performance.now() + ms;
    panRef.current.pos = -1;
  }, []);
  const pick = useCallback(
    (i: number) => {
      const list = listRef.current;
      const card = sliceRefs.current[i];
      if (!list || !card) return;
      holdPan(9000);
      list.scrollTo({ left: card.offsetLeft - (list.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
    },
    [holdPan],
  );

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
        // Phones: the slices are a row that pans by itself; each strip follows its card, the centred one is live.
        const list = listRef.current;
        const pan = panRef.current;
        if (list && !reduce && now > pan.holdUntil) {
          const max = list.scrollWidth - list.clientWidth;
          if (pan.pos < 0) pan.pos = list.scrollLeft;
          pan.pos += PAN_SPEED * dt;
          if (pan.pos >= max) {
            // End of the row: rest a moment, then glide back to the start.
            pan.pos = -1;
            pan.holdUntil = now + 4500;
            window.setTimeout(() => list.scrollTo({ left: 0, behavior: "smooth" }), 1800);
          } else {
            list.scrollLeft = pan.pos;
          }
        }
        hot = -1;
        const box = canvas.getBoundingClientRect();
        const w = Math.max(box.width, 1);
        const mid = box.left + w / 2;
        for (let i = 0; i < count; i++) {
          const el = sliceRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          bounds[i] = (r.left - box.left) / w;
          if (i === count - 1) bounds[count] = (r.right - box.left) / w;
          if (r.left <= mid && r.right > mid) hot = i;
        }
        if (hot >= 0 && hot !== centreRef.current) {
          centreRef.current = hot;
          setCentre(hot);
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
            // Keep the whole note on screen: an opened note near an edge would otherwise be cut off.
            const a2 = el.firstElementChild as HTMLElement | null;
            const hw = (a2?.offsetWidth ?? 0) / 2 + 14;
            const hh = (a2?.offsetHeight ?? 0) / 2 + 14;
            const x = Math.min(Math.max(vw / 2 + Math.sin(a) * R, hw), vw - hw);
            const y = Math.min(Math.max(vh / 2 - Math.cos(a) * R, hh), vh - hh);
            el.style.setProperty("--x", `${x}px`);
            el.style.setProperty("--y", `${y}px`);
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
              layout: bands ? 2 : 0,
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

  // Desktop: when scrolling comes to rest near the hub, glide onto it with an ease-in-out (a soft snap).
  useEffect(() => {
    const hub = hubRef.current;
    if (!hub) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let idle = 0;
    let raf = 0;
    let gliding = false;
    const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const stop = () => {
      cancelAnimationFrame(raf);
      gliding = false;
    };
    const glide = () => {
      const offset = hub.getBoundingClientRect().top;
      if (!wide.matches || Math.abs(offset) < 2 || Math.abs(offset) > window.innerHeight * 0.35) return;
      const from = window.scrollY;
      const to = from + offset;
      if (motion.matches) {
        window.scrollTo({ top: to, behavior: "instant" });
        return;
      }
      const start = performance.now();
      const ms = Math.min(900, 380 + Math.abs(offset) * 1.4);
      gliding = true;
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        window.scrollTo({ top: from + (to - from) * ease(k), behavior: "instant" });
        if (k < 1) raf = requestAnimationFrame(step);
        else gliding = false;
      };
      raf = requestAnimationFrame(step);
    };
    const onScroll = () => {
      if (gliding) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(glide, 140);
    };
    // Any input from the visitor takes over from the glide.
    const interrupt = () => {
      if (gliding) stop();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    return () => {
      stop();
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, []);

  // Keys 1-6 open a world; /#explore (and the old /#experience, /#projects links) scroll to the hub.
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
      if (hash === "explore" || hash === "experience" || hash === "projects") hubRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
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

  // Pointer over the hub: the wedge under it is the hot one; dragging from the centre spins the pizza.
  const onHubMove = (event: React.PointerEvent<HTMLElement>) => {
    const hub = hubRef.current;
    if (!hub || window.matchMedia("(max-width: 767px)").matches) return;
    const { f, d, r } = angleAt(event);
    const rot = rotRef.current;
    if (rot.dragging) {
      // A press on the centre disc has no angle yet: take it from the first move a little way out.
      if (Number.isNaN(rot.lastAngle) || d < 10) {
        if (d >= 10) rot.lastAngle = f;
        return;
      }
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
    // Only the centre disc starts a spin, so the slices stay plain links to hover and click.
    if (window.matchMedia("(max-width: 767px)").matches || !(event.target as HTMLElement).closest(".nb-hub-centre")) return;
    const rot = rotRef.current;
    rot.dragging = true;
    rot.moved = false;
    rot.velocity = 0;
    const start = angleAt(event);
    rot.lastAngle = start.d < 10 ? NaN : start.f;
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

  const hubTitle = "Explore my experiences and projects";

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

        <div className="nb-hub-centre nb-paper" aria-hidden="true">
          <span className="nb-hub-centre-text">Hold to rotate</span>
        </div>

        <div className="nb-hub-band">
          {/* The worlds, drawn only here: the canvas belongs to the hub, not the page. */}
          <canvas ref={canvasRef} className="nb-hub-canvas" aria-hidden="true" hidden={!webgl} />
          <ol
            ref={listRef}
            className="nb-hub-slices"
            onPointerDown={(event) => {
              holdPan();
              // Mouse drag scrolls the row too (touch already swipes natively).
              if (event.pointerType !== "mouse" || !listRef.current) return;
              rowDrag.current = { x: event.clientX, left: listRef.current.scrollLeft, moved: false };
            }}
            onPointerMove={(event) => {
              const drag = rowDrag.current;
              const list = listRef.current;
              if (!drag || !list) return;
              const dx = event.clientX - drag.x;
              if (Math.abs(dx) > 4) drag.moved = true;
              list.scrollLeft = drag.left - dx;
              holdPan();
            }}
            onPointerUp={() => {
              window.setTimeout(() => (rowDrag.current = null), 0);
            }}
            onPointerLeave={() => {
              rowDrag.current = null;
            }}
            onClickCapture={(event) => {
              // A drag that ends over a card must not open it.
              if (rowDrag.current?.moved) {
                event.preventDefault();
                event.stopPropagation();
              }
            }}
            onTouchStart={() => holdPan()}
            onWheel={() => holdPan()}
          >
            {worlds.slice(0, count).map((world, i) => {
              const category = categoryOf(world.id);
              const ready = (readyMask >> i) & 1;
              return (
                <li
                  key={world.id}
                  ref={(el) => {
                    sliceRefs.current[i] = el;
                  }}
                  className={`nb-slice ${hovered === i ? "is-hot" : ""} ${centre === i ? "is-centre" : ""}`}
                  data-world={world.id}
                >
                  <Link href={worldHref(world.id)} onFocus={() => hover(i)} onBlur={() => hover(-1)} onPointerEnter={() => hover(i)}>
                    <span className="head">
                      <span className="nb-mono num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="nb-chip" data-category={category}>
                        {categoryShort(world.id)}
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

        {/* Phones only: six numbered segments to pick a slice, with the current one named below. */}
        <nav className="nb-hub-picker" aria-label="Pick a project">
          <div className="segments">
            {worlds.slice(0, count).map((world, i) => (
              <button
                key={world.id}
                type="button"
                aria-label={shortName(world.name)}
                aria-current={centre === i ? "true" : undefined}
                data-category={categoryOf(world.id)}
                onClick={() => pick(i)}
              >
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="bar" aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="now" aria-live="polite">
            {shortName(worlds[centre]?.name ?? "")}
          </p>
        </nav>
      </section>
  );
}
