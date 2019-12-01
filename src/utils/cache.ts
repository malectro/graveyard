export default class Cache<K, V> {
  private map: Map<K, V> = new Map();

  constructor(private onCreate: (K) => V) {}

  get(id: K) {
    let thing = this.map.get(id);
    if (!thing) {
      thing = this.onCreate(id);
      this.map.set(id, thing);
    }
    return thing;
  }
}
