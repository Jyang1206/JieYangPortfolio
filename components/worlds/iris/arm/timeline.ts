/**
 * The simulated IRIS sorting loop: tray layout, rack slots and the timed schedule shared by the 3D arm and
 * the detections panel. Pure data and functions (no three.js), so the panel stays light.
 *
 * Robot frame: metres, x forward from the arm, y to the arm's left, z up; the table top is z = 0.
 */

export type InstrumentKind = "artery-forceps" | "iris-scissors" | "scalpel-handle" | "tissue-forceps" | "needle-holder";

export type Instrument = {
  id: InstrumentKind;
  label: string;
  track: number;
  /** Centre on the tray and direction of the long axis (radians, robot frame). */
  x: number;
  y: number;
  yaw: number;
  /** Height of its underside: 0 on the drape, raised when it rests across another instrument. */
  lift: number;
  /** Where the fingers close, measured along the long axis from the centre. */
  grip: number;
  /** Rack slot assigned by the selected set. */
  slot: number;
  restsOn?: InstrumentKind;
};

/** Thickness of a flat instrument where the gripper holds it. */
export const INSTRUMENT_THICKNESS = 0.005;
export const DRAPE_TOP = 0.006;

export const TRAY = { x: 0.46, y: -0.03, width: 0.34, depth: 0.46 };

// Two contact pairs: the artery forceps cross the scalpel handle, the tissue forceps cross the needle holder.
export const INSTRUMENTS: Instrument[] = [
  { id: "scalpel-handle", label: "scalpel handle", track: 7, x: 0.44, y: -0.17, yaw: 0.3, lift: 0, grip: -0.02, slot: 2 },
  { id: "artery-forceps", label: "artery forceps", track: 3, x: 0.47, y: -0.135, yaw: 1.75, lift: INSTRUMENT_THICKNESS, grip: -0.005, slot: 0, restsOn: "scalpel-handle" },
  { id: "needle-holder", label: "needle holder", track: 12, x: 0.55, y: 0.04, yaw: -0.25, lift: 0, grip: -0.005, slot: 4 },
  { id: "tissue-forceps", label: "tissue forceps", track: 9, x: 0.515, y: 0.06, yaw: 1.3, lift: INSTRUMENT_THICKNESS, grip: 0.0, slot: 3, restsOn: "needle-holder" },
  { id: "iris-scissors", label: "iris scissors", track: 4, x: 0.375, y: 0.1, yaw: 2.35, lift: 0, grip: -0.01, slot: 1 },
];

/** Topmost first: what the contact graph allows at each pick (anything resting on an instrument goes before it). */
export const PICK_ORDER: InstrumentKind[] = ["artery-forceps", "tissue-forceps", "scalpel-handle", "iris-scissors", "needle-holder"];

export const BY_ID = Object.fromEntries(INSTRUMENTS.map((i) => [i.id, i])) as Record<InstrumentKind, Instrument>;

/** Sorting rack beside the tray: slots run along x, instruments lie across the rack along y. */
export const RACK = { x: 0.36, y: 0.37, length: 0.4, width: 0.17, height: 0.03, pitch: 0.074 };

export const RACK_SLOTS = 5;

/** Where an instrument rests in its rack slot: centred on the slot, long axis across the rack. */
export function slotPose(slot: number) {
  return { x: RACK.x + (slot - (RACK_SLOTS - 1) / 2) * RACK.pitch, y: RACK.y, yaw: Math.PI / 2 };
}

export const STEPS = ["Survey", "Detect", "Confirm identity", "Order", "Plan + approve", "Pick + place"] as const;

export type SegmentKind =
  | "survey"
  | "detect"
  | "identity"
  | "order"
  | "plan"
  | "approach"
  | "descend"
  | "close"
  | "lift"
  | "carry"
  | "lower"
  | "open"
  | "retreat"
  | "return"
  | "done"
  | "reset";

/** Keyframes the arm moves between; `pick` says whose grasp or place pose. */
export type Keyframe = { kind: "survey" } | { kind: "aboveGrasp" | "grasp" | "abovePlace" | "place"; pick: number };

export type Segment = {
  kind: SegmentKind;
  pick: number;
  start: number;
  duration: number;
  from: Keyframe;
  to: Keyframe;
  /** Index into STEPS, or -1 outside the pipeline (tray reset). */
  step: number;
};

