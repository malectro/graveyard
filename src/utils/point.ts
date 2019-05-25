export interface Point {
  x: number;
  y: number;
}

// TODO (kyle): could do more immutable operations if we pool these.

export function point(x: number = 0, y: number = 0) {
  return {
    x, y,
  };
}
export const create = point;

export function add<T extends Point>(target: T, source: Point): T {
  target.x += source.x;
  target.y += source.y;
  return target;
}

export function subtract<T extends Point>(target: T, source: Point): T {
  target.x -= source.x;
  target.y -= source.y;
  return target;
}

export function scale<T extends Point>(target: T, scalar: number): T {
  target.x *= scalar;
  target.y *= scalar;
  return target;
}

export function set<T extends Point>(target: T, source: Point): T {
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

export function floor(point: Point) {
  point.x = Math.floor(point.x);
  point.y = Math.floor(point.y);
  return point;
}

export function assignMin(point: Point) {
  const min = Math.min(point.x, point.y);
  point.x = min;
  point.y = min;
  return point;
}