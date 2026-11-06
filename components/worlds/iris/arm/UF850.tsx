"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import { Color, Euler, MeshStandardMaterial, Vector3, type Group, type Mesh } from "three";
import { JOINT_ORIGINS } from "./kinematics";

export const UF850_MODEL = "/robot/uf850/uf850-visual.glb";

/** Registers the groups the loop writes every frame: six arm joints (rotation.z) and six gripper linkage joints (rotation.x). */
export type ArmRefs = {
  joint: (index: number, group: Group | null) => void;
  gripper: (index: number, group: Group | null) => void;
};

/**
 * Sign of each gripper linkage joint against `drive_joint` (URDF mimic joints, all multiplier 1):
 * left outer knuckle, left finger, left inner knuckle, right outer knuckle, right finger, right inner knuckle.
 */
export const GRIPPER_SIGNS = [1, -1, 1, -1, 1, -1];

function useLinkMaterials() {
  return useMemo(
    () => ({
      // UF850 links are white powder-coated aluminium; the xArm gripper and camera are dark.
      link: new MeshStandardMaterial({ color: LINK_WHITE, roughness: 0.42, metalness: 0.05 }),
      gripper: new MeshStandardMaterial({ color: "#2b2c30", roughness: 0.5, metalness: 0.2 }),
      finger: new MeshStandardMaterial({ color: "#46484d", roughness: 0.45, metalness: 0.35 }),
      cap: new MeshStandardMaterial({ color: "#1d1e21", roughness: 0.35, metalness: 0.1 }),
      camera: new MeshStandardMaterial({ color: "#2f3135", roughness: 0.38, metalness: 0.55 }),
      glass: new MeshStandardMaterial({ color: "#0a0b0d", roughness: 0.08, metalness: 0.2 }),
    }),
    [],
  );
}

const LINKS = ["link_base", "link1", "link2", "link3", "link4", "link5", "link6"];
/** Housing ends that are not caps on the real arm (indices into findCaps' list for that link). */
// link5 is a cylinder about joint 6; its sides along joint 5 would paint a stripe, not a cap.
const SKIP_CAPS: Record<string, number[]> = { link5: [0, 1] };
const LINK_WHITE = new Color("#f3f3f0");
const CAP_DARK = new Color("#2a2b2f");
/** Joint housings end in flat round faces this wide (m) or less; those faces are the dark caps. */
const CAP_RADIUS = 0.07;

/** Axes of the joints a link carries, in that link's frame: its own joint (z through the origin) and the next one. */
function jointAxes(link: number): { origin: Vector3; dir: Vector3 }[] {
  const axes = link > 0 ? [{ origin: new Vector3(), dir: new Vector3(0, 0, 1) }] : [];
  const next = JOINT_ORIGINS[link];
  if (next) {
    const { xyz, rpy } = next;
    axes.push({ origin: new Vector3(...xyz), dir: new Vector3(0, 0, 1).applyEuler(new Euler(rpy[0], rpy[1], rpy[2], "ZYX")) });
  }
  return axes;
}

/** How deep from a housing's outer end the dark cap reaches along the joint axis (m). */
const CAP_DEPTH = 0.005;
const MAX_CAPS = 4;

type Cap = { origin: Vector3; dir: Vector3; end: number };

/** Outer end of each joint housing a link carries, measured from the mesh (both sides of each axis). */
function findCaps(node: Mesh, link: number): Cap[] {
  const position = node.geometry.getAttribute("position");
  const p = new Vector3();
  const offset = new Vector3();
  const caps: Cap[] = [];
  for (const { origin, dir } of jointAxes(link)) {
    for (const side of [1, -1]) {
      const d = dir.clone().multiplyScalar(side);
      let end = -Infinity;
      for (let i = 0; i < position.count; i += 1) {
        p.fromBufferAttribute(position, i).multiply(node.scale).add(node.position);
        offset.subVectors(p, origin);
        const along = offset.dot(d);
        if (offset.addScaledVector(d, -along).length() < CAP_RADIUS) end = Math.max(end, along);
      }
      if (Number.isFinite(end)) caps.push({ origin, dir: d, end });
    }
  }
  return caps.slice(0, MAX_CAPS);
}

/**
 * The UF850 meshes are one piece per link, so the dark joint caps are painted per fragment: the outer
 * CAP_DEPTH of each joint housing, within CAP_RADIUS of its axis, in the link's own frame.
 */
