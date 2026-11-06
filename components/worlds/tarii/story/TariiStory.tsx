"use client";

/* eslint-disable @next/next/no-img-element -- sprites, walk frames and captures are sized and swapped by the loop's CSS, not next/image. */
import {
  BatteryFull,
  Check,
  CircleCheck,
  Coffee,
  HeartPulse,
  type LucideIcon,
  Moon,
  Plane,
  Signal,
  Sun,
  Sunset,
  Wifi,
} from "lucide-react";
import {
  type CSSProperties,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ACTORS,
  type ActorId,
  CARD_LABEL,
  COVER_AT,
  type CardKind,
  MOMENTS,
  MONTH_DAYS,
  MONTH_OFFSET,
  type Mark,
  PUBLISHED_FROM,
  cardsAt,
} from "./loopModel";
import { TariiWord } from "./TariiWord";
import "./tarii-loop.css";

const SPRITES = "/tarii-story/characters/";
/** How long each moment holds before the next one. */
const MOMENT_MS = 5600;
/** On the cover moment: how long before Maya accepts and the cover lands. */
const ACCEPT_MS = 2000;
/** One walk across the stage (matches the CSS `left` transition). */
const WALK_MS = 1000;
/** Where someone off stage waits: past the nearer edge. */
const OFF_LEFT = -12;
const OFF_RIGHT = 112;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CELLS = Array.from({ length: 35 }, (_, i) => i - MONTH_OFFSET + 1);
const RINGS = Array.from({ length: 14 }, (_, i) => `ring-${i}`);
const WALK_FRAMES = ["walk-a", "walk-c", "walk-b", "walk-d"];
const NAMES: Record<ActorId | "team", string> = {
  maya: "Maya",
  jo: "Jo",
  alex: "Alex",
  sam: "Sam",
  team: "Team member",
};
const ICONS: Record<CardKind, LucideIcon> = {
  leave: Plane,
  off: Coffee,
  pref: Sunset,
  day: Sun,
  night: Moon,
  sick: HeartPulse,
  cover: CircleCheck,
};

const LAST = MOMENTS.length - 1;

function subscribeReduced(change: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", change);
  return () => mq.removeEventListener("change", change);
}
const readReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Positions = Record<ActorId, number>;
const IDS = ACTORS.map((a) => a.id);
const offEdge = (x: number) => (x < 50 ? OFF_LEFT : OFF_RIGHT);

/** Where everyone stands once `moment` has settled; anyone off stage waits past the left edge. */
function restingAt(moment: number): Positions {
  const marks = MOMENTS[moment].actors;
  return Object.fromEntries(IDS.map((id) => [id, marks[id]?.x ?? OFF_LEFT])) as Positions;
}

/**
 * The walk from one moment to the next. `start` places newcomers, unseen, past
 * the edge nearer their mark; `to` is where everyone ends. Leavers walk out
 * past the edge nearer where they stood.
 */
function walkTo(from: Positions, next: number) {
  const marks = MOMENTS[next].actors;
  const start = { ...from };
  const to = { ...from };
  for (const id of IDS) {
    const mark = marks[id];
    const away = from[id] < 0 || from[id] > 100;
    if (mark) {
      if (away) start[id] = offEdge(mark.x);
      to[id] = mark.x;
    } else if (!away) {
      to[id] = offEdge(from[id]);
    }
  }
  return { start, to };
}

/**
 * Tarii, as a phone and the team's calendar. A loop of six moments plays by
 * itself: a member asks for leave, the roster goes out, a sick day opens a
 * seat and a teammate takes it. The phone shows each moment and the floating
 * desk calendar updates in step, while the team walk in and out around it.
 * Hover the calendar or phone to turn them, a day for its details, a person
 * for their name, a hovering screen to enlarge it. The loop rests while it is
 * off screen; with reduced motion it shows the month settled, with the six
 * moments written out.
 */
