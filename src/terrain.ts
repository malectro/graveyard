import * as PIXI from 'pixi.js';
import {ClusterRecord} from './api';

const TILE_SIZE = 32;
const TILE_PADDING = TILE_SIZE;

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
  dirt: PIXI.Graphics;
  private screenWidth: number;
  private screenHeight: number;
  private clusterCount: number;

  constructor(screenWidth: number, screenHeight: number, clusters: ClusterRecord[]) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // Grass tiling layer
    const grassTexture = generateGrassTexture();
    this.grass = new PIXI.TilingSprite(
      grassTexture,
      screenWidth + TILE_PADDING * 2,
      screenHeight + TILE_PADDING * 2,
    );

    // Dirt circles layer
    this.dirt = new PIXI.Graphics();
    this.clusterCount = 0;
    this.drawClusters(clusters);
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
  }

  updateClusters(clusters: ClusterRecord[]): void {
    if (clusters.length !== this.clusterCount) {
      this.drawClusters(clusters);
    }
  }

  private drawClusters(clusters: ClusterRecord[]): void {
    this.clusterCount = clusters.length;
    this.dirt.clear();
    for (const cluster of clusters) {
      // Filled circle
      this.dirt.beginFill(0x5c3d1e);
      this.dirt.drawCircle(cluster.center.x, cluster.center.y, cluster.radius);
      this.dirt.endFill();
      // Border ring
      this.dirt.lineStyle(4, 0x4a2e14);
      this.dirt.drawCircle(cluster.center.x, cluster.center.y, cluster.radius);
      this.dirt.lineStyle(0);
    }
  }
}
