// Procedural path system — grid-aligned dirt walkways with organic wobble.
// Path layout is deterministic based on coordinates (no stored state needed).
// Must stay in sync with the path logic in tools/serve.ts.

export const GRID_SPACING = 600;
export const PATH_HALF_WIDTH = 28;
export const PATH_MARGIN = 40; // extra buffer around paths for tombstone placement
export const MIN_TOMBSTONE_SPACING = 200; // center-to-center minimum between tombstones

// Deterministic pseudo-random hash
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Wobble offset for a path center line.
// axisOffset separates vertical (0) from horizontal (1000) paths.
export function pathWobble(lineIndex: number, axisOffset: number, along: number): number {
  const seed = lineIndex * 73 + axisOffset;
  const amp = 12 + hash(seed) * 24; // 12–36px amplitude
  const freq = 0.003 + hash(seed + 1) * 0.003; // varying frequency
  const phase = hash(seed + 2) * Math.PI * 2;
  return Math.sin(along * freq + phase) * amp;
}

// Shortest distance from a point to the nearest path center line.
export function distToNearestPath(x: number, y: number): number {
  // Nearest vertical path (constant-x line, wobbles in x as fn of y)
  const vIdx = Math.round(x / GRID_SPACING);
  const vCenterX = vIdx * GRID_SPACING + pathWobble(vIdx, 0, y);
  const vDist = Math.abs(x - vCenterX);

  // Nearest horizontal path (constant-y line, wobbles in y as fn of x)
  const hIdx = Math.round(y / GRID_SPACING);
  const hCenterY = hIdx * GRID_SPACING + pathWobble(hIdx, 1000, x);
  const hDist = Math.abs(y - hCenterY);

  return Math.min(vDist, hDist);
}

// Is the point visually on a path?
export function isOnPath(x: number, y: number): boolean {
  return distToNearestPath(x, y) <= PATH_HALF_WIDTH;
}

// Is the point too close to a path for tombstone placement?
export function isNearPath(x: number, y: number): boolean {
  return distToNearestPath(x, y) <= PATH_HALF_WIDTH + PATH_MARGIN;
}
