export function generateAizawa(
  count: number,
): { x: number; y: number; z: number }[] {
  const points = [];
  const a = 0.95;
  const b = 0.7;
  const c = 0.6;
  const d = 3.5;
  const f = 0.1;
  const dt = 0.01;

  let x = 0.1;
  let y = 0;
  let z = 0;

  for (let i = 0; i < count; i++) {
    const dx = ((z - b) * x - d * y) * dt;
    const dy = (d * x + (z - b) * y) * dt;
    const dz =
      (c + a * z - Math.pow(z, 3) / 3 - x * x + f * z * Math.pow(x, 3)) * dt;

    x += dx;
    y += dy;
    z += dz;

    points.push({ x: x * 10, y: y * 10, z: z * 10 });
  }
  return points;
}

export function generateBatman(
  count: number,
): { x: number; y: number; z: number }[] {
  const points = [];
  const scale = 2;
  const topPoints = [];
  const bottomPoints = [];

  const halfCount = Math.floor(count / 2);
  for (let i = 0; i <= halfCount; i++) {
    const x = -7 + (14 * i) / halfCount;
    const absX = Math.abs(x);
    let yTop = 0;
    let yBottom = 0;

    if (absX < 0.5) {
      yTop = 2.25;
    } else if (absX < 0.75) {
      yTop = 3 * absX + 0.75;
    } else if (absX < 1) {
      yTop = 9 - 8 * absX;
    } else if (absX < 3) {
      yTop =
        1.5 -
        0.5 * absX -
        ((6 * Math.sqrt(10)) / 14) *
          (Math.sqrt(3 - Math.pow(absX, 2) + 2 * absX) - 2);
    } else if (absX <= 7) {
      yTop = 3 * Math.sqrt(1 - Math.pow(x / 7, 2));
    }

    if (absX < 4) {
      yBottom =
        Math.abs(x / 2) -
        ((3 * Math.sqrt(33) - 7) / 112) * Math.pow(x, 2) -
        3 +
        Math.sqrt(1 - Math.pow(Math.abs(absX - 2) - 1, 2));
    } else if (absX <= 7) {
      yBottom = -3 * Math.sqrt(1 - Math.pow(x / 7, 2));
    }

    topPoints.push({ x: x * scale, y: yTop * scale, z: 2 * Math.sin(x) });
    bottomPoints.push({ x: x * scale, y: yBottom * scale, z: 2 * Math.sin(x) });
  }

  return [...topPoints, ...bottomPoints.reverse()];
}

export function generateButterfly(
  count: number,
): { x: number; y: number; z: number }[] {
  const points = [];
  const scale = 3;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const e =
      Math.exp(Math.cos(t)) -
      2 * Math.cos(4 * t) -
      Math.pow(Math.sin(t / 12), 5);
    const x = scale * Math.sin(t) * e;
    const y = scale * Math.cos(t) * e;
    const z = 2 * Math.sin(t);
    points.push({ x, y, z });
  }
  return points;
}

export function generateCircle(count: number) {
  const points = [];

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;

    const x = Math.cos(t) * 10;
    const y = Math.sin(t) * 10;
    const z = 0;

    points.push({ x, y, z });
  }

  return points;
}

export function generateHeart(
  count: number,
): { x: number; y: number; z: number }[] {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    const z = 2 * Math.sin(t);
    points.push({ x, y, z });
  }
  return points;
}

export function generateMultiLemniscate(
  count: number,
): { x: number; y: number; z: number }[] {
  const points = [];
  const a0 = 4;
  const r = 0.7;
  const Sx = 5;
  const Sy = 5;

  for (let k = 0; k < 4; k++) {
    const ak = a0 * Math.pow(r, k);

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;

      const x = Sx * ak * Math.cos(t);
      const y = Sy * ak * Math.sin(t) * Math.cos(t);
      const z = 2 * Math.sin(t) + k;

      points.push({ x, y, z });
    }
  }
  return points;
}

export function generateRose(count: number) {
  const points = [];
  const n = 5;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;

    const r = Math.cos(n * t);

    const x = r * Math.cos(t) * 10;
    const y = r * Math.sin(t) * 10;
    const z = 0;

    points.push({ x, y, z });
  }

  return points;
}

