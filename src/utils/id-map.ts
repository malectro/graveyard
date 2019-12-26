import ClassParser, {Parser} from './class-parser';


export interface Identified {
  id: string;
}

export class IdMap<T extends Identified> extends Map<string, T> {
  static fromJSON<T extends Identified>(json: T[]): IdMap<T> {
    return new IdMap(json.map(thing => [thing.id, thing]));
  }

  toJSON(): T[] {
    return Array.from(this.values());
  }
}

export function parseClasses<C extends Identified>(classes: Array<Parser<C>>, json: Array<any>): IdMap<C> {
  const parser = new ClassParser(classes);
  return IdMap.fromJSON(
    json.map(item => parser.parse(item)),
  );
}
