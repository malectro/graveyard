import {Sprite} from './sprite.ts';

export const entities: Sprite[] = [
  {id: '1', type: 'headstone', x: 200, y: 100, width: 50, height: 50, data: {text: 'Here lies Kyle'}},
  {id: '2', type: 'headstone', x: 50, y: 100, width: 50, height: 50, data: {text: 'Here lies Kyle'}},
  {id: '3', type: 'headstone', x: 300, y: 150, width: 50, height: 50, data: {text: 'Here lies Kyle'}},
  {id: '4', type: 'headstone', x: 4000, y: 150, width: 50, height: 50, data: {text: 'Here lies Kyle'}},
  {id: '5', type: 'grass', x: -100, y: 200, width: 50, height: 50},
  {id: '6', type: 'tree', x: -300, y: 100, width: 50, height: 50},
];
