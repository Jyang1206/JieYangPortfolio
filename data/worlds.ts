import { battlecodeWorld } from "./battlecode";

// Home-page worlds, in travel order. Index matches the shader order in components/worlds/shaders.ts.

export type Shot = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Phone captures sit in a handset frame; screens sit in a browser-like frame. */
  kind: "screen" | "phone";
};

export type World = {
  id: string;
  name: string;
  place: string;
  role: string;
  /** One or two sentences that introduce the work to someone new to it. */
  excerpt: string;
  built: string[];
  tags: string[];
  storyHref?: string;
  /** Name of the crossing used to enter this world, shown in the readout. */
  crossing: string;
  /** Static background used when WebGL2 is unavailable. */
  fallback: string;
  /** Cards follow the product's own identity instead of the portfolio's paper and ink. */
  theme?: "tarii";
  /** Real captures, in story order. */
  shots?: Shot[];
};

export const worlds: World[] = [
  {
    id: "iris",
    name: "IRIS",
    place: "Singapore National Eye Centre · industry project",
    role: "Perception and robot control",
    excerpt:
      "A robot cell that sorts ophthalmic surgical instruments. It looks at a cluttered tray, works out which instrument sits on top, and picks it only after an operator approves the move.",
    built: [
      "Detection and tracking of ophthalmic surgical instruments from RGB-D, with DINO identity checks when a set needs them",
      "Topmost-first pick order from a contact graph between overlapping instruments",
      "xArm motion through MoveIt, shared workspace limits and explicit operator approval",
    ],
    tags: ["ROS 2", "C++", "MoveIt", "RealSense", "YOLO", "DINO", "React"],
    storyHref: "/projects/iris",
    crossing: "aperture",
    fallback: "radial-gradient(circle at 55% 48%, #6f8a94 0%, #1d3f47 38%, #071116 80%)",
  },
  {
    id: "tarii",
    name: "Tarii",
    place: "Hospital staff rostering",
    role: "Software Engineer Intern",
    excerpt:
      "A rostering product for hospital departments. I did UI/UX and product work, helped run a trial demo with a hospital department, and built features the trial needed.",
    built: [
      "UI/UX and product design for the web app rosterers use",
      "Helped run a trial demo with a hospital department in Singapore and improved the demo experience",
      "Built new features when the trial needed them",
    ],
    tags: ["Full-stack", "UI/UX", "Product", "Client demos"],
    storyHref: "/projects/tarii",
    crossing: "roster turnover",
    theme: "tarii",
    shots: [
      { src: "/images/tarii/hero-solve.png", alt: "Fortnight roster grid before solving, every cell empty", caption: "A fortnight before the solve: people down the side, days across, nothing assigned.", width: 1100, height: 825, kind: "screen" },
      { src: "/images/tarii/p4-console.png", alt: "Solve console with dates, readiness and scope options", caption: "The rosterer picks the dates and what the solve should cover.", width: 575, height: 750, kind: "screen" },
      { src: "/images/tarii/p5-roster.png", alt: "Published fortnight roster with shifts, on-call and leave filled in", caption: "After the solve: every day complete, on-call and leave in place, ready for review.", width: 1380, height: 754, kind: "screen" },
    ],
    fallback: "linear-gradient(135deg, #fbf1df 0%, #ecdcc4 45%, #a7a3b4 100%)",
  },
  {
    id: "movel",
    name: "Movel AI",
    place: "Robotics fleet orchestration · internship",
    role: "Full-stack developer intern",
    excerpt:
      "Software that lets a mixed fleet of robots work inside real buildings, riding lifts, passing secure doors and moving inventory, while operators stay in control.",
    built: [
      "Dispatch, reservation and retry logic for SEER AMRs, AGVs and an Omron robot dog",
      "Integrations with KONE lifts, SALTO doors, RFID, chutes and inventory flows",
      "React operator dashboards for robot state, map intent and task queues",
    ],
    tags: ["TypeScript", "React", "FastAPI", "Node.js", "RabbitMQ", "MQTT"],
    storyHref: "/projects/seer-fleet-management",
    crossing: "lidar sweep",
    shots: [
      { src: "/images/fleet-management-ui.png", alt: "Fleet management and trolley inventory dashboard", caption: "Fleet management and trolley inventory, as operators used it.", width: 1842, height: 914, kind: "screen" },
    ],
    fallback: "linear-gradient(180deg, #74797a 0%, #55595a 60%, #2f3233 100%)",
  },
  {
    id: "st-engineering",
    name: "ST Engineering",
    place: "ADAS perception · internship",
    role: "Software engineering intern",
    excerpt:
      "Three real-time vision projects on a vehicle: rebuilding the road under it, calibrating and stitching a surround view, and stitching three overlapping forward cameras into one panorama.",
    built: [
      "Downward view: VPI Lucas–Kanade tracking with forward/backward checks, RANSAC ego-motion and temporal synthesis of the road under the vehicle",
      "Calibration and surround view: marker detection, a pose graph refined with Ceres, and a quality gate; setup went from about an hour to under five minutes",
      "Multi-camera stitching: three overlapping forward cameras into one cylindrical panorama with GPU dense flow, synchronised inputs and low-latency RTSP output",
    ],
    tags: ["C++17", "CUDA", "NVIDIA VPI", "OpenCV", "Ceres", "GStreamer", "DDS", "GoogleTest"],
    storyHref: "/projects/st-engineering-bev-motion",
    crossing: "optical flow",
    fallback: "linear-gradient(180deg, #05070d 0%, #2a1408 48%, #120d0a 100%)",
  },
  {
    id: "guitar",
    name: "Guitar Story",
    place: "NUS Orbital 2025 · Artemis",
    role: "Software engineer and co-lead",
    excerpt:
      "A practice app that watches your fretboard through a webcam, lights up where the notes of a scale are, and listens to check that you played them.",
    built: [
      "YOLOv8 fretboard detection and calibration, 90% note-overlay accuracy at 30 FPS",
      "Web Audio pitch detection for play-along timing and scoring",
      "A tuner, speed adjuster, tab creator and calibration tools around it",
    ],
    tags: ["React", "Vite", "YOLOv8", "Firebase", "InferenceJS"],
    storyHref: "/projects/guitar-scale-visualizer",
    crossing: "string pluck",
    fallback: "radial-gradient(circle at 60% 40%, #6b3a1c 0%, #2a130a 50%, #0b0605 100%)",
  },
  battlecodeWorld,
];
