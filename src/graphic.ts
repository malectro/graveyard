import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import Pool from './utils/pool';
import Cache from './utils/cache';
import {scale} from './utils/array';

export default class Graphic {
  mesh: PIXI.Container;
  asset: Asset;

  static fromJSON(json: Asset): Graphic {
    const graphic = new Graphic();
    graphic.asset = json;

    const reference = json.mesh;

    if (typeof reference === 'number') {
      const mesh = meshPool.request();
      mesh.shader = shaderCache.get(json.mesh);
      graphic.mesh = mesh;

    } else {
      const texture = PIXI.Texture.from(`/assets/${reference}`, {
        alphaMode: PIXI.ALPHA_MODES.UNPACK,
      });
      const sprite = PIXI.Sprite.from(texture);
      graphic.mesh = sprite;
    }

    return graphic;
  }

  toJSON() {
    const {mesh} = this;
    let reference;

    if (mesh instanceof PIXI.Mesh) {
      reference = PIXI.utils.rgb2hex(mesh.shader.uniforms.uColor);
    } else if (mesh instanceof PIXI.Sprite) {
      reference = mesh.name;
    }

    return {
      mesh: reference,
    };
  }

  setPosition(position: Vector2) {
    this.mesh.position.set(position.x, position.y);
  }
}

export interface Asset {
  id: string;
  mesh: number | string;
}

const meshPool = new Pool(
  () => new PIXI.Mesh(defaultGeometry, defaultShader),
);

const unitSquare = [-1, -1, 1, -1, 1, 1, -1, 1];

const defaultGeometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', scale(unitSquare, 50), 2)
  .addIndex([0, 1, 2, 0, 3, 2]);

const shaderCache = new Cache(
  (color: number) => { 
    console.log('creating shader', PIXI.utils.hex2rgb(color), color);
    return new PIXI.Shader(solidColorProgram, {
    uColor: PIXI.utils.hex2rgb(color),
  }); },
);

let defaultShader;
let solidColorProgram;

export async function loadShaders() {
  const [vert, frag] = await Promise.all([
    fetch('shaders/2d.vert').then(response => response.text()),
    fetch('shaders/solidColor.frag').then(response => response.text()),
  ]);

  solidColorProgram = PIXI.Program.from(vert, frag);
  defaultShader = shaderCache.get(0x00ff00);
}
