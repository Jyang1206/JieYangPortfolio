# Model And MuJoCo Pipeline

## Model Sources

- xArm: start from UFACTORY/xArm ROS description or MuJoCo Menagerie. Prefer URDF/MJCF as the source of truth, then export a web presentation GLB.
- SEER / AMR / AGV: use approved company CAD or simplified inspired geometry. Do not publish proprietary exact CAD unless Jie has permission.
- Guitar and vehicle scenes: use lightweight licensed GLB assets or simplified Blender models tuned for storytelling.

## Asset Workflow

1. Collect source model: `URDF`, `MJCF`, `STEP`, `STL`, `DAE`, `FBX`, or `GLB`.
2. Clean in Blender:
   - remove internal parts and hidden hardware
   - simplify high-poly geometry
   - assign a small material set
   - set origins and pivots per moving link
   - name major robot links clearly
3. Export presentation assets to `public/models/*.glb`.
4. Optimize:
   - `gltf-transform optimize input.glb output.glb`
   - keep textures small
   - target roughly 2-5 MB per hero model when possible
5. Keep simulation assets separate from presentation assets:
   - MuJoCo / MJCF: `public/seer/assets/scene/**/scene.xml`
   - Three.js / R3F: `public/models/*.glb`

## Current Website Integration

- Landing and gallery scenes load GLB or MJCF-derived preview geometry through `ModelWithFallback` and `MjcfPreviewModel`.
- Missing or broken model assets fall back to simple primitive geometry, so the site should not crash when a model is absent.
- The homepage embeds the bundled mjswan MuJoCo WASM viewer from `public/seer/index.html`.
- Project pages embed the matching scene through `MjswanProjectEmbed`.
- The xArm story scene also replays a small MuJoCo-style pick trace so scroll progress drives arm pose, gripper state, target lift, and end-effector path.

## MuJoCo Trace Workflow

The robust portfolio path is:

1. Author or import an MJCF scene.
2. Run MuJoCo locally or in Python.
3. Export a compact JSON trace:
   - time
   - joint positions
   - end-effector pose
   - target object pose
   - gripper state
   - phase/status labels
4. Replay that trace in React Three Fiber.

This keeps the website fast and reliable while still making the animation physically informed.

## Next Model Improvements

- Replace the current placeholder/converted models with cleaned link-aware GLBs.
- Add one exported trace JSON per major project.
- Add a small script under `scripts/` that converts MuJoCo state logs into the exact trace shape used by the R3F scenes.
- Compress final GLBs before deployment.
