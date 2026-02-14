import * as p from './utils/point.js';
import {PhysicsBox} from './utils/box';
import {Species} from './entity';


export class HeroSpecies implements Species {
  readonly collides = true;
  constructor(readonly id: string, readonly name: string = 'New Hero') {}

  static fromJSON(json): HeroSpecies {
    const species = new HeroSpecies(json.id, json.name);
    return species;
  }
}

export function resolveVelocity(box: PhysicsBox): PhysicsBox {
  p.scale(p.normalize(p.set(box.acceleration, box.direction)), box.speed);
  return box;
}
