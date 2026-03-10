export function norm(arr: number[]) {
  const min = Math.min(...arr)
  const max = Math.max(...arr)

  if (Math.abs(max - min) < 1e-9) return arr

  return arr.map(v => 2 * (v - min) / (max - min) - 1)
}

export function mapToXYZ(
  u: number[],
  v: number[],
  scale = 300,
  plane: "YZ" | "XZ" | "XY" = "YZ",
  offsetAxis: "X" | "Y" | "Z" = "Y",
  offsetValue = -200
) {

  const u_s = norm(u).map(x => x * scale)
  const v_s = norm(v).map(x => x * scale)

  const n = u_s.length

  const X = new Array(n).fill(0)
  const Y = new Array(n).fill(0)
  const Z = new Array(n).fill(0)

  if (plane === "YZ") {
    for (let i = 0; i < n; i++) {
      Y[i] = u_s[i]
      Z[i] = v_s[i]
    }
  }

  if (plane === "XZ") {
    for (let i = 0; i < n; i++) {
      X[i] = u_s[i]
      Z[i] = v_s[i]
    }
  }

  if (plane === "XY") {
    for (let i = 0; i < n; i++) {
      X[i] = u_s[i]
      Y[i] = v_s[i]
    }
  }

  if (offsetAxis === "X")
    for (let i = 0; i < n; i++) X[i] += offsetValue

  if (offsetAxis === "Y")
    for (let i = 0; i < n; i++) Y[i] += offsetValue

  if (offsetAxis === "Z")
    for (let i = 0; i < n; i++) Z[i] += offsetValue

  const result = []

  for (let i = 0; i < n; i++) {
    result.push({
      x: X[i],
      y: Y[i],
      z: Z[i]
    })
  }

  return result
}