export function TariiStory() {
  const calm = useSyncExternalStore(subscribeReduced, readReduced, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [moment, setMoment] = useState(0);
  const [accepted, setAccepted] = useState(false);
  // Where everyone stands, and who is parked off stage (moved there with no
  // transition, so a newcomer never slides across the stage unseen).
  const [cast, setCast] = useState<{ pos: Positions; parked: ActorId[] }>(() => ({
    pos: restingAt(0),
    parked: IDS.filter((id) => !MOMENTS[0].actors[id]),
  }));
  const pos = cast.pos;
  // Who is mid-walk, and who of them walks towards the left.
  const [walk, setWalk] = useState<{ ids: ActorId[]; left: ActorId[] }>({ ids: [], left: [] });
  const [onScreen, setOnScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const running = onScreen && pageVisible && !calm;

  // Rest while off screen or in a background tab.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), {
      threshold: 0.15,
    });
    io.observe(root);
    const vis = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  // The loop: each moment holds, then the next one comes in.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      const next = moment === LAST ? 0 : moment + 1;
      const { start, to } = walkTo(pos, next);
      const ids = IDS.filter((id) => start[id] !== to[id]);
      const gone = IDS.filter((id) => !MOMENTS[next].actors[id] && (pos[id] < 0 || pos[id] > 100));
      // Newcomers jump, parked and unseen, to the edge they enter from; two
      // frames later everyone walks to their mark.
      setCast({ pos: start, parked: IDS.filter((id) => pos[id] < 0 || pos[id] > 100) });
      setMoment(next);
      setAccepted(false);
      setWalk({ ids, left: ids.filter((id) => to[id] < start[id]) });
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(() => setCast({ pos: to, parked: gone })),
      );
    }, MOMENT_MS);
    return () => window.clearTimeout(t);
  }, [running, moment, pos]);

  // The cover moment: Maya accepts a moment after it opens.
  useEffect(() => {
    if (moment !== COVER_AT || accepted || !running) return;
    const t = window.setTimeout(() => setAccepted(true), ACCEPT_MS);
    return () => window.clearTimeout(t);
  }, [moment, accepted, running]);

  // Walkers stop and take their pose once they arrive.
  useEffect(() => {
    if (!walk.ids.length) return;
    const t = window.setTimeout(() => setWalk({ ids: [], left: [] }), WALK_MS + 60);
    return () => window.clearTimeout(t);
  }, [walk]);

  // Reduced motion: the month settled, everything on the calendar.
  const shown = calm ? LAST : moment;
  const covered = calm || shown > COVER_AT || (shown === COVER_AT && accepted);
  const scene = MOMENTS[shown];
  const places = calm ? restingAt(LAST) : pos;
  const parked = calm ? IDS.filter((id) => !MOMENTS[LAST].actors[id]) : cast.parked;

  // Pointer turn: the calendar and the phone face the pointer a little.
  function tilt(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || calm) return;
    const stage = stageRef.current;
    if (!stage) return;
    const read = (selector: string, vx: string, vy: string) => {
      const el = stage.querySelector<HTMLElement>(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));
      el.style.setProperty(vx, clamp((e.clientX - (r.left + r.width / 2)) / r.width).toFixed(3));
      el.style.setProperty(vy, clamp((e.clientY - (r.top + r.height / 2)) / r.height).toFixed(3));
    };
    read(".hs-device", "--hs-tx", "--hs-ty");
    read(".tsy-phone", "--hs-px", "--hs-py");
  }
  function untilt() {
    const stage = stageRef.current;
    for (const p of ["--hs-tx", "--hs-ty"]) stage?.querySelector<HTMLElement>(".hs-device")?.style.setProperty(p, "0");
    for (const p of ["--hs-px", "--hs-py"]) stage?.querySelector<HTMLElement>(".tsy-phone")?.style.setProperty(p, "0");
  }

  return (
    <div className="tsy" data-note="Phone and calendar" ref={rootRef} data-calm={calm ? "" : undefined}>
      <div className="tsy-stage" ref={stageRef} onPointerMove={tilt} onPointerLeave={untilt}>
        <div className="tsy-floor" aria-hidden="true" />
        {/* The rotating caption; screen readers get the written list below. */}
        <div className="tsy-caption" aria-hidden="true">
          <p className="tsy-eyebrow">
            How <TariiWord /> works
            {calm ? null : (
              <span className="tsy-count">
                {shown + 1} / {MOMENTS.length}
              </span>
            )}
          </p>
          {calm ? (
            <p className="tsy-title">One month, on the phone and the calendar</p>
          ) : (
            <div key={shown} className="tsy-caption-in">
              <p className="tsy-title">{scene.title}</p>
              <p className="tsy-text">{scene.text}</p>
            </div>
          )}
          {calm ? null : (
            <div className="tsy-dots">
              {MOMENTS.map((m, i) => (
                <i key={m.title} className={i === shown ? "is-on" : i < shown ? "is-done" : undefined} />
              ))}
            </div>
          )}
        </div>

        <div className="tsy-scene">
          <img className="tsy-plant" src={`${SPRITES}props/plant.svg`} alt="" aria-hidden="true" />
          <div className="hs-device">
            <DeskCalendar moment={shown} covered={covered} fresh={!calm} />
          </div>

          {!calm && scene.float ? (
            <button
              type="button"
              key={scene.float.src}
              className="tsy-float"
              aria-label={`The planner's screen: ${scene.float.alt}`}
            >
              <span className="tsy-float-frame">
                <img src={scene.float.src} alt="" width={1100} height={825} loading="lazy" decoding="async" draggable={false} />
              </span>
            </button>
          ) : null}

          {ACTORS.map(({ id, role }) => {
            const mark: Mark | undefined = scene.actors[id];
            const x = places[id];
            const off = !mark;
            const walking = !calm && walk.ids.includes(id);
            return (
              <div
                key={id}
                className={`hs-actor hs-actor-${id}${walking ? " hs-walking" : ""}${off ? " hs-out" : ""}${parked.includes(id) ? " hs-parked" : ""}${x > 50 ? " hs-say-left" : ""}`}
                style={{ "--hs-ax": `${x}%` } as CSSProperties}
                aria-hidden="true"
              >
                {mark?.say && !walking && !calm ? (
                  <span className="hs-say" key={`${shown}-${mark.say}`}>
                    {mark.say}
                  </span>
                ) : null}
                {walking ? (
                  <span className={`hs-walk${walk.left.includes(id) ? " hs-flip" : ""}`}>
                    {WALK_FRAMES.map((f) => (
                      <img key={f} src={`${SPRITES}${id}/${f}.svg`} alt="" draggable={false} />
                    ))}
                  </span>
                ) : (
                  <img src={`${SPRITES}${id}/${mark?.pose ?? "idle"}.svg`} alt="" draggable={false} />
                )}
                <span className="hs-tag">
                  <strong>{NAMES[id]}</strong>
                  {role}
                </span>
              </div>
            );
          })}
        </div>

        <div className="tsy-phone" aria-hidden="true">
          <div className="hs-handset-frame">
            <i className="hs-handset-key hs-handset-key-a" />
            <i className="hs-handset-key hs-handset-key-b" />
            <i className="hs-handset-key hs-handset-key-c" />
            <div className="hs-handset-screen">
              <div className="hs-handset-status">
                <span>9:41</span>
                <i className="hs-handset-island" />
                <span className="hs-handset-icons">
                  <Signal size={12} strokeWidth={2.4} />
                  <Wifi size={12} strokeWidth={2.4} />
                  <BatteryFull size={15} strokeWidth={2} />
                </span>
              </div>
              <div className="tsy-screens">
                {MOMENTS.map((m, i) => {
                  const on = i === (calm ? 2 : shown);
                  // Only this screen and its neighbours stay in the page.
                  if (!on && Math.abs(i - shown) > 1 && !(shown === 0 && i === LAST)) return null;
                  return m.screen === "cover" ? (
                    <CoverScreen key="cover" on={on} accepted={covered} />
                  ) : (
                    <img
                      key={m.screen.src}
                      src={m.screen.src}
                      alt=""
                      className={on ? "is-on" : undefined}
                      decoding="async"
                      draggable={false}
                    />
                  );
                })}
              </div>
              <i className="hs-handset-home" />
            </div>
          </div>
        </div>
      </div>

      <ol className="tsy-steps">
        {MOMENTS.map((m) => (
          <li key={m.title}>
            <strong>{m.title}.</strong> {m.text}
          </li>
        ))}
      </ol>
    </div>
  );
}

