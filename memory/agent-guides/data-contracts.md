# Data Contracts

## Project Metadata

All portfolio project content is owned by `data/projects.ts`.

`Project` fields:
- `slug` - route segment for `/projects/[slug]`.
- `title`, `subtitle`, `shortDescription`, `longDescription` - user-visible copy and metadata.
- `tags`, `role`, `technologies` - reusable labels and project context.
- `company`, `companyLogo`, `artifactImage`, `concepts` - optional supporting details.
- `modelPath`, `additionalModelPaths`, `fallbackImage` - visual asset references.
- `storySteps` - scroll narrative sequence.
- `accentColor` - project accent used by UI and scenes.
- `sceneType` - scene selector: `xarm`, `seer`, `guitar`, `vehicle`, or `deployment`.
- `category` - home ordering bucket: `experience` or `project`.

## Story Steps

`StoryStep` fields:
- `id` - stable key used by scenes, progress panels, and active hotspot logic.
- `title` and `body` - written narrative. Keep project explanation here, not inside scene files.
- `cameraTarget` - narrative cue for the camera/scene state.
- `activeHotspot` - optional scene hotspot id.
- `metrics` - optional short readouts for panels or HUD elements.
- `technicalDetails` - optional deeper implementation notes.

## Scene Rules

- Scene components receive `project`, `progress`, `activeStep`, and `activeIndex` through `ProjectStoryLayout`.
- Scene files may hard-code geometric labels, hotspot positions, and visual annotations.
- Project facts, role descriptions, project copy, and technologies should stay in `data/projects.ts`.
- If a project needs a new visual behavior, prefer extending `sceneType` and one scene component over branching throughout layout code.

## Asset Rules

- GLB paths should point into `public/models/`.
- Missing assets must not crash the site; use `ModelWithFallback` or primitive placeholders.
- Keep fallback copy and alt-like descriptions available through normal DOM text, not only canvas text.
