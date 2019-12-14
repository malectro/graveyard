export default class ClassParser {
  private classMap: Map<string, Parser>;

  constructor(classes: Array<Parser>) {
    this.classMap = classes.reduce((map, cls) => map.set(cls.name, cls), new Map());
  }

  parse(json: any): any {
    const cls = this.classMap.get(json.className);
    if (!cls) {
      throw new Error(`Attempted to parse data of invalid class type ${json.className}.`);
    }
    return cls.fromJSON(json);
  }
}

interface Parser {
  fromJSON(json: any): any;
  name: string;
}
