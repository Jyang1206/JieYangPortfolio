import type { World } from "./worlds";

// Sources: the team's Battlecode 2026 repository (GitHub Jyang1206/battlecode, a fork of privateducksheep/battlecode).
// Game facts come from its GameRules.md; built items from draft.cpp / plan.h, bot.cpp / hunt.cpp,
// scripts/replay_decode.py, tools/opponent_bank.py and tools/bench3.py.
// Ladder facts come from the user's screenshots of the team page on 2026a.battlecode.co.uk (public/images/battlecode):
// team-stats.webp, taken 7 Nov 2026 (season chart 14 Oct to 7 Nov), and team-page.webp, an earlier capture at #11.
// The background replay is the unranked Rows match 2e59cf07 (14 Oct 2026, OneTap won 1,056 to 924), decoded in the
// team repository under docs/strategy/evidence/rows/2e59cf07.
export const battlecodeWorld: World = {
  id: "battlecode",
  name: "Battlecode",
  place: "Cambridge Battlecode 2026 · team OneTap",
  role: "Bot strategy, replay analysis and testing",
  excerpt:
    "A C++ bot, written by three of us from NUS, that plays Cambridge Battlecode matches on its own and peaked at #11 on the 2026 ladder.",
  built: [
    "A C++ bot that picks champions per map during the draft, farms camps, banks gems at altars and weighs each fight before it commits",
    "A replay decoder that rebuilds every round of a match from the official engine: positions, gems carried, attacks, captures and deaths",
    "Paired local benchmarks against a bank of frozen opponents on every map from both sides, used to compare versions before uploading one",
    "Platinum tier: a peak rating of 2,035 and a peak ladder position of #11 in the 2026 season (14 Oct to 7 Nov 2026); on 7 Nov, #88 of 825 at 1,997 Elo, with a 51% win rate over 3,390 ranked games",
  ],
  tags: ["C++", "Game AI", "Python", "Replay analysis", "Benchmarking"],
  crossing: "fog of war",
  fallback: "radial-gradient(circle at 66% 50%, #3f5a24 0%, #22301a 42%, #0b0d0c 82%)",
  shots: [
    {
      src: "/images/battlecode/team-stats.webp",
      alt: "OneTap team page: Platinum, 1,997 Elo, ladder #88 of 825, peak rating 2,035, peak position #11, 51% ranked win rate from 1,717 wins and 1,673 losses, with the season rating chart from 14 Oct to 7 Nov",
      caption: "Our team page on 7 Nov: peak #11 and 2,035 Elo during the season, 3,390 ranked games played.",
      width: 1300,
      height: 1220,
      kind: "screen",
    },
    {
      src: "/images/battlecode/visualiser-match.webp",
      alt: "Official Battlecode visualiser mid-match at round 874 of 1679: a grass map with stone walls and a dark path loop, OneTap champions ringed blue, the opponent's ringed red, and gold coin stacks on camps",
      caption: "A ladder match in the official visualiser. OneTap's champions are ringed blue.",
      width: 698,
      height: 724,
      kind: "screen",
    },
  ],
};
