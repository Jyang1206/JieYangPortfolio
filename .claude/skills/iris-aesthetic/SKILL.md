---
name: iris-aesthetic
description: Use when designing, writing or reviewing anything for the IRIS world, its hub slice or its story page in this portfolio. Holds what IRIS is, the facts that may be stated, and its visual identity (the INSPIRE 2026 poster).
---

# IRIS — Intelligent Robotic Instrument Sorter

## What it is
A real-time perception-to-grasp robot cell that sorts ophthalmic surgical instruments after eye surgery. A wrist-mounted Intel RealSense D435i streams RGB-D into ROS 2 Jazzy; C++ and Python nodes run YOLO instance segmentation and tracking, DINOv3 identity checks and learned contact heads that decide which instrument is on top; MoveIt and ros2_control drive a UFACTORY UF850 arm with the xArm gripper; a React dashboard shows it live over WebSocket and WebRTC. Every move stays inside a shared workspace and waits for explicit operator approval.

- Category: **Project**. NUS CDE3301, with the Singapore National Eye Centre (SNEC). Jan 2026 – present. Team: Ng Jie Yang, Alexander Yaw.
- Jie Yang's part: cleaned and curated the datasets; trained and evaluated every model (YOLO segmentation, DINOv3 identity head on masked crops with leave-one-capture-day-out evaluation, contact heads, vision-language experiments); mapped RGB-D detections into grasp coordinates for the UFACTORY arm through ROS 2 and MoveIt.
- Pipeline: Capture scene → Detect + track → Confirm identity → Determine order → Plan + approve → Pick + place.
- Results (poster, 28 trays, new physical layouts not in training data, 95% intervals): 94% [88–97] instruments detected from the initial survey (131/140); 78% [66–87] accuracy identifying the upper instrument in touching pairs; 87% [80–92] of proposed picks safe (nothing resting on them); 83% [66–93] trays fully sorted without intervention (25/30). Pick order is advisory; robot motion stays under backend checks and operator supervision.
- Repo: private. No public site. Source of truth: the IRIS repo (`C:\Users\Admin\OneDrive\Desktop\3301\IRIS`, AGENTS.md, docs/).

## Assets
- `public/images/iris/`: `wrist-camera-tray.png` (real wrist frame), `console-tray-check.png` (operator console), `dino-identity.png` (identity-training figure), optional `grasp-point.png`, `wrist-hardware.png`.
- 3D: `components/worlds/iris/arm/` (animated UF850 sort loop + `IrisDetectionsPanel`), `public/robot/uf850/uf850-visual.glb` (UFACTORY BSD-3 licence alongside).
- Shader: `components/worlds/shaders/iris.ts` (steel tray under theatre light, cobalt detection brackets).

## Look: the INSPIRE 2026 poster
- Surface: grey board `#e9e9e6`; ink `#111111`; single accent indigo `#2b2fd4`; dashboard cobalt `#3b7cff` only for detection overlays.
- Type: **Anton** (`var(--font-iris)`) uppercase for the IRIS wordmark and big numbers; **italic heavy** sans for section labels ("DETECTION", "PERCEPTION", "PICKING"); clean grotesk body.
- Motifs: aperture/iris rings with degree ticks, viewfinder corner brackets, detection boxes with "ID · CONF" tags, the blue nitrile glove meeting the gripper, thin black swoosh rules.
- Layout: poster-like blocks with heavy top rules; big percentages with bracketed intervals; a horizontal six-step pipeline with icons.
- Mood: clinical, precise, confident. White light, steel, indigo.

## Avoid
- Claiming clinical deployment, accuracy beyond the poster numbers, or that the robot acts without approval.
- Warm or playful palettes; paper/notebook framing; emoji.
