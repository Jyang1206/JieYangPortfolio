import { Matrix4 } from "three";
import { downPose, forward, inverse, type Joints } from "./kinematics";
import { BY_ID, DRAPE_TOP, PICK_ORDER, RACK, slotPose, type Instrument, type Keyframe, type Segment } from "./timeline";

/** Clearance above the grasp and place poses for the approach and retreat. */
const HOVER = 0.11;
/** Fingertips sit this far above the instrument underside when they close. */
const GRIP_HEIGHT = 0.0022;
/** Survey: the wrist camera looks straight down over the middle of the tray. */
const SURVEY: [number, number, number] = [0.43, -0.02, 0.4];
/** All zeros is a folded, tool-down pose; seeding from it keeps the elbow-up, wrist-down branch. */
const SEED: Joints = [0, 0, 0, 0, 0, 0];

function trayMatrix(instrument: Instrument): Matrix4 {
  return new Matrix4().makeRotationZ(instrument.yaw).setPosition(instrument.x, instrument.y, DRAPE_TOP + instrument.lift);
}

function rackMatrix(instrument: Instrument): Matrix4 {
  const slot = slotPose(instrument.slot);
  return new Matrix4().makeRotationZ(slot.yaw).setPosition(slot.x, slot.y, RACK.height);
}

function raised(pose: Matrix4, dz: number): Matrix4 {
  const out = pose.clone();
  out.elements[14] += dz;
  return out;
}

function distance(a: readonly number[], b: readonly number[]) {
  return a.reduce((sum, v, i) => Math.max(sum, Math.abs(v - b[i])), 0);
}

export type Plan = {
  keyframes: Map<string, Joints>;
  /** Instrument pose relative to the tool centre point while held (constant from grasp to release). */
  held: Map<string, Matrix4>;
  tray: Map<string, Matrix4>;
  rack: Map<string, Matrix4>;
};

const keyOf = (k: Keyframe) => (k.kind === "survey" ? "survey" : `${k.kind}:${k.pick}`);

function solvePlan(): Plan {
  const keyframes = new Map<string, Joints>();
  const held = new Map<string, Matrix4>();
  const tray = new Map<string, Matrix4>();
  const rack = new Map<string, Matrix4>();
  const survey = inverse(downPose(SURVEY, 0), SEED).q;
  keyframes.set("survey", survey);

  PICK_ORDER.forEach((id, pick) => {
    const instrument = BY_ID[id];
    const onTray = trayMatrix(instrument);
    const inRack = rackMatrix(instrument);
    tray.set(id, onTray);
    rack.set(id, inRack);

    // A parallel gripper can close either way round: take the tool yaw that turns the wrist least.
    const gx = instrument.x + instrument.grip * Math.cos(instrument.yaw);
    const gy = instrument.y + instrument.grip * Math.sin(instrument.yaw);
    const gz = DRAPE_TOP + instrument.lift + GRIP_HEIGHT;
    let best: { grasp: Matrix4; above: Joints; at: Joints } | null = null;
    for (const flip of [0, Math.PI]) {
      const grasp = downPose([gx, gy, gz], instrument.yaw + Math.PI / 2 + flip);
      const above = inverse(raised(grasp, HOVER), survey).q;
      const at = inverse(grasp, above).q;
      if (!best || distance(above, survey) < distance(best.above, survey)) best = { grasp, above, at };
    }
    const { grasp, above, at } = best!;
    keyframes.set(`aboveGrasp:${pick}`, above);
    keyframes.set(`grasp:${pick}`, at);

    const relative = grasp.clone().invert().multiply(onTray);
    held.set(id, relative);
    const place = inRack.clone().multiply(relative.clone().invert());
    const abovePlace = inverse(raised(place, HOVER), above).q;
    keyframes.set(`abovePlace:${pick}`, abovePlace);
    keyframes.set(`place:${pick}`, inverse(place, abovePlace).q);
  });
  return { keyframes, held, tray, rack };
}

let plan: Plan | null = null;
/** Solved once, on first use (a few milliseconds), so the panel never pays for it. */
export function getPlan(): Plan {
  plan ??= solvePlan();
  return plan;
}

const smoother = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/** Joint angles at a point in a segment: eased joint-space interpolation between its two keyframes. */
export function jointsAt(segment: Segment, u: number, out: number[] = new Array(6)): number[] {
  const { keyframes } = getPlan();
  const a = keyframes.get(keyOf(segment.from))!;
  const b = keyframes.get(keyOf(segment.to))!;
  const e = smoother(u);
  for (let i = 0; i < 6; i += 1) out[i] = a[i] + (b[i] - a[i]) * e;
  return out;
}

export { forward };
