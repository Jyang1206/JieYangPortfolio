"use client";

import { forwardRef, useMemo } from "react";
import { BufferGeometry, ExtrudeGeometry, Shape, type Group, type MeshStandardMaterial } from "three";
import { INSTRUMENT_SCALE, SHAPES, type Primitive, type Tone } from "./shapes";
import { RACK, RACK_SLOTS, TRAY, DRAPE_TOP, slotPose, type InstrumentKind } from "./timeline";

const MM = 0.001 * INSTRUMENT_SCALE;

function barGeometry(p: Extract<Primitive, { shape: "bar" }>): { geometry: BufferGeometry; x: number; y: number; angle: number } {
  const dx = p.b[0] - p.a[0];
  const dy = p.b[1] - p.a[1];
  const length = Math.hypot(dx, dy);
  const w1 = p.w1 ?? p.w0;
  const outline = new Shape();
  outline.moveTo(0, -p.w0 / 2);
  outline.lineTo(length, -w1 / 2);
  outline.lineTo(length, w1 / 2);
  outline.lineTo(0, p.w0 / 2);
  outline.closePath();
  // A small bevel catches the studio light on the edges, which is what makes thin steel read as steel.
  const bevel = Math.min(0.5, p.t / 4, Math.min(p.w0, w1) / 4);
  const geometry = new ExtrudeGeometry(outline, { depth: p.t - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: 1 });
  geometry.translate(0, 0, bevel);
  return { geometry, x: p.a[0], y: p.a[1], angle: Math.atan2(dy, dx) };
}

export type InstrumentMaterials = Record<Tone, MeshStandardMaterial>;

/** One instrument in millimetres, scaled to metres. Its pose is written by the loop, not by React. */
export const Instrument3D = forwardRef<Group, { kind: InstrumentKind; materials: InstrumentMaterials }>(function Instrument3D(
  { kind, materials },
  ref,
) {
  const parts = useMemo(
    () =>
      SHAPES[kind].map((p, i) => {
        const tone = p.tone ?? "steel";
        if (p.shape === "bar") {
          const { geometry, x, y, angle } = barGeometry(p);
          return (
            <mesh key={i} geometry={geometry} material={materials[tone]} position={[x, y, 0]} rotation={[0, 0, angle]} castShadow />
          );
        }
        if (p.shape === "ring") {
          return (
            <mesh key={i} material={materials[tone]} position={[p.c[0], p.c[1], p.tube]} castShadow>
              <torusGeometry args={[p.r, p.tube, 10, 32]} />
            </mesh>
          );
        }
        return (
          <mesh key={i} material={materials[tone]} position={[p.c[0], p.c[1], p.t / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[p.r, p.r, p.t, 24]} />
          </mesh>
        );
      }),
    [kind, materials],
  );
  return (
    <group ref={ref} matrixAutoUpdate={false}>
      <group scale={MM}>{parts}</group>
    </group>
  );
});

/** Steel tray with the green drape the IRIS cell uses, and the sorting rack beside it. */
export function TrayAndRack() {
  const trayRim = 0.012;
  return (
    <group>
      <mesh position={[TRAY.x, TRAY.y, 0.003]} receiveShadow>
        <boxGeometry args={[TRAY.width + trayRim * 2, TRAY.depth + trayRim * 2, 0.006]} />
        <meshStandardMaterial color="#b9bdc2" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[TRAY.x, TRAY.y, DRAPE_TOP / 2 + 0.001]} receiveShadow>
        <boxGeometry args={[TRAY.width, TRAY.depth, DRAPE_TOP]} />
        <meshStandardMaterial color="#1d5a50" roughness={0.95} metalness={0} />
      </mesh>

      <mesh position={[RACK.x, RACK.y, RACK.height / 2]} receiveShadow castShadow>
        <boxGeometry args={[RACK.length, RACK.width, RACK.height]} />
        <meshStandardMaterial color="#e4e5e3" roughness={0.6} />
      </mesh>
      {Array.from({ length: RACK_SLOTS }, (_, slot) => {
        const pose = slotPose(slot);
        return (
          <group key={slot} position={[pose.x, pose.y, RACK.height]}>
            {/* Recessed slot bed, darker so the placed steel stands out. */}
            <mesh position={[0, 0, 0.0004]} receiveShadow>
              <boxGeometry args={[0.046, RACK.width - 0.014, 0.001]} />
              <meshStandardMaterial color="#9fa3a8" roughness={0.8} />
            </mesh>
            {/* Indigo tag at the slot's front edge: the IRIS destination colour. */}
            <mesh position={[0, -RACK.width / 2 + 0.006, 0.0006]}>
              <boxGeometry args={[0.03, 0.006, 0.0012]} />
              <meshStandardMaterial color="#2b2fd4" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
