import type { Story } from "../types";

// Sources: components/worlds/panels/STContent.tsx, data/worlds.ts and the user's brief.
// No internal project names, repository paths or code identifiers from the employer.
export const stStory: Story = {
  slug: "st-engineering-bev-motion",
  worldId: "st-engineering",
  theme: "st",
  name: "ST Engineering",
  role: "Software Engineering Intern, Computer Vision & Autonomous Systems",
  dates: "May – Aug 2026",
  place: "ST Engineering, Singapore",
  header: {
    word: "ST Engineering",
    title: "Three real-time vision projects on a vehicle",
    lede: "Rebuilding the road under a vehicle from frames it has already seen, calibrating its cameras and drawing a surround view, and stitching three overlapping forward cameras into one panorama.",
  },
  facts: [
    { label: "Role", value: "Software Engineering Intern" },
    { label: "Team", value: "Computer Vision & Autonomous Systems" },
    { label: "Dates", value: "May – Aug 2026" },
    { label: "Language", value: "C++17 with CUDA" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The problem",
      title: "The problem",
      blocks: [
        {
          kind: "p",
          text: "A vehicle's cameras see the world around it, but not the whole of it and not in one picture. The road directly underneath is hidden by the vehicle itself. Each camera sits at its own position and angle, which has to be known exactly before their images can be joined. And where views overlap, the same object appears from different angles, so naive stitching tears it in half.",
        },
        {
          kind: "p",
          text: "All three problems run on the vehicle, in real time, on video streams that do not always arrive in step. That rules out anything that is only correct offline.",
        },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        { kind: "h3", text: "Downward view" },
        {
          kind: "p",
          text: "A module that rebuilds the road under the vehicle from frames taken a moment earlier, as the vehicle drove over it.",
        },
        {
          kind: "list",
          items: [
            "Tracked road features with pyramidal Lucas–Kanade on NVIDIA VPI, keeping only points that pass a forward/backward check and dropping points on moving obstacles.",
            "Estimated the vehicle's motion with RANSAC and smoothed it over time, handling streams that arrive out of sync.",
            "Used that motion to synthesise the view under the vehicle from earlier frames.",
            "Cached regions of interest and optimised the hot path to stay real time, with GoogleTest coverage.",
          ],
        },
        { kind: "h3", text: "Calibration and surround view" },
        {
          kind: "p",
          text: "Automated camera calibration that finds each camera's exact position and angle on the vehicle and feeds it to the surround-view render.",
        },
        {
          kind: "list",
          items: [
            "Pluggable detectors for AprilTag, ArUco and ChArUco targets placed around the vehicle, with a pose estimate for each camera.",
            "A pose graph bootstrapped from one anchor tag, refined globally with Ceres by minimising reprojection error, with a robust Huber loss and the anchor held fixed.",
            "A quality gate on the final error, support for several camera models, and conversion of the result to the extrinsics the surround view needs.",
          ],
        },
        { kind: "h3", text: "Multi-camera stitching" },
        {
          kind: "p",
          text: "A pipeline that joins three overlapping forward cameras into one seamless panorama in real time.",
        },
        {
          kind: "list",
          items: [
            "Projected the views onto a cylinder and reconciled each overlap on the GPU with dense optical flow computed in both directions.",
            "Separated foreground from background and used a fixed seam so moving objects do not tear, then joined the images with multi-band blending.",
            "Synchronised camera timestamps with bounded queues that drop stale frames, and wrote custom CUDA kernels for the hot path.",
            "Streamed the result over RTSP through GStreamer with low latency, alongside a diagnostics video.",
          ],
        },
      ],
    },
    {
      id: "how",
      nav: "Concepts",
      title: "Concepts used",
      blocks: [
        {
          kind: "list",
          items: [
            "Downward view: track the road between frames, work out how the vehicle moved, and use earlier frames to fill in the road it is now covering.",
            "Calibration and surround view: find targets around the vehicle, solve every camera's position together, and accept the result only if it passes a quality check.",
            "Multi-camera stitching: project three overlapping views onto one surface and blend them so moving objects stay whole, live.",
          ],
        },
        {
          kind: "concepts",
          items: ["Optical flow", "Ego-motion estimation", "Robust fitting (RANSAC)", "Fiducial markers", "Pose graphs", "Multi-camera calibration", "Surround view", "Panorama stitching", "Multi-band blending", "GPU kernels", "Low-latency streaming"],
        },
      ],
    },
    {
      id: "decisions",
      nav: "Decisions",
      title: "Decisions and trade-offs",
      blocks: [
        {
          kind: "decisions",
          items: [
            {
              choice: "Check results, not just convergence",
              why: "An optimiser stopping does not mean the cameras agree with what they saw, so calibration passes a quality gate before it is used.",
              cost: "Some sessions are rejected and redone.",
            },
            {
              choice: "Drop late frames on purpose",
              why: "In a live view a late frame is worse than a missing one, so queues are bounded and the drop policy is explicit.",
              cost: "Drops have to be counted and visible.",
            },
            {
              choice: "A fixed seam for stitching",
              why: "A seam that moves every frame flickers and cuts through people and cars.",
              cost: "Parallax near the seam has to be handled another way.",
            },
          ],
        },
      ],
    },
    {
      id: "results",
      nav: "Results",
      title: "Results",
      blocks: [
        {
          kind: "stats",
          items: [
            { value: "~1 h → <5 min", label: "Production calibration time", detail: "Manual setup replaced by detection, a pose-graph solve and a quality gate." },
            { value: "Real time", label: "All three pipelines", detail: "Running on the vehicle's live camera streams, with the stitched view streamed over low-latency RTSP." },
          ],
          note: "The downward-view module has GoogleTest coverage. Other figures from the internship are internal and are not published here.",
        },
      ],
    },
    {
      id: "stack",
      nav: "Stack",
      title: "Stack",
      blocks: [
        {
          kind: "stack",
          groups: [
            { label: "Language and build", items: ["C++17", "CMake", "GoogleTest"] },
            { label: "GPU", items: ["CUDA, including custom kernels", "NVIDIA VPI"] },
            { label: "Vision and optimisation", items: ["OpenCV", "Ceres Solver", "AprilTag, ArUco, ChArUco"] },
            { label: "Streaming", items: ["GStreamer RTP/RTSP", "DDS"] },
          ],
        },
      ],
    },
    {
      id: "learned",
      nav: "What I learned",
      title: "What I learned",
      blocks: [
        {
          kind: "list",
          items: [
            "Make coordinate frames explicit. Naming every transform by the two frames it maps between (B-from-A) makes a chain read in order, and a wrong multiplication shows up in review.",
            "Own resources with RAII. When every buffer, stream and handle has one owner that releases it, shutdown and error paths stop leaking.",
            "Split prepare from process. GPU buffers are allocated once when a pipeline is prepared, and the per-frame path never allocates.",
            "Convergence is not acceptance. An optimiser stopping and a result being good are two different checks.",
            "Every queue needs a size and a drop policy, decided on purpose.",
            "Build observability in from the start: a diagnostics video and counters for drops and rejected points answered most questions before anyone opened a debugger.",
          ],
        },
      ],
    },
  ],
};
