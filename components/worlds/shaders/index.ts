// World shaders, in the order of data/worlds.ts. The lens cap always comes last.
import { COMMON, MAIN, VERTEX } from "./common";
import cap from "./cap";
import iris from "./iris";
import tarii from "./tarii";
import movel from "./movel";
import st from "./st";
import guitar from "./guitar";
import battlecode from "./battlecode";
import COMPOSITE from "./composite";

const bodies = [iris, tarii, movel, st, guitar, battlecode];

export const WORLD_FRAGMENTS = [...bodies, cap].map((body) => COMMON + body + MAIN);
export const CAP_INDEX = bodies.length;
export { VERTEX, COMPOSITE };
