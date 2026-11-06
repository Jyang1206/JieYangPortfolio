---
name: st-engineering-aesthetic
description: Use when designing, writing or reviewing anything for the ST Engineering world, its hub slice or its story page in this portfolio. Holds the three projects, what may be stated (no internal names), and the night-ADAS identity.
---

# ST Engineering — computer vision for vehicles

## What it is
Three real-time vision projects on a vehicle, in modern C++ on NVIDIA GPUs.

- Category: **Professional experience**. Software Engineering Intern, Computer Vision & Autonomous Systems. May – Aug 2026.
1. **Downward view**: rebuild the road under the vehicle. VPI pyramidal Lucas–Kanade tracking with forward/backward validation, filtering points on moving obstacles, handling desynchronised video, RANSAC motion estimation with smoothing, temporal image synthesis, ROI caching and hot-path optimisation, GoogleTest.
2. **Calibration and surround view** (one project): pluggable AprilTag / ArUco / ChArUco detectors, per-camera pose estimation, a relative pose graph bootstrapped from an anchor tag and refined with Ceres (robust Huber loss, anchor fixed for gauge freedom), a quality gate so convergence is not acceptance, several camera models, bowl-view extrinsics for the surround (AVM) render. Production calibration went from about an hour to under five minutes.
3. **Multi-camera stitching**: three forward cameras with overlapping views and different perspectives stitched into one cylindrical panorama: GPU dense optical flow reconciled in both directions, foreground/background separation and a fixed seam, timestamp sync with bounded queues that drop stale frames, multi-band blending, custom CUDA kernels, low-latency RTSP via GStreamer, diagnostics video.
- Lessons worth telling: explicit coordinate frames (`AFromB`), RAII and ownership, prepare/process lifecycles for GPU buffers, convergence ≠ acceptance, bounded queues and drop policy, observability.
- Stack: C++17, CUDA, NVIDIA VPI, OpenCV, Ceres, GStreamer RTP/RTSP, DDS, CMake, GoogleTest.
- **Never** state internal project names, repository paths, code identifiers, topic names or customer names. Code is internal; site: https://www.stengg.com

## Assets
- Shader: `components/worlds/shaders/st.ts` (three modes driven by `uParams.x`; `STControls` loops `uParams.y` automatically). Content: `components/worlds/panels/STContent.tsx`.

## Look: night ADAS
- Asphalt navy/black `#0b0d12`–`#1a1d24`, sodium amber `#ffa040` light pools, feature-point mint `#8cf2c8`, lane paint off-white, camera-frustum outlines.
- Type: technical grotesk; mono for frame counts, timings and coordinate labels; diagrams with thin rules and arrows.
- Motifs: flow vectors, feature tracks, frustums, AprilTag squares, stitched seams, before/after toggles.
- Mood: engineering notebook at night, precise and calm.

## Avoid
- Inventing latency numbers or accuracy; any employer-internal detail; bright daytime palettes.
