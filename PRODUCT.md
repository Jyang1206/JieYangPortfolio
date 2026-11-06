# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers for robotics, perception, and full-stack roles, usually opening the link from a CV or message on a laptop, with a few minutes to decide whether Jie Yang is worth an interview. Secondary: engineers who click into a project story to check depth.

## Product Purpose

A personal portfolio for Jie Yang (NUS Computer Science, expected 2027). It shows five bodies of work, each as its own environment the visitor travels through, and lets the visitor open a scroll-driven story for each one. Success: a visitor can name what Jie built at each place after one pass, and opens at least one story.

## Positioning

Every project is shown inside the physical setting it was built for (operating theatre cell, vehicle on a road, warehouse floor, hospital roster office, guitar fretboard), rendered in real time, so the work reads as deployed systems rather than repos.

## Operating Context

Five environments, in this order unless changed:

- IRIS: ophthalmic surgical-instrument detection, identity confirmation, contact-ordered picking and xArm execution with operator approval and backend safety gates (SNEC industry project). Source of truth: the IRIS repository.
- ST Engineering: ADAS perception intern; C++/CUDA/NVIDIA VPI KLT optical flow, ego-motion estimation, under-vehicle (downward/BEV) view reconstruction.
- Movel AI: full-stack robotics fleet orchestration intern; SEER AMRs, AGVs, Omron robot dog, dispatch and reservation logic, lift/door/RFID/chute integrations, React operator dashboards.
- Tarii: full-stack / product work on a hospital staff rostering product; web app, analytics interface, spreadsheet import with inconsistent staff-name matching, and staff notifications (Telegram bot explored ahead of a mobile app).
- Guitar Scale Visualizer: NUS Orbital Artemis project; YOLOv8 fretboard detection, calibration, scale overlays, Web Audio pitch detection.

## Capabilities and Constraints

- Next.js App Router, TypeScript, Tailwind v4, React Three Fiber/drei, Framer Motion (existing stack; do not add heavy animation libraries).
- Backgrounds are real-time rendered (WebGL), chosen by the user over generated images.
- Existing GLB models under `public/models`, MuJoCo browser sim under `public/seer`, project story routes under `/projects/[slug]`.
- Must work without WebGL, honour reduced motion, and stay usable on mobile.

## Evidence on Hand

- Project copy in `data/projects.ts`.
- Fleet UI screenshot `public/images/fleet-management-ui.png`.
- No Tarii screenshots, logo, or metrics yet. Client hospital names and commercial terms from Tarii are not to be published unless the user confirms.
- No Tarii project entry existed before this redesign; its copy is drafted from the user's answer and must be confirmed by the user.

## Product Principles

- Show the setting the system works in, then the system.
- Name concrete technical work; no invented metrics, clients, or results.
- Robotics and automation framed as help for the people doing the work.
- The written story stays readable without 3D.

## Accessibility & Inclusion

Reduced-motion mode, keyboard-reachable project entries, readable contrast over animated backgrounds, non-WebGL fallback.
