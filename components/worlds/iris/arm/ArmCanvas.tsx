"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { CanvasTexture, Matrix4, MeshStandardMaterial, SRGBColorSpace, Vector3, type Group } from "three";
import { Instrument3D, TrayAndRack, type InstrumentMaterials } from "./Instruments3D";
import { forward, getPlan, jointsAt } from "./motion";
import { loopTime } from "./store";
import { INSTRUMENTS, RACK, STILL_TIME, TRAY, gripperAt, instrumentState, segmentAt } from "./timeline";
import { GRIPPER_SIGNS, UF850, type ArmRefs } from "./UF850";

// Camera in the scene's Y-up world (robot x forward -> world x, robot z up -> world y, robot y left -> world -z).
const EYE = new Vector3(1.75, 1.1, 1.35);
const LOOK = new Vector3(0.3, 0.32, -0.08);
/** How far the view leans toward the gripper: enough to follow the work, not enough to swing the frame. */
const FOLLOW = 0.22;

function steel(color: string, metalness: number, roughness: number) {
  return new MeshStandardMaterial({ color, metalness, roughness, transparent: true, envMapIntensity: 1.2 });
}

/**
 * Soft blob shadows on the (invisible) table: they ground the cell over the shader without a shadow pass.
 * (drei's ContactShadows threw a long streak across the transparent canvas here.)
 */
