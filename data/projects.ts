// Project registry: one entry per world with a page at /projects/[slug].
// The page's short brief lives in data/briefs.ts; this file holds what the home page,
// routing and metadata need.

export type ProjectCategory = "experience" | "project" | "hackathon";

/** Kept for components/worlds/WorldContent.tsx, which still reads `storySteps` when present. */
export type StoryStep = {
  id: string;
  title: string;
  body: string;
  metrics?: string[];
};

export type Project = {
  slug: string;
  /** World id on the home page and /w/[id]. */
  worldId: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  role: string;
  /** A shorter role for the at-a-glance list, when `role` is long. */
  roleShort?: string;
  dates: string;
  category: ProjectCategory;
  storySteps?: StoryStep[];
};

export const homeIntro =
  "Hi, I'm Jie Yang. I really like solving problems and helping people. Right now, that has manifested in my interest in robotics and automation, because I think these systems can alleviate repetitive work, assist physical workers, and make difficult workflows easier. I also really enjoy frontend and UI/UX work: making a complicated system feel simple to the person using it. Enjoy my portfolio.";

/** Story order follows the home page's world order. */
export const projects: Project[] = [
  {
    slug: "iris",
    worldId: "iris",
    title: "IRIS",
    subtitle: "Intelligent Robotic Instrument Sorter",
    shortDescription:
      "A robot cell that detects ophthalmic surgical instruments on a cluttered tray, works out which one is on top, and picks it under backend safety checks and operator approval.",
    role: "Perception and robot control",
    dates: "Jan 2026 – present",
    category: "project",
  },
  {
    slug: "tarii",
    worldId: "tarii",
    title: "Tarii",
    subtitle: "Staff rostering for hospital departments",
    shortDescription:
      "UI/UX, product and full-stack work on a rostering product: the web app and analytics rosterers use, spreadsheet import that matches messy staff names, and Telegram notifications for staff.",
    role: "UI/UX, product and full-stack",
    dates: "Oct 2026 – present",
    category: "experience",
  },
  {
    slug: "seer-fleet-management",
    worldId: "movel",
    title: "Movel AI",
    subtitle: "Robotics fleet orchestration",
    shortDescription:
      "Backend services and operator tools that let a mixed fleet of AMRs work inside real buildings: lifts, secure doors, RFID and inventory systems.",
    role: "Full-Stack Developer Intern, Robotics Fleet Orchestration",
    roleShort: "Full-Stack Developer Intern",
    dates: "Dec 2025 – Apr 2026",
    category: "experience",
  },
  {
    slug: "st-engineering-bev-motion",
    worldId: "st-engineering",
    title: "ST Engineering",
    subtitle: "Real-time vision on a vehicle",
    shortDescription:
      "Three C++/CUDA vision projects: rebuilding the road under a vehicle, calibrating and drawing a surround view, and stitching three forward cameras into one panorama.",
    role: "Software Engineering Intern, Computer Vision & Autonomous Systems",
    roleShort: "Software Engineering Intern",
    dates: "May – Aug 2026",
    category: "experience",
  },
  {
    slug: "guitar-scale-visualizer",
    worldId: "guitar",
    title: "Guitar Story",
    subtitle: "Scales drawn on your own fretboard",
    shortDescription:
      "A practice app that finds the fretboard in a webcam feed, overlays the notes of a scale, and listens to check what you played.",
    role: "Software engineer and co-lead",
    dates: "May – Aug 2025",
    category: "project",
  },
  {
    slug: "battlecode",
    worldId: "battlecode",
    title: "Battlecode",
    subtitle: "Cambridge Battlecode 2026",
    shortDescription:
      "A C++ bot that plays a real-time strategy game on its own, plus the replay and benchmarking tools our team used to decide which version went live.",
    role: "Bot strategy, replay analysis and testing",
    dates: "Oct – Nov 2026",
    category: "hackathon",
  },
];

/** Old URLs that now point at a renamed story. */
export const legacySlugs: Record<string, string> = {
  "xarm-vision-to-pick": "iris",
};

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function nextProject(slug: string) {
  const i = projects.findIndex((project) => project.slug === slug);
  return projects[(i + 1) % projects.length];
}
