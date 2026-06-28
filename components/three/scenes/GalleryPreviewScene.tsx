"use client";

import { ContactShadows, Environment, Float, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import type { Project } from "../../../data/projects";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import { ModelWithFallback } from "../ModelWithFallback";
import { MjcfPreviewModel } from "../MjcfPreviewModel";

type GalleryPreviewSceneProps = {
  project: Project;
  index: number;
  presentation?: "card" | "showcase";
  active?: boolean;
};

export function GalleryPreviewScene({
  project,
  index,
  presentation = "card",
  active = true,
}: GalleryPreviewSceneProps) {
  const groupRef = useRef<Group>(null);
  const reducedMotion = usePrefersReducedMotion();
  const showcase = presentation === "showcase";

  useFrame((state, delta) => {
    if (!groupRef.current || reducedMotion || !active) return;
    const time = state.clock.elapsedTime + index * 1.37;

    if (showcase) {
      groupRef.current.position.x = Math.sin(time * 0.36) * 0.26;
      groupRef.current.position.y = -0.24 + Math.cos(time * 0.48) * 0.2;
      groupRef.current.position.z = Math.cos(time * 0.32) * 0.32;
      groupRef.current.rotation.x = 0.12 + Math.sin(time * 0.31) * 0.08;
      groupRef.current.rotation.y += delta * 0.52;
      groupRef.current.rotation.z = Math.sin(time * 0.28) * 0.08;
      return;
    }

    groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[4, 5, 3]}
        intensity={showcase ? 2.4 : 1.9}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-3, 2, -2]}
        color={project.accentColor}
        intensity={showcase ? 3.2 : 2.2}
      />
      <Environment preset="studio" />
      <ShowcaseStage color={project.accentColor} active={active && !reducedMotion} showcase={showcase} />
      <Float
        speed={reducedMotion ? 0 : showcase ? 1.45 : 1.2}
        floatIntensity={showcase ? 0.55 : 0.25}
        rotationIntensity={showcase ? 0.22 : 0.12}
      >
        <group
          ref={groupRef}
          position={[0, showcase ? -0.24 : -0.25, 0]}
          rotation={[0.15, index * 0.35, 0]}
          scale={showcase ? 1.9 : 1}
        >
          {project.sceneType === "seer" ? (
            <FleetCadPreview project={project} />
          ) : getMjcfPreview(project.sceneType) ? (
            <MjcfPreviewModel
              {...getMjcfPreview(project.sceneType)!}
              fallback={<PreviewGeometry sceneType={project.sceneType} color={project.accentColor} />}
            />
          ) : (
            <ModelWithFallback
              modelPath={project.modelPath}
              fallback={<PreviewGeometry sceneType={project.sceneType} color={project.accentColor} />}
            />
          )}
        </group>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, showcase ? -1.95 : -1.28, 0]}>
        <circleGeometry args={[showcase ? 2.9 : 1.55, 64]} />
        <meshBasicMaterial color={project.accentColor} transparent opacity={showcase ? 0.13 : 0.08} />
      </mesh>
      <ContactShadows
        position={[0, showcase ? -1.86 : -1.22, 0]}
        opacity={0.2}
        scale={showcase ? 5 : 3}
        blur={2.4}
        far={3}
      />
    </>
  );
}

function ShowcaseStage({
  color,
  active,
  showcase,
}: {
  color: string;
  active: boolean;
  showcase: boolean;
}) {
  const ringRef = useRef<Group>(null);
  const pulseRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!active) return;
    const time = state.clock.elapsedTime;

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * (showcase ? 0.34 : 0.18);
      ringRef.current.rotation.x = Math.sin(time * 0.32) * 0.08;
    }

    if (pulseRef.current) {
      const scale = showcase ? 1 + Math.sin(time * 1.4) * 0.045 : 1;
      pulseRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, showcase ? -1.68 : -1.08, 0]}>
      <group ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        {[1.15, 1.7, 2.26].map((radius, index) => (
          <mesh key={radius}>
            <torusGeometry args={[showcase ? radius * 1.2 : radius * 0.72, 0.006, 8, 96]} />
            <meshBasicMaterial color={index === 1 ? color : "#bae6fd"} transparent opacity={showcase ? 0.32 : 0.18} />
          </mesh>
        ))}
      </group>

      <group ref={pulseRef}>
        <Line
          points={[
            [showcase ? -2.7 : -1.55, 0.04, 0],
            [showcase ? 2.7 : 1.55, 0.04, 0],
          ]}
          color={color}
          transparent
          opacity={showcase ? 0.58 : 0.32}
          lineWidth={1.2}
        />
        <Line
          points={[
            [0, 0.04, showcase ? -2.7 : -1.55],
            [0, 0.04, showcase ? 2.7 : 1.55],
          ]}
          color="#e2e8f0"
          transparent
          opacity={showcase ? 0.34 : 0.18}
          lineWidth={1}
        />
      </group>
    </group>
  );
}

