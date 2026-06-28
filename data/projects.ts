export type SceneType = "xarm" | "seer" | "guitar" | "vehicle" | "deployment";

export type StoryStep = {
  id: string;
  title: string;
  body: string;
  cameraTarget: string;
  activeHotspot?: string;
  metrics?: string[];
  technicalDetails?: string[];
};

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  role: string;
  company?: string;
  companyLogo?: string;
  artifactImage?: string;
  concepts?: string[];
  technologies: string[];
  modelPath: string;
  additionalModelPaths?: string[];
  fallbackImage: string;
  storySteps: StoryStep[];
  accentColor: string;
  sceneType: SceneType;
  category: "experience" | "project";
};

export const homeIntro =
  "Hi, I'm Jie Yang. I really like solving problems and helping people. Right now, that has manifested in my interest in robotics and automation, because I think these systems can alleviate repetitive work, assist physical workers, and make difficult workflows easier. Enjoy my portfolio.";

const xarmStorySteps: StoryStep[] = [
  {
    id: "overview",
    title: "Overview",
    body: "A compact robot cell connects perception, calibration, planning, and execution so a camera observation can become a careful pick in the robot workspace.",
    cameraTarget: "Full robot cell",
    activeHotspot: "workspace",
    metrics: ["Robot cell", "Vision-to-action loop"],
    technicalDetails: ["Workspace plane", "Target object", "Robot base reference"],
  },
  {
    id: "vision",
    title: "Vision",
    body: "The camera module observes the work surface and produces a target estimate. The important work is making that observation trustworthy enough to drive robot motion.",
    cameraTarget: "Camera and sensor module",
    activeHotspot: "camera",
    metrics: ["Camera frame", "Object localization"],
    technicalDetails: ["Image-space estimate", "Sensor mounting assumptions"],
  },
  {
    id: "calibration",
    title: "Calibration",
    body: "Calibration relates the camera frame to the robot base frame. This is the bridge between what the system sees and where the arm can actually move.",
    cameraTarget: "Camera-to-base transform",
    activeHotspot: "tf",
    metrics: ["Camera → base", "Frame alignment"],
    technicalDetails: ["Extrinsic transform", "Coordinate frame checks"],
  },
  {
    id: "transform-logic",
    title: "Transform Logic",
    body: "The estimated target moves through the transform chain into robot coordinates, producing a reachable pre-grasp point and a pick pose.",
    cameraTarget: "Target in robot frame",
    activeHotspot: "base",
    metrics: ["Target pose", "Pre-grasp offset"],
    technicalDetails: ["TF chain", "Pose validation", "Reachability check"],
  },
  {
    id: "pick-execution",
    title: "Pick Execution",
    body: "The arm approaches, grasps, lifts, and retreats along a simple path. Each phase is separated so the behavior can be tested safely before real execution.",
    cameraTarget: "End-effector path",
    activeHotspot: "end-effector",
    metrics: ["Pre-grasp", "Grasp", "Lift", "Retreat"],
    technicalDetails: ["Waypoint sequence", "End-effector alignment"],
  },
  {
    id: "safety",
    title: "Safety",
    body: "The dry-run gate, workspace limits, and status checks keep the pipeline from treating a confident-looking estimate as permission to move blindly.",
    cameraTarget: "Safety envelope",
    activeHotspot: "safety",
    metrics: ["Dry-run gate", "Boundary checks", "Status hold"],
    technicalDetails: ["Workspace limit", "Execution gating", "Human review point"],
  },
];

