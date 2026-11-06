import { aiExperience } from "../../../data/profile";
import type { Story } from "../types";

const guitarModel = aiExperience.find((line) => line.includes("(Guitar Scale Visualizer)"))?.replace(/\s*\(Guitar Scale Visualizer\)$/, "");

// Sources: the user's resume (NUS Orbital 2025, Artemis), data/worlds.ts and the previous data/projects.ts copy.
export const guitarStory: Story = {
  slug: "guitar-scale-visualizer",
  worldId: "guitar",
  theme: "guitar",
  name: "Guitar Scale Visualizer",
  role: "Software engineer and co-lead",
  dates: "May – Aug 2025",
  place: "NUS Orbital 2025, Artemis",
  header: {
    word: "Guitar",
    title: "Guitar Scale Visualizer",
    lede: "A practice app that finds the fretboard in your webcam feed, lights up where the notes of a scale are on your own guitar, and listens to check that you played them.",
  },
  facts: [
    { label: "Role", value: "Software engineer and co-lead" },
    { label: "Dates", value: "May – Aug 2025" },
    { label: "Programme", value: "NUS Orbital 2025, Artemis" },
    { label: "Runs in", value: "The browser, with a webcam and microphone" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The problem",
      title: "The problem",
      blocks: [
        {
          kind: "p",
          text: "Scale charts are drawn on a flat, generic neck. To use one, a learner has to translate the chart onto their own guitar, at whatever angle they are holding it, while also trying to play in time. And a chart cannot tell you whether the note you just played was the right one.",
        },
        {
          kind: "p",
          text: "We wanted the chart to sit on the real fretboard, and the app to listen.",
        },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        {
          kind: "p",
          text: "I co-led the project as a software engineer. What the app does:",
        },
        {
          kind: "list",
          items: [
            ...(guitarModel ? [guitarModel] : []),
            "A calibration system that maps the detected neck to frets and strings, so scale notes land in the right places.",
            "Scale overlays drawn on the live video.",
            "Web Audio pitch detection for play-along timing and scoring.",
            "A tuner, a YouTube speed adjuster and a custom tab creator around the core practice loop.",
          ],
        },
      ],
    },
    {
      id: "how",
      nav: "How it works",
      title: "How it works",
      blocks: [
        {
          kind: "p",
          text: "Two loops run side by side in the browser: one watches the guitar and places the notes, the other listens and checks what was played.",
        },
        { kind: "diagram", id: "guitar-pipeline", caption: "Vision places the notes; audio checks what was played." },
        {
          kind: "concepts",
          items: ["Object detection", "In-browser inference", "Camera calibration", "Live video overlays", "Pitch detection", "Timing and scoring"],
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
              choice: "Run the model in the browser",
              over: "Over sending frames to a server",
              why: "The overlay has to follow the guitar as it moves. Keeping inference on the user's machine avoids a network round trip on every frame and keeps the video private.",
              cost: "The model has to be small enough for an ordinary laptop.",
            },
            {
              choice: "A calibration step",
              over: "Over trusting each frame's detection alone",
              why: "A detection says where the neck is, not where each fret is. Calibration supplies that mapping, which is what makes the overlay land on the right notes.",
              cost: "One setup step before practice.",
            },
            {
              choice: "Check playing by ear",
              over: "Over watching the fingers",
              why: "Pitch is direct evidence of the note played. Finger positions on camera are often hidden by the hand.",
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
            { value: "90%", label: "Note-overlay accuracy", detail: "Scale notes drawn in the right place on the fretboard." },
            { value: "30 FPS", label: "Overlay frame rate", detail: "In the browser, on the live webcam feed." },
            { value: "Artemis", label: "NUS Orbital 2025", detail: "The highest Level of Achievement in NUS Orbital." },
          ],
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
            { label: "App", items: ["React", "Vite", "Firebase"] },
            { label: "Vision", items: ["YOLOv8", "InferenceJS"] },
            { label: "Audio", items: ["Web Audio API pitch detection"] },
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
            "A real-time overlay lives or dies on its frame budget; accuracy that arrives late looks wrong.",
            "Detection is only half of placing something on a real object. The mapping from the detection to the object's own geometry is where accuracy is won.",
            "Practice tools need feedback. Listening to what was played turned a chart into an exercise.",
          ],
        },
      ],
    },
  ],
};
