// Content model for the long-form project stories at /projects/[slug].
// Stories are data: the page shell renders blocks, and diagrams are referenced by id.

export type StoryTheme = "iris" | "tarii" | "movel" | "st" | "guitar" | "battlecode";

export type DiagramId =
  | "iris-pipeline"
  | "iris-contact-graph"
  | "tarii-flow"
  | "tarii-name-match"
  | "movel-integrations"
  | "guitar-pipeline"
  | "battlecode-book";

export type Figure = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  /** Rendered only if the file exists under public/ at build time. */
  optional?: boolean;
  /** "screen" gets a device frame; "photo" a plain mount. */
  frame?: "screen" | "photo" | "phone";
};

export type Stat = {
  value: string;
  /** Confidence interval or count, shown in mono under the value. */
  interval?: string;
  label: string;
  detail?: string;
};

export type Decision = {
  choice: string;
  over?: string;
  why: string;
  cost?: string;
};

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "figure"; figure: Figure }
  | { kind: "phones"; figures: Figure[] }
  | { kind: "stats"; items: Stat[]; note?: string }
  | { kind: "decisions"; items: Decision[] }
  | { kind: "steps"; items: { title: string; body: string }[] }
  | { kind: "diagram"; id: DiagramId; caption: string }
  | { kind: "stack"; groups: { label: string; items: string[] }[] }
  | { kind: "callout"; text: string }
  | { kind: "concepts"; items: string[] };

export type Section = {
  id: string;
  /** Short name in the contents list. */
  nav: string;
  title: string;
  blocks: Block[];
};

export type StoryHeader = {
  /** Display word set in the world's title face. */
  word: string;
  /** One line under the display word. */
  title: string;
  /** The question or summary the story answers. */
  lede: string;
  /** People credited on the work, in order. */
  team?: string;
  /** Image beside the header text. */
  figure?: Figure;
};

export type Story = {
  slug: string;
  /** World id on the home page and /w/[id]; also keys the category. */
  worldId: string;
  theme: StoryTheme;
  name: string;
  role: string;
  dates: string;
  place: string;
  header: StoryHeader;
  /** Short facts in the margin, label then value. */
  facts: { label: string; value: string }[];
  sections: Section[];
};
