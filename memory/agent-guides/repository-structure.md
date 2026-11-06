# Repository Structure

## Top-Level Map

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router routes, global CSS, layout, and project route entrypoints. |
| `components/worlds/` | Home page "five worlds" stage: WebGL2 shaders for each world and its entry crossing (`shaders.ts`), the renderer (`WorldRenderer.ts`) and the long-page stage where scroll scrubs each crossing, `WorldContent.tsx` for each world's cards and captures, `WorldBackdrop.tsx` for story-page heroes and `XArmWorldModel.tsx` for the xArm GLB in the IRIS world (`WorldsStage.tsx`). World copy lives in `data/worlds.ts`. |
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
| `WorldsStage` | Welcome plus five worlds on one long page, crossings scrubbed by scroll; each world is entered through its own crossing (aperture, roster turnover, lidar sweep, optical flow, string pluck). |
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
