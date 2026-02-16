/**
 * Generates 32x32 pixel-art tombstone PNGs from grid definitions.
 *
 * Run: deno run --allow-write tools/gen-tombstones.ts
 *
 * Each design is a 32x32 grid where each cell is a palette index.
 * The palette maps indices to RGBA colors.
 */

import { resolve } from 'https://deno.land/std/path/mod.ts';

// --- PNG writer (minimal, uncompressed) ---

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function adler32(buf: Uint8Array): number {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const buf = new Uint8Array(4 + 4 + data.length + 4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, data.length);
  buf.set(typeBytes, 4);
  buf.set(data, 8);
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(typeBytes, 0);
  crcData.set(data, 4);
  view.setUint32(8 + data.length, crc32(crcData));
  return buf;
}

function writePng(width: number, height: number, pixels: Uint8Array): Uint8Array {
  // pixels: RGBA, row-major, width*height*4 bytes
  // Build raw image data with filter byte 0 (None) per row
  const raw = new Uint8Array(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: None
    raw.set(
      pixels.subarray(y * width * 4, (y + 1) * width * 4),
      y * (1 + width * 4) + 1,
    );
  }

  // Deflate as a single uncompressed block (store)
  // zlib header: CMF=0x78, FLG=0x01
  const maxBlock = 65535;
  const blocks: Uint8Array[] = [];
  for (let offset = 0; offset < raw.length; offset += maxBlock) {
    const end = Math.min(offset + maxBlock, raw.length);
    const len = end - offset;
    const isLast = end === raw.length;
    const block = new Uint8Array(5 + len);
    block[0] = isLast ? 0x01 : 0x00;
    block[1] = len & 0xff;
    block[2] = (len >> 8) & 0xff;
    block[3] = (~len) & 0xff;
    block[4] = (~len >> 8) & 0xff;
    block.set(raw.subarray(offset, end), 5);
    blocks.push(block);
  }
  const totalBlockSize = blocks.reduce((s, b) => s + b.length, 0);
  const compressed = new Uint8Array(2 + totalBlockSize + 4);
  compressed[0] = 0x78;
  compressed[1] = 0x01;
  let pos = 2;
  for (const block of blocks) {
    compressed.set(block, pos);
    pos += block.length;
  }
  const adler = adler32(raw);
  compressed[pos] = (adler >> 24) & 0xff;
  compressed[pos + 1] = (adler >> 16) & 0xff;
  compressed[pos + 2] = (adler >> 8) & 0xff;
  compressed[pos + 3] = adler & 0xff;

  // IHDR
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = pngChunk('IHDR', ihdr);
  const idatChunk = pngChunk('IDAT', compressed);
  const iendChunk = pngChunk('IEND', new Uint8Array(0));

  const png = new Uint8Array(
    signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length,
  );
  let p = 0;
  png.set(signature, p); p += signature.length;
  png.set(ihdrChunk, p); p += ihdrChunk.length;
  png.set(idatChunk, p); p += idatChunk.length;
  png.set(iendChunk, p);
  return png;
}

// --- Palette ---

type RGBA = [number, number, number, number];

const PAL: Record<string, RGBA> = {
  _: [0, 0, 0, 0],          // transparent
  // Stone grays
  D: [60, 60, 65, 255],     // dark stone
  M: [100, 100, 108, 255],  // mid stone
  L: [145, 145, 150, 255],  // light stone
  H: [180, 180, 185, 255],  // highlight
  W: [210, 210, 215, 255],  // white highlight
  // Earth / ground
  E: [80, 60, 40, 255],     // earth brown
  G: [55, 80, 45, 255],     // grass green
  g: [75, 110, 60, 255],    // light grass
  // Accents
  R: [120, 50, 50, 255],    // rust / dark red
  C: [70, 85, 70, 255],     // moss / lichen
  K: [40, 40, 45, 255],     // near-black outline
  S: [130, 130, 140, 255],  // shadow stone
  B: [85, 85, 95, 255],     // between dark and mid
  P: [160, 160, 168, 255],  // pale stone
  // Cross / special
  X: [170, 155, 130, 255],  // aged white / sandstone
  Y: [140, 125, 100, 255],  // darker sandstone
  Z: [200, 185, 160, 255],  // light sandstone
};