function GroundShadows() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d")!;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(0,0,0,0.55)");
    gradient.addColorStop(0.55, "rgba(0,0,0,0.28)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return map;
  }, []);
  // [x, y, size x, size y] in the robot frame: arm base, tray, rack.
  const blobs: [number, number, number, number][] = [
    [0, 0, 0.42, 0.42],
    [TRAY.x, TRAY.y, TRAY.width * 1.45, TRAY.depth * 1.4],
    [RACK.x, RACK.y, RACK.length * 1.4, RACK.width * 1.8],
  ];
  return (
    <>
      {blobs.map(([x, y, w, h]) => (
        <mesh key={`${x},${y}`} position={[x, y, 0.0005]} renderOrder={-1}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function SortingLoop({ still, orbiting }: { still: boolean; orbiting: MutableRefObject<boolean> }) {
  const joints = useRef<(Group | null)[]>([]);
  const gripper = useRef<(Group | null)[]>([]);
  const refs = useMemo<ArmRefs>(
    () => ({
      joint: (i, group) => {
        joints.current[i] = group;
      },
      gripper: (i, group) => {
        gripper.current[i] = group;
      },
    }),
    [],
  );
  const instrumentRefs = useRef<(Group | null)[]>([]);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as { target: Vector3 } | null;
  const invalidate = useThree((state) => state.invalidate);
  // With `still` the canvas renders on demand: draw once the model has loaded (and once more for the environment map).
  useEffect(() => {
    invalidate(2);
  }, [invalidate, still]);
  const size = useThree((state) => state.size);
  const materials = useMemo(
    () =>
      INSTRUMENTS.map(
        (): InstrumentMaterials => ({
          steel: steel("#d4d8dd", 0.92, 0.26),
          dark: steel("#8d9298", 0.85, 0.5),
          gold: steel("#d6b25e", 0.9, 0.3),
        }),
      ),
    [],
  );
  const scratch = useMemo(() => ({ q: new Array<number>(6).fill(0), tcp: new Matrix4(), look: LOOK.clone(), at: new Vector3() }), []);

  useFrame(() => {
    const t = still ? STILL_TIME : loopTime();
    const { segment, u } = segmentAt(t);
    const plan = getPlan();
    const q = jointsAt(segment, u, scratch.q);
    joints.current.forEach((joint, i) => joint?.rotation.set(0, 0, q[i]));
    const drive = gripperAt(segment, u);
    gripper.current.forEach((joint, i) => joint?.rotation.set(GRIPPER_SIGNS[i] * drive, 0, 0));

    const tcp = forward(q, scratch.tcp);
    INSTRUMENTS.forEach((instrument, i) => {
      const group = instrumentRefs.current[i];
      if (!group) return;
      const state = instrumentState(instrument.id, segment, u);
      if (state.place === "held") group.matrix.multiplyMatrices(tcp, plan.held.get(instrument.id)!);
      else group.matrix.copy((state.place === "tray" ? plan.tray : plan.rack).get(instrument.id)!);
      group.matrixWorldNeedsUpdate = true;
      group.visible = state.opacity > 0.01;
      for (const material of Object.values(materials[i])) material.opacity = state.opacity;
    });

    // Once the visitor has dragged the view, it stays where they left it.
    if (orbiting.current) return;
    // Lean the view gently toward the tool centre point; narrow viewports step back to keep the cell in frame.
    const e = tcp.elements;
    scratch.at.set(e[12], e[14], -e[13]);
    const target = LOOK.clone().lerp(scratch.at, FOLLOW);
    scratch.look.lerp(target, still ? 1 : 0.06);
    const aspect = size.width / Math.max(1, size.height);
    // Keep the cell's width in frame on narrow viewports by stepping back.
    const back = aspect < 1.3 ? Math.min(2.4, (1.3 / aspect) ** 0.85) : 1;
    camera.position.copy(EYE).sub(LOOK).multiplyScalar(back).add(scratch.look);
    camera.lookAt(scratch.look);
    controls?.target.copy(scratch.look);
  });

  return (
    // Robot frame is Z up; the scene is Y up.
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <GroundShadows />
      <UF850 refs={refs} />
      <TrayAndRack />
      {INSTRUMENTS.map((instrument, i) => (
        <Instrument3D
          key={instrument.id}
          kind={instrument.id}
          materials={materials[i]}
          ref={(group) => {
            instrumentRefs.current[i] = group;
          }}
        />
      ))}
    </group>
  );
}

/**
 * The IRIS cell as a simulation: the UFACTORY UF850 with an xArm gripper and wrist RealSense sorts a tray of
 * instruments topmost-first into a rack, forever. Transparent canvas, so the IRIS shader world shows through.
 * `still` holds one representative frame; `active` false stops rendering.
 */
export default function ArmCanvas({ active, still }: { active: boolean; still: boolean }) {
  const orbiting = useRef(false);
  // Drag to look around with a mouse or pen; on touch screens a drag must still scroll the page.
  const [canOrbit] = useState(() => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches);
  return (
    <Canvas
      frameloop={active ? (still ? "demand" : "always") : "never"}
      dpr={[1, 2]}
      camera={{ position: EYE.toArray(), fov: 30, near: 0.05, far: 20 }}
      gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
      style={{ background: "transparent", pointerEvents: canOrbit ? "auto" : "none", cursor: canOrbit ? "grab" : undefined }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#c9c4b8", 0.7]} />
      <directionalLight position={[1.6, 3.2, 1.4]} intensity={1.8} color="#fffaf2" />
      <directionalLight position={[-2, 1.6, -1]} intensity={0.6} color="#dfe6ff" />
      <Suspense fallback={null}>
        {/* Soft studio softboxes for the steel and white powder coat; built locally, no HDR download. */}
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[4, 1.5, 2]} rotation={[0, -Math.PI / 3, 0]} scale={[3, 2, 1]} />
          <Lightformer form="rect" intensity={0.9} position={[-4, 1, -2]} rotation={[0, Math.PI / 3, 0]} scale={[3, 2, 1]} />
          <Lightformer form="ring" intensity={0.6} color="#c8ccff" position={[0, 1, -4]} scale={2} />
        </Environment>
        <SortingLoop still={still} orbiting={orbiting} />
        {canOrbit && (
          <OrbitControls
            makeDefault
            target={LOOK.toArray()}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={0.25}
            maxPolarAngle={1.45}
            onStart={() => {
              orbiting.current = true;
            }}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
