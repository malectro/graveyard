export default {
  hero: '3',
  entities: [
    {id: '1', box: {className: 'StaticPhysics', position: {x: 200, y: 100}, size: {x: 128, y: 128}}, assetId: '1', speciesId: '1', triggerId: '1'},
    {id: '2', box: {className: 'StaticPhysics', position: {x: 400, y: 100}, size: {x: 64, y: 64}}, assetId: '2', speciesId: '2'},
    {id: '3', box: {className: 'DynamicPhysics', position: {x: 0, y: 0}, size: {x: 64, y: 96}, speed: 0.5}, assetId: '3', speciesId: '3'},
  ],
  assets: [
    {id: '1', className: 'StaticGraphic',  width: 128, height: 128, src: 'zelda-headstone.png'},
    {id: '2', className: 'StaticGraphic',  width: 64, height: 64, src: 'grass-1.png'},
    {id: '3', className: 'AnimatedGraphic', width: 64, height: 96, src: [
      'link-sprites/down-walk-1.png',
      'link-sprites/down-walk-2.png',
      'link-sprites/down-walk-3.png',
      'link-sprites/down-walk-4.png',
    ]},
  ],
  species: [
    {id: '1', type: 'headstone', collides: true, triggerable: true, text: 'Here lies Kyle'},
    {id: '2', type: 'grass', collides: false},
    {id: '3', type: 'hero', collides: true, name: 'Dude'},
  ],
  triggers: [
    {id: '1', box: {position: {x: 0, y: 128}, size: {x: 128, y: 50}}},
  ],
};

