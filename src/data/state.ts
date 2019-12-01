export default {
  entities: [
    {id: '1', box: {position: {x: 200, y: 100}, size: {x: 100, y: 100}}, assetId: '1', speciesId: '1'},
    {id: '2', box: {position: {x: 400, y: 100}, size: {x: 50, y: 50}}, assetId: '2', speciesId: '2'},
  ],
  assets: [
    {id: '1', width: 100, height: 100, mesh: 0x0000ff},
    {id: '2', width: 50, height: 50, mesh: 0x00ff00},
  ],
  species: [
    {id: '1', type: 'headstone', collides: true, text: 'Here lies Kyle'},
    {id: '2', type: 'grass', collides: false,},
  ],
};

