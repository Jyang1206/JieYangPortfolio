import type { Story } from "../types";
import { battlecodeStory } from "./battlecode";
import { guitarStory } from "./guitar";
import { irisStory } from "./iris";
import { movelStory } from "./movel";
import { stStory } from "./st";
import { tariiStory } from "./tarii";

const stories: Story[] = [irisStory, tariiStory, movelStory, stStory, guitarStory, battlecodeStory];

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}
