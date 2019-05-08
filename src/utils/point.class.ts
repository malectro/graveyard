// TODO (kyle): allow for floats?

export class Point {
  private data: Uint32Array;

  constructor(x: number, y: number) {
    this.data = new Uint32Array([x, y]);
  }

  get x() {
    return this.data[0];
  }
  get y() {
    return this.data[1];
  }
  get w() {
    return this.data[0];
  }
  get h() {
    return this.data[1];
  }

  set x(x: number) {
    this.data[0] = x;
  }
  set y(y: number) {
    this.data[1] = y;
  }

  add(source: Point) {
    this.x += source.x;
    this.y += source.y;
    return this;
  }

  subtract(source: Point) {
    this.x -= source.x;
    this.y -= source.y;
    return this;
  }

  scale(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  set(source: Point) {
    this.x = source.x;
    this.y = source.y;
    return this;
  }

  normalize() {
    const distance = Math.sqrt(this.x * this.x + this.y * this.y);
    const scale = distance !== 0 ? 1 / distance : 1;

    this.x *= scale;
    this.y *= scale;

    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  assignMin() {
    const min = Math.min(this.x, this.y);
    this.x = min;
    this.y = min;
    return this;
  }
}
