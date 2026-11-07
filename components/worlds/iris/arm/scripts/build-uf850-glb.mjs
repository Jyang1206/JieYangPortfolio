// Builds public/robot/uf850/uf850-visual.glb from the UFACTORY UF850 + xArm gripper visual STLs.
//
//   node components/worlds/iris/arm/scripts/build-uf850-glb.mjs <path to IRIS public/robot/uf850>
//
// Each STL is welded, simplified with meshoptimizer (already installed through drei), given creased
// normals and written as one named mesh node with KHR_mesh_quantization (int16 positions, int8 normals),
// which three's GLTFLoader reads without a decoder. Mesh frames are unchanged: each node's translation and
// uniform scale only undo the quantization, so link frames still match uf850.urdf.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { BufferAttribute } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { mergeVertices, toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MeshoptSimplifier } from "meshoptimizer";

const source = resolve(process.argv[2] ?? "../IRIS/apps/dashboard-web/public/robot/uf850");
const target = resolve("public/robot/uf850");

// [name in the GLB, STL path relative to the source, kept fraction of triangles]
const MESHES = [
  ["link_base", "meshes/uf850/visual/link_base.stl", 0.3],
  ["link1", "meshes/uf850/visual/link1.stl", 0.35],
  ["link2", "meshes/uf850/visual/link2.stl", 0.35],
  ["link3", "meshes/uf850/visual/link3.stl", 0.35],
  ["link4", "meshes/uf850/visual/link4.stl", 0.35],
  ["link5", "meshes/uf850/visual/link5.stl", 0.4],
  ["link6", "meshes/uf850/visual/link6.stl", 0.2],
  ["gripper_base", "meshes/gripper/xarm/base_link.stl", 0.12],
  ["left_outer_knuckle", "meshes/gripper/xarm/left_outer_knuckle.stl", 0.6],
  ["left_finger", "meshes/gripper/xarm/left_finger.stl", 0.25],
  ["left_inner_knuckle", "meshes/gripper/xarm/left_inner_knuckle.stl", 0.2],
  ["right_outer_knuckle", "meshes/gripper/xarm/right_outer_knuckle.stl", 0.6],
  ["right_finger", "meshes/gripper/xarm/right_finger.stl", 0.25],
  ["right_inner_knuckle", "meshes/gripper/xarm/right_inner_knuckle.stl", 0.2],
];

await MeshoptSimplifier.ready;
const loader = new STLLoader();

function processMesh(file, keep) {
  const bytes = readFileSync(join(source, file));
  let geometry = loader.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  geometry.deleteAttribute("normal");
  geometry = mergeVertices(geometry, 1e-6);
  const before = geometry.index.count / 3;
  const positions = geometry.getAttribute("position").array;
  const indices = new Uint32Array(geometry.index.array);
  // Error is relative to the mesh extent; 0.4% keeps silhouettes and fillets.
  const [simplified] = MeshoptSimplifier.simplify(indices, Float32Array.from(positions), 3, Math.floor(indices.length * keep / 3) * 3, 0.004, []);
  geometry.setIndex(new BufferAttribute(simplified, 1));
  geometry = toCreasedNormals(geometry, (35 * Math.PI) / 180);
  geometry = mergeVertices(geometry, 1e-6);
  return { geometry, before, after: geometry.index.count / 3 };
}

const chunks = [];
let offset = 0;
function push(typed) {
  const pad = (4 - (offset % 4)) % 4;
  if (pad) {
    chunks.push(new Uint8Array(pad));
    offset += pad;
  }
  const view = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
  chunks.push(view);
  const at = offset;
  offset += view.byteLength;
  return at;
}

const gltf = {
  asset: { version: "2.0", generator: "IRIS portfolio build-uf850-glb", copyright: "UFACTORY Inc., BSD-3-Clause (see LICENSE)" },
  extensionsUsed: ["KHR_mesh_quantization"],
  extensionsRequired: ["KHR_mesh_quantization"],
  scene: 0,
  scenes: [{ nodes: [] }],
  nodes: [],
  meshes: [],
  accessors: [],
  bufferViews: [],
  buffers: [{ byteLength: 0 }],
  materials: [{ name: "uf850", pbrMetallicRoughness: { baseColorFactor: [0.95, 0.95, 0.95, 1], metallicFactor: 0, roughnessFactor: 0.5 } }],
};

