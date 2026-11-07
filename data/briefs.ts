// The short version of each project, shown on the project page around its live world:
// what it is, what I did, the stack and the skills it used. Facts come from .claude/skills/<project>-aesthetic.

export type Brief = {
  /** One or two sentences: what the thing is. */
  what: string;
  /** A short recognition shown beside the name, e.g. an award level. */
  badge?: string;
  /** A poster the stage can open over the world with a toggle. */
  poster?: { src: string; alt: string; width: number; height: number };
  /** What I did, a few short lines. */
  did: string[];
  stack: string[];
  skills: string[];
  /**
   * Extra sections shown in the same card after the overview, one at a time (tabs, arrows or scroll).
   * Keep each short: a title, one or two sentences, and at most four points.
   */
  more?: BriefSection[];
};

export type BriefSection = {
  title: string;
  text?: string;
  points?: string[];
};

export const briefs: Record<string, Brief> = {
  iris: {
    poster: {
      src: "/images/iris/inspire-2026-poster.webp",
      alt: "IRIS poster for INSPIRE 2026: the problem, objectives, the gripper picking forceps, results (94% detected, 78% upper instrument named, 87% safe picks, 83% trays sorted) and the six-step pipeline.",
      width: 1413,
      height: 2000,
    },
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
    more: [
      {
        title: "The problem",
        text: "After every surgical case, staff sort a cluttered tray of instruments back into their sets by hand.",
        points: [
          "The instruments are thin, polished steel and reflect light differently each time",
          "Several are near-copies, such as flat and dissecting tweezers",
          "Their tips are delicate, so the arm cannot pull one from underneath",
        ],
      },
      {
        title: "What I learned",
        points: [
          "First detector: 0.97 mAP on its own data, fired on 51% of another set",
          "The robot's own records needed checking: 44% of its logged overlaps were not contact",
          "A falling training loss did not mean the vision-language models read the image",
          "Models advise; the backend and the operator decide every motion",
        ],
      },
    ],
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
    more: [
      {
        title: "The problem",
        text: "Before Tarii, a department kept leave, on-call duties and past rosters in separate workbooks. The roster went out by email, and every change after that was another round of messages.",
      },
      {
        title: "The product",
        text: "The lead reviews and adjusts each drafted roster before publishing it.",
        points: [
          "Staff request leave from their phone",
          "Their postings land in a calendar",
          "An inbox tells them when a roster is out",
        ],
      },
      {
        title: "What I designed",
        points: [
          "The solve console: pick the dates and see what is still missing",
          "The solved grid, with each day's coverage shown above the rows",
          "Cover changes after publishing: open a cell and pick a teammate",
        ],
      },
    ],
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
    more: [
      {
        title: "The problem",
        text: "One delivery can need a lift, two secure doors, an inventory system and an operator watching. Each of those has its own protocol and fails in its own way.",
      },
      {
        title: "On site",
        text: "The services were deployed with Docker and validated in operation at NUS and GSK.",
        points: [
          "SEER AMRs, AGVs and an Omron robot dog",
          "KONE lifts and SALTO door access",
          "RFID readers, MQTT devices, chutes and inventory platforms",
        ],
      },
      {
        title: "What I learned",
        points: [
          "Physical systems fail halfway through a task, and most of the work is there",
          "Anything a task reserves has to be released on every failure path",
          "Operators need to see where a robot is going and why it waits",
          "Site visits found problems the test setup never showed",
        ],
      },
    ],
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
    more: [
      {
        title: "Downward view",
        text: "The vehicle hides the road directly beneath it. This module fills that area in from frames the cameras captured a moment earlier.",
        points: [
          "Tracked road features on the GPU with NVIDIA VPI",
          "Estimated the vehicle's motion, including from out-of-sync streams",
          "Kept it real time, with GoogleTest coverage",
        ],
      },
      {
        title: "Calibration",
        text: "Production calibration went from about an hour to under five minutes.",
        points: [
          "Detection of AprilTag, ArUco and ChArUco targets around the vehicle",
          "Every camera's position solved together with Ceres",
          "A quality check on the result before anything uses it",
          "Output fed straight into the surround-view render",
        ],
      },
      {
        title: "Stitching",
        text: "Three overlapping forward cameras joined into one live panorama.",
        points: [
          "Moving people and cars stay whole across the seams",
          "Custom CUDA kernels for the per-frame work",
          "The panorama streamed over RTSP through GStreamer",
        ],
      },
    ],
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
    more: [
      {
        title: "The problem",
        text: "Scale charts show a flat, generic neck. You have to map one onto your own guitar while you play, and the chart can't tell you whether you hit the right note.",
      },
      {
        title: "Features",
        points: [
          "Scale notes drawn on your fretboard in the live webcam feed",
          "Calibration that maps the detected neck to frets and strings",
          "Play-along scoring that listens to the pitch you play",
          "A tuner, a tab creator and YouTube speed control",
        ],
      },
      {
        title: "Results",
        text: "The model runs in the browser, so your video stays on your machine.",
        points: [
          "90% note-overlay accuracy",
          "30 FPS on a live webcam feed",
          "Artemis, the highest level of achievement in NUS Orbital 2025",
        ],
      },
    ],
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
    more: [
      {
        title: "The game",
        text: "Both teams draft champions, then clear monster camps for gems and gold. The first to tribute 1,000 gems at altars wins, and each champion runs our code every turn under a compute budget.",
      },
      {
        title: "Testing",
        text: "We froze every version and never edited it, so each change had a fixed control.",
        points: [
          "Paired games on both sides of every map before an upload",
          "Experiments ran locally or unranked, never on the ranked ladder",
          "Replays showed what each version spent its turns on",
          "Adjusted for opponents, 14 versions with 50+ live games were statistically tied",
        ],
      },
      {
        title: "Results",
        text: "Team OneTap, three NUS students.",
        points: [
          "Peak #11 on the ladder, Platinum tier, rating 2,035",
          "#88 of 825 on 7 November, at 1,997",
          "51% win rate over 3,390 ranked games",
        ],
      },
    ],
  },
};
