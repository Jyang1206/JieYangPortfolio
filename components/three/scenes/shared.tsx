"use client";

import type { Vector3Tuple } from "three";

type PlaceholderRobotProps = {
  color: string;
  position?: Vector3Tuple;
  scale?: number;
};

export function PlaceholderRobot({ color, position = [0, 0, 0], scale = 1 }: PlaceholderRobotProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.15, 0.36, 0.78]} />
        <meshStandardMaterial color="#dbeafe" metalness={0.18} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.68, 0.26, 0.52]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {[-0.45, 0.45].map((x) =>
        [-0.38, 0.38].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.22, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 18]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        )),
      )}
    </group>
  );
}
