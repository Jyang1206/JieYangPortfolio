// The landing page's introduction and skills. Skills come from the resume (Nov 2026) and the projects on this site.

export const greeting = "Hi! I'm Jie Yang.";

export const tagline = "NUS Computer Science undergraduate building robots, backends and interfaces that people can rely on.";

/** What I enjoy, in my own order. */
export const interests = [
  {
    title: "Robotics and AI",
    body: "I enjoy working with AI models and robots: perception that turns what a camera sees into robot actions, and the planning and navigation that make those actions safe.",
  },
  {
    title: "Backend and infrastructure",
    body: "I enjoy backend development: building infrastructure that lasts and weighing the trade-offs between one system design and another.",
  },
  {
    title: "Frontend and UI/UX",
    body: "I enjoy frontend UI/UX work: improving the experience for the people who use a product, building a solid brand identity, and drawing in the right users with considered design and interaction.",
  },
];

export type SkillGroup = { label: string; items: string[] };

export const skills: SkillGroup[] = [
  { label: "Languages", items: ["C++", "Python", "TypeScript", "JavaScript", "Java", "SQL"] },
  {
    label: "Robotics and perception",
    items: ["ROS 2", "MoveIt", "OpenCV", "NVIDIA VPI", "RGB-D cameras", "Camera calibration", "AprilTags", "Optical flow / KLT", "BEV and ego-motion", "Surround-view stitching"],
  },
  {
    label: "AI and models",
    items: ["YOLO detection and segmentation", "DINOv3 embeddings", "Vision-language models", "PyTorch", "Hugging Face", "Roboflow", "Model evaluation", "CUDA"],
  },
  {
    label: "Backend and systems",
    items: ["Node.js", "FastAPI", "REST APIs", "Docker", "RabbitMQ", "MQTT", "Redis", "SQLite", "Firebase", "GStreamer / RTSP", "DDS"],
  },
  { label: "Frontend and design", items: ["React", "Next.js", "Vite", "Tailwind CSS", "WebGL / Three.js", "UI/UX and product design"] },
  { label: "Tools", items: ["Git", "GitHub Actions", "Linux", "CMake", "GoogleTest", "Gradle"] },
];

/** One-line AI summary for the intro. The detailed list lives with the projects. */
export const aiSummary =
  "I train and evaluate vision models end to end, from cleaning the data to running them on live robot cameras: segmentation, identity embeddings and learned contact reasoning for IRIS, and in-browser detection for the Guitar Scale Visualizer.";

/** AI experience in detail, shown on the IRIS and Guitar pages rather than the intro. */
export const aiExperience = [
  "Cleaned and curated the instrument datasets, then trained and evaluated every IRIS model myself",
  "YOLO instance segmentation for reflective, look-alike, overlapping surgical tools (IRIS)",
  "A DINOv3 identity head on masked crops, tested with leave-one-capture-day-out folds (IRIS)",
  "Learned contact heads that decide which instrument is on top, plus vision-language experiments for tray understanding (IRIS)",
  "Mapped model detections from an RGB-D camera into grasp coordinates for a UFACTORY arm through ROS 2 and MoveIt (IRIS)",
  "YOLOv8 fretboard detection in the browser with 90% note-overlay accuracy at 30 FPS (Guitar Scale Visualizer)",
];
