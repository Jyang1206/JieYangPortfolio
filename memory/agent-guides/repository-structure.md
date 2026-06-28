# Repository Structure

## Top-Level Map

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router routes, global CSS, layout, and project route entrypoints. |
| `components/home/` | Home page sections: hero, simulation embed, project gallery, systems showcase, about scroller. |
| `components/project/` | Shared project-story layout, narrative panels, and project-specific embeds. |
| `components/three/` | Canvas shell, model fallback, hotspots, and R3F scene components. |
| `data/` | Editable portfolio content and project metadata. |
| `hooks/` | Browser interaction hooks for reduced motion, scroll sections, and story progress. |
| `public/models/` | GLB assets used by gallery and project scenes. |
| `public/images/` | Screenshots and image artifacts. |
| `public/seer/` | Embedded SEER/MuJoCo-style simulation artifact and support files. |
| `scripts/` | Asset conversion and model generation helpers. |
| `docs/` | Durable implementation notes and asset pipeline documentation. |
| `memory/agent-guides/` | Condensed agent handoff guides. |

## Routes

| Route | Entry | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Renders the landing hero, simulation, project gallery, systems showcase, about, and footer. |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | Uses `data/projects.ts` for static params, metadata, and story layout content. |

## Key Components

| Component | Purpose |
|---|---|
| `LandingHero` | Mission-control intro and featured 3D model preview. |
| `ProjectGalaxy` | Floating project selection gallery and accessible project links. |
| `ProjectStoryLayout` | Shared project detail shell: intro, artifacts, sticky canvas, and narrative panels. |
| `ThreeCanvasShell` | Shared R3F canvas wrapper with fallback content. |
| `ModelWithFallback` | Loads GLB assets via Drei and falls back to primitive/2D content on failure. |
| `XArmScene`, `SeerFleetScene`, `GuitarVisualizerScene`, `VehicleBevScene` | Project-specific scroll-driven scene implementations. |

## Commands

The current package manager state is npm (`package-lock.json` is present).

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

If a task changes scripts or package management, update this file and root `AGENTS.md`.
