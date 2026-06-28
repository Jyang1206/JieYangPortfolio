"use client";

import { useMemo, type ReactNode } from "react";

type MjcfPreviewModelProps = {
  scenePath: string;
  bodyName: string;
  fallback: ReactNode;
};

type MaterialMap = Record<string, string>;

type PreviewGeom = {
  name: string;
  type: "box" | "cylinder" | "sphere";
  pos: [number, number, number];
  size: number[];
  quat?: [number, number, number, number];
  color: string;
};

type PreviewResource =
  | { status: "pending"; promise: Promise<void>; geoms: null }
  | { status: "error"; promise: null; geoms: null }
  | { status: "ready"; promise: null; geoms: PreviewGeom[] };

const previewResourceCache = new Map<string, PreviewResource>();

export function MjcfPreviewModel({ scenePath, bodyName, fallback }: MjcfPreviewModelProps) {
  const state = readMjcfPreview(scenePath, bodyName);

  const centeredGeoms = useMemo(() => {
    if (state.status !== "ready") return [];
    return centerGeoms(state.geoms);
  }, [state]);

  if (state.status !== "ready") {
    return fallback;
  }

  return (
    <group rotation={[0, -0.35, 0]} scale={1.35}>
      {centeredGeoms.map((geom) => (
        <MjcfGeom key={geom.name} geom={geom} />
      ))}
    </group>
  );
}

function readMjcfPreview(scenePath: string, bodyName: string) {
  const cacheKey = `${scenePath}::${bodyName}`;
  const cached = previewResourceCache.get(cacheKey);

  if (cached) {
    if (cached.status === "pending") throw cached.promise;
    return cached;
  }

  const resource: PreviewResource = {
    status: "pending",
    promise: fetch(scenePath, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load MJCF scene: ${response.status}`);
        return response.text();
      })
      .then((xmlText) => {
        const geoms = parseMjcfBody(xmlText, bodyName);
        previewResourceCache.set(
          cacheKey,
          geoms.length ? { status: "ready", geoms, promise: null } : { status: "error", geoms: null, promise: null },
        );
      })
      .catch(() => {
        previewResourceCache.set(cacheKey, { status: "error", geoms: null, promise: null });
      }),
    geoms: null,
  };

  previewResourceCache.set(cacheKey, resource);
  throw resource.promise;
}

function MjcfGeom({ geom }: { geom: PreviewGeom }) {
  const position: [number, number, number] = [geom.pos[0], geom.pos[2], -geom.pos[1]];
  const rotation: [number, number, number] = geom.quat ? quatToEulerApprox(geom.quat) : [0, 0, 0];

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      {geom.type === "cylinder" ? (
        <cylinderGeometry args={[geom.size[0], geom.size[0], geom.size[1] * 2, 32]} />
      ) : geom.type === "sphere" ? (
        <sphereGeometry args={[geom.size[0], 32, 24]} />
      ) : (
        <boxGeometry args={[geom.size[0] * 2, geom.size[2] * 2, geom.size[1] * 2]} />
      )}
      <meshStandardMaterial color={geom.color} metalness={0.18} roughness={0.42} />
    </mesh>
  );
}

function parseMjcfBody(xmlText: string, bodyName: string) {
  const document = new DOMParser().parseFromString(xmlText, "application/xml");
  if (document.querySelector("parsererror")) return [];

  const materials = Array.from(document.querySelectorAll("asset material")).reduce<MaterialMap>(
    (map, material) => {
      const name = material.getAttribute("name");
      const rgba = material.getAttribute("rgba");
      const color = rgbaToHex(rgba ?? "");
      if (name && color) map[name] = color;
      return map;
    },
    {},
  );

  const body = Array.from(document.querySelectorAll("worldbody body")).find(
    (element) => element.getAttribute("name") === bodyName,
  );

  if (!body) return [];

  return Array.from(body.querySelectorAll(":scope > geom"))
    .map<PreviewGeom | null>((geom, index) => {
      const type = geom.getAttribute("type") ?? "box";
      if (type !== "box" && type !== "cylinder" && type !== "sphere") return null;

      const color =
        rgbaToHex(geom.getAttribute("rgba") ?? "") ??
        materials[geom.getAttribute("material") ?? ""] ??
        "#e8f1fb";

      return {
        name: geom.getAttribute("name") ?? `${bodyName}-${index}`,
        type,
        pos: parseVec3(geom.getAttribute("pos"), [0, 0, 0]),
        size: parseSize(geom.getAttribute("size"), type),
        quat: parseQuat(geom.getAttribute("quat")),
        color,
      } satisfies PreviewGeom;
    })
    .filter((geom): geom is PreviewGeom => Boolean(geom));
}

function centerGeoms(geoms: PreviewGeom[]) {
  if (!geoms.length) return geoms;

  const center = geoms.reduce<[number, number, number]>(
    (sum, geom) => [sum[0] + geom.pos[0], sum[1] + geom.pos[1], sum[2] + geom.pos[2]],
    [0, 0, 0],
  );

  center[0] /= geoms.length;
  center[1] /= geoms.length;
  center[2] /= geoms.length;

  return geoms.map((geom) => ({
    ...geom,
    pos: [geom.pos[0] - center[0], geom.pos[1] - center[1], geom.pos[2] - center[2]] as [
      number,
      number,
      number,
    ],
  }));
}

function parseNumbers(value: string | null) {
  if (!value) return [];
  return value
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(Number.isFinite);
}

function parseVec3(value: string | null, fallback: [number, number, number]): [number, number, number] {
  const values = parseNumbers(value);
  if (values.length < 3) return fallback;
  return [values[0], values[1], values[2]];
}

function parseQuat(value: string | null): [number, number, number, number] | undefined {
  const values = parseNumbers(value);
  if (values.length < 4) return undefined;
  return [values[0], values[1], values[2], values[3]];
}

function parseSize(value: string | null, type: PreviewGeom["type"]) {
  const values = parseNumbers(value);
  if (type === "box") {
    return values.length >= 3 ? [values[0], values[1], values[2]] : [0.1, 0.1, 0.1];
  }

  return values.length >= 2 ? [values[0], values[1]] : [0.1, 0.1];
}

function rgbaToHex(value: string) {
  const rgba = parseNumbers(value);
  if (rgba.length < 3) return null;
  if (!Number.isFinite(rgba[0])) return null;

  const channel = (number: number) =>
    Math.max(0, Math.min(255, Math.round(number * 255)))
      .toString(16)
      .padStart(2, "0");

  return `#${channel(rgba[0])}${channel(rgba[1])}${channel(rgba[2])}`;
}

function quatToEulerApprox(quat: [number, number, number, number]) {
  const [, x, y, z] = quat;

  if (Math.abs(x) > 0.6) return [Math.PI / 2, 0, 0] as [number, number, number];
  if (Math.abs(y) > 0.6) return [0, Math.PI / 2, 0] as [number, number, number];
  if (Math.abs(z) > 0.6) return [0, 0, Math.PI / 2] as [number, number, number];
  return [0, 0, 0] as [number, number, number];
}