function renderGrid(grid: string[]): Uint8Array {
  const pixels = new Uint8Array(32 * 32 * 4);
  for (let y = 0; y < 32; y++) {
    const row = grid[y] || '';
    for (let x = 0; x < 32; x++) {
      const ch = row[x] || '_';
      const color = PAL[ch] || PAL['_'];
      const i = (y * 32 + x) * 4;
      pixels[i] = color[0];
      pixels[i + 1] = color[1];
      pixels[i + 2] = color[2];
      pixels[i + 3] = color[3];
    }
  }
  return pixels;
}

// --- Tombstone designs ---

// 1. Classic rounded top (similar vibe to existing but distinct style)
const rounded: string[] = [
  '________________________________',
  '________________________________',
  '____________KKKKKK______________',
  '___________KLLHHLLK_____________',
  '__________KLHWWWHHLK____________',
  '_________KLHWWWWWHMLK___________',
  '_________KMHWWWWWHMLK___________',
  '_________KMLLHHHHLLMK___________',
  '_________KMLLLLLLLMMK___________',
  '_________KMLLLLLLLMMK___________',
  '_________KMLLMMLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLMLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLMLLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLMLLLMMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLLMLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMMMMMMMMMBK___________',
  '_________KDBBBBBBBBDK___________',
  '_________KKKKKKKKKKK____________',
  '________gGGgEEEEEgGGg___________',
  '_______gGgGgEEEEEgGgGg__________',
  '______gGggGgEEEEEgGggGg_________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

// 2. Celtic cross
const cross: string[] = [
  '________________________________',
  '________________________________',
  '____________KKKK________________',
  '___________KXZZXK_______________',
  '___________KXZZXK_______________',
  '________KKKKXZZXKKKK____________',
  '________KZZYXZZXYZZK____________',
  '________KZZYXZZXYYXK____________',
  '________KKKKXZZXKKKK____________',
  '___________KXZZXK_______________',
  '___________KXZZXK_______________',
  '___________KXZZXK_______________',
  '___________KXYXYK_______________',
  '___________KXZZXK_______________',
  '___________KXYZXK_______________',
  '___________KXZZXK_______________',
  '___________KXZZXK_______________',
  '___________KXZYXK_______________',
  '___________KXZZXK_______________',
  '___________KXZZXK_______________',
  '___________KYXXYK_______________',
  '__________KKYYYYKK______________',
  '_________KKYYYYYYKK_____________',
  '_________KKKKKKKKKKK____________',
  '________gGGgEEEEEgGGg___________',
  '_______gGgGgEEEEEgGgGg__________',
  '______gGggGgEEEEEgGggGg_________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

// 3. Obelisk / tall pointed
const obelisk: string[] = [
  '________________________________',
  '______________KK________________',
  '_____________KMDK_______________',
  '_____________KMLK_______________',
  '____________KMLMK______________',
  '____________KMLLK______________',
  '____________KMLMK______________',
  '___________KKMLLKK_____________',
  '___________KMMLLLK_____________',
  '___________KMLLMMK_____________',
  '___________KMLLLMK_____________',
  '___________KMLMLMK_____________',
  '___________KMLLLMK_____________',
  '___________KMLLLMK_____________',
  '___________KMLLMMK_____________',
  '___________KMLLLDK_____________',
  '___________KMLMLDK_____________',
  '___________KMLLLDK_____________',
  '___________KMLLLDK_____________',
  '___________KMLLLDK_____________',
  '___________KMMMMDK_____________',
  '__________KKDDDDDKK____________',
  '__________KMMLLLLMDK___________',
  '__________KDDDDDDDBK___________',
  '__________KKKKKKKKKKK___________',
  '________gGGgEEEEEgGGg___________',
  '_______gGgGgEEEEEgGgGg__________',
  '______gGggGgEEEEEgGggGg_________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

// 4. Flat / wide slab
const slab: string[] = [
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '______KKKKKKKKKKKKKKKKKK________',
  '______KLLHHHHHHHHHHHHLLK________',
  '______KMLLLLLLLLLLLLLMMK________',
  '______KMLLMLLLLLLMLLMMK________',
  '______KMLLLLLLLLLLLLLMK________',
  '______KMLLLMLLLLMLLLLMK________',
  '______KMLLLLLLLLLLLLLMK________',
  '______KMLLLLLMLLLLMLLMK________',
  '______KMLLLLLLLLLLLLLMK________',
  '______KMLLMLLLLLLLLLLMK________',
  '______KMLLLLLLLLLMLLLMK________',
  '______KMLLLLLLLLLLLLLMK________',
  '______KMMMMMMMMMMMMMMDK________',
  '______KDBBBBBBBBBBBBBDK________',
  '______KKKKKKKKKKKKKKKKKK________',
  '____gGGgGEEEEEEEEEEEgGGGg______',
  '___gGgGgGEEEEEEEEEEEgGgGGg_____',
  '__gGggGgGEEEEEEEEEEEgGggGGg____',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

// 5. Angel wing / ornate
const angel: string[] = [
  '________________________________',
  '________________________________',
  '____________KKKKKK______________',
  '___________KHWWWHLK_____________',
  '___________KLWWWHLK_____________',
  '__________KKLLHHLLKK____________',
  '_________KPKKKKKKKKPK___________',
  '________KPLK______KLPK_________',
  '________KPLK______KLPK_________',
  '_______KPLMK______KMLPK________',
  '_______KPMKKKKKKKKKKMSK________',
  '________KKMLLLLLLLLLKK_________',
  '_________KMLLLLLLLLLK___________',
  '_________KMLLLMLLLMMK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLMLLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLLLMLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLMLLLMMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMLLLLLLLMDK___________',
  '_________KMMMMMMMMMBK___________',
  '_________KDBBBBBBBBDK___________',
  '_________KKKKKKKKKKK____________',
  '________gGGgEEEEEgGGg___________',
  '_______gGgGgEEEEEgGgGg__________',
  '______gGggGgEEEEEgGggGg_________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

// 6. Broken / cracked tombstone
const broken: string[] = [
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
  '____________KKKKK_______________',
  '___________KLLHLK_______________',
  '__________KLLLHKK_______________',
  '__________KMLLLK_K______________',
  '_________KMLLMMK________________',
  '_________KMLLMK_________________',
  '_________KMLLLMK________________',
  '_________KMLLLMMK_______________',
  '_________KMLLLLLMK______________',
  '_________KMLMLLMMK______________',
  '_________KMLLLLLMDK_____________',
  '_________KMLLLMLMDK_____________',
  '_________KMLLLLLMDK_____________',
  '_________KMLMLLLLDK_____________',
  '_________KMLLLLLMDK_____________',
  '_________KMLLMLLMDK_____________',
  '_________KMLLLLLMDK_____________',
  '_________KMLLLLLMDK_____________',
  '_________KMMMMMMMBK_____________',
  '_________KDBBBBBBDK_____________',
  '_________KKKKKKKKKK_____________',
  '________gGGgEEEEEgGGg___________',
  '_______gGgGgEEEEEgGgGg__________',
  '______gGggGgEEEEEgGggGg_________',
  '________________________________',
  '________________________________',
  '________________________________',
  '________________________________',
];

const designs: [string, string[]][] = [
  ['tombstone-rounded', rounded],
  ['tombstone-cross', cross],
  ['tombstone-obelisk', obelisk],
  ['tombstone-slab', slab],
  ['tombstone-angel', angel],
  ['tombstone-broken', broken],
];

const outDir = resolve(Deno.cwd(), 'src/assets');

for (const [name, grid] of designs) {
  const pixels = renderGrid(grid);
  const png = writePng(32, 32, pixels);
  const path = resolve(outDir, `${name}.png`);
  await Deno.writeFile(path, png);
  console.log(`Wrote ${path}`);
}

console.log(`\nGenerated ${designs.length} tombstone sprites.`);
