"use client";

import { ContactShadows, Environment, Grid, Html, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, MathUtils, Vector3 } from "three";
import type { Project, StoryStep } from "../../../data/projects";
import { Hotspot } from "../Hotspot";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import xarmPickTraceJson from "../../../public/sim/xarm-pick-trace.json";

type SceneProps = {
  project: Project;
  progress: number;
  activeStep: StoryStep;
  activeIndex: number;
};

const cameraPositions: [number, number, number][] = [
  [4.6, 3.15, 5.2],
  [2.7, 2.35, 2.95],
  [3.35, 2.85, 3.8],
  [2.8, 2.15, 3.05],
  [3.6, 2.55, 3.1],
  [4.5, 3.4, 4.7],
];

const lookTargets: [number, number, number][] = [
  [0, 0.65, 0],
  [-1.28, 1.25, 0.1],
  [-0.25, 0.8, 0],
  [0.45, 0.58, 0.2],
  [0.78, 0.92, 0.05],
  [0, 0.55, 0],
];

type MujocoTraceFrame = {
  t: number;
  phase: string;
  joints: [number, number, number, number];
  ee: [number, number, number];
  target: [number, number, number];
  gripper: number;
  status: string[];
};

type RawTraceFrame = typeof xarmPickTraceJson.frames[number];

const mujocoPickTrace: MujocoTraceFrame[] = xarmPickTraceJson.frames.map(normalizeTraceFrame);

export function XArmScene({ project, progress, activeStep, activeIndex }: SceneProps) {
  const rigRef = useRef<Group>(null);
  const reducedMotion = usePrefersReducedMotion();
  const tracePose = useMemo(() => interpolateTrace(progress), [progress]);

  useFrame((_, delta) => {
    if (!rigRef.current || reducedMotion) return;
    rigRef.current.rotation.y = MathUtils.lerp(
      rigRef.current.rotation.y,
      -0.25 + progress * 0.55,
      Math.min(1, delta * 2.2),
    );
  });

  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 8, 15]} />
      <Environment preset="studio" />
      <ambientLight intensity={0.25} color="#0f172a" />
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.0005}
        color="#ffffff"
      />
      <pointLight
        position={[-2, 2.5, 2.5]}
        color={project.accentColor}
        intensity={1.8}
        distance={8}
        decay={2}
      />
      <spotLight
        position={[0, 6, 0]}
        color={project.accentColor}
        intensity={0.6}
        angle={0.1}
        penumbra={0.8}
        decay={2}
      />
      <CameraRig activeIndex={activeIndex} reducedMotion={reducedMotion} />

      <Grid
        args={[8, 8]}
        cellSize={0.32}
        sectionSize={1.6}
        cellColor="#1e3a5f"
        sectionColor={project.accentColor}
        fadeDistance={8}
        fadeStrength={1.6}
        infiniteGrid
        position={[0, -1.2, 0]}
      />

      <group ref={rigRef} position={[0, -0.62, 0]}>
        <Workspace active={activeStep.activeHotspot === "workspace"} color={project.accentColor} />
        <RobotArm activeHotspot={activeStep.activeHotspot} color={project.accentColor} pose={tracePose} />
        <CameraModule active={activeStep.activeHotspot === "camera"} color={project.accentColor} />
        <TargetObject activeIndex={activeIndex} color={project.accentColor} pose={tracePose} />
        <TransformGraphics activeIndex={activeIndex} color={project.accentColor} progress={progress} />
        <SafetyEnvelope active={activeStep.activeHotspot === "safety"} color={project.accentColor} />
        <TraceMarker pose={tracePose} color={project.accentColor} activeIndex={activeIndex} />

        <Hotspot
          id="camera"
          label="Camera"
          position={[-1.32, 1.62, 0.08]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
        <Hotspot
          id="end-effector"
          label="End Effector"
          position={[0.86, 1.14, 0.02]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
        <Hotspot
          id="base"
          label="Robot Base"
          position={[-0.12, 0.18, 0]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
        <Hotspot
          id="workspace"
          label="Workspace"
          position={[0.22, 0.03, 0.94]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
        <Hotspot
          id="tf"
          label="TF Transform"
          position={[-0.72, 1.08, -0.18]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
        <Hotspot
          id="safety"
          label="Safety Gate"
          position={[1.36, 0.72, -1.02]}
          activeHotspot={activeStep.activeHotspot}
          color={project.accentColor}
        />
      </group>

      <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={8} blur={3} far={3.5} />
    </>
  );
}

function normalizeTraceFrame(frame: RawTraceFrame): MujocoTraceFrame {
  return {
    t: frame.t,
    phase: frame.phase,
    joints: toTuple4(frame.joints),
    ee: toTuple3(frame.ee),
    target: toTuple3(frame.target),
    gripper: frame.gripper,
    status: [...frame.status],
  };
}

function toTuple3(value: number[]): [number, number, number] {
  return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0];
}

function toTuple4(value: number[]): [number, number, number, number] {
  return [value[0] ?? 0, value[1] ?? 0, value[2] ?? 0, value[3] ?? 0];
}

function interpolateTrace(progress: number): MujocoTraceFrame {
  const clamped = MathUtils.clamp(progress, 0, 1);
  const nextIndex = mujocoPickTrace.findIndex((frame) => frame.t >= clamped);

  if (nextIndex <= 0) return mujocoPickTrace[0];
  if (nextIndex === -1) return mujocoPickTrace[mujocoPickTrace.length - 1];

  const previous = mujocoPickTrace[nextIndex - 1];
  const next = mujocoPickTrace[nextIndex];
  const local = (clamped - previous.t) / Math.max(0.0001, next.t - previous.t);
  const eased = MathUtils.smoothstep(local, 0, 1);

  return {
    t: clamped,
    joints: interpolateTuple(previous.joints, next.joints, eased) as [number, number, number, number],
    ee: interpolateTuple(previous.ee, next.ee, eased) as [number, number, number],
    target: interpolateTuple(previous.target, next.target, eased) as [number, number, number],
    gripper: MathUtils.lerp(previous.gripper, next.gripper, eased),
    phase: local < 0.5 ? previous.phase : next.phase,
    status: local < 0.5 ? previous.status : next.status,
  };
}

function interpolateTuple(previous: readonly number[], next: readonly number[], alpha: number) {
  return previous.map((value, index) => MathUtils.lerp(value, next[index], alpha));
}

function CameraRig({
  activeIndex,
  reducedMotion,
}: {
  activeIndex: number;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new Vector3(), []);
  const position = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    const nextPosition = cameraPositions[activeIndex] ?? cameraPositions[0];
    const nextTarget = lookTargets[activeIndex] ?? lookTargets[0];
    position.set(...nextPosition);
    target.set(...nextTarget);

    if (reducedMotion) {
      camera.position.copy(position);
    } else {
      camera.position.lerp(position, Math.min(1, delta * 2.4));
    }

    camera.lookAt(target);
  });

  return null;
}