function DeskCalendar({ moment, covered, fresh }: { moment: number; covered: boolean; fresh: boolean }) {
  const cards = cardsAt(moment, covered);
  const openSeat = moment === COVER_AT && !covered;
  return (
    <div className="hs-calendar" aria-hidden="true">
      <div className="hs-cal-back" />
      <div className="hs-cal-paper">
        <i className="hs-cal-side" />
        <i className="hs-cal-base" />
        <div className="hs-rings">
          {RINGS.map((r) => (
            <i key={r} />
          ))}
        </div>
        <div className="hs-cal-head">
          <p>
            October <span>2026</span>
          </p>
          {moment >= PUBLISHED_FROM ? (
            <span className="hs-published">
              <CircleCheck size={13} /> Published
            </span>
          ) : null}
          <TariiWord />
        </div>
        <div className="hs-cal-grid">
          {WEEKDAYS.map((d) => (
            <span className="hs-weekday" key={d}>
              {d}
            </span>
          ))}
          {CELLS.map((day) => {
            if (day < 1 || day > MONTH_DAYS) return <span className="hs-blank" key={`b${day}`} />;
            const here = cards.filter((c) => c.day === day);
            const tip = here.map((c) => `${NAMES[c.who]}: ${CARD_LABEL[c.kind]}`).join(" · ");
            return (
              <span
                className={`hs-day${here.length ? " hs-day-busy" : ""}${openSeat && day === 22 ? " hs-day-swap" : ""}`}
                key={day}
              >
                <b>{day}</b>
                {here.map((c) => {
                  const Icon = ICONS[c.kind];
                  return (
                    <span
                      key={`${c.kind}-${c.who}`}
                      className={`hs-card hs-card-${c.kind}${fresh && c.from === moment ? " hs-card-new" : ""}`}
                      style={{ "--hs-delay": `${(day % 9) * 70}ms` } as CSSProperties}
                    >
                      <Icon size={10} strokeWidth={2} />
                      <em>{CARD_LABEL[c.kind]}</em>
                      <img src={`${SPRITES}avatars/${c.who}-happy.svg`} alt="" />
                    </span>
                  );
                })}
                {tip ? (
                  <span className="hs-tip">
                    <strong>{day} October</strong>
                    {tip}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** The phone's cover request, drawn in Tarii's style: Alex's seat on the 22nd, and Maya taking it. */
function CoverScreen({ on, accepted }: { on: boolean; accepted: boolean }) {
  return (
    <div className={`tsy-cover${on ? " is-on" : ""}`}>
      <p className="tsy-cover-top">Inbox</p>
      <p className="tsy-cover-label">Needs you</p>
      <div className="tsy-cover-card">
        <div className="tsy-cover-who">
          <img src={`${SPRITES}avatars/alex-happy.svg`} alt="" />
          <span>
            <strong>Alex is off sick</strong>
            <em>Thu 22 Oct · Day shift</em>
          </span>
        </div>
        <p>You are free that day. Take the seat?</p>
        {accepted ? (
          <p className="tsy-cover-done">
            <Check size={14} strokeWidth={2.6} /> You are covering Thu 22 Oct
          </p>
        ) : (
          <div className="tsy-cover-actions">
            <span className="tsy-cover-yes">Take the seat</span>
            <span className="tsy-cover-no">Not this time</span>
          </div>
        )}
      </div>
      <p className="tsy-cover-label">Updates</p>
      <div className="tsy-cover-row">Your shifts for 12–25 Oct 2026 are published</div>
    </div>
  );
}
