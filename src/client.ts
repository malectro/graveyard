//import './webgl.js';
//import * as PIXI from 'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.7/pixi.min.js';
//import * as PIXI from '../node_modules/pixi.js/dist/pixi.js';
//import * as PIXI from 'pixi.js';

import {scale, repeat} from './utils/array.js';
import * as PointMath from './utils/point.js';

interface Headstone extends PointMath.Point {
  id: string;
  text: string;
}

interface Hero extends PointMath.Point {
  id: string;
  name: string;
}

async function main() {
  const viewSize = PointMath.point(window.innerWidth, window.innerHeight);
  const halfViewSize = PointMath.floor(PointMath.scale({...viewSize}, 0.5));

  const cameraPaddingPercentage = 0.2;
  const cameraPadding = PointMath.assignMin(
    PointMath.floor(PointMath.scale({...viewSize}, cameraPaddingPercentage)),
  );
  const cameraMaxDistance = PointMath.subtract(
    {...halfViewSize},
    cameraPadding,
  );

  const app = new PIXI.Application({
    width: viewSize.x,
    height: viewSize.y,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.view);

  const unitSquare = [-1, -1, 1, -1, 1, 1, -1, 1];

  const headstoneGeometry = new PIXI.Geometry()
    .addAttribute('aVertexPosition', scale(unitSquare, 50), 2)
    .addIndex([0, 1, 2, 0, 3, 2]);

  const [vert, frag] = await Promise.all([
    fetch('shaders/2d.vert').then(response => response.text()),
    fetch('shaders/solidColor.frag').then(response => response.text()),
  ]);

  const solidColorProgram = PIXI.Program.from(vert, frag);

  const world = new PIXI.Container();

  app.stage.addChild(world);

  function setCameraX(x: number) {
    app.stage.x = halfViewSize.x - x;
  }
  function setCameraY(y: number) {
    app.stage.y = halfViewSize.y - y;
  }
function setCameraPosition(x: number, y: number) {
  app.stage.x = halfViewSize.x - x;
  app.stage.y = halfViewSize.y - y;
}

  const stones: Headstone[] = [
    {id: '1', x: 0, y: 0, text: 'Here lies Kyle'},
    {id: '2', x: 50, y: 100, text: 'Here lies Kyle'},
    {id: '3', x: 300, y: 150, text: 'Here lies Kyle'},
  ];

  const greenShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.5, 0.8, 0.5],
  });
  const headstoneMeshes = stones.map(stone => {
    const headstoneMesh = new PIXI.Mesh(headstoneGeometry, greenShader);
    headstoneMesh.position.set(stone.x, stone.y);
    world.addChild(headstoneMesh);
    return headstoneMesh;
  });

  const hero: Hero = {
    id: '1',
    name: 'Kyle',
    x: 0,
    y: 0,
  };

  const pinkShader = new PIXI.Shader(solidColorProgram, {
    uColor: [0.8, 0.5, 0.5],
  });
  const heroMesh = new PIXI.Mesh(headstoneGeometry, pinkShader);
  heroMesh.position.set(hero.x, hero.y);
  app.stage.addChild(heroMesh);

  setCameraPosition(hero.x, hero.y);

  app.ticker.add(_delta => {
    PointMath.add(hero, velocity);
    heroMesh.position.set(hero.x, hero.y);

    const cameraX = halfViewSize.x - app.stage.x;
    const cameraY = halfViewSize.y - app.stage.y;

    const cameraDistanceX = hero.x - cameraX;
    if (cameraDistanceX > cameraMaxDistance.x) {
      setCameraX(hero.x - cameraMaxDistance.x);
    } else if (cameraDistanceX < -cameraMaxDistance.x) {
      setCameraX(hero.x + cameraMaxDistance.x);
    }

    const cameraDistanceY = hero.y - cameraY;
    if (cameraDistanceY > cameraMaxDistance.y) {
      setCameraY(hero.y - cameraMaxDistance.y);
    } else if (cameraDistanceY < -cameraMaxDistance.y) {
      setCameraY(hero.y + cameraMaxDistance.y);
    }
  });

  const keys = {
    ArrowDown: {x: 0, y: 1},
    ArrowUp: {x: 0, y: -1},
    ArrowRight: {x: 1, y: 0},
    ArrowLeft: {x: -1, y: 0},
  };
  const direction = {x: 0, y: 0};
  const speed = 10;
  const velocity = {x: 0, y: 0};

  function resolveVelocity() {
    PointMath.scale(
      PointMath.normalize(PointMath.set(velocity, direction)),
      speed,
    );
  }

  const currentKeys = new Set();

  window.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (!currentKeys.has(event.key)) {
          currentKeys.add(event.key);

          PointMath.add(direction, key);
          resolveVelocity();
        }
      }
    },
    {capture: true},
  );

  window.addEventListener(
    'keyup',
    event => {
      const key = keys[event.key];

      if (key) {
        event.preventDefault();

        if (currentKeys.has(event.key)) {
          currentKeys.delete(event.key);
          PointMath.subtract(direction, key);
          resolveVelocity();
          console.log(
            'hio',
            hero.x,
            app.stage.x - halfWindowWidth,
            hero.x + (app.stage.x - halfWindowWidth),
            viewSize.x,
          );
        }
      }
    },
    {capture: true},
  );
}

main();

/*
*/

/*
window.addEventListener('resize', () => {
  Object.assign(canvas, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
});
*/
