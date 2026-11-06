/**
 * The Tarii phone-and-calendar loop: six moments of one October, played on a
 * member's phone while the team's desk calendar updates in step. Cast, card
 * kinds and the month are taken from Tarii's "How it works" story; the phone
 * shots are its public Harbourline demo captures.
 */

export type ActorId = "maya" | "jo" | "alex" | "sam";
/** Poses in the Tarii character kit (`/tarii-story/characters/<name>/<pose>.svg`). */
export type Pose = "idle" | "point" | "phone" | "place" | "celebrate";

export const ACTORS: ReadonlyArray<{ id: ActorId; name: string; role: string }> = [
  { id: "maya", name: "Maya", role: "Team member" },
  { id: "jo", name: "Jo", role: "Team member" },
  { id: "alex", name: "Alex", role: "Team member" },
  { id: "sam", name: "Sam", role: "Planner" },
];

/** Where a person stands: x is the feet centre in % of the stage width. */
export interface Mark {
  x: number;
  pose?: Pose;
  say?: string;
}

export interface Shot {
  src: string;
  alt: string;
}

export interface Moment {
  title: string;
  text: string;
  /** The phone's screen: a real capture, or the drawn cover request. */
  screen: Shot | "cover";
  /** Who is on stage; anyone missing walks off. */
  actors: Partial<Record<ActorId, Mark>>;
  /** The planner's side of the same moment, hovering by the calendar. */
  float?: Shot;
}

const S = "/tarii-story/story/";

export const MOMENTS: ReadonlyArray<Moment> = [
  {
    title: "Maya asks for leave",
    text: "From her phone: 20 and 21 October. The request lands on the team's calendar, with the rest of the team's.",
    screen: { src: `${S}x-04-days-20-21.webp`, alt: "Phone leave form with 20 and 21 October picked." },
    actors: { maya: { x: 10, pose: "phone", say: "Leave on the 20th and 21st, please." } },
    float: {
      src: `${S}q-01-queue-new.webp`,
      alt: "The planner's request queue with the new leave request and Accept into plan.",
    },
  },
  {
    title: "The roster goes out",
    text: "The planner solves the month around the requests and publishes. Every shift lands at once, and each member gets a message.",
    screen: { src: `${S}x-08-inbox.webp`, alt: "A member's inbox with the roster-published update." },
    actors: {
      sam: { x: 10, pose: "point", say: "Published." },
      jo: { x: 60, pose: "celebrate", say: "It's out!" },
    },
    float: {
      src: `${S}q-06-published.webp`,
      alt: "The roster after Publish roster, with the line saying who it was published to.",
    },
  },
  {
    title: "Each member sees their own",
    text: "Maya opens her calendar: only her own shifts, with her leave on the 20th and 21st.",
    screen: {
      src: `${S}x-10-calendar.webp`,
      alt: "A member's phone calendar with their own shifts and their leave on 20 and 21 October.",
    },
    actors: { maya: { x: 10, pose: "phone", say: "Only my own shifts." } },
  },
  {
    title: "Alex is sick on the 22nd",
    text: "He reports it from his phone. His seat on the 22nd opens.",
    screen: { src: `${S}m2-02-sick-form.webp`, alt: "The phone form to report a sick day." },
    actors: {
      maya: { x: 10 },
      alex: { x: 60, pose: "phone", say: "Not well. Sick on the 22nd." },
    },
  },
  {
    title: "Maya swaps in",
    text: "Maya is free that day. She takes the seat, and the 22nd is covered again.",
    screen: "cover",
    actors: {
      maya: { x: 10, pose: "place", say: "I'll take the 22nd." },
      alex: { x: 60 },
    },
    float: {
      src: `${S}c-03-covered.webp`,
      alt: "The planner's roster after the cover: the gap is filled and every day is covered.",
    },
  },
  {
    title: "End of the month",
    text: "Each member checks their hours against their contract. The planner sees the balance for each level, never a ranking of people.",
    screen: { src: "/tarii-story/shots/p10-phone.png", alt: "Phone page showing a member's own hours for these dates." },
    actors: {
      maya: { x: 10, pose: "phone", say: "My hours, against my contract." },
      sam: { x: 60, pose: "point", say: "Balance per level." },
    },
    float: {
      src: `${S}r-05-published.webp`,
      alt: "The published roster with the figures for sessions, stretched days and calls for each level.",
    },
  },
];

/** The moment the roster is published: the calendar shows Published from here on. */
export const PUBLISHED_FROM = 1;
/** The cover moment: its cover card lands part way through, once Maya accepts. */
export const COVER_AT = 4;

/** October 2026 starts on a Thursday: three blank cells in a Monday-first grid. */
export const MONTH_OFFSET = 3;
export const MONTH_DAYS = 31;

export type CardKind = "leave" | "off" | "pref" | "day" | "night" | "sick" | "cover";
export interface DayCard {
  day: number;
  kind: CardKind;
  /** "team": someone in the wider team. */
  who: ActorId | "team";
  /** The moment on which the card first lands, so it can animate in. */
  from: number;
}

const SHIFTS_FROM = 1;
const SICK_FROM = 3;

const REQUESTS: DayCard[] = [
  { day: 8, kind: "off", who: "jo", from: 0 },
  { day: 20, kind: "leave", who: "maya", from: 0 },
  { day: 21, kind: "leave", who: "maya", from: 0 },
  { day: 23, kind: "pref", who: "alex", from: 0 },
  { day: 3, kind: "off", who: "team", from: 0 },
  { day: 13, kind: "leave", who: "team", from: 0 },
  { day: 14, kind: "leave", who: "team", from: 0 },
  { day: 27, kind: "pref", who: "team", from: 0 },
  { day: 16, kind: "off", who: "team", from: 0 },
  { day: 30, kind: "off", who: "team", from: 0 },
];

/** Example shifts once the roster is solved. An illustration, not a solver result. */
function exampleShifts(): DayCard[] {
  // day % 3 picks the person; the 22nd falls to Alex, who reports sick later.
  const who: ActorId[] = ["maya", "alex", "jo"];
  const out: DayCard[] = [];
  for (let day = 1; day <= MONTH_DAYS; day++) {
    if (REQUESTS.some((r) => r.day === day)) continue;
    out.push({ day, kind: day % 4 === 0 ? "night" : "day", who: who[day % 3], from: SHIFTS_FROM });
  }
  return out;
}
const SHIFTS = exampleShifts();

/**
 * What the calendar shows at `moment`; it keeps what earlier moments added.
 * `covered` is whether Maya has taken the 22nd yet.
 */
export function cardsAt(moment: number, covered: boolean): DayCard[] {
  const cards = [...REQUESTS];
  if (moment >= SHIFTS_FROM) cards.push(...SHIFTS);
  if (moment >= SICK_FROM) {
    const i = cards.findIndex((c) => c.day === 22);
    if (i >= 0) cards.splice(i, 1);
    cards.push({ day: 22, kind: covered ? "cover" : "sick", who: covered ? "maya" : "alex", from: covered ? COVER_AT : SICK_FROM });
  }
  return cards;
}

export const CARD_LABEL: Record<CardKind, string> = {
  leave: "Leave",
  off: "Day off",
  pref: "Prefers late",
  day: "Day",
  night: "Night",
  sick: "Sick day",
  cover: "Cover",
};
