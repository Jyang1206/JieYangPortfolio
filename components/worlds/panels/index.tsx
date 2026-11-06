import type { ComponentType } from "react";
import { BattlecodeReplayOverlay } from "../battlecode";
import { IrisArmOverlay } from "../iris/arm";
import { TariiStory } from "../tarii/story";
import { STControls } from "./STControls";

export type ParamValues = Partial<Record<0 | 1 | 2 | 3, number>>;

/** Props a world's shader driver receives. `setParams` drives that world's shader `uParams`. */
export type ControlsProps = {
  setParams: (values: ParamValues) => void;
  still: boolean;
};

type WorldExtras = {
  /** Invisible driver mounted while the world page is open; it steers the shader's `uParams` on its own. */
  Controls?: ComponentType<ControlsProps>;
  /** Animated layer drawn over the world's shader on the sticky stage (e.g. the IRIS arm, a Battlecode replay). */
  Overlay?: ComponentType<{ active: boolean; still: boolean }>;
  /** The Tarii story loop, placed by the Tarii story page. */
  Extra?: ComponentType;
};

export const WORLD_EXTRAS: Record<string, WorldExtras> = {
  iris: { Overlay: IrisArmOverlay },
  tarii: { Extra: TariiStory },
  "st-engineering": { Controls: STControls },
  battlecode: { Overlay: BattlecodeReplayOverlay },
};