export function generateSpiral(count: number) {
  const points = [];

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 4;

    const x = t * Math.cos(t);
    const y = t * Math.sin(t);
    const z = 0;

    points.push({
      x: x * 2,
      y: y * 2,
      z,
    });
  }

  return points;
}


// export function generateLorenzCustom(count: number) {
//   const sigma = 15
//   const rho = 15
//   const beta = 8 / 3
//   const dt = 0.005

//   const steps = count * 4

//   let x = 1
//   let y = 1
//   let z = 1

//   const trajectory: {x:number,y:number,z:number}[] = []

//   for (let i = 0; i < steps; i++) {

//     const dx = sigma * (y - x)
//     const dy = x * (rho - z) - y
//     const dz = x * y - beta * z

//     x += dx * dt
//     y += dy * dt
//     z += dz * dt

//     trajectory.push({x,y,z})
//   }

//   // downsample to match backend
//   const result = []

//   for (let i = 0; i < count; i++) {
//     const idx = Math.floor((i / count) * trajectory.length)
//     const p = trajectory[idx]

//     result.push({
//       x: p.x * 5,
//       y: p.y * 5,
//       z: p.z * 5
//     })
//   }

//   return result
// }

export function generateLorenzCustom(count: number) {

  const sigma = 15
  const rho = 15
  const beta = 8 / 3
  const dt = 0.005

  const steps = count * 4

  let x = 1
  let y = 1
  let z = 1

  const trajectory: { x: number; y: number; z: number }[] = []

  for (let i = 0; i < steps; i++) {

    const dx = sigma * (y - x)
    const dy = x * (rho - z) - y
    const dz = x * y - beta * z

    x += dx * dt
    y += dy * dt
    z += dz * dt

    trajectory.push({ x, y, z })
  }

  // downsample
  const sampled: { x: number; y: number; z: number }[] = []

  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * trajectory.length)
    sampled.push(trajectory[idx])
  }

  // normalize to [-1,1]
  const xs = sampled.map(p => p.x)
  const ys = sampled.map(p => p.y)
  const zs = sampled.map(p => p.z)

  const norm = (arr: number[]) => {
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    return arr.map(v => (2 * (v - min)) / (max - min) - 1)
  }

  const xn = norm(xs)
  const yn = norm(ys)
  const zn = norm(zs)

  const SCALE = 20   // 👈 adjust this to fit canvas

  const result = []

  for (let i = 0; i < count; i++) {
    result.push({
      x: xn[i] * SCALE,
      y: yn[i] * SCALE,
      z: zn[i] * SCALE
    })
  }

  return result
}

// export function generateLorenzCustom(count: number) {
//   const sigma = 15
//   const rho = 15
//   const beta = 8 / 3
//   const dt = 0.005

//   const burnIn = 500
//   const steps = count * 4 + burnIn

//   let x = 1
//   let y = 1
//   let z = 1

//   const trajectory: { x: number; y: number; z: number }[] = []

//   for (let i = 0; i < steps; i++) {
//     const dx = sigma * (y - x)
//     const dy = x * (rho - z) - y
//     const dz = x * y - beta * z

//     x += dx * dt
//     y += dy * dt
//     z += dz * dt

//     // ignore unstable starting motion
//     if (i >= burnIn) {
//       trajectory.push({ x, y, z })
//     }
//   }

//   // downsample
//   const sampled: { x: number; y: number; z: number }[] = []

//   for (let i = 0; i < count; i++) {
//     const idx = Math.floor((i / count) * trajectory.length)
//     sampled.push(trajectory[idx])
//   }

//   // normalize to [-1, 1]
//   const xs = sampled.map((p) => p.x)
//   const ys = sampled.map((p) => p.y)
//   const zs = sampled.map((p) => p.z)

//   const norm = (arr: number[]) => {
//     const min = Math.min(...arr)
//     const max = Math.max(...arr)
//     if (max - min < 1e-9) return arr.map(() => 0)
//     return arr.map((v) => (2 * (v - min)) / (max - min) - 1)
//   }

//   const xn = norm(xs)
//   const yn = norm(ys)
//   const zn = norm(zs)

//   const SCALE = 18

//   const result = []

//   for (let i = 0; i < count; i++) {
//     result.push({
//       x: xn[i] * SCALE,
//       y: yn[i] * SCALE,
//       z: zn[i] * SCALE,
//     })
//   }

//   return result
// }
