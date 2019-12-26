export default {
  hero: '3',
  entities: [
    {id: '1', box: {className: 'StaticPhysics', position: {x: 200, y: 100}, size: {x: 100, y: 100}}, assetId: '1', speciesId: '1', triggerId: '1'},
    {id: '2', box: {className: 'StaticPhysics', position: {x: 400, y: 100}, size: {x: 50, y: 50}}, assetId: '2', speciesId: '2'},
    {id: '3', box: {className: 'DynamicPhysics', position: {x: 0, y: 0}, size: {x: 100, y: 100}, speed: 0.5}, assetId: '3', speciesId: '3'},
  ],
  assets: [
    {id: '1', width: 100, height: 100, mesh: 0x0000ff},
    {id: '2', width: 50, height: 50, mesh: 0x00ff00},
    {id: '3', width: 100, height: 100, mesh: 0xff0000},
  ],
  species: [
    {id: '1', type: 'headstone', collides: true, triggerable: true, text: 'Here lies Kyle'},
    {id: '2', type: 'grass', collides: false},
    {id: '3', type: 'hero', collides: true, name: 'Dude'},
  ],
  triggers: [
    {id: '1', box: {position: {x: 0, y: 100}, size: {x: 100, y: 50}}},
  ],
};