export const projects: Project[] = [
  {
    slug: "xarm-vision-to-pick",
    title: "xArm Vision-to-Pick Pipeline",
    subtitle: "Ophthalmic surgical tool identification and robot grasping",
    shortDescription:
      "An industry-partnered perception-to-grasp pipeline for identifying, localizing, and sorting ophthalmic surgical instruments.",
    longDescription:
      "This Singapore National Eye Centre project focuses on the full chain from RGB-D sensing and fine-grained tool recognition through camera-to-robot calibration, grasp coordinate mapping, and UFactory robotic arm manipulation.",
    tags: ["Robot arm", "RGB-D", "YOLOv8", "ROS", "SNEC"],
    role: "Industry-partnered computer vision and robotics project",
    company: "Singapore National Eye Centre",
    concepts: [
      "Perception-to-grasp pipeline",
      "Camera-to-robot calibration",
      "Safety-gated manipulation",
      "Fine-grained surgical tool recognition",
    ],
    technologies: ["Python", "ROS 2", "YOLOv8", "RGB-D cameras", "UFactory xArm"],
    modelPath: "/models/xarm5-xf1300.glb?v=5",
    fallbackImage: "/fallbacks/xarm.png",
    storySteps: xarmStorySteps,
    accentColor: "#5eead4",
    sceneType: "xarm",
    category: "project",
  },
  {
    slug: "seer-fleet-management",
    title: "Full-Stack Robotics Fleet Application",
    subtitle: "SEER robots, AGV workflows, Omron dog deployment, and operator dashboards",
    shortDescription:
      "Robotics fleet orchestration work connecting AMRs, trolley inventory flows, RFID systems, chutes, lifts, secure doors, and operator tools.",
    longDescription:
      "A deployment-oriented Movel AI experience involving SEER robots, AGV operations, an Omron robot dog, dispatch states, REST APIs, workflow validation, retry handling, reservation logic, and integrations with enterprise systems.",
    tags: ["Movel AI", "FMS", "SEER", "AGV", "Dashboards"],
    role: "Full-Stack Developer Intern - Robotics Fleet Orchestration",
    company: "Movel AI",
    artifactImage: "/images/fleet-management-ui.png",
    concepts: [
      "Fleet orchestration",
      "Operator-in-the-loop automation",
      "Dispatch and reservation logic",
      "Lift, door, RFID, chute, and inventory integrations",
      "Deployment debugging and production validation",
    ],
    technologies: [
      "TypeScript",
      "React",
      "FastAPI",
      "Node.js",
      "REST",
      "JSON schemas",
      "RabbitMQ / MQTT",
      "KONE / SALTO integrations",
      "Deployment validation",
    ],
    modelPath: "/models/amr.glb?v=5",
    additionalModelPaths: ["/models/agv-forklifter.glb?v=5"],
    fallbackImage: "/fallbacks/seer.png",
    storySteps: [
      {
        id: "overview",
        title: "Overview",
        body: "SEER robots, AGVs, and an Omron robot dog become part of one operational full-stack robotics workflow for physical sites.",
        cameraTarget: "Fleet approach",
        activeHotspot: "robot",
        metrics: ["AMR / AGV workflows", "Operator dashboard", "Live deployment"],
      },
      {
        id: "orchestration",
        title: "Fleet Orchestration",
        body: "Dispatch state, route intent, robot availability, and reservation logic keep automation useful without removing operator control.",
        cameraTarget: "Dispatch overlays",
        activeHotspot: "route",
        metrics: ["Dispatch state", "Retry handling", "Reservations"],
      },
      {
        id: "integrations",
        title: "Site Integrations",
        body: "Robots only become useful in a facility when they coordinate with lifts, secure doors, RFID events, chute states, inventory flows, and client systems.",
        cameraTarget: "Integration nodes",
        activeHotspot: "route",
        metrics: ["KONE lifts", "SALTO doors", "RFID / inventory"],
      },
      {
        id: "operator-ui",
        title: "Operator UI",
        body: "The dashboard work focuses on making robot state, map intent, task queues, and recovery actions understandable during live operations.",
        cameraTarget: "Dashboard overlay",
        activeHotspot: "robot",
        metrics: ["React tools", "Map operations", "Live status"],
      },
    ],
    accentColor: "#60a5fa",
    sceneType: "seer",
    category: "experience",
  },
  {
    slug: "guitar-scale-visualizer",
    title: "Guitar Scale Visualizer",
    subtitle: "Gamified real-time guitar learning application",
    shortDescription:
      "A NUS Orbital Artemis Award project using real-time computer vision and audio feedback to make guitar practice more interactive.",
    longDescription:
      "The visualizer uses YOLOv8 detection, calibration algorithms, note overlays, Web Audio API pitch detection, scoring, timing evaluation, and play-along feedback to support gamified music learning.",
    tags: ["YOLOv8", "Web Audio", "30 FPS", "NUS Orbital"],
    role: "Software Engineer and Co-Lead - NUS Orbital Artemis Award",
    company: "NUS Orbital",
    concepts: [
      "Real-time computer vision overlay",
      "Fretboard calibration",
      "Audio feedback and scoring",
      "Gamified learning loop",
    ],
    technologies: ["YOLOv8", "Web Audio API", "JavaScript", "Calibration", "Realtime UI"],
    modelPath: "/models/guitar-camera.glb?v=3",
    fallbackImage: "/fallbacks/guitar.png",
    storySteps: [
      {
        id: "overview",
        title: "Overview",
        body: "A camera and fretboard become a shared visual space for learning scales through direct overlays.",
        cameraTarget: "Camera and fretboard",
        activeHotspot: "camera",
      },
      {
        id: "mapping",
        title: "Mapping",
        body: "Detected fret positions are mapped into notes, then highlighted according to the selected musical scale.",
        cameraTarget: "Fret grid",
        activeHotspot: "fretboard",
      },
    ],
    accentColor: "#facc15",
    sceneType: "guitar",
    category: "project",
  },
  {
    slug: "st-engineering-bev-motion",
    title: "ST Engineering Downward View / BEV Motion Estimation",
    subtitle: "ADAS perception, optical flow, and real-time BEV reconstruction",
    shortDescription:
      "A real-time ADAS perception module for BEV ego-motion estimation and under-vehicle view reconstruction.",
    longDescription:
      "This ST Engineering internship centers on modern C++ perception work with NVIDIA VPI, CUDA, OpenCV, KLT optical flow, feature-track management, ego-motion estimation, and frame warping across heterogeneous compute backends.",
    tags: ["ST Engineering", "ADAS", "C++", "CUDA", "VPI KLT"],
    role: "Software Engineering Intern - ADAS Perception Systems",
    company: "ST Engineering",
    concepts: [
      "Real-time ADAS perception",
      "Backend-agnostic optical flow",
      "Heterogeneous compute pipelines",
      "BEV ego-motion estimation",
      "Frame warping and temporal stitching",
    ],
    technologies: ["Modern C++", "NVIDIA VPI", "CUDA", "OpenCV", "KLT tracking"],
    modelPath: "/models/vehicle.glb?v=4",
    fallbackImage: "/fallbacks/vehicle.png",
    storySteps: [
      {
        id: "overview",
        title: "Overview",
        body: "A vehicle moves through a road scene while feature points provide the signal for motion estimation.",
        cameraTarget: "Vehicle and road",
        activeHotspot: "vehicle",
      },
      {
        id: "motion",
        title: "Motion Estimation",
        body: "Tracked points and motion vectors support the transform logic needed to form a recovered downward view.",
        cameraTarget: "Feature vectors",
        activeHotspot: "flow",
      },
    ],
    accentColor: "#fb7185",
    sceneType: "vehicle",
    category: "experience",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
