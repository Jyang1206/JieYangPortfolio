# AGENTS.md — Robotics Portfolio Website

## Project Summary

This repository is for an interactive robotics portfolio website for Jie Yang.

The website should feel like an immersive robotics showcase: part mission-control interface, part 3D project explainer, part deployment story. It should not look like a generic software engineering portfolio.

The core concept:
- Landing page introduces Jie Yang as someone who enjoys solving problems and helping people.
- The portfolio frames robotics and automation as a way to alleviate repetitive, difficult, or physically demanding work.
- After the landing section, users see floating rotating 3D models representing different projects.
- Each project can be clicked, opening a dedicated project story page.
- Each project page uses scroll-driven 3D storytelling: as the user scrolls, the camera, model, hotspots, overlays, and text change.
- The goal is to show both technical skill and human-centered motivation.

## Agent Handoff / Guide Index

This repo uses a lightweight progressive-disclosure handoff pattern inspired by the pocket-teleop agent guides. Start here for the product brief, then read the focused guide that owns the files you expect to touch.

| Need | Read |
|---|---|
| File map, routes, scripts, and asset locations | `memory/agent-guides/repository-structure.md` |
| Stack boundaries and dependency rules | `memory/agent-guides/techstack.md` |
| Project metadata, story steps, and scene data contracts | `memory/agent-guides/data-contracts.md` |
| Verification, docs expectations, accessibility, and WebGL quality bar | `memory/agent-guides/project-workflow.md` |
| Shipped architecture checkpoints | `memory/agent-guides/milestones.md` |
| Accepted tradeoffs that should not be blindly reversed | `memory/agent-guides/deviations.md` |

