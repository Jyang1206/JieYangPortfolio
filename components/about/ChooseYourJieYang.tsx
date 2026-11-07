"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";
import { tagline } from "../../data/profile";
import { ContactLinks } from "../ContactLinks";
import { DrumStage } from "./DrumStage";
import { heroMoments, type HeroMoment } from "./moments";
import styles from "./ChooseYourJieYang.module.css";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/* Horizontal travel (px) that counts as a swipe rather than a tap. */
const SWIPE_PX = 40;

function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

type PrintProps = {
  moment: HeroMoment;
  depth: number;
  first: boolean;
  imgId: string;
  onMissing: (id: string) => void;
};

/* One photo in the stack. Tries each candidate file in order; a file that errors or decodes to
   nothing moves on to the next. When none loads, the placeholder initials show if the moment has
   them, otherwise the moment reports itself missing and leaves the stack. */
function Print({ moment, depth, first, imgId, onMissing }: PrintProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [attempt, setAttempt] = useState(0);
  const src = moment.srcs[attempt];
  const exhausted = src === undefined;

  /* Advance only past the file that failed, so an error reported twice skips nothing. */
  const fail = useCallback(
    (failed: string) =>
      setAttempt((i) => (moment.srcs[i] === failed ? i + 1 : i)),
    [moment.srcs],
  );

  useEffect(() => {
    if (exhausted) {
      if (!moment.placeholder) onMissing(moment.id);
      return;
    }
    /* Covers an error that happened before hydration attached the handlers. */
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) fail(src);
  }, [exhausted, src, fail, moment.id, moment.placeholder, onMissing]);

  const front = depth === 0;

  return (
    <span
      className={styles.print}
      data-depth={Math.min(depth, 2)}
      aria-hidden={front ? undefined : true}
    >
      {exhausted ? (
        <span
          className={styles.placeholder}
          id={front ? imgId : undefined}
          role="img"
          aria-label="Jie Yang"
        >
          <span className={styles.placeholderInitials} aria-hidden="true">
            {moment.placeholder}
          </span>
        </span>
      ) : (
        <Image
          key={src}
          ref={imgRef}
          id={front ? imgId : undefined}
          src={src}
          alt={front ? moment.alt : ""}
          fill
          sizes="(max-width: 879px) 82vw, 520px"
          preload={first}
          loading={first ? undefined : "eager"}
          draggable={false}
          className={styles.img}
          style={{ objectPosition: moment.objectPosition }}
          onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
            if (event.currentTarget.naturalWidth === 0) fail(src);
          }}
          onError={() => fail(src)}
        />
      )}
    </span>
  );
}

type ChooseYourJieYangProps = {
  /* The hero opens the page, so its title defaults to the page's h1. */
  as?: "h1" | "h2";
  moments?: HeroMoment[];
  id?: string;
  className?: string;
};

export function ChooseYourJieYang({
  as: Heading = "h1",
  moments = heroMoments,
  id = "hello",
  className = "",
}: ChooseYourJieYangProps) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const reduced = usePrefersReducedMotion();
  const frameRef = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ x: number; y: number; swiped: boolean } | null>(null);
  const titleId = useId();
  const imgId = useId();

  const visible = moments.filter((m) => !missing.includes(m.id));
  const n = visible.length;

  /* The current moment; if its photo went missing, the next one in the original order takes over. */
  let pos = visible.findIndex((m) => m.id === currentId);
  if (pos < 0 && currentId !== null) {
    const from = moments.findIndex((m) => m.id === currentId);
    pos = visible.findIndex((m) => moments.indexOf(m) > from);
  }
  if (pos < 0) pos = 0;
  const current: HeroMoment | undefined = visible[pos];
  const next = n > 1 ? visible[(pos + 1) % n] : undefined;
  const prev = n > 1 ? visible[(pos - 1 + n) % n] : undefined;

  const markMissing = useCallback((missingId: string) => {
    setMissing((list) =>
      list.includes(missingId) ? list : [...list, missingId],
    );
  }, []);

  const go = (delta: number) => {
    if (n < 2) return;
    setCurrentId(visible[(pos + delta + n) % n].id);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    swipe.current = { x: event.clientX, y: event.clientY, swiped: false };
  };
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const start = swipe.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      start.swiped = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onFrameClick = () => {
    /* A swipe already moved; swallow the click that follows it. */
    if (swipe.current?.swiped) {
      swipe.current = null;
      return;
    }
    swipe.current = null;
    go(1);
  };

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      data-moment={current?.id ?? "none"}
      className={`${styles.section} ${className}`}
    >
      {/* The drumming photo turns the whole hero into a gig: dark stage, sweeping lights, a crowd. */}
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.haze} />
        <span className={styles.crowd} />
      </div>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Heading id={titleId} className={styles.title}>
            <span className={styles.titleWord}>Hello! I&apos;m</span>{" "}
            <span className={styles.titleScript}>Jie Yang</span>
          </Heading>

          {current && (
            <div
              className={styles.moment}
              aria-live="polite"
              aria-atomic="true"
            >
              <p className={styles.srOnly}>
                Photo {pos + 1} of {n}.
              </p>
              <p key={`t-${current.id}`} className={styles.momentTitle}>
                {current.title}
              </p>
              <p key={`l-${current.id}`} className={styles.momentLine}>
                {current.line}
              </p>
            </div>
          )}

          {/* Who I am in a line, and how to reach me, without scrolling. */}
          <p className={styles.tagline}>{tagline}</p>
          <ContactLinks tone={current?.id === "supernova" ? "light" : "dark"} className={styles.contact} />
        </div>

        <div className={styles.visual}>
          <div className={styles.stage}>
            <div className={styles.arch}>
              <DrumStage
                scene={current?.scene ?? "calm"}
                still={reduced}
                holeRef={frameRef}
                className={styles.canvas}
              />
            </div>
            {current && (
              <button
                ref={frameRef}
                type="button"
                className={styles.frame}
                aria-label={next ? `Next photo: ${next.label}` : current.alt}
                aria-describedby={next ? imgId : undefined}
                onClick={onFrameClick}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  swipe.current = null;
                }}
              >
                {visible.map((m, i) => (
                  <Print
                    key={m.id}
                    moment={m}
                    depth={(i - pos + n) % n}
                    first={i === 0}
                    imgId={imgId}
                    onMissing={markMissing}
                  />
                ))}
              </button>
            )}
          </div>
          {n > 1 && (
            <div className={styles.controls}>
              <p className={styles.hint}>
                <span>Click to see other photos of me</span>
              </p>
              <button
                type="button"
                className={styles.step}
                aria-label={`Previous photo: ${prev?.label}`}
                onClick={() => go(-1)}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    d="M10 3 5 8l5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <div className={styles.dots}>
                {visible.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    className={styles.dot}
                    aria-label={`Show photo: ${m.label}`}
                    aria-current={i === pos ? "true" : undefined}
                    onClick={() => setCurrentId(m.id)}
                  >
                    <span aria-hidden="true" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.step}
                aria-label={`Next photo: ${next?.label}`}
                onClick={() => go(1)}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
