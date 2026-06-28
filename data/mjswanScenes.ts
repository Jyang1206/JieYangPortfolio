import type { SceneType } from "./projects";

export type MjswanSceneMode = {
  id: SceneType;
  label: string;
  sceneName: string;
  projectSlug: string;
  summary: string;
};

export const mjswanSceneModes: MjswanSceneMode[] = [
  {
    id: "seer",
    label: "SEER",
    sceneName: "Warehouse Pickup",
    projectSlug: "seer-fleet-management",
    summary: "AMR warehouse pickup scene with zones, shelves, lanes, payload, and docking context.",
  },
  {
    id: "xarm",
    label: "xArm",
    sceneName: "xArm Pick Cell",
    projectSlug: "xarm-vision-to-pick",
    summary: "Vision-to-pick cell with table workspace, camera, gripper, and target surgical tool.",
  },
  {
    id: "vehicle",
    label: "Vehicle",
    sceneName: "Vehicle BEV Rig",
    projectSlug: "st-engineering-bev-motion",
    summary: "ADAS perception rig with ego vehicle, road plane, BEV patch, and feature-track markers.",
  },
  {
    id: "guitar",
    label: "Guitar",
    sceneName: "Guitar Scale Rig",
    projectSlug: "guitar-scale-visualizer",
    summary: "Computer-vision learning rig with webcam, fretboard geometry, strings, frets, and note dots.",
  },
];

export function getMjswanSceneMode(sceneType: SceneType) {
  return mjswanSceneModes.find((mode) => mode.id === sceneType);
}

export function getMjswanSceneUrl(sceneName: string) {
  const params = new URLSearchParams({
    panel: "0",
    config: "/seer/assets/config.json",
    scene: sceneName,
  });

  return `/seer/index.html?${params.toString()}`;
}