function FleetCadPreview({ project }: { project: Project }) {
  const [agvPath] = project.additionalModelPaths ?? [];

  return (
    <group>
      <group position={[-0.75, -0.1, 0]} scale={0.72}>
        <MjcfPreviewModel
          scenePath="/seer/assets/scene/seer_warehouse/scene.xml"
          bodyName="seer_amr"
          fallback={<PreviewGeometry sceneType="seer" color={project.accentColor} />}
        />
      </group>

      {agvPath && (
        <group position={[0.85, -0.18, 0.2]} rotation={[0, -0.45, 0]} scale={0.58}>
          <ModelWithFallback modelPath={agvPath} fallback={null} />
        </group>
      )}

      <group position={[1.03, 0.12, -0.58]} rotation={[0, 0.45, 0]} scale={0.52}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.9, 0.34, 0.34]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.18} roughness={0.34} />
        </mesh>
        <mesh position={[0.58, 0.5, 0]} castShadow>
          <boxGeometry args={[0.25, 0.22, 0.24]} />
          <meshStandardMaterial color="#dbeafe" />
        </mesh>
        {[-0.32, 0.32].map((x) =>
          [-0.16, 0.16].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.02, z]} castShadow>
              <boxGeometry args={[0.08, 0.52, 0.08]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

function getMjcfPreview(sceneType: Project["sceneType"]) {
  if (sceneType === "xarm") {
    return {
      scenePath: "/seer/assets/scene/xarm_pick_cell/scene.xml",
      bodyName: "xarm_cell",
    };
  }

  if (sceneType === "vehicle") {
    return {
      scenePath: "/seer/assets/scene/vehicle_bev_rig/scene.xml",
      bodyName: "ego_vehicle",
    };
  }

  if (sceneType === "guitar") {
    return {
      scenePath: "/seer/assets/scene/guitar_scale_rig/scene.xml",
      bodyName: "guitar_rig",
    };
  }

  return null;
}

function PreviewGeometry({ sceneType, color }: { sceneType: Project["sceneType"]; color: string }) {
  if (sceneType === "xarm") {
    return (
      <group>
        <mesh position={[0, -0.58, 0]}>
          <cylinderGeometry args={[0.48, 0.6, 0.24, 32]} />
          <meshStandardMaterial color="#d7e2ec" metalness={0.45} roughness={0.34} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.24, 1.4, 0.24]} />
          <meshStandardMaterial color="#e9f1f8" metalness={0.35} roughness={0.32} />
        </mesh>
        <mesh position={[0.6, 0.58, 0]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.22, 1.15, 0.22]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.25} roughness={0.36} />
        </mesh>
        <mesh position={[1.02, 1.02, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      </group>
    );
  }

  if (sceneType === "guitar") {
    return (
      <group>
        <mesh rotation={[0, 0, 0.08]}>
          <boxGeometry args={[2.3, 0.22, 0.14]} />
          <meshStandardMaterial color="#f6d18a" />
        </mesh>
        {[-0.7, -0.25, 0.2, 0.65].map((x) => (
          <mesh key={x} position={[x, 0.02, 0.09]}>
            <boxGeometry args={[0.018, 0.28, 0.018]} />
            <meshStandardMaterial color="#7c5a36" />
          </mesh>
        ))}
        <mesh position={[-1.0, 0.54, 0]}>
          <boxGeometry args={[0.5, 0.32, 0.36]} />
          <meshStandardMaterial color="#dbeafe" />
        </mesh>
        <mesh position={[0.55, 0.2, 0.12]}>
          <sphereGeometry args={[0.08, 18, 18]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
        </mesh>
      </group>
    );
  }

  if (sceneType === "seer") {
    return (
      <group>
        <group position={[-0.34, -0.08, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.3, 0.38, 0.86]} />
            <meshStandardMaterial color="#e8f1fb" metalness={0.2} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[0.72, 0.28, 0.54]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.12} />
          </mesh>
          {[-0.48, 0.48].map((x) =>
            [-0.42, 0.42].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, -0.24, z]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.13, 0.13, 0.09, 24]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
            )),
          )}
        </group>

        <group position={[1.14, -0.28, 0.48]} scale={0.58}>
          <mesh>
            <boxGeometry args={[1.4, 0.28, 0.72]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.18} roughness={0.4} />
          </mesh>
          <mesh position={[0.42, 0.26, 0]}>
            <boxGeometry args={[0.5, 0.22, 0.42]} />
            <meshStandardMaterial color="#bfdbfe" />
          </mesh>
        </group>

        <group position={[1.12, 0.08, -0.5]} scale={0.45}>
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.9, 0.34, 0.34]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.34} />
          </mesh>
          <mesh position={[0.58, 0.5, 0]}>
            <boxGeometry args={[0.25, 0.22, 0.24]} />
            <meshStandardMaterial color="#dbeafe" />
          </mesh>
          {[-0.32, 0.32].map((x) =>
            [-0.16, 0.16].map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.02, z]}>
                <boxGeometry args={[0.08, 0.52, 0.08]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            )),
          )}
        </group>
      </group>
    );
  }

  if (sceneType === "vehicle") {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.7, 0.42, 0.82]} />
          <meshStandardMaterial color="#d9e3ed" metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.34, 0]}>
          <boxGeometry args={[0.8, 0.32, 0.66]} />
          <meshStandardMaterial color="#8fb6cf" transparent opacity={0.72} />
        </mesh>
        {[-0.58, 0.58].map((x) =>
          [-0.48, 0.48].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, -0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.12, 24]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          )),
        )}
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, -0.25, 0]}>
        <boxGeometry args={[1.3, 0.34, 0.88]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.2} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.72, 0.26, 0.56]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[0.58, -0.02, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}
