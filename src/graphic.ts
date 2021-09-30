import * as PIXI from 'pixi.js';
import {Vector2} from './utils/point';
import Pool from './utils/pool';
import Cache from './utils/cache';
import {scale} from './utils/array';
import {Physics} from './physics';

export interface Graphic {
  id: string;
  mesh: PIXI.Container;
  update(physics: Physics): void;
  copy(): Graphic;
}

export class StaticGraphic implements Graphic {
  id: string;
  mesh: PIXI.Container;
  asset: Asset;

  static fromJSON(json: Asset): StaticGraphic {
    const graphic = new StaticGraphic();
    graphic.asset = json;
    graphic.id = json.id;

    const reference = json.src;

    if (typeof reference === 'number') {
      const mesh = meshPool.request();
      mesh.shader = shaderCache.get(reference);
      graphic.mesh = mesh;
    } else {
      const texture = PIXI.Texture.from(`assets/${reference}`, {
        alphaMode: PIXI.ALPHA_MODES.UNPACK,
        scaleMode: PIXI.SCALE_MODES.NEAREST,
        //width: json.sourceSize.width,
        //height: json.sourceSize.height,
        // TODO
        //roundPixels: true,
      });
      const sprite = new PIXI.Sprite(texture);
      graphic.mesh = sprite;
    }

    graphic.mesh.width = json.size.width;
    graphic.mesh.height = json.size.height;

    console.log('hioooo', json);

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
      ...this.asset,
      id: this.id,
      type: this.asset.type,
      //src: reference,
    };
  }

  update(physics: Physics): void {
    this.mesh.position.set(physics.position.x, physics.position.y);
  }

  copy(): StaticGraphic {
    return StaticGraphic.fromJSON(this.toJSON());
  }
}

export class AnimatedGraphic implements Graphic {
  id: string;
  mesh: PIXI.AnimatedSprite;
  asset: Asset;
  state = 'stand';
  direction = 'down';
  states = {};

  static fromJSON(json: Asset): AnimatedGraphic {
    const graphic = new AnimatedGraphic();
    graphic.asset = json;
    graphic.id = json.id;

    for (const [direction, spriteSet] of Object.entries(json.src)) {
      graphic.states[direction] = {};
      for (const [state, src] of Object.entries(spriteSet)) {
        graphic.states[direction][state] = src.map(createTexture);
      }
    }

    console.log('hoa', graphic);
    const sprite = new PIXI.AnimatedSprite(graphic.states['down']['stand']);
    sprite.animationSpeed = 0.2;
    sprite.play();
    graphic.mesh = sprite;

    graphic.mesh.width = json.size.width;
    graphic.mesh.height = json.size.height;

    return graphic;
  }

  toJSON(): Asset {
    return this.asset;
  }

  update(physics: Physics): void {
    this.mesh.position.set(physics.position.x, physics.position.y);

    let direction;
    if (physics.facing.x > 0) {
      direction = 'right';
    } else if (physics.facing.x < 0) {
      direction = 'left';
    } else if (physics.facing.y < 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }
    

    let state;

      if (physics.velocity.x === 0 && physics.velocity.y === 0) {
        state = 'stand';
      } else {
        state = 'walk';
      }

    if (state !== this.state || this.direction !== direction) {
      this.mesh.textures = this.states[direction][state];
      this.mesh.gotoAndPlay(0);
      this.direction = direction;
      this.state = state;
    }
  }

  copy(): AnimatedGraphic {
    return AnimatedGraphic.fromJSON(this.toJSON());
  }
}

export interface Asset {
  id: string;
  type: 'static' | 'animated';
  src: number | string;
  sourceSize: {
    width: number;
    height: number;
  };
  size: {
    width: number;
    height: number;
  };
}

function createTexture(src: string) {
      return PIXI.Texture.from(`assets/${src}`, {
        alphaMode: PIXI.ALPHA_MODES.UNPACK,
        scaleMode: PIXI.SCALE_MODES.NEAREST,
        //width: json.sourceSize.width,
        //height: json.sourceSize.height,
      });
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
