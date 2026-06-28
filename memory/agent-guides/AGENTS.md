# memory/agent-guides - condensed portfolio guides

## Purpose

This folder is the fast handoff layer for future agents working on the robotics portfolio. It mirrors the useful pattern from pocket-teleop: start from the root `AGENTS.md`, then read only the guide that matches the files being edited.

## Ownership

Owns the durable project map for:
- `repository-structure.md` - routes, components, hooks, assets, and commands.
- `techstack.md` - runtime stack and library boundaries.
- `data-contracts.md` - project metadata and story-step contract.
- `project-workflow.md` - verification, docs, accessibility, and WebGL expectations.
- `milestones.md` - shipped architecture checkpoints.
- `deviations.md` - accepted tradeoffs that should not be "fixed" blindly.

## Local Contracts

- Keep guides concise and current. Document stable contracts, not conversation history.
- A code change that alters architecture, data shape, commands, assets, or workflow should update the closest relevant guide in the same change.
- Do not duplicate the full root portfolio brief here. These guides should help an agent find the right files and avoid breaking boundaries.

## Work Guidance

- Read `data-contracts.md` before editing `data/projects.ts` or any project scene props.
- Read `repository-structure.md` before moving files, adding routes, or changing scripts.
- Read `techstack.md` before adding dependencies or changing rendering/runtime behavior.
- Read `project-workflow.md` before finishing a task.

## Verification

These files are documentation. Verify them by checking that paths, scripts, data fields, and architectural claims match the current repo.

## Child DOX Index

No children. Leaf boundary.
