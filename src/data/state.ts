type WalkerSpriteSet = {
  stand: Array<string>;
  walk: Array<string>;
};

function getAnimatedGraphics(
  name,
): {
  down: WalkerSpriteSet;
  left: WalkerSpriteSet;
  top: WalkerSpriteSet;
  right: WalkerSpriteSet;
} {
  const src = {};
  for (const direction of ['down', 'left', 'up', 'right']) {
    src[direction] = {
      stand: [`${name}/${direction}-stand.png`],
      walk: Array.from(Array(4)).map(
        (_, i) => `${name}/${direction}-walk-${i + 1}.png`,
      ),
    };
  }
  return src;
}

// Grass positions scattered throughout
const grassPositions = [
  {x: 400, y: 100}, {x: 500, y: 100},  // originals
  {x: 100, y: 300}, {x: -100, y: 200}, {x: 350, y: -100},
  {x: -250, y: -300}, {x: 700, y: 50}, {x: 150, y: 500},
  {x: -450, y: 400}, {x: 950, y: -50}, {x: -750, y: 250},
  {x: 1050, y: 350}, {x: -550, y: -500}, {x: 650, y: -350},
  {x: -350, y: 650}, {x: 1250, y: 150}, {x: -950, y: -150},
  {x: 550, y: 750}, {x: -150, y: -750}, {x: 850, y: 550},
  {x: -1050, y: 450}, {x: 1350, y: -250}, {x: -650, y: 850},
  {x: 250, y: -650}, {x: 1550, y: 50}, {x: -1250, y: -350},
  {x: 450, y: 1050}, {x: -850, y: -650}, {x: 1150, y: 700},
  {x: -1450, y: 550}, {x: 750, y: -800}, {x: -50, y: 900},
  {x: 1750, y: -400}, {x: -1650, y: 200}, {x: 350, y: -900},
  {x: -1150, y: 750}, {x: 1650, y: 400}, {x: -350, y: -1100},
  {x: 1950, y: -200}, {x: -1850, y: -50},
];

// Build grass entities
let nextGrassId = 200;
const grassEntities = grassPositions.map((pos, i) => ({
  id: String(nextGrassId + i),
  box: {
    className: 'StaticPhysics',
    position: pos,
    size: {x: 64, y: 64},
  },
  assetId: '2',
  speciesId: '2',
}));

export default {
  hero: '3',
  entities: [
    ...grassEntities,
    {
      id: '3',
      box: {
        className: 'DynamicPhysics',
        position: {x: 0, y: 0},
        size: {x: 64, y: 96},
        speed: 1,
        friction: 0.9,
      },
      assetId: '3',
      speciesId: '3',
    },
  ],
  assets: [
    {
      id: '1',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'zelda-headstone.png',
    },
    {
      id: '10',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-rounded.png',
    },
    {
      id: '11',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-cross.png',
    },
    {
      id: '12',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-obelisk.png',
    },
    {
      id: '13',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-slab.png',
    },
    {
      id: '14',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-angel.png',
    },
    {
      id: '15',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'tombstone-broken.png',
    },
    {
      id: '16',
      className: 'StaticGraphic',
      sourceSize: {width: 32, height: 32},
      size: {width: 128, height: 128},
      src: 'hld-tombstone.png',
    },
    {
      id: '2',
      className: 'StaticGraphic',
      sourceSize: {width: 16, height: 16},
      size: {width: 64, height: 64},
      src: 'grass-1.png',
    },
    {
      id: '3',
      className: 'AnimatedGraphic',
      sourceSize: {width: 16, height: 24},
      size: {width: 64, height: 96},
      src: getAnimatedGraphics('link-sprites'),
    },
  ],
  species: [
    {id: '2', type: 'grass', collides: false},
    {id: '3', type: 'hero', collides: true, name: 'Dude'},
  ],
  triggers: [{id: '1', box: {position: {x: 0, y: 128}, size: {x: 128, y: 50}}}],
};
