import * as p from './utils/point';
import {Box, createBox, copy, setOffset, doBoxesIntersect} from './utils/box';
import {Entity} from './entity';
import {getGame} from './game';
import AlertDialog from './ui/AlertDialog';


export class Trigger {
  public id: string;
  private box = createBox();
  public parent: Entity;

  static fromJSON(json: any): Trigger {
    const trigger = new Trigger();

    trigger.id = json.id;
    trigger.box = json.box;

    return trigger;
  }

  toJSON(): any {
    return this;
  }

  activate(): void {
    getGame().ui.setDialog(
      AlertDialog,
      {text: this.parent.species.text},
    );
  }

  canActivate(entity: Entity): boolean {
    const realBox = copy(this.box);
    setOffset(realBox, this.parent.box.position);
    console.log('can activate?', entity.box, this.box, realBox);
    return doBoxesIntersect(entity.box, realBox);
  }
}
