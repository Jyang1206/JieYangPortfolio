// The short version of each project, shown on the project page around its live world:
// what it is, what I did, the stack and the skills it used. Facts come from .claude/skills/<project>-aesthetic.

export type Brief = {
  /** One or two sentences: what the thing is. */
  what: string;
  /** A short recognition shown beside the name, e.g. an award level. */
  badge?: string;
  /** What I did, a few short lines. */
  did: string[];
  stack: string[];
  skills: string[];
};

export const briefs: Record<string, Brief> = {
  iris: {
    what: "A robot cell built with the Singapore National Eye Centre. It identifies surgical instruments in a cluttered tray and sorts them, topmost first, into their slots.",
    did: [
      "Cleaned the datasets, then trained and evaluated every model",
      "Instance segmentation for thin, reflective, look-alike instruments",
      "A DINOv3 identity head to tell near-identical instruments apart",
      "Contact heads that decide which instrument is on top",
      "Turned RGB-D detections into grasps for the UF850 arm",
    ],
    stack: ["Python", "PyTorch", "YOLO", "DINOv3", "C++", "ROS 2", "MoveIt", "RealSense", "React", "Docker"],
    skills: ["Computer vision", "Model training and evaluation", "Data cleaning", "Robot grasping", "Camera calibration"],
  },
  tarii: {
    what: "A rostering product for hospital departments and other shift teams. Rosterers set the rules, a solver drafts the roster, and staff see their shifts on their phone.",
    did: [
      "UI/UX and product design for the web app rosterers use",
      "Helped run a trial demo with a hospital department in Singapore",
      "Improved the demo experience",
      "Built new features when the trial needed them",
    ],
    stack: ["React", "TypeScript", "Vite", "Python", "FastAPI", "Postgres", "Redis"],
    skills: ["UI/UX design", "Product design", "Full-stack development", "Client demos"],
  },
  movel: {
    what: "Fleet orchestration for robots that work inside real buildings: AMRs, AGVs and a robot dog that ride lifts, pass secure doors and move trolleys and inventory.",
    did: [
      "Backend services, REST APIs and task workflows in Node.js and TypeScript",
      "Retries, resource reservation and recovery when a step fails",
      "Integrations with lifts, door access, RFID, MQTT devices and chutes",
      "Operator dashboards in React, deployed with Docker at NUS and GSK",
    ],
    stack: ["TypeScript", "Node.js", "React", "MQTT", "RabbitMQ", "FastAPI", "Docker"],
    skills: ["Backend design", "Workflow orchestration", "Hardware integration", "Fault tolerance"],
  },
  "st-engineering": {
    what: "Three real-time computer vision projects on a vehicle, written in C++ and CUDA on NVIDIA GPUs.",
    did: [
      "Downward view: rebuilt the road under the vehicle from earlier frames",
      "Calibration and surround view: cut production calibration from about an hour to under five minutes",
      "Multi-camera stitching: three forward cameras into one panorama",
    ],
    stack: ["C++17", "CUDA", "NVIDIA VPI", "OpenCV", "Ceres", "GStreamer", "DDS", "CMake", "GoogleTest"],
    skills: ["Optical flow", "Camera calibration", "Image stitching", "GPU programming", "Real-time systems"],
  },
  guitar: {
    badge: "Artemis level",
    what: "A practice app that finds the fretboard in your webcam, lights up the notes of a scale on your own guitar, and listens to check you played them. NUS Orbital, Artemis level.",
    did: [
      "Co-led the team as a software engineer",
      "Real-time YOLOv8 fretboard detection: 90% note-overlay accuracy at 30 FPS",
      "Pitch detection with the Web Audio API for play-along scoring",
      "Tuner, tab creator, calibration and YouTube speed control",
    ],
    stack: ["React", "Vite", "YOLOv8", "InferenceJS", "Firebase", "Web Audio API"],
    skills: ["In-browser ML", "Audio processing", "Frontend", "Team lead"],
  },
  battlecode: {
    what: "Cambridge Battlecode 2026: a programming competition where your code plays the match. Our C++ bot drafts champions, farms camps and races to bank gems.",
    did: [
      "Wrote bot strategy: the draft, camp farming and fight decisions",
      "Built a replay decoder that rebuilds every round",
      "Paired benchmarks against frozen opponents on every map",
      "Peaked at #11 on the ladder, Platinum, 2,035 rating",
    ],
    stack: ["C++", "Python"],
    skills: ["Game AI", "Benchmarking", "Data analysis"],
  },
};
