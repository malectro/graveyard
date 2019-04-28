export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y: number) {
  return {
    x, y,
  };
}

export function add(target: Point, source: Point) {
  target.x += source.x;
  target.y += source.y;
  return target;
}

export function subtract(target: Point, source: Point) {
  target.x -= source.x;
  target.y -= source.y;
  return target;
}

export function scale(target: Point, scalar: number) {
  target.x *= scalar;
  target.y *= scalar;
  return target;
}

export function set(target: Point, source: Point) {
  target.x = source.x;
  target.y = source.y;
  return target;
}

export function normalize(point: Point) {
  const distance = Math.sqrt(point.x * point.x + point.y * point.y); 
  const scale = distance !== 0 ? 1 / distance : 1;

  point.x *= scale;
  point.y *= scale;

  return point;
}