Latest handoff:
- The active app is a Next.js App Router portfolio using npm scripts from `package.json`.
- Project content is centralized in `data/projects.ts`; scenes should consume this data rather than own project copy.
- Project story scroll progress is owned by `hooks/useScrollNarrativeProgress.ts`; `ProjectStoryLayout` composes layout, scene selection, and narrative panels.
- Real models currently use available files such as `/models/xarm5-xf1300.glb`, `/models/amr.glb`, `/models/agv-forklifter.glb`, `/models/guitar-camera.glb`, and `/models/vehicle.glb`.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` before finishing code changes when feasible.

## Primary Tech Stack

Use:
- Next.js with App Router
- TypeScript
- Tailwind CSS
- React Three Fiber
- @react-three/drei
- Framer Motion for UI transitions
- Optional: GSAP or Theatre.js only if needed for complex scroll/camera choreography

Do not add heavy animation libraries unless they are clearly necessary.

## Design Direction

The visual identity should combine:
- dark mission-control landing page
- clean engineering case-study project pages
- robotics HUD overlays
- subtle grid lines, small status labels, floating panels, and technical annotations
- professional, modern, readable typography

Avoid:
- overused SaaS landing page visuals
- random neon cyberpunk clutter
- excessive particle effects
- inaccessible low-contrast text
- 3D gimmicks that distract from the project explanation

The site should feel technical, cinematic, and sincere.

## Core Pages

### 1. Home Page `/`

Sections:
1. Landing intro
2. Continue/scroll cue
3. Floating rotating 3D project models
4. Project selection cards
5. Contact/footer

Landing copy should be editable from a data file. Default copy:

"Hi, I'm Jie Yang. I really like solving problems and helping people. Right now, that has manifested in my interest in robotics and automation, because I think these systems can alleviate repetitive work, assist physical workers, and make difficult workflows easier. Enjoy my portfolio."

The tone should be warm, human, and technically curious.

### 2. Project Index / Floating Model Gallery

After the landing page, show floating rotating 3D models for the main projects.

Initial projects:
- xArm Vision-to-Pick Pipeline
- SEER Robot / Full-Stack Fleet Management Experience
- Guitar Scale Visualizer
- ST Engineering Downward View / BEV Motion Estimation
- Optional: AGV / Robot Dog Deployment Story

Each project model should:
- rotate slowly at rest
- have a short title
- have a subtitle describing the experience
- be clickable
- support keyboard focus and accessible labels
- fall back to a styled 2D project card if WebGL fails

### 3. Project Detail Page `/projects/[slug]`

Each project page should:
- use a full-screen or near-full-screen 3D canvas
- include scroll-driven sections
- include sticky explanatory text panels
- animate the camera/model/hotspots based on scroll progress
- use one shared project-story architecture, but allow project-specific scene components

Recommended structure:
- `/app/projects/[slug]/page.tsx`
- `/data/projects.ts`
- `/components/project/ProjectStoryLayout.tsx`
- `/components/project/ScrollNarrative.tsx`
- `/components/three/scenes/*`
- `/components/three/models/*`
- `/components/ui/*`

## Project Story Concepts

### xArm Project

Scene concept:
- 3D model of xArm robot arm
- camera module attached or floating near workspace
- table/workspace plane
- optional target object

Scroll behavior:
1. Overview: show entire robot cell
2. Vision: camera swoops toward camera/sensor hotspot
3. Calibration: show arrows from camera frame to robot base frame
4. Transform Logic: show coordinate frames and target point
5. Pick Execution: highlight end effector and path
6. Safety: show workspace boundary box, dry-run gate, status checks

Hotspots:
- Camera / perception
- End effector
- Robot base
- Workspace
- TF transform chain
- Safety gates

Text should emphasize:
- perception-to-action pipeline
- image/object localization
- camera-to-robot transform
- pre-grasp, grasp, lift, retreat
- dry-run and safety gating

### SEER Robot / Full-Stack Fleet Management Project

Scene concept:
- Ground plane or warehouse/hotel corridor-like floor
- SEER robot starts far away and slowly drives toward center as user scrolls
- Previous company logo placeholder in corner
- Once robot parks in the center, a floating UI render appears
- Optional other robots/AGV/robot dog move in background and center near bottom

Scroll behavior:
1. Overview: robot appears in distance
2. Full-stack backend: robot moves closer; show API/status overlays
3. Fleet logic: show route lines, dispatch states, map zones
4. Integrations: show lift/door/inventory icons around robot
5. UI: robot parks; floating operational UI appears
6. Deployment: multiple robots converge or settle into a final deployment tableau

Text should emphasize:
- full-stack robotics work
- FMS logic
- REST APIs / JSON schemas
- robot dispatch
- UI dashboards
- deployment debugging
- lift/door/inventory integrations

### Guitar Scale Visualizer

Scene concept:
- Camera object or stylized webcam spins into center
- Guitar neck/fretboard appears
- UI overlay renders scale dots on the guitar
- Notes light up according to selected scale

Scroll behavior:
1. Overview: camera/webcam rotates
2. Detection: camera points toward guitar neck
3. Mapping: fretboard grid appears
4. UI render: scale dots appear
5. Interaction: selected musical scale changes visible notes

Text should emphasize:
- computer vision
- detecting guitar frets
- mapping notes to fret positions
- real-time visual overlay
- making music learning more intuitive

### ST Engineering / Downward View Generation

Scene concept:
- Vehicle driving on road
- Feature points / optical flow appear on ground texture
- BEV/downward view panel begins to form beneath the vehicle
- Vehicle slowly becomes transparent near the bottom
- Motion-estimated generated underside/downward view is revealed

Scroll behavior:
1. Overview: vehicle drives across road
2. Feature tracking: show points on road/asphalt
3. Ego-motion: show motion vectors and transform overlay
4. Obstacle filtering: fade out unwanted moving objects/noise
5. Stitching: show recovered downward view region
6. Reveal: vehicle becomes transparent, generated BEV/downward view is visible

Text should emphasize:
- C++ / OpenCV / CUDA
- VPI KLT tracking
- feature detection
- motion estimation
- BEV/downward view generation
- real-time ADAS constraints

## Data-Driven Content

All project metadata should live in `/data/projects.ts`.

Each project should include:
- slug
- title
- subtitle
- shortDescription
- longDescription
- tags
- role
- technologies
- modelPath
- fallbackImage
- storySteps
- accentColor
- sceneType

Story steps should include:
- id
- title
- body
- cameraTarget or narrative cue
- activeHotspot
- optional metrics
- optional technical details

Do not hard-code project text inside scene components unless it is purely visual annotation text.

## 3D Asset Handling

Use `.glb` or `.gltf` models stored under `/public/models`.

Expected paths:
- `/models/xarm.glb`
- `/models/seer.glb`
- `/models/agv.glb`
- `/models/robot-dog.glb`
- `/models/guitar-camera.glb`
- `/models/vehicle.glb`

If a model is missing, create a clean placeholder model using simple primitive geometry. The site must not crash because an asset is missing.

Use:
- `useGLTF` from Drei for model loading
- `Suspense` for loading states
- simple loading fallback
- error boundary or graceful fallback for model loading failure

Do not commit large unoptimized model files without checking size.

## Performance Requirements

Because this is a 3D WebGL portfolio, optimize from the beginning:
- lazy-load project scenes
- keep the landing page lightweight
- use compressed/optimized GLB files when possible
- avoid unnecessary high-poly assets
- reduce texture sizes
- avoid constant render loops where static scenes can rest
- pause or reduce animations when offscreen
- support reduced motion preferences
- provide a non-WebGL fallback for accessibility and weaker devices

Do not create particle-heavy scenes unless explicitly requested.

## Accessibility Requirements

The site must remain usable without 3D interaction.

Include:
- semantic HTML headings
- keyboard-accessible project cards
- readable text panels
- alt/fallback descriptions for 3D projects
- reduced-motion mode
- sufficient contrast
- mobile fallback layouts

The 3D canvas should enhance the project story, not replace the written content.

## Code Style

Use:
- TypeScript
- functional React components
- small composable components
- Tailwind CSS utility classes
- clear file naming
- data-driven rendering

Avoid:
- giant monolithic scene files
- hard-coded project-specific copy scattered across components
- unnecessary global state
- magic numbers without comments in animation timelines
- adding dependencies without reason

## Suggested Component Architecture

Use components similar to:

- `LandingHero`
- `ProjectGalaxy`
- `ProjectModelCard`
- `ProjectStoryLayout`
- `NarrativePanel`
- `ScrollProgress`
- `ThreeCanvasShell`
- `Hotspot`
- `ModelWithFallback`
- `XArmScene`
- `SeerFleetScene`
- `GuitarVisualizerScene`
- `VehicleBevScene`

Use shared helpers for:
- scroll progress
- camera interpolation
- hotspot activation
- model loading fallback
- responsive 3D settings

## Implementation Strategy

Build in phases.

### Phase 1: Working Skeleton
- Next.js app
- Tailwind setup
- homepage
- project data file
- routing to `/projects/[slug]`
- project story layout
- placeholder 3D scenes using simple shapes
- one fully working scroll-driven scene, preferably xArm

### Phase 2: Project Gallery
- floating rotating models/cards
- clickable project selection
- responsive fallback

### Phase 3: Project-Specific Scenes
- implement xArm scene
- implement SEER scene
- implement ST Engineering vehicle scene
- implement guitar visualizer scene

### Phase 4: Polish
- transitions
- UI overlays
- performance
- accessibility
- mobile layout
- content refinement

Do not try to perfect all project scenes in the first pass. Prioritize architecture and one impressive vertical slice.

## Testing / Quality Checks

After changes, run:
- package manager install check
- TypeScript check
- lint
- build

Expected commands, depending on setup:
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm dev`

If scripts do not exist, add reasonable scripts to `package.json`.

Before finishing any task:
- summarize what changed
- list files edited
- mention any missing assets or placeholders
- mention how to run locally
- mention any follow-up tasks
