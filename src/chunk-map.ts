import {Entity} from './entity';
import {Box} from './utils/box';
import * as p from './utils/point';

const CHUNK_SIZE = 512;

function chunkKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

function toChunkCoord(worldPos: number): number {
  return Math.floor(worldPos / CHUNK_SIZE);
}

function entityChunkKey(entity: Entity): string {
  return chunkKey(
    toChunkCoord(entity.box.position.x),
    toChunkCoord(entity.box.position.y),
  );
}

export function chunkKeysForBox(box: Box): string[] {
  const minCx = toChunkCoord(box.position.x);
  const minCy = toChunkCoord(box.position.y);
  const maxCx = toChunkCoord(box.position.x + box.size.x);
  const maxCy = toChunkCoord(box.position.y + box.size.y);

  const keys: string[] = [];
  for (let cx = minCx; cx <= maxCx; cx++) {
    for (let cy = minCy; cy <= maxCy; cy++) {
      keys.push(chunkKey(cx, cy));
    }
  }
  return keys;
}

export class ChunkMap {
  private chunks: Map<string, Map<string, Entity>> = new Map();
  private entityToChunk: Map<string, string> = new Map();
  loadedChunks: Set<string> = new Set();
  pendingChunks: Set<string> = new Set();

  isChunkLoaded(key: string): boolean {
    return this.loadedChunks.has(key);
  }

  markChunkLoaded(key: string): void {
    this.loadedChunks.add(key);
    this.pendingChunks.delete(key);
  }

  isChunkPending(key: string): boolean {
    return this.pendingChunks.has(key);
  }

  markChunkPending(key: string): void {
    this.pendingChunks.add(key);
  }

  get(id: string): Entity | undefined {
    const ck = this.entityToChunk.get(id);
    if (ck === undefined) return undefined;
    const chunk = this.chunks.get(ck);
    return chunk ? chunk.get(id) : undefined;
  }

  set(id: string, entity: Entity): void {
    // Remove from old chunk if present
    this.delete(id);

    const ck = entityChunkKey(entity);
    this.entityToChunk.set(id, ck);

    let chunk = this.chunks.get(ck);
    if (!chunk) {
      chunk = new Map();
      this.chunks.set(ck, chunk);
    }
    chunk.set(id, entity);
  }

  delete(id: string): boolean {
    const ck = this.entityToChunk.get(id);
    if (ck === undefined) return false;

    const chunk = this.chunks.get(ck);
    if (chunk) {
      chunk.delete(id);
      if (chunk.size === 0) {
        this.chunks.delete(ck);
      }
    }
    this.entityToChunk.delete(id);
    return true;
  }

  updatePosition(entity: Entity): void {
    const oldKey = this.entityToChunk.get(entity.id);
    const newKey = entityChunkKey(entity);
    if (oldKey === newKey) return;

    // Remove from old chunk
    if (oldKey !== undefined) {
      const oldChunk = this.chunks.get(oldKey);
      if (oldChunk) {
        oldChunk.delete(entity.id);
        if (oldChunk.size === 0) {
          this.chunks.delete(oldKey);
        }
      }
    }

    // Add to new chunk
    let newChunk = this.chunks.get(newKey);
    if (!newChunk) {
      newChunk = new Map();
      this.chunks.set(newKey, newChunk);
    }
    newChunk.set(entity.id, entity);
    this.entityToChunk.set(entity.id, newKey);
  }

  *entitiesNear(point: p.Point): IterableIterator<Entity> {
    const cx = toChunkCoord(point.x);
    const cy = toChunkCoord(point.y);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const chunk = this.chunks.get(chunkKey(cx + dx, cy + dy));
        if (chunk) {
          yield* chunk.values();
        }
      }
    }
  }

  *entitiesInBox(box: Box): IterableIterator<Entity> {
    const minCx = toChunkCoord(box.position.x);
    const minCy = toChunkCoord(box.position.y);
    const maxCx = toChunkCoord(box.position.x + box.size.x);
    const maxCy = toChunkCoord(box.position.y + box.size.y);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const chunk = this.chunks.get(chunkKey(cx, cy));
        if (chunk) {
          yield* chunk.values();
        }
      }
    }
  }

  *values(): IterableIterator<Entity> {
    for (const chunk of this.chunks.values()) {
      yield* chunk.values();
    }
  }
}
