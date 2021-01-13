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

export default {
  hero: '3',
  entities: [
    {
      id: '1',
      box: {
        className: 'StaticPhysics',
        position: {x: 200, y: 100},
        size: {x: 128, y: 128},
      },
      assetId: '1',
      speciesId: '1',
      triggerId: '1',
    },
    {
      id: '2',
      box: {
        className: 'StaticPhysics',
        position: {x: 400, y: 100},
        size: {x: 64, y: 64},
      },
      assetId: '2',
      speciesId: '2',
    },
    {
      id: '4',
      box: {
        className: 'StaticPhysics',
        position: {x: 500, y: 100},
        size: {x: 64, y: 64},
      },
      assetId: '2',
      speciesId: '2',
    },
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
    {
      id: '1',
      type: 'headstone',
      collides: true,
      triggerable: true,
      text: 'Here lies Kyle',
    },
    {id: '2', type: 'grass', collides: false},
    {id: '3', type: 'hero', collides: true, name: 'Dude'},
  ],
  triggers: [{id: '1', box: {position: {x: 0, y: 128}, size: {x: 128, y: 50}}}],
};
