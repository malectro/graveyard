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

// Generate tombstone entities, species, and grass scattered across the world.
// Tombstones are spread across many chunks (512px each) to test spatial chunking.

const epitaphs = [
  'Here lies Kyle',
  'Gone but not debugged',
  'Segfault in peace',
  '404: Life not found',
  'He mass-assigned his last hash',
  'Returned void too soon',
  'Finally free of technical debt',
  'git commit -m "goodbye"',
  'She never closed her brackets',
  'Unreachable code reached',
  'Stack overflow: too many calls',
  'He died as he lived: in production',
  'null pointer to heaven',
  'Lost in the cloud',
  'Exited with code 0',
  'Garbage collected',
  'Her last words: "it works on my machine"',
  'Caught the final exception',
  'Thread terminated',
  'Memory leak sealed forever',
  'No more merge conflicts',
  'Deployed to the great beyond',
  'while(alive) {} // timeout',
  'rm -rf /life',
  'sudo shutdown -h now',
  'Could not resolve dependency: oxygen',
  'End of file',
  'Killed by OOM killer',
  'Unhandled promise rejection',
  'Connection reset by reaper',
];

// Tombstone positions spread across a large area (-2000 to 2000)
const tombstonePositions = [
  {x: 200, y: 100},    // original
  {x: -300, y: -200},
  {x: 600, y: 400},
  {x: -800, y: 300},
  {x: 1000, y: -100},
  {x: -500, y: -600},
  {x: 1200, y: 600},
  {x: -1000, y: 100},
  {x: 300, y: -500},
  {x: 800, y: 200},
  {x: -200, y: 700},
  {x: 1500, y: -300},
  {x: -1300, y: -400},
  {x: 700, y: -700},
  {x: -600, y: 500},
  {x: 1800, y: 100},
  {x: -1500, y: 700},
  {x: 400, y: 900},
  {x: -900, y: -800},
  {x: 1100, y: 800},
  {x: -1800, y: -100},
  {x: 1600, y: 500},
  {x: -400, y: -1000},
  {x: 900, y: -900},
  {x: -1100, y: 600},
  {x: 2000, y: -500},
  {x: -1600, y: -700},
  {x: 500, y: 1100},
  {x: -700, y: 1000},
  {x: 1400, y: -800},
];

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

// Build species: one per tombstone (each has unique epitaph), plus grass and hero
let nextSpeciesId = 10;
const tombstoneSpecies = epitaphs.map((text, i) => ({
  id: String(nextSpeciesId + i),
  type: 'headstone',
  collides: true,
  triggerable: true,
  text,
}));

// Build tombstone entities
let nextEntityId = 100;
const tombstoneEntities = tombstonePositions.map((pos, i) => ({
  id: String(nextEntityId + i),
  box: {
    className: 'StaticPhysics',
    position: pos,
    size: {x: 128, y: 128},
  },
  assetId: '1',
  speciesId: String(nextSpeciesId + i),
  triggerId: '1',
}));

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
    ...tombstoneEntities,
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
    ...tombstoneSpecies,
    {id: '2', type: 'grass', collides: false},
    {id: '3', type: 'hero', collides: true, name: 'Dude'},
  ],
  triggers: [{id: '1', box: {position: {x: 0, y: 128}, size: {x: 128, y: 50}}}],
};