// Seconds. Perception steps run longer on the first pick so a visitor can read them, then quicken.
const PERCEPTION_FIRST: [SegmentKind, number][] = [
  ["survey", 1.1],
  ["detect", 0.9],
  ["identity", 0.9],
  ["order", 1.0],
  ["plan", 1.0],
];
const PERCEPTION_LATER: [SegmentKind, number][] = [
  ["survey", 0.7],
  ["detect", 0.5],
  ["identity", 0.5],
  ["order", 0.7],
  ["plan", 0.6],
];
// Approach and carry are the long joint-space moves; descend/lift/lower are short vertical moves.
const MOTION: [SegmentKind, number, Keyframe["kind"], Keyframe["kind"]][] = [
  ["approach", 1.2, "survey", "aboveGrasp"],
  ["descend", 0.65, "aboveGrasp", "grasp"],
  ["close", 0.4, "grasp", "grasp"],
  ["lift", 0.6, "grasp", "aboveGrasp"],
  ["carry", 1.5, "aboveGrasp", "abovePlace"],
  ["lower", 0.6, "abovePlace", "place"],
  ["open", 0.35, "place", "place"],
  ["retreat", 0.45, "place", "abovePlace"],
  ["return", 1.2, "abovePlace", "survey"],
];
const DONE_HOLD = 1.6;
const RESET = 2.2;

const STEP_OF: Partial<Record<SegmentKind, number>> = { survey: 0, detect: 1, identity: 2, order: 3, plan: 4 };

function keyframe(kind: Keyframe["kind"], pick: number): Keyframe {
  return kind === "survey" ? { kind } : { kind, pick };
}

function buildSchedule(): { segments: Segment[]; cycle: number } {
  const segments: Segment[] = [];
  let t = 0;
  const survey: Keyframe = { kind: "survey" };
  PICK_ORDER.forEach((_, pick) => {
    for (const [kind, duration] of pick === 0 ? PERCEPTION_FIRST : PERCEPTION_LATER) {
      segments.push({ kind, pick, start: t, duration, from: survey, to: survey, step: STEP_OF[kind] ?? 0 });
      t += duration;
    }
    for (const [kind, duration, from, to] of MOTION) {
      segments.push({ kind, pick, start: t, duration, from: keyframe(from, pick), to: keyframe(to, pick), step: 5 });
      t += duration;
    }
  });
  const end = PICK_ORDER.length;
  segments.push({ kind: "done", pick: end, start: t, duration: DONE_HOLD, from: survey, to: survey, step: -1 });
  t += DONE_HOLD;
  segments.push({ kind: "reset", pick: end, start: t, duration: RESET, from: survey, to: survey, step: -1 });
  t += RESET;
  return { segments, cycle: t };
}

export const SCHEDULE = buildSchedule();
export const CYCLE_SECONDS = SCHEDULE.cycle;

/** Loop time held when motion is reduced: the first instrument in the air, on its way to the rack. */
export const STILL_TIME = (() => {
  const carry = SCHEDULE.segments.find((s) => s.kind === "carry" && s.pick === 0)!;
  return carry.start + carry.duration * 0.3;
})();