function capMaterial(base: MeshStandardMaterial, node: Mesh, caps: Cap[]): MeshStandardMaterial {
  const material = base.clone();
  const pad = (list: Vector3[]) => [...list, ...Array.from({ length: MAX_CAPS - list.length }, () => new Vector3())];
  const uniforms = {
    uNodeScale: { value: node.scale.x },
    uNodeOffset: { value: node.position.clone() },
    uCapOrigin: { value: pad(caps.map((c) => c.origin)) },
    uCapDir: { value: pad(caps.map((c) => c.dir)) },
    uCapEnd: { value: [...caps.map((c) => c.end), ...Array(MAX_CAPS - caps.length).fill(1e3)] },
    uCapColor: { value: CAP_DARK },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uNodeScale;\nuniform vec3 uNodeOffset;\nvarying vec3 vLinkPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLinkPos = position * uNodeScale + uNodeOffset;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vLinkPos;
uniform vec3 uCapOrigin[${MAX_CAPS}];
uniform vec3 uCapDir[${MAX_CAPS}];
uniform float uCapEnd[${MAX_CAPS}];
uniform vec3 uCapColor;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
for (int i = 0; i < ${MAX_CAPS}; i++) {
  vec3 offsetFromAxis = vLinkPos - uCapOrigin[i];
  float along = dot(offsetFromAxis, uCapDir[i]);
  float radial = length(offsetFromAxis - uCapDir[i] * along);
  if (along > uCapEnd[i] - ${CAP_DEPTH.toFixed(4)} && radial < ${CAP_RADIUS.toFixed(4)}) diffuseColor.rgb = uCapColor;
}`,
      );
  };
  material.customProgramCacheKey = () => `uf850-caps-${caps.length}`;
  return material;
}

/** One joint: the URDF origin transform, then a group the loop turns about z. */
function Joint({ index, refs, children }: { index: number; refs: ArmRefs; children: ReactNode }) {
  const { xyz, rpy } = JOINT_ORIGINS[index];
  return (
    <group position={xyz} rotation={[rpy[0], rpy[1], rpy[2], "ZYX"]}>
      <group
        ref={(group) => {
          refs.joint(index, group);
        }}
      >
        {children}
      </group>
    </group>
  );
}

function GripperJoint({ index, refs, position, children }: { index: number; refs: ArmRefs; position: [number, number, number]; children: ReactNode }) {
  return (
    <group position={position}>
      <group
        ref={(group) => {
          refs.gripper(index, group);
        }}
      >
        {children}
      </group>
    </group>
  );
}

/** The UF850 arm built from its URDF, with the xArm gripper and a RealSense D435i on the wrist. Robot frame (Z up). */
export function UF850({ refs }: { refs: ArmRefs }) {
  const { nodes } = useGLTF(UF850_MODEL);
  const materials = useLinkMaterials();
  const linkMaterials = useMemo(
    () =>
      LINKS.map((name, i) => {
        const node = nodes[name] as Mesh;
        return capMaterial(materials.link, node, findCaps(node, i).filter((_, k) => !SKIP_CAPS[name]?.includes(k)));
      }),
    [nodes, materials.link],
  );
  const part = (name: string, material: MeshStandardMaterial) => {
    const node = nodes[name] as Mesh;
    const link = LINKS.indexOf(name);
    return <mesh geometry={node.geometry} position={node.position} scale={node.scale} material={link >= 0 ? linkMaterials[link] : material} />;
  };

  return (
    <group>
      {part("link_base", materials.link)}
      <Joint index={0} refs={refs}>
        {part("link1", materials.link)}
        <Joint index={1} refs={refs}>
          {part("link2", materials.link)}
          <Joint index={2} refs={refs}>
            {part("link3", materials.link)}
            <Joint index={3} refs={refs}>
              {part("link4", materials.link)}
              <Joint index={4} refs={refs}>
                {part("link5", materials.link)}
                <Joint index={5} refs={refs}>
                  {part("link6", materials.link)}
                  {/* link_eef and the gripper base coincide with the link6 frame. */}
                  {part("gripper_base", materials.gripper)}
                  <GripperJoint index={0} refs={refs} position={[0, 0.035, 0.059098]}>
                    {part("left_outer_knuckle", materials.gripper)}
                    <GripperJoint index={1} refs={refs} position={[0, 0.035465, 0.042039]}>
                      {part("left_finger", materials.finger)}
                    </GripperJoint>
                  </GripperJoint>
                  <GripperJoint index={2} refs={refs} position={[0, 0.02, 0.074098]}>
                    {part("left_inner_knuckle", materials.gripper)}
                  </GripperJoint>
                  <GripperJoint index={3} refs={refs} position={[0, -0.035, 0.059098]}>
                    {part("right_outer_knuckle", materials.gripper)}
                    <GripperJoint index={4} refs={refs} position={[0, -0.035465, 0.042039]}>
                      {part("right_finger", materials.finger)}
                    </GripperJoint>
                  </GripperJoint>
                  <GripperJoint index={5} refs={refs} position={[0, -0.02, 0.074098]}>
                    {part("right_inner_knuckle", materials.gripper)}
                  </GripperJoint>
                  <WristCamera materials={materials} />
                </Joint>
              </Joint>
            </Joint>
          </Joint>
        </Joint>
      </Joint>
    </group>
  );
}

/** Intel RealSense D435i (90 x 25 x 25 mm) on a bracket off the flange, looking along the tool axis. */
function WristCamera({ materials }: { materials: ReturnType<typeof useLinkMaterials> }) {
  return (
    <group position={[0.068, 0, 0.05]}>
      {/* Bracket from the flange ring to the camera. */}
      <mesh position={[-0.026, 0, -0.03]} material={materials.cap}>
        <boxGeometry args={[0.04, 0.03, 0.005]} />
      </mesh>
      <mesh position={[-0.008, 0, -0.016]} material={materials.cap}>
        <boxGeometry args={[0.005, 0.03, 0.032]} />
      </mesh>
      <mesh material={materials.camera} castShadow>
        <boxGeometry args={[0.025, 0.09, 0.025]} />
      </mesh>
      {/* Front glass with the stereo pair, RGB lens and projector, facing the tray (+z, tool direction). */}
      <mesh position={[0, 0, 0.0126]} material={materials.glass}>
        <boxGeometry args={[0.02, 0.084, 0.0008]} />
      </mesh>
      {[-0.035, -0.012, 0.012, 0.035].map((y) => (
        <mesh key={y} position={[0, y, 0.0132]} rotation={[Math.PI / 2, 0, 0]} material={materials.cap}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.0006, 20]} />
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload(UF850_MODEL);
