import type { ComponentType } from "react";
import { BattlecodeReplayOverlay } from "../battlecode";
import { IrisArmOverlay } from "../iris/arm";
import { TariiStory } from "../tarii/story";
import { GuitarPanel } from "./GuitarPanel";
import { STControls } from "./STControls";
import { STPanel } from "./STPanel";

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
  /** The Tarii phone and calendar, placed on the stage beside the brief. */
  Extra?: ComponentType;
  /** Visible controls on the stage: pick an ST project, a guitar key and scale. */
  Panel?: ComponentType<ControlsProps>;
};

export const WORLD_EXTRAS: Record<string, WorldExtras> = {
  iris: { Overlay: IrisArmOverlay },
  tarii: { Extra: () => <TariiStory simple /> },
  "st-engineering": { Controls: STControls, Panel: STPanel },
  guitar: { Panel: GuitarPanel },
  battlecode: { Overlay: BattlecodeReplayOverlay },
};
