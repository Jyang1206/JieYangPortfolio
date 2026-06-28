# Project Workflow

## Change Flow

1. Read root `AGENTS.md`.
2. Read the guide that owns the files being changed.
3. Make scoped edits following current patterns.
4. Update guides when a change alters structure, data contracts, commands, assets, or workflow.
5. Run relevant checks before final response.

## Verification

Expected checks for ordinary code changes:

```bash
npm run lint
npm run typecheck
npm run build
```

Run `npm install` only when dependencies or lockfile state require it. Start `npm run dev` when the user needs to try the app locally.

## Frontend Quality Bar

- The first screen should be the portfolio experience, not a marketing splash detached from the app.
- 3D should enhance the story; written content and links must remain usable when WebGL fails.
- Respect reduced-motion preferences.
- Maintain keyboard-accessible project navigation.
- Avoid low-contrast text, heavy particles, and generic SaaS visuals.
- Keep cards to repeated items, modals, and framed tools. Do not nest cards inside cards.

## 3D Quality Bar

- Use lazy or scoped scene loading when adding heavier scenes.
- Keep placeholder primitives polished and intentional when real models are unavailable.
- Avoid constant animation work when a scene is offscreen or reduced motion is enabled.
- Test mobile and desktop layout when changing sticky canvas, overlays, or text panels.

## Documentation Rule

When a code change affects durable project behavior, update the nearest relevant guide. Small visual tuning may leave docs unchanged, but still check whether the guide has become stale.
