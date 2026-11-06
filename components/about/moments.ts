import type { StageScene } from "./drumScene";

/* The hero's click-through "sides of me". Add a photo by adding an entry; order is the click order,
   and the first entry is what loads first. Each moment lists candidate files, tried in order. If none
   loads, a moment with `placeholder` initials shows them in a white-outlined print; any other moment
   is skipped. */
export type HeroMoment = {
  id: string;
  /* Short name used in "Next photo: <label>" and the progress dots. */
  label: string;
  title: string;
  line: string;
  srcs: string[];
  alt: string;
  /* Initials shown in place of the photo while none of `srcs` exists. */
  placeholder?: string;
  /* Where the face sits, so object-fit: cover keeps it in frame. */
  objectPosition: string;
  /* What the green arch does behind this photo. */
  scene: StageScene;
};

export const heroMoments: HeroMoment[] = [
  {
    id: "hello",
    label: "Portrait",
    title: "Engineer",
    line: "Robotics, AI, backends and interfaces. Click the photo to see the other sides.",
    srcs: ["/images/me/portrait.jpg", "/images/me/portrait.webp", "/images/me/portrait.png"],
    alt: "Portrait of Jie Yang in Paris.",
    placeholder: "JY",
    objectPosition: "50% 30%",
    scene: "calm",
  },
  {
    id: "drummer",
    label: "Drummer",
    title: "Drummer",
    line: "I also enjoy drumming and performing in a band!",
    srcs: ["/images/me/drum-kit-selfie.webp"],
    alt: "Jie Yang taking a selfie behind a drum kit on a pink-lit stage, with a cymbal and a bandmate on guitar behind him.",
    objectPosition: "50% 74%",
    scene: "drums",
  },
  {
    id: "supernova",
    label: "Supernova 2025",
    title: "Supernova 2025",
    line: "Second runner-up at NUS Supernova 2025.",
    srcs: ["/images/me/supernova-award.webp"],
    alt: "Jie Yang smiling on an outdoor festival stage under green stage lights, holding an award and a pair of drumsticks, with a crowd behind him.",
    objectPosition: "50% 50%",
    scene: "stage",
  },
];
