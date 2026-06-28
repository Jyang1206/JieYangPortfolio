# Tech Stack

## Core Runtime

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js App Router | Routes live under `app/`; server pages pass data into client components. |
| Language | TypeScript | Keep component props typed from shared data contracts. |
| Styling | Tailwind CSS v4 | Global tokens and custom utilities live in `app/globals.css`. |
| 3D rendering | React Three Fiber + Three.js | Scene components live in `components/three/scenes/`. |
| 3D helpers | `@react-three/drei` | Use `useGLTF`, `Clone`, camera helpers, and HTML overlays where appropriate. |
| UI animation | Framer Motion | Use for UI transitions; avoid adding GSAP/Theatre unless scroll/camera choreography genuinely needs it. |
| Icons | `lucide-react` | Use for controls and mission/HUD affordances. |

## Architectural Boundaries

- Project content is data-driven from `data/projects.ts`; scenes may read metadata but should not own portfolio copy.
- Scroll orchestration lives in hooks, currently `hooks/useScrollNarrativeProgress.ts` for project stories and `hooks/useHorizontalScrollSection.ts` for horizontal sections.
- Canvas setup and WebGL fallback live in `components/three/ThreeCanvasShell.tsx`; model fallback lives in `components/three/ModelWithFallback.tsx`.
- Scene components should focus on 3D composition, animation, hotspots, and visual annotations.
- UI components should stay usable without WebGL. The written narrative is the primary accessible content.

## Dependency Rules

- Do not add heavy animation, physics, state, or model-processing libraries without a specific need.
- Prefer existing project patterns before adding abstractions.
- Keep browser-only logic inside `"use client"` components or hooks.
- Use static assets from `public/` and avoid committing large unoptimized models.
