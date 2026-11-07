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

export type SkillGroup = { area: "Robotics" | "Full stack"; label: string; items: string[] };

export const languages = ["C++", "Python", "TypeScript", "JavaScript", "Java", "SQL"];

export const skills: SkillGroup[] = [
  {
    area: "Robotics",
    label: "AI and machine learning",
    items: ["PyTorch", "Hugging Face", "Model training", "Model evaluation", "Data cleaning and labelling", "Roboflow", "Vision-language models", "CUDA"],
  },
  {
    area: "Robotics",
    label: "Perception",
    items: [
      "YOLO detection and segmentation",
      "DINOv3 embeddings",
      "OpenCV",
      "NVIDIA VPI",
      "Optical flow / KLT",
      "Camera calibration",
      "AprilTags",
      "RGB-D cameras",
      "Surround-view stitching",
      "BEV and ego-motion",
    ],
  },
  {
    area: "Robotics",
    label: "ROS and control",
    items: ["ROS 2", "MoveIt", "ros2_control", "Grasp planning", "DDS", "GStreamer / RTSP", "CMake", "GoogleTest"],
  },
  {
    area: "Full stack",
    label: "Frontend",
    items: ["React", "Next.js", "Vite", "Tailwind CSS", "WebGL / Three.js", "UI/UX and product design"],
  },
  {
    area: "Full stack",
    label: "Backend",
    items: ["Node.js", "FastAPI", "REST API design", "PostgreSQL", "Redis", "SQLite", "Firebase"],
  },
  {
    area: "Full stack",
    label: "System architecture",
    items: [
      "Event-driven microservices",
      "API gateway",
      "RabbitMQ",
      "MQTT",
      "Docker containers",
      "AWS deployment",
      "GitHub Actions CI",
    ],
  },
];

/** Education, from the resume (Nov 2026). */
export const education = [
  {
    school: "National University of Singapore",
    detail: "Bachelor of Computer Science · NUS Merit Scholarship",
    dates: "2024 – 2028 (expected)",
  },
  {
    school: "Anglo-Chinese School (Independent)",
    detail: "International Baccalaureate Diploma, 42/45",
    dates: "",
  },
];
