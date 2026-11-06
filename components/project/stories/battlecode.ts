import type { Story } from "../types";

// Sources: the team repository (README, GameRules.md, docs/ARCHITECTURE.md, docs/TEST_BENCH.md),
// data/battlecode.ts and the team page captures in public/images/battlecode (ladder figures as at 7 Nov 2026).
export const battlecodeStory: Story = {
  slug: "battlecode",
  worldId: "battlecode",
  theme: "battlecode",
  name: "Battlecode",
  role: "Bot strategy, replay analysis and testing",
  dates: "Oct – Nov 2026",
  place: "Cambridge Battlecode 2026, team OneTap",
  header: {
    word: "Battlecode",
    title: "Cambridge Battlecode 2026",
    lede: "A programming competition where the code plays the match. Our C++ bot drafts champions for each map, clears monster camps for gems and gold, and races the other team to tribute 1,000 gems at altars.",
    team: "Team OneTap, three NUS students",
    figure: {
      src: "/images/battlecode/visualiser-match.webp",
      alt: "Match replay in the official visualiser: OneTap's champions in blue against the opponent's in red on a grass map with camps and altars",
      caption: "A ranked match in the official visualiser: our champions are ringed in blue, round 874 of 1,679.",
      width: 698,
      height: 724,
    },
  },
  facts: [
    { label: "Team", value: "OneTap, three NUS students" },
    { label: "Role", value: "Bot strategy, replay analysis and testing" },
    { label: "Tier", value: "Platinum" },
    { label: "Language", value: "C++ bot, Python tooling" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The game",
      title: "The game",
      blocks: [
        {
          kind: "p",
          text: "Before a match, both teams draft three to five champions, one at a time and simultaneously, with the whole map visible. The map is dotted with camps of monsters. Clearing a camp and capturing its region drops gems and gold. Gold buys items at the spawn; gems have to be carried to an altar and tributed. The first team to tribute 1,000 gems wins at once; otherwise, at round 2,000, tributed gems decide, then lifetime gold, then kills.",
        },
        {
          kind: "p",
          text: "Nobody plays. Each champion runs our code every turn under a compute budget, and a turn that runs out of budget is suspended mid-function. So the bot has to decide quickly as well as well, and every extra check in a hot path costs something.",
        },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        {
          kind: "list",
          items: [
            "Strategy for a C++ bot that picks champions per map during the draft, farms camps, banks gems at altars and weighs each fight before it commits.",
            "A replay decoder that rebuilds every round of a match from the official engine: positions, gems carried, attacks, captures and deaths.",
            "Paired local benchmarks against a bank of frozen opponents, on every map from both sides, used to decide which version went live.",
          ],
        },
        {
          kind: "p",
          text: "The team kept one folder per teammate and one frozen folder per version, never editing an old version, so any change could be measured against a fixed control.",
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
          text: "Each champion runs the same short list of priorities every turn (fight if it is worth it, otherwise retreat, capture, bank gems or farm) and stops at the first one that uses the turn. Map-specific choices live in a small strategy book, one entry per map and side, separate from the engine of skills.",
        },
        { kind: "diagram", id: "battlecode-book", caption: "Skills hold no map knowledge. The book decides, per map and side, which draft and behaviour to use." },
        {
          kind: "p",
          text: "The replay decoder rebuilds every round of a match, so we could see what a version actually spent its turns on. Paired benchmarks played both sides of every map against frozen opponents before a version was uploaded.",
        },
        {
          kind: "concepts",
          items: ["Game AI under a compute budget", "Drafting", "Data-driven strategy tables", "Replay analysis", "Paired benchmarking", "Rating-adjusted comparison"],
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
              choice: "Strategy per map and side",
              over: "Over one global improvement",
              why: "The live record showed that the same guard rules helped some cells and hurt others. On one map's side a, the unguarded core went 10 of 14 while the guarded core went 8 of 32 with the same draft.",
              cost: "Eighteen cells to keep track of, which is why they became data in a book.",
            },
            {
              choice: "Freeze every version",
              over: "Over editing in place",
              why: "A change can only be measured against something that does not move.",
              cost: "Many folders, and discipline about which one is current.",
            },
            {
              choice: "Paired benchmarks on every map and side",
              over: "Over a few watched games",
              why: "Single games are noisy. Playing both sides of every map against the same opponents makes two versions comparable.",
              cost: "Hours of local games for each candidate.",
            },
            {
              choice: "Test locally or unranked, never on ranked",
              over: "Over trying ideas on the ladder",
              why: "Ranked games move the team's rating. An experiment there costs real standing.",
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
            { value: "Platinum", label: "Tier" },
            { value: "2,035", label: "Peak rating" },
            { value: "#11", label: "Peak ladder position" },
            { value: "51%", interval: "1,717 W · 1,673 L", label: "Ranked win rate", detail: "Over 3,390 ranked games." },
          ],
          note: "From the team page on 7 November 2026, when OneTap stood at #88 of 825 with a rating of 1,997.",
        },
        {
          kind: "figure",
          figure: {
            src: "/images/battlecode/team-stats.webp",
            alt: "OneTap team page: Platinum, peak rating 2,035, peak position #11, ranked win rate 51%, and rating over the season",
            caption: "Rating over the season, from 14 October to 7 November. The dashed line is ladder position.",
            width: 1300,
            height: 1220,
            frame: "screen",
          },
        },
        { kind: "h3", text: "What the benchmarks could not tell us" },
        {
          kind: "p",
          text: "We tried to find a local test that would predict the live ladder, so it could gate releases. It did not exist. After adjusting for opponent strength and the mix of maps and sides, the 14 versions with at least 50 live games were statistically indistinguishable (p = 0.46); an apparent ranking among them was mostly who each version happened to play. Across 3,780 local games no panel of local opponents reproduced the live order. The protocol we kept instead was the same opponents and maps for every version, in one time window, scored with a model of how the bot played.",
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
            { label: "Bot", items: ["C++", "The competition's C++ SDK and CLI"] },
            { label: "Tooling", items: ["Python replay decoder", "Benchmark and comparison scripts", "Opponent bank of frozen bots"] },
            { label: "Analysis", items: ["Rating-adjusted win models", "Per-map, per-side breakdowns"] },
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
            "Win rates without opponent strength mean little. Most of an apparent ranking can be who you happened to play.",
            "A refactor needs an identity test before it needs a review: same inputs, same outputs, on every case.",
            "When the budget is per turn, order of work is strategy.",
            "Look at what the bot did, from replays, before arguing about what it should do.",
          ],
        },
      ],
    },
  ],
};
