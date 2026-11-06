---
name: battlecode-aesthetic
description: Use when designing, writing or reviewing anything for the Battlecode world, its hub slice or its story page in this portfolio. Holds team facts, what the team built, and the game-board identity.
---

# Battlecode — Cambridge Battlecode 2026, team OneTap

## What it is
A programming competition where the code plays the match. Team OneTap (three NUS students) wrote a C++ bot that drafts champions per map, clears monster camps for gems and gold, and races the other team to tribute gems at altars.

- Category: **Hackathon**. Season 14 Oct – 7 Nov 2026.
- Results (team page screenshots): Platinum; peak rating 2,035; peak ladder position #11; on 7 Nov #88 of 825 at 1,997 Elo; 51% ranked win rate over 3,390 ranked games (1,717 W · 1,673 L).
- Built (from the team repo): the C++ bot (draft, camp farming, gem banking, fight evaluation); a replay decoder rebuilding every round from the official engine; paired local benchmarks against a bank of frozen opponents on every map from both sides, used to compare versions before uploading one.
- Repo: private. Site: https://2026a.battlecode.co.uk
- Source: team repo clone `C:\Users\Admin\OneDrive\Desktop\3301\battlecode-ref` (README, GameRules.md, docs/), `data/battlecode.ts`.

## Assets
- `public/images/battlecode/`: `visualiser-match.webp`, `team-stats.webp`, `team-page.webp`.
- Replay: `public/battlecode/match.json` (real unranked OneTap win on the Rows map, 1,056–924, 430 rounds) drawn by `components/worlds/battlecode/` (`BattlecodeReplayOverlay`, `draw.ts`). No official art is used (licence unclear).

## Look: the game board
- Olive grass `#4f5c40`–`#6b7a45` with a fine grid, stone walls `#8a8f86`, dark path loop, team blue `#4f8dff` vs red `#e2504a`, gold `#f2c14e`, gem purple `#9b6bff`; dark UI chrome `#101310`.
- Type: bold sporty grotesk for headings; mono for rounds, Elo and scores.
- Motifs: champion tokens with team rings, round counters, score bars, ladder chart line, map tiles.
- Mood: competitive, game-like, fun; numbers front and centre.

## Avoid
- Official sprites/logos unless a licence allows; inventing tournament placements beyond the facts above.
