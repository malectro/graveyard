export default class ClassParser<C> {
  private classMap: Map<string, Parser<C>>;

  constructor(classes: Array<Parser<C>>) {
    this.classMap = classes.reduce((map, cls) => map.set(cls.name, cls), new Map());
  }

  parse(json: any): C {
    const cls = this.classMap.get(json.className);
    if (!cls) {
      throw new Error(`Attempted to parse data of invalid class type ${json.className}.`);
    }
    return cls.fromJSON(json);
  }
}

export interface Parser<C> {
  fromJSON(json: any): C;
  name: string;
}
