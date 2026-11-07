"use client";

import dynamic from "next/dynamic";

// three.js, the UF850 model and the IK stay out of the page bundle and off the server until the overlay mounts.
const ArmCanvas = dynamic(() => import("./ArmCanvas"), { ssr: false });

/**
 * The IRIS cell as a simulation: the UFACTORY UF850 with an xArm gripper and wrist RealSense sorts a tray of
 * instruments topmost-first into a rack, in a loop. Transparent canvas, so the IRIS shader world shows through.
 * `still` holds one representative frame (reduced motion); `active` false stops rendering.
 */
export function IrisArmOverlay({ active, still }: { active: boolean; still: boolean }) {
  return <ArmCanvas active={active} still={still} />;
}
