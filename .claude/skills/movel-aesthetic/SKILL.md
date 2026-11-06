---
name: movel-aesthetic
description: Use when designing, writing or reviewing anything for the Movel AI world, its hub slice or its story page in this portfolio. Holds what the internship was, what may be stated, and its fleet-operations identity.
---

# Movel AI — robotics fleet orchestration

## What it is
Software that lets a mixed fleet of robots work inside real buildings: SEER AMRs, AGVs and an Omron robot dog riding lifts, passing secure doors and moving trolleys and inventory, while operators stay in control.

- Category: **Professional experience**. Full-Stack Developer Intern, Robotics Fleet Orchestration. Dec 2025 – Apr 2026.
- Built: backend services in Node.js/TypeScript; REST APIs, workflow orchestration and state management for robot tasks and inventory; fault-tolerant workflows with validation, retries, resource reservation and recovery; integrations with RFID, MQTT devices, elevator (KONE) controls, door access (SALTO), chutes and inventory platforms; React operator dashboards; Docker deployments with operational validation at NUS and GSK.
- Repo: private. Site: https://www.movel.ai
- Do not invent fleet sizes, uptime or customer outcomes.

## Assets
- `public/images/fleet-management-ui.png` (fleet management + trolley inventory dashboard).
- Shader: `components/worlds/shaders/movel.ts` (top-down warehouse floor, racking, AMRs on dashed routes, self-running dispatch loop to lift lobby / RFID gate / laundry chute / secure store).
- GLBs available: `public/models/amr.glb`, `agv-forklifter.glb`.

## Look: fleet operations floor
- Polished concrete greys `#46494a`–`#7b8081`, safety yellow `#f2c230` lane lines and hazard hatching, racking orange `#d9622b`, route cyan `#40c7ff`, status green `#4ade80`.
- Type: a sturdy grotesk for copy; **mono only for readouts** (task states, destinations, timestamps).
- Motifs: floor markings, dashed planned routes, station markers (lift, door, RFID, chute), task-state timelines (Reserve → Call lift → Ride → Release), map pins.
- Layout: operator-console structure (state columns, step lists) rather than marketing cards.
- Mood: practical, reliable, real buildings.

## Avoid
- Sci-fi neon, glassy HUD clutter, claims about autonomy beyond what is listed.