for (const [name, file, keep] of MESHES) {
  const { geometry, before, after } = processMesh(file, keep);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const centre = box.getCenter(box.min.clone());
  const half = Math.max(...box.getSize(box.min.clone()).toArray()) / 2;
  const pos = geometry.getAttribute("position");
  const nrm = geometry.getAttribute("normal");
  const count = pos.count;
  // VEC3 int16 needs 4-byte aligned elements: pad each to 8 bytes; normals int8 padded to 4 bytes.
  const qPos = new Int16Array(count * 4);
  const qNrm = new Int8Array(count * 4);
  const qMin = [32767, 32767, 32767];
  const qMax = [-32767, -32767, -32767];
  for (let i = 0; i < count; i += 1) {
    const p = [pos.getX(i), pos.getY(i), pos.getZ(i)];
    const c = centre.toArray();
    for (let k = 0; k < 3; k += 1) {
      const q = Math.max(-32767, Math.min(32767, Math.round(((p[k] - c[k]) / half) * 32767)));
      qPos[i * 4 + k] = q;
      qMin[k] = Math.min(qMin[k], q);
      qMax[k] = Math.max(qMax[k], q);
    }
    const n = [nrm.getX(i), nrm.getY(i), nrm.getZ(i)];
    for (let k = 0; k < 3; k += 1) qNrm[i * 4 + k] = Math.round(n[k] * 127);
  }
  const index = count < 65536 ? Uint16Array.from(geometry.index.array) : Uint32Array.from(geometry.index.array);

  const views = gltf.bufferViews;
  views.push({ buffer: 0, byteOffset: push(qPos), byteLength: qPos.byteLength, byteStride: 8, target: 34962 });
  const posAcc = gltf.accessors.push({ bufferView: views.length - 1, componentType: 5122, normalized: true, count, type: "VEC3", min: qMin, max: qMax }) - 1;
  // Normalized accessors store min/max as raw integers; GLTFLoader rescales them.
  views.push({ buffer: 0, byteOffset: push(qNrm), byteLength: qNrm.byteLength, byteStride: 4, target: 34962 });
  const nrmAcc = gltf.accessors.push({ bufferView: views.length - 1, componentType: 5120, normalized: true, count, type: "VEC3" }) - 1;
  views.push({ buffer: 0, byteOffset: push(index), byteLength: index.byteLength, target: 34963 });
  const idxAcc = gltf.accessors.push({ bufferView: views.length - 1, componentType: index instanceof Uint16Array ? 5123 : 5125, count: index.length, type: "SCALAR" }) - 1;

  const mesh = gltf.meshes.push({ name, primitives: [{ attributes: { POSITION: posAcc, NORMAL: nrmAcc }, indices: idxAcc, material: 0 }] }) - 1;
  const node = gltf.nodes.push({ name, mesh, translation: centre.toArray(), scale: [half, half, half] }) - 1;
  gltf.scenes[0].nodes.push(node);
  console.log(`${name.padEnd(20)} ${String(before).padStart(6)} -> ${String(after).padStart(6)} triangles`);
}

const pad4 = (n) => (n + 3) & ~3;
const binLength = pad4(offset);
gltf.buffers[0].byteLength = binLength;
const json = Buffer.from(JSON.stringify(gltf));
const jsonLength = pad4(json.length);
const total = 12 + 8 + jsonLength + 8 + binLength;
const out = Buffer.alloc(total, 0);
out.writeUInt32LE(0x46546c67, 0);
out.writeUInt32LE(2, 4);
out.writeUInt32LE(total, 8);
out.writeUInt32LE(jsonLength, 12);
out.writeUInt32LE(0x4e4f534a, 16);
json.copy(out, 20);
out.fill(0x20, 20 + json.length, 20 + jsonLength);
let at = 20 + jsonLength;
out.writeUInt32LE(binLength, at);
out.writeUInt32LE(0x004e4942, at + 4);
at += 8;
for (const chunk of chunks) {
  Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength).copy(out, at);
  at += chunk.byteLength;
}

mkdirSync(target, { recursive: true });
writeFileSync(join(target, "uf850-visual.glb"), out);
copyFileSync(join(source, "LICENSE"), join(target, "LICENSE"));
copyFileSync(join(source, "uf850.urdf"), join(target, "uf850.urdf"));
console.log(`wrote ${join(target, "uf850-visual.glb")} (${(total / 1024).toFixed(0)} KiB)`);
