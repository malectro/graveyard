import * as PIXI from 'pixi.js';
import {GRID_SPACING, PATH_HALF_WIDTH, pathWobble} from './paths';

const TILE_SIZE = 32;
const TILE_PADDING = TILE_SIZE;
const PATH_REDRAW_THRESHOLD = 100;
const PATH_SAMPLE_STEP = 16;

function generateGrassTexture(): PIXI.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Base green fill
  ctx.fillStyle = '#2d5a1e';
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  // Per-pixel shade variation on ~30% of pixels
  const imageData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < 0.3) {
      const variation = Math.floor(Math.random() * 31) - 15; // ±15
      data[i] = Math.max(0, Math.min(255, data[i] + variation));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation));
    }
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = PIXI.Texture.from(canvas);
  texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return texture;
}

export class Terrain {
  grass: PIXI.TilingSprite;
  paths: PIXI.Graphics;
  private screenWidth: number;
  private screenHeight: number;
  private lastPathCameraX = Infinity;
  private lastPathCameraY = Infinity;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Grass tiling layer
    const grassTexture = generateGrassTexture();
    this.grass = new PIXI.TilingSprite(
      grassTexture,
      screenWidth + TILE_PADDING * 2,
      screenHeight + TILE_PADDING * 2,
    );

    // Path overlay layer
    this.paths = new PIXI.Graphics();
  }

  update(cameraX: number, cameraY: number): void {
    // Position grass so it covers the viewport with padding
    const halfW = this.screenWidth / 2;
    const halfH = this.screenHeight / 2;
    this.grass.x = cameraX - halfW - TILE_PADDING;
    this.grass.y = cameraY - halfH - TILE_PADDING;
    // Keep tiles world-aligned
    this.grass.tilePosition.x = -this.grass.x;
    this.grass.tilePosition.y = -this.grass.y;

    // Redraw paths if camera moved enough
    const dx = cameraX - this.lastPathCameraX;
    const dy = cameraY - this.lastPathCameraY;
    if (dx * dx + dy * dy > PATH_REDRAW_THRESHOLD * PATH_REDRAW_THRESHOLD) {
      this.drawPaths(cameraX, cameraY);
      this.lastPathCameraX = cameraX;
      this.lastPathCameraY = cameraY;
    }
  }

  private drawPaths(cameraX: number, cameraY: number): void {
    const pad = 100;
    const halfW = this.screenWidth / 2 + pad;
    const halfH = this.screenHeight / 2 + pad;
    const left = cameraX - halfW;
    const right = cameraX + halfW;
    const top = cameraY - halfH;
    const bottom = cameraY + halfH;

    this.paths.clear();

    const pathWidth = PATH_HALF_WIDTH * 2;

    // Border layer (slightly wider, darker)
    this.paths.lineStyle(pathWidth + 6, 0x3d3228);
    this.drawPathLines(left, right, top, bottom);

    // Main path surface
    this.paths.lineStyle(pathWidth, 0x7a6b5a);
    this.drawPathLines(left, right, top, bottom);
  }

  private drawPathLines(left: number, right: number, top: number, bottom: number): void {
    // Vertical paths
    const vStart = Math.floor(left / GRID_SPACING);
    const vEnd = Math.ceil(right / GRID_SPACING);
    for (let i = vStart; i <= vEnd; i++) {
      let first = true;
      for (let y = top; y <= bottom; y += PATH_SAMPLE_STEP) {
        const x = i * GRID_SPACING + pathWobble(i, 0, y);
        if (first) {
          this.paths.moveTo(x, y);
          first = false;
        } else {
          this.paths.lineTo(x, y);
        }
      }
    }

    // Horizontal paths
    const hStart = Math.floor(top / GRID_SPACING);
    const hEnd = Math.ceil(bottom / GRID_SPACING);
    for (let i = hStart; i <= hEnd; i++) {
      let first = true;
      for (let x = left; x <= right; x += PATH_SAMPLE_STEP) {
        const y = i * GRID_SPACING + pathWobble(i, 1000, x);
        if (first) {
          this.paths.moveTo(x, y);
          first = false;
        } else {
          this.paths.lineTo(x, y);
        }
      }
    }
  }
}
