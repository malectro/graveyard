import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import Pool from './utils/pool';
import Cache from './utils/cache';
import {scale} from './utils/array';

export default class Graphic {
  id: string;
  mesh: PIXI.Container;
  asset: Asset;

  static fromJSON(json: Asset): Graphic {
    const graphic = new Graphic();
    graphic.asset = json;
    graphic.id = json.id;

    if (json.type === 'animated') {
      const textures = json.src.map(src =>
        PIXI.Texture.from(`/assets/${src}`, {
          alphaMode: PIXI.ALPHA_MODES.UNPACK,
          scaleMode: PIXI.SCALE_MODES.NEAREST,
        }),
      );
      const sprite = new PIXI.AnimatedSprite(textures);
      sprite.animationSpeed = 0.1;
      sprite.play();
      graphic.mesh = sprite;
    } else {
      const reference = json.src;

      if (typeof reference === 'number') {
        const mesh = meshPool.request();
        mesh.shader = shaderCache.get(reference);
        graphic.mesh = mesh;
      } else {
        const texture = PIXI.Texture.from(`/assets/${reference}`, {
          alphaMode: PIXI.ALPHA_MODES.UNPACK,
          scaleMode: PIXI.SCALE_MODES.NEAREST,
          // TODO
          //roundPixels: true,
        });
        const sprite = new PIXI.Sprite(texture);
        graphic.mesh = sprite;
      }
    }

    graphic.mesh.width = json.width;
    graphic.mesh.height = json.height;

    return graphic;
  }

  toJSON(): Asset {
    const {mesh} = this;
    let reference;

    if (mesh instanceof PIXI.Mesh) {
      reference = PIXI.utils.rgb2hex(mesh.shader.uniforms.uColor);
    } else if (mesh instanceof PIXI.Sprite) {
      reference = mesh.name;
    }

    return {
      id: this.id,
      type: this.asset.type,
      src: reference,
      width: this.mesh.width,
      height: this.mesh.height,
    };
  }

  setPosition(position: Vector2): void {
    this.mesh.position.set(position.x, position.y);
  }
}

export interface Asset {
  id: string;
  type: 'static' | 'animated';
  src: number | string;
  width: number;
  height: number;
}

const meshPool = new Pool(() => new PIXI.Mesh(defaultGeometry, defaultShader));

const unitSquare = [-1, -1, 1, -1, 1, 1, -1, 1];

const defaultGeometry = new PIXI.Geometry()
  .addAttribute('aVertexPosition', scale(unitSquare, 50), 2)
  .addIndex([0, 1, 2, 0, 3, 2]);

const shaderCache = new Cache((color: number) => {
  console.log('creating shader', PIXI.utils.hex2rgb(color), color);
  return new PIXI.Shader(solidColorProgram, {
    uColor: PIXI.utils.hex2rgb(color),
  });
});

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
