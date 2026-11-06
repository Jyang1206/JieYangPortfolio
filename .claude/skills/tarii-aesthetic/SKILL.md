---
name: tarii-aesthetic
description: Use when designing, writing or reviewing anything for the Tarii world, its hub slice or its story page in this portfolio. Holds what Tarii is, what may be stated, and its still-water product identity.
---

# Tarii — hospital staff rostering

## What it is
A rostering product for hospital departments and other shift teams. Staff send leave, availability and preferences; the rosterer sets departments, stations, shifts, coverage and rules; a constraint solver proposes a roster; people review, adjust and publish; staff see postings, changes and swaps on their phone.

- Category: **Professional experience**. Role: UI/UX, product and full-stack.
- Jie Yang did a lot of the UI/UX and product work: the web app and the analytics rosterers use to review a roster; spreadsheet import that matches staff names written in shortened or reordered forms; staff notifications through a Telegram bot ahead of a full mobile app.
- Never name real hospitals or clients ("a hospital department in Singapore" at most). Never claim perfect rosters, guaranteed fairness, automatic approval or unverified time savings. Voice: "the lead decides".
- Repo: private (company). Site: https://tarii-site.pages.dev
- Source of truth: the Tarii repo `C:\Users\Admin\Desktop\Tarii\saas-roster` (`docs/design/tarii-design-kit.md`).

## Assets
- `public/images/tarii/`: Harbourline Security demo captures (fictional team): `hero-solve.png` (before), `p4-console.png` (solve console), `p5-roster.png` (after), wordmark.
- `public/tarii-story/`: characters (Maya, Jo, Alex, Sam), story captures, phone shot. `components/worlds/tarii/story/` = the self-running phone + floating calendar loop (`TariiStory`).
- Shader: `components/worlds/shaders/tarii.ts` (dawn light over a roster grid).

## Look: "still water"
- Paper `#f7faf8`, ink `#173d3c`, teal `#315a60`, mint `#a4c8ba`, light mint `#d1e3dc`, amber `#e4b23c` (on-call), muted text `#53706e` (never lighter on paper).
- Type: **Hanken Grotesk** (`var(--font-tarii)`), headlines 600, body 400; the Tarii wordmark image for the name.
- Shapes: rounded rectangles (6–8px controls, 14–16px panels), hairlines and space instead of cards for text, one primary button per screen.
- Motif: inputs settling into a roster grid, one row per person; the floating desk calendar with request cards landing on days; friendly character sprites.
- Mood: calm, quiet coordinator, humane.

## Avoid
- "AI", "smart", "powerful", "algorithm", "best roster" in copy; scoring people; loud colours; paper-notebook framing.
