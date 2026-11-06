"use client";

import { IrisArmOverlay } from "./iris/arm";

/**
 * The IRIS cell over the tray shader: the articulated UF850 sorting instruments in a loop (see components/worlds/iris/arm).
 * Kept as the default export WorldsStage loads.
 */
export default function XArmWorldModel({ active, still }: { active: boolean; still: boolean }) {
  return <IrisArmOverlay active={active} still={still} />;
}
