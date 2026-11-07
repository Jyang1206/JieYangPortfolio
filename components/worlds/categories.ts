import { projects } from "../../data/projects";

// How each world is filed. Colours are the three category inks used on the hub's
// chips and on each world page's corner label (globals.css `--cat-*`).

export type Category = "experience" | "project" | "hackathon";

export const CATEGORY_OF: Record<string, Category> = {
  tarii: "experience",
  movel: "experience",
  "st-engineering": "experience",
  iris: "project",
  guitar: "project",
  battlecode: "hackathon",
};

export const CATEGORIES: { id: Category; label: string; short: string }[] = [
  { id: "experience", label: "Professional experience", short: "Experience" },
  { id: "project", label: "Project", short: "Project" },
  { id: "hackathon", label: "Hackathon", short: "Hackathon" },
];

export const categoryOf = (worldId: string): Category => CATEGORY_OF[worldId] ?? "project";

export const categoryLabel = (worldId: string) => CATEGORIES.find((c) => c.id === categoryOf(worldId))?.label ?? "Project";
/** The short form, for the hub's compact slice labels. */
export const categoryShort = (worldId: string) => CATEGORIES.find((c) => c.id === categoryOf(worldId))?.short ?? "Project";

/** Short names for tabs and the hub. */
export const shortName = (name: string) => (name === "Guitar Scale Visualizer" ? "Guitar" : name);

/** A world's page: its project story, with the live world on top. */
export const worldHref = (id: string) => `/projects/${projects.find((project) => project.worldId === id)?.slug ?? id}`;
