export default class Pool<T> {
  private pool: T[] = [];

  constructor(private create: () => T) {}

  request(): T {
    return this.pool.length > 0 ? this.pool.pop() : this.create();
  }

  retire(thing: T) {
    this.pool.push(thing);
  }
}
