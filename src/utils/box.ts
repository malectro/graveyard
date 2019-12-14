import * as p from './point';

export interface Box {
  position: p.Vector2;
  size: p.Vector2;
}

export interface PhysicsBox extends Box {
  speed: number;
  direction: p.Vector2;
  velocity: p.Vector2;
  futurePosition: p.Vector2;
  lastUpdate: number;
}

export function intersectSegment(
  box: Box,
  rayOrigin: p.Point,
  rayTerminus: p.Vector2,
): null | p.Point {
  const {position, size} = box;

  const bottom = position.y + size.x;
  const right = position.x + size.y;

  const topLeft = box;
  const bottomLeft = p.create(position.x, bottom);
  const bottomRight = p.create(right, bottom);
  const topRight = p.create(right, position.y);

  const face1 = intersectLines(rayOrigin, rayTerminus, position, topRight);
  const face2 = intersectLines(rayOrigin, rayTerminus, topRight, bottomRight);
  const face3 = intersectLines(rayOrigin, rayTerminus, bottomRight, bottomLeft);
  const face4 = intersectLines(rayOrigin, rayTerminus, bottomLeft, position);

  let closestDistance = Infinity;
  let closestFace = null;

  // TODO (kyle): this is probably not efficient
  for (const face of [face1, face2, face3, face4]) {
    if (face) {
      const distance = p.cheapDistance(rayOrigin, face);
      if (distance < closestDistance) {
        closestFace = face;
        closestDistance = distance;
      }
    }
  }

  return closestFace;
}

export function intersectLines(
  l1: p.Vector2,
  l2: p.Vector2,
  l3: p.Vector2,
  l4: p.Vector2,
): null | p.Point {
  const denominator =
    (l1.x - l2.x) * (l3.y - l4.y) - (l1.y - l2.y) * (l3.x - l4.x);

  if (denominator === 0) {
    return null;
  }

  const tNumerator =
    (l1.x - l3.x) * (l3.y - l4.y) - (l1.y - l3.y) * (l3.x - l4.x);
  const uNumerator =
    (l1.y - l2.y) * (l1.x - l3.x) - (l1.x - l2.x) * (l1.y - l3.y);

  if (tNumerator === 0 || uNumerator === 0) {
    return null;
  }

  const t = tNumerator / denominator;
  const u = uNumerator / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {x: l1.x + t * (l2.x - l1.x), y: l1.y + t * (l2.y - l1.y)};
  }
}
