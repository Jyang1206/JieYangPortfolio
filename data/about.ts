export type AboutPanel = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

export const aboutPanels: AboutPanel[] = [
  {
    id: "schooling",
    eyebrow: "Schooling",
    title: "National University of Singapore",
    body: "Bachelor of Computer Science undergraduate and NUS Merit Scholarship recipient, expected to graduate in 2027. Earlier academic foundation from the Anglo-Chinese School (Independent) International Baccalaureate Diploma Programme with 42/45.",
    points: ["B.Comp Computer Science", "NUS Merit Scholarship", "Expected 2027", "IB Diploma 42/45"],
  },
  {
    id: "learning",
    eyebrow: "Technical Focus",
    title: "Robotics, perception, and backend systems",
    body: "I work across real-time perception, robotics orchestration, computer vision, and full-stack tools, with a strong focus on systems that survive deployment constraints.",
    points: ["Modern C++ / Python", "ROS 2 / OpenCV / CUDA", "FastAPI / Node.js", "React / TypeScript"],
  },
  {
    id: "motivation",
    eyebrow: "Summary",
    title: "Real-world robotics needs both perception and product thinking",
    body: "My experience spans robotics fleet orchestration, ADAS perception, computer vision, workflow automation, and production validation for deployed robotics systems.",
    points: ["Fleet orchestration", "ADAS perception", "Computer vision", "Production validation"],
  },
  {
    id: "direction",
    eyebrow: "Direction",
    title: "Systems that are useful outside the demo",
    body: "I am interested in robotics software that connects perception, planning, backend reliability, and operator-facing tools into workflows people can actually use.",
    points: ["Robotics software", "Deployment-minded systems", "Operator tools", "Human-centered automation"],
  },
];