function Workspace({ active, color }: { active: boolean; color: string }) {
  return (
    <group>
      <mesh receiveShadow position={[0.15, -0.04, 0]}>
        <boxGeometry args={[3.7, 0.08, 2.35]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>
      <mesh position={[0.15, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.55, 2.2, 8, 6]} />
        <meshStandardMaterial
          color={active ? color : "#64748b"}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={active ? 0.4 : 0.15}
        />
      </mesh>
    </group>
  );
}

function RobotArm({
  activeHotspot,
  color,
  pose,
}: {
  activeHotspot?: string;
  color: string;
  pose: MujocoTraceFrame;
}) {
  const baseActive = activeHotspot === "base";
  const effectorActive = activeHotspot === "end-effector";
  const [baseYaw, shoulder, elbow, wrist] = pose.joints;
  const fingerSpread = 0.07 + pose.gripper * 0.08;

  return (
    <group position={[-0.35, 0.02, -0.05]}>
      <group rotation={[0, baseYaw, 0]}>
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.34, 0.42, 0.24, 40]} />
          <meshStandardMaterial
            color={baseActive ? color : "#cbd5e1"}
            metalness={0.7}
            roughness={0.18}
            envMapIntensity={1.5}
          />
        </mesh>
        <mesh castShadow position={[0, 0.33, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.24, 32]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.6}
            roughness={0.15}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh castShadow position={[0.05, 0.78, 0]} rotation={[0, 0, -0.46 + shoulder]}>
          <boxGeometry args={[0.24, 1.08, 0.28]} />
          <meshStandardMaterial
            color="#e5edf6"
            metalness={0.5}
            roughness={0.2}
            envMapIntensity={1.0}
          />
        </mesh>
        <mesh castShadow position={[0.42, 1.26, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.65}
            roughness={0.12}
            envMapIntensity={1.3}
          />
        </mesh>
        <mesh castShadow position={[0.72, 1.18, 0]} rotation={[0, 0, 1.05 + elbow]}>
          <boxGeometry args={[0.21, 0.78, 0.22]} />
          <meshStandardMaterial
            color="#eef4fb"
            metalness={0.55}
            roughness={0.18}
            envMapIntensity={1.1}
          />
        </mesh>
        <group position={pose.ee} rotation={[0, 0, wrist]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.22, 0.22]} />
            <meshStandardMaterial
              color={effectorActive ? color : "#334155"}
              emissive={effectorActive ? color : "#000000"}
              emissiveIntensity={effectorActive ? 0.6 : 0}
              metalness={0.8}
              roughness={0.08}
              envMapIntensity={2.0}
            />
          </mesh>
          <mesh castShadow position={[0.11, -0.06, fingerSpread]} rotation={[0, 0.2, 0.15]}>
            <boxGeometry args={[0.05, 0.32, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.25} />
          </mesh>
          <mesh castShadow position={[0.11, -0.06, -fingerSpread]} rotation={[0, -0.2, 0.15]}>
            <boxGeometry args={[0.05, 0.32, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function TraceMarker({
  pose,
  color,
  activeIndex,
}: {
  pose: MujocoTraceFrame;
  color: string;
  activeIndex: number;
}) {
  if (activeIndex < 3) return null;

  return (
    <group position={[pose.ee[0], pose.ee[1] + 0.24, pose.ee[2]]}>
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html center distanceFactor={7} position={[0.34, 0.12, 0]} occlude>
        <div className="min-w-36 border border-cyan-200/30 bg-slate-950/86 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-100 shadow-2xl shadow-black/40 backdrop-blur">
          <p className="font-semibold text-white">{pose.phase.replace(/_/g, " ")}</p>
          <p className="mt-1 text-cyan-100/72">{pose.status[0]?.replace(/_/g, " ")}</p>
        </div>
      </Html>
    </group>
  );
}

function CameraModule({ active, color }: { active: boolean; color: string }) {
  return (
    <group position={[-1.3, 1.18, 0.1]} rotation={[0.22, -0.3, 0.05]}>
      <mesh castShadow>
        <boxGeometry args={[0.54, 0.34, 0.24]} />
        <meshStandardMaterial
          color={active ? color : "#dbeafe"}
          emissive={active ? color : "#000000"}
          emissiveIntensity={active ? 0.4 : 0}
          metalness={0.8}
          roughness={0.08}
          envMapIntensity={2.0}
        />
      </mesh>
      <mesh position={[0.29, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.08, 24]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <Line
        points={[
          [0.35, -0.05, 0],
          [1.2, -0.75, 0.18],
          [1.95, -1.14, 0.26],
        ]}
        color={color}
        transparent
        opacity={active ? 0.9 : 0.3}
        lineWidth={1.4}
      />
    </group>
  );
}

function TargetObject({
  activeIndex,
  color,
  pose,
}: {
  activeIndex: number;
  color: string;
  pose: MujocoTraceFrame;
}) {
  return (
    <mesh castShadow position={pose.target}>
      <boxGeometry args={[0.28, 0.18, 0.28]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={activeIndex >= 3 ? 0.5 : 0.1}
        metalness={0.7}
        roughness={0.1}
      />
    </mesh>
  );
}

function TransformGraphics({
  activeIndex,
  color,
  progress,
}: {
  activeIndex: number;
  color: string;
  progress: number;
}) {
  const showTf = activeIndex >= 2;
  const showPath = activeIndex >= 3;
  const pathPoints = mujocoPickTrace
    .filter((frame) => frame.t <= Math.max(progress, 0.38))
    .map((frame) => frame.ee);

  return (
    <group>
      {showTf && (
        <>
          <CoordinateFrame position={[-1.05, 0.78, -0.28]} labelColor="#60a5fa" />
          <CoordinateFrame position={[-0.35, 0.22, -0.12]} labelColor={color} />
          <Line
            points={[
              [-1.05, 0.78, -0.28],
              [-0.35, 0.22, -0.12],
            ]}
            color={color}
            lineWidth={2.5}
            transparent
            opacity={0.85}
          />
        </>
      )}
      {showPath && (
        <Line
          points={pathPoints.length > 1 ? pathPoints : mujocoPickTrace.slice(0, 2).map((frame) => frame.ee)}
          color="#2563eb"
          lineWidth={4}
          transparent
          opacity={activeIndex >= 4 ? 1 : 0.7}
        />
      )}
    </group>
  );
}

function CoordinateFrame({
  position,
  labelColor,
}: {
  position: [number, number, number];
  labelColor: string;
}) {
  const [x, y, z] = position;

  return (
    <group>
      <Line points={[position, [x + 0.36, y, z]]} color="#ef4444" lineWidth={2} />
      <Line points={[position, [x, y + 0.36, z]]} color="#22c55e" lineWidth={2} />
      <Line points={[position, [x, y, z + 0.36]]} color="#3b82f6" lineWidth={2} />
      <mesh position={position}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={labelColor} />
      </mesh>
    </group>
  );
}

function SafetyEnvelope({ active, color }: { active: boolean; color: string }) {
  return (
    <group visible={active}>
      <mesh position={[0.18, 0.72, 0]}>
        <boxGeometry args={[3.55, 1.55, 2.18]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.54} />
      </mesh>
      <Line
        points={[
          [1.45, 0.02, -1.08],
          [1.45, 1.42, -1.08],
        ]}
        color={color}
        lineWidth={4}
      />
    </group>
  );
}
