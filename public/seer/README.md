# SEER mjswan Static App

This folder contains the packaged mjswan web viewer mounted as one shared static app.
The portfolio embeds `/seer/index.html?panel=0&config=/seer/assets/config.json`
in iframes and switches scenes with the `scene` query parameter.

Current MJCF scenes:
- `/seer/assets/scene/seer_warehouse/scene.xml`
- `/seer/assets/scene/xarm_pick_cell/scene.xml`
- `/seer/assets/scene/vehicle_bev_rig/scene.xml`
- `/seer/assets/scene/guitar_scale_rig/scene.xml`

The bundled mjswan assets are patched to load MuJoCo and ONNX WASM from
`/seer/assets/*` so the app works when mounted under the Next.js public folder.