export function segmentAt(time: number): { index: number; segment: Segment; u: number } {
  const t = ((time % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
  const list = SCHEDULE.segments;
  let lo = 0;
  let hi = list.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (list[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  const segment = list[lo];
  return { index: lo, segment, u: Math.min(1, Math.max(0, (t - segment.start) / segment.duration)) };
}

export type InstrumentPlace = "tray" | "held" | "rack";

/** Where an instrument is at this point of the loop, and how visible (the reset fades the rack out, the tray in). */
export function instrumentState(id: InstrumentKind, segment: Segment, u: number): { place: InstrumentPlace; opacity: number } {
  const p = PICK_ORDER.indexOf(id);
  if (segment.kind === "reset") {
    return u < 0.5 ? { place: "rack", opacity: 1 - u * 2 } : { place: "tray", opacity: (u - 0.5) * 2 };
  }
  if (segment.pick > p) return { place: "rack", opacity: 1 };
  if (segment.pick < p) return { place: "tray", opacity: 1 };
  switch (segment.kind) {
    case "lift":
    case "carry":
    case "lower":
      return { place: "held", opacity: 1 };
    case "open":
    case "retreat":
    case "return":
      return { place: "rack", opacity: 1 };
    default:
      return { place: "tray", opacity: 1 };
  }
}

/** Gripper drive joint (xArm gripper `drive_joint`, radians): 0 is fully open, 0.85 fully closed. */
export const GRIPPER_OPEN = 0.12;
export const GRIPPER_CLOSED = 0.79;

export function gripperAt(segment: Segment, u: number): number {
  const ease = u * u * (3 - 2 * u);
  switch (segment.kind) {
    case "close":
      return GRIPPER_OPEN + (GRIPPER_CLOSED - GRIPPER_OPEN) * ease;
    case "lift":
    case "carry":
    case "lower":
      return GRIPPER_CLOSED;
    case "open":
      return GRIPPER_CLOSED + (GRIPPER_OPEN - GRIPPER_CLOSED) * ease;
    default:
      return GRIPPER_OPEN;
  }
}

/** What the detections panel shows at one point of the loop. */
export type PanelState = {
  /** Changes whenever anything shown changes; used to skip identical updates. */
  key: string;
  step: number;
  pick: number;
  kind: SegmentKind;
  /** Instruments the last survey frame shows on the tray, with their pick order (1 = topmost). */
  onTray: { id: InstrumentKind; order: number }[];
  target: InstrumentKind | null;
  showOutlines: boolean;
  showLabels: boolean;
  showOrder: boolean;
  sorted: number;
  log: string;
};

export function panelStateAt(time: number): PanelState {
  const { segment, u } = segmentAt(time);
  const { kind, pick } = segment;
  const resetting = kind === "reset";
  const placed = ["open", "retreat", "return"].includes(kind);
  // The panel shows the survey frame taken before the current pick; the target leaves it once placed.
  const remaining = resetting ? (u < 0.5 ? [] : PICK_ORDER) : PICK_ORDER.slice(Math.min(pick + (placed ? 1 : 0), PICK_ORDER.length));
  const onTray = remaining.map((id, i) => ({ id, order: i + 1 }));
  const target = kind === "done" || resetting || placed ? null : PICK_ORDER[pick];
  const perception = segment.step >= 0 && segment.step < 5 ? segment.step : 5;
  const inPipeline = kind !== "done" && !resetting;
  const showOutlines = inPipeline && kind !== "survey";
  const showLabels = inPipeline && perception >= 2;
  // Order numbers are stale once the target is placed; they return after the next survey.
  const showOrder = inPipeline && perception >= 3 && !placed;
  const sorted = resetting ? (u < 0.5 ? PICK_ORDER.length : 0) : Math.min(pick + (placed ? 1 : 0), PICK_ORDER.length);
  const log = logLine(segment, remaining.length, sorted);
  return {
    key: `${kind}:${pick}:${resetting && u >= 0.5 ? "in" : ""}`,
    step: segment.step,
    pick,
    kind,
    onTray,
    target: target ?? null,
    showOutlines,
    showLabels,
    showOrder,
    sorted,
    log,
  };
}

function logLine(segment: Segment, remaining: number, sorted: number): string {
  const id = PICK_ORDER[segment.pick];
  const instrument = id ? BY_ID[id] : null;
  switch (segment.kind) {
    case "survey":
      return segment.pick === 0 ? "Survey pose. Wrist RGB-D frame captured." : "Back at survey. Rescanning the tray after the place.";
    case "detect":
      return `${remaining} instrument${remaining === 1 ? "" : "s"} segmented, stable track IDs held.`;
    case "identity":
      return "Identities match the selected set (DINO, operator reviewed).";
    case "order": {
      if (!instrument) return "";
      const under = instrument.restsOn ? BY_ID[instrument.restsOn].label : null;
      return under ? `Contact heads: ${instrument.label} rests on the ${under}. It goes first.` : `Nothing rests on the ${instrument.label}. It is next.`;
    }
    case "plan":
      return `Grasp planned inside the workspace. Operator approved track #${instrument?.track}.`;
    case "approach":
    case "descend":
    case "close":
    case "lift":
      return `Picking the ${instrument?.label} (track #${instrument?.track}).`;
    case "carry":
    case "lower":
      return `Carrying it to rack slot ${(instrument?.slot ?? 0) + 1}.`;
    case "open":
    case "retreat":
    case "return":
      return `Placed in slot ${(instrument?.slot ?? 0) + 1}. Placement check passed.`;
    case "done":
      return `Tray clear. ${sorted} of ${PICK_ORDER.length} instruments sorted.`;
    case "reset":
      return "Resetting the simulated tray.";
  }
}
