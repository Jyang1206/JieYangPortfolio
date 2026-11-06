import { Euler, Matrix4, Quaternion, Vector3 } from "three";

/**
 * UF850 kinematics from public/robot/uf850/uf850.urdf (robot frame: metres, Z up, base at the origin).
 * Every arm joint turns about its own z axis after the fixed URDF origin transform.
 */
export type Joints = [number, number, number, number, number, number];

type Origin = { xyz: [number, number, number]; rpy: [number, number, number] };

export const JOINT_ORIGINS: Origin[] = [
  { xyz: [0, 0, 0.364], rpy: [0, 0, 0] },
  { xyz: [0, 0, 0], rpy: [1.5708, -1.5708, 0] },
  { xyz: [0.39, 0, 0], rpy: [-3.1416, 0, -1.5708] },
  { xyz: [0.15, 0.426, 0], rpy: [-1.5708, 0, 0] },
  { xyz: [0, 0, 0], rpy: [-1.5708, 0, 0] },
  { xyz: [0, -0.09, 0], rpy: [1.5708, 0, 0] },
];

const LIMITS: [number, number][] = [
  [-Math.PI * 2, Math.PI * 2],
  [-2.3038346, 2.3038346],
  [-4.2236968, 0.061087],
  [-Math.PI * 2, Math.PI * 2],
  [-2.1642, 2.1642],
  [-Math.PI * 2, Math.PI * 2],
];

/** xArm gripper: tool centre point (between the fingertips) above the gripper base, which sits on the flange. */
export const TCP_OFFSET = 0.172;

const originMatrices = JOINT_ORIGINS.map(({ xyz, rpy }) =>
  new Matrix4().compose(new Vector3(...xyz), new Quaternion().setFromEuler(new Euler(rpy[0], rpy[1], rpy[2], "ZYX")), new Vector3(1, 1, 1)),
);

const scratchRot = new Matrix4();
const tcpLocal = new Matrix4().makeTranslation(0, 0, TCP_OFFSET);

/** Tool centre point pose in the robot frame for the given joints. */
export function forward(q: readonly number[], out = new Matrix4()): Matrix4 {
  out.identity();
  for (let i = 0; i < 6; i += 1) {
    out.multiply(originMatrices[i]).multiply(scratchRot.makeRotationZ(q[i]));
  }
  return out.multiply(tcpLocal);
}

/** Target pose: tool pointing straight down at `position`, fingers closing across the horizontal direction `yaw`. */
export function downPose(position: [number, number, number], yaw: number): Matrix4 {
  // Tool z points down (-Z); tool y (the finger closing axis) lies along `yaw`.
  const y = new Vector3(Math.cos(yaw), Math.sin(yaw), 0);
  const z = new Vector3(0, 0, -1);
  const x = new Vector3().crossVectors(y, z);
  return new Matrix4().makeBasis(x, y, z).setPosition(...position);
}

const current = new Matrix4();
const probe = new Matrix4();
const qCur = new Quaternion();
const qTarget = new Quaternion();
const qErr = new Quaternion();
const pCur = new Vector3();
const pTarget = new Vector3();

function poseError(target: Matrix4, pose: Matrix4, out: number[]) {
  pTarget.setFromMatrixPosition(target);
  pCur.setFromMatrixPosition(pose);
  qTarget.setFromRotationMatrix(target);
  qCur.setFromRotationMatrix(pose);
  qErr.copy(qTarget).multiply(qCur.invert());
  if (qErr.w < 0) qErr.set(-qErr.x, -qErr.y, -qErr.z, -qErr.w);
  const s = Math.sqrt(1 - Math.min(1, qErr.w * qErr.w));
  const angle = 2 * Math.acos(Math.min(1, qErr.w));
  const k = s < 1e-9 ? 2 : angle / s;
  // Orientation weighted at 0.3 m per radian so position and rotation converge together.
  out[0] = pTarget.x - pCur.x;
  out[1] = pTarget.y - pCur.y;
  out[2] = pTarget.z - pCur.z;
  out[3] = qErr.x * k * 0.3;
  out[4] = qErr.y * k * 0.3;
  out[5] = qErr.z * k * 0.3;
}

/** Solves 6x6 A x = b in place (Gaussian elimination with partial pivoting). */
function solve(a: number[][], b: number[]): number[] {
  const n = b.length;
  for (let c = 0; c < n; c += 1) {
    let p = c;
    for (let r = c + 1; r < n; r += 1) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    [b[c], b[p]] = [b[p], b[c]];
    for (let r = c + 1; r < n; r += 1) {
      const f = a[r][c] / a[c][c];
      for (let k = c; k < n; k += 1) a[r][k] -= f * a[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r -= 1) {
    let s = b[r];
    for (let k = r + 1; k < n; k += 1) s -= a[r][k] * x[k];
    x[r] = s / a[r][r];
  }
  return x;
}

/**
 * Damped least-squares IK with a numerical Jacobian, seeded from the previous solution so consecutive
 * keyframes stay on the same branch and joint-space interpolation between them stays smooth.
 */
export function inverse(target: Matrix4, seed: readonly number[]): { q: Joints; error: number } {
  const q = [...seed] as Joints;
  const e = new Array<number>(6).fill(0);
  const ep = new Array<number>(6).fill(0);
  const h = 1e-5;
  const lambda = 0.02;
  let error = Infinity;
  for (let iter = 0; iter < 200; iter += 1) {
    poseError(target, forward(q, current), e);
    error = Math.hypot(...e);
    if (error < 1e-5) break;
    const jac: number[][] = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
    for (let j = 0; j < 6; j += 1) {
      const saved = q[j];
      q[j] = saved + h;
      poseError(target, forward(q, probe), ep);
      q[j] = saved;
      // de/dq is the negative of the pose Jacobian.
      for (let r = 0; r < 6; r += 1) jac[r][j] = (e[r] - ep[r]) / h;
    }
    // (J^T J + lambda^2 I) dq = J^T e
    const jtj: number[][] = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
    const jte = new Array<number>(6).fill(0);
    for (let a = 0; a < 6; a += 1) {
      for (let b = 0; b < 6; b += 1) {
        let s = 0;
        for (let r = 0; r < 6; r += 1) s += jac[r][a] * jac[r][b];
        jtj[a][b] = s + (a === b ? lambda * lambda : 0);
      }
      let s = 0;
      for (let r = 0; r < 6; r += 1) s += jac[r][a] * e[r];
      jte[a] = s;
    }
    const dq = solve(jtj, jte);
    for (let j = 0; j < 6; j += 1) {
      const step = Math.max(-0.2, Math.min(0.2, dq[j]));
      q[j] = Math.max(LIMITS[j][0], Math.min(LIMITS[j][1], q[j] + step));
    }
  }
  return { q, error };
}
