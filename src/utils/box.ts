import * as p from './point';


interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function intersectSegment(box: Box, rayOrigin: p.Point, rayTerminus: p.Vector2): null | p.Point {
  const bottom = box.y + box.height;
  const right = box.x + box.width;

  const topLeft = box;
  const bottomLeft = p.create(box.x, bottom);
  const bottomRight = p.create(right, bottom);
  const topRight = p.create(right, box.y);

  const face1 = intersectLines(rayOrigin, rayTerminus, box, topRight);
  const face2 = intersectLines(rayOrigin, rayTerminus, topRight, bottomRight);
  const face3 = intersectLines(rayOrigin, rayTerminus, bottomRight, bottomLeft);
  const face4 = intersectLines(rayOrigin, rayTerminus, bottomLeft, box);

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

export function intersectLines(l1: p.Vector2, l2: p.Vector2, l3: p.Vector2, l4: p.Vector2): null | p.Point {
  const denominator = (l1.x - l2.x) * (l3.y - l4.y) - (l1.y - l2.y) * (l3.x - l4.x);

  if (denominator === 0) {
    return null;
  }

  const tNumerator = (l1.x - l3.x) * (l3.y - l4.y) - (l1.y - l3.y) * (l3.x - l4.x);
  const uNumerator = (l1.y - l2.y) * (l1.x - l3.x) - (l1.x - l2.x) * (l1.y - l3.y);

  if (tNumerator === 0 || uNumerator === 0) {
    return null;
  }

  const t = tNumerator / denominator;
  const u = uNumerator / denominator;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {x: l1.x + t * (l2.x - l1.x), y: l1.y + t * (l2.y - l1.y)};
  }
}

console.log('intersection lines',
  intersectLines(
    {x: 0, y: 0},
    {x: 10, y: 0},
    {x: 5, y: 5},
    {x: 5, y: -5},
  ),
);
