# Design system: a tech portfolio with light paper accents

The site reads as a modern robotics portfolio: off-white surfaces, dark ink, one electric blue, thin
1 px rules, precise spacing, mono only for data and labels. Paper is an accent, not the surface: a
faint grain on the hero and the arch, nothing ruled, taped, torn or spiral-bound. The worlds are
rendered live in WebGL and are the memorable thing; everything around them is quiet.

Reference poster: `docs/notebook-reference.webp` (the bold script capital over the condensed word, the
green arch with contour lines, the sparkle, the white-outlined cut-out). The script treatment is used
exactly once, on the home hero ("Jie Yang", owned by `components/about`). Every other heading is the
condensed display face alone.

Stylesheet: `app/globals.css`. Assets: `public/notebook/` (grain, arch mask, contour lines, sparkle,
halftone; the rule/tape/spiral/clip/corner files remain on disk but nothing uses them).

## Pages

| Route | What | Owner |
| --- | --- | --- |
| `/` | nav, hero (`ChooseYourJieYang`), `AboutSection` (greeting, tagline, interests, skills, AI summary), `HomeStage` hub, back cover | `app/page.tsx` |
| `/projects/<slug>` | `WorldStage` (that world rendered live, its overlay and driver, a lead card) then the long-form `StoryPage` | `app/projects/[slug]/page.tsx` |
| `/w/<id>` | permanent redirect to `/projects/<slug>` (`next.config.ts`) | |

`/#experience` and `/#projects` scroll to the hub and filter it by category; `/#explore` scrolls to it.
Keys 1 to 6 open a world's page. `components/worlds/categories.ts` holds the category map
(experience: tarii, movel, st-engineering; project: iris, guitar; hackathon: battlecode), the short
names and `worldHref`.

## Tokens (`:root`)

| Token | Value | Use |
| --- | --- | --- |
| `--nb-paper` | `#f1efea` | surfaces |
| `--nb-card` | `#fbfaf7` | panels |
| `--nb-ink` / `--nb-ink-soft` / `--nb-ink-faint` | `#141414` / `#4a4642` / `#8a8378` | text |
| `--nb-blue` | `#1f4fff` | the accent |
| `--nb-tint` | `#1d5c48` | the green arch tint |
| `--cat-experience` / `--cat-project` / `--cat-hackathon` | `#1f4fff` / `#c2410c` / `#7e22ce` | category dots and chips |

Per-world overrides on `[data-world="…"]`: IRIS (grey board `#e9e9e6`, indigo `#2b2fd4`, Anton titles),
Tarii (still-water `#f7faf8` / `#173d3c` / `#315a60`, Hanken, 14 px radius), Guitar (rosewood paper,
copper accent, italic titles). Others use the defaults.

## Type

Archivo (variable `wdth`; display at `wdth 62/900`, labels at `wdth 100/800`), Schibsted Grotesk for
body, Martian Mono for readouts, Yellowtail for the single script word, Anton for IRIS, Hanken for
Tarii. Loaded in `app/layout.tsx` through `next/font`.

## Classes that components build with

| Class | Purpose |
| --- | --- |
| `.nb-paper` | surface colour + faint grain overlay (`::before`, opacity .16) |
| `.nb-display` / `.nb-label` / `.nb-mono` / `.nb-hand` | type roles (`.nb-hand` is hidden in layouts; kept for the hero) |
| `.nb-card` (+ `.nb-card-title`, `dl`, `.big`, `.ci`, `.foot`) | 1 px panel with a 4 px radius |
| `.nb-note` (+ `.nb-label`, `h3`, `ol/ul` with `.nb-note-num`) | a block with one thin rule above; circled step numbers only for real sequences |
| `.nb-chip[data-category]` | category pill; `.nb-legend-item` is the quiet dot + label form |
| `.nb-btn` / `.nb-btn-ghost` / `.nb-pill` | buttons (ink with blue offset shadow; outlined; pill with the blue dot) |
| `.nb-links` (`ProjectLinks`) | repo and site links; private repos show a lock and no link |
| `.nb-arch`, `.nb-arch-frame`, `.nb-sparkle` | the green arch window with contour lines and the sparkle |
| `.nb-nav*` (`NotebookNav`) | the site nav; hides once the hub takes over on the home page |
| `.nb-about*`, `.nb-intro`, `.nb-skills` | the about section |
| `.nb-hub*`, `.nb-slice*` | the hub: canvas confined to the section, slice notes placed by `HomeStage` |
| `.nb-stage*` | the live world at the top of a project page |
| `.nb-back`, `.nb-cover-*` | the back cover / footer |

Retired (still defined, forced off by the "Tech balance" block at the end of the stylesheet): ruled
backgrounds, spiral, tape, doodles, photo corners, paper clips, handwritten margin notes, torn edges.

## The hub

`HomeStage` owns one WebGL canvas inside the hub section. `WorldRenderer.renderHub` keeps a
quarter-resolution frame per world (refreshed one per frame in turn) and a half-resolution frame of
the hovered world, then `hubShader.ts` cuts them into wedges by polar angle (`uRotate` turns the
pizza; bands by height on narrow screens). Each wedge samples exactly one world. Battlecode's match is
drawn by `hub/battlecodeSlice.ts` into an offscreen 2D canvas at 12 fps and uploaded as that slice's
texture (`setStill` / `touchStill`). The pizza turns at one revolution per 70 s, pauses on hover or
focus, can be dragged, and does not turn under reduced motion. Slice notes are DOM links positioned
at each wedge's middle, compact at rest and opened for the hot slice.

## Accessibility

Body 16 px+ on paper (16:1), blue only for labels and links, focus rings 2 px blue with 2 px offset,
decorative elements `aria-hidden`, reduced motion removes rotation, tilts and transitions, and the
WebGL fallback is each world's `fallback` gradient.
