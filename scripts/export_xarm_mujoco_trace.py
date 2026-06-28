#!/usr/bin/env python3
"""Export the xArm portfolio pick trace from the bundled MJCF scene.

The current MJCF scene is intentionally lightweight for the browser viewer: the
arm is static geometry and only the tool has a freejoint. This exporter still
loads the MJCF with MuJoCo when available, records scene metadata, and writes the
waypoint trace consumed by the React Three Fiber xArm story. When the MJCF is
upgraded to an actuated xArm model, replace KEYFRAMES with qpos-derived samples.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MJCF = ROOT / "public" / "seer" / "assets" / "scene" / "xarm_pick_cell" / "scene.xml"
DEFAULT_OUTPUT = ROOT / "public" / "sim" / "xarm-pick-trace.json"

KEYFRAMES: list[dict[str, Any]] = [
    {
        "t": 0.0,
        "phase": "overview",
        "joints": [0.0, -0.1, 0.16, 0.04],
        "ee": [0.98, 0.88, 0.0],
        "target": [0.76, 0.08, 0.34],
        "gripper": 1.0,
        "status": ["cell_ready", "dry_run_enabled"],
    },
    {
        "t": 0.16,
        "phase": "vision",
        "joints": [0.03, -0.02, 0.1, -0.02],
        "ee": [0.88, 0.86, 0.1],
        "target": [0.76, 0.08, 0.34],
        "gripper": 1.0,
        "status": ["camera_locked", "object_detected"],
    },
    {
        "t": 0.32,
        "phase": "calibration",
        "joints": [0.08, 0.14, -0.02, -0.08],
        "ee": [0.78, 0.62, 0.23],
        "target": [0.76, 0.08, 0.34],
        "gripper": 1.0,
        "status": ["tf_chain_valid", "workspace_valid"],
    },
    {
        "t": 0.46,
        "phase": "pre_grasp",
        "joints": [0.11, 0.24, -0.09, -0.08],
        "ee": [0.74, 0.38, 0.31],
        "target": [0.76, 0.08, 0.34],
        "gripper": 1.0,
        "status": ["pre_grasp_pose", "reachability_ok"],
    },
    {
        "t": 0.58,
        "phase": "grasp",
        "joints": [0.12, 0.18, -0.04, -0.02],
        "ee": [0.76, 0.2, 0.34],
        "target": [0.76, 0.18, 0.34],
        "gripper": 0.0,
        "status": ["gripper_closed", "contact_assumed"],
    },
    {
        "t": 0.74,
        "phase": "lift",
        "joints": [0.03, -0.04, 0.12, 0.08],
        "ee": [0.86, 0.82, 0.22],
        "target": [0.86, 0.58, 0.22],
        "gripper": 0.0,
        "status": ["lift_clear", "tool_secured"],
    },
    {
        "t": 1.0,
        "phase": "retreat",
        "joints": [-0.08, -0.16, 0.2, 0.12],
        "ee": [0.62, 1.05, -0.08],
        "target": [0.62, 0.82, -0.08],
        "gripper": 0.0,
        "status": ["retreat_pose", "execution_complete"],
    },
]


def load_mujoco_metadata(mjcf_path: Path) -> dict[str, Any]:
    try:
        import mujoco  # type: ignore
    except ImportError:
        return {
            "mujocoValidated": False,
            "mujocoNote": "Install mujoco to validate the MJCF before export.",
        }

    model = mujoco.MjModel.from_xml_path(str(mjcf_path))
    data = mujoco.MjData(model)
    mujoco.mj_forward(model, data)

    return {
        "mujocoValidated": True,
        "nq": int(model.nq),
        "nv": int(model.nv),
        "bodyCount": int(model.nbody),
        "geomCount": int(model.ngeom),
        "timestep": float(model.opt.timestep),
    }


def build_trace(mjcf_path: Path) -> dict[str, Any]:
    xml_bytes = mjcf_path.read_bytes()
    metadata = load_mujoco_metadata(mjcf_path)

    return {
        "schema": "portfolio.mujoco_trace.v1",
        "sourceMjcf": "/seer/assets/scene/xarm_pick_cell/scene.xml",
        "sourceSha256": hashlib.sha256(xml_bytes).hexdigest(),
        "scene": "xArm Pick Cell",
        "duration": 4.8,
        "coordinateSystem": "three-r3f-display",
        "generatedBy": "scripts/export_xarm_mujoco_trace.py",
        "metadata": metadata,
        "notes": [
            "The current MJCF cell is a static xArm display scene with a freejoint surgical_tool body.",
            "This trace is waypoint-based and can be regenerated after the MJCF is replaced with an actuated robot model.",
        ],
        "frames": KEYFRAMES,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Export the xArm pick trace JSON.")
    parser.add_argument("--mjcf", type=Path, default=DEFAULT_MJCF)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.mjcf.exists():
        raise SystemExit(f"MJCF scene not found: {args.mjcf}")

    trace = build_trace(args.mjcf)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(trace, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {args.out.relative_to(ROOT)} with {len(trace['frames'])} frames")


if __name__ == "__main__":
    main()
