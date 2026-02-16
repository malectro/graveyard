import { resolve, extname } from 'https://deno.land/std/path/mod.ts';
import { buildDir } from './common.ts';

const CHUNK_SIZE = 512;

function toChunkCoord(worldPos: number): number {
  return Math.floor(worldPos / CHUNK_SIZE);
}

// --- Seed data (matches the 30 epitaphs from src/data/state.ts) ---

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

const tombstonePositions = [
  { x: 200, y: 100 },
  { x: -300, y: -200 },
  { x: 600, y: 400 },
  { x: -800, y: 300 },
  { x: 1000, y: -100 },
  { x: -500, y: -600 },
  { x: 1200, y: 600 },
  { x: -1000, y: 100 },
  { x: 300, y: -500 },
  { x: 800, y: 200 },
  { x: -200, y: 700 },
  { x: 1500, y: -300 },
  { x: -1300, y: -400 },
  { x: 700, y: -700 },
  { x: -600, y: 500 },
  { x: 1800, y: 100 },
  { x: -1500, y: 700 },
  { x: 400, y: 900 },
  { x: -900, y: -800 },
  { x: 1100, y: 800 },
  { x: -1800, y: -100 },
  { x: 1600, y: 500 },
  { x: -400, y: -1000 },
  { x: 900, y: -900 },
  { x: -1100, y: 600 },
  { x: 2000, y: -500 },
  { x: -1600, y: -700 },
  { x: 500, y: 1100 },
  { x: -700, y: 1000 },
  { x: 1400, y: -800 },
];

interface TombstoneRecord {
  id: string;
  position: { x: number; y: number };
  size: { x: number; y: number };
  text: string;
}

// --- Content types ---

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.vert': 'text/plain',
  '.frag': 'text/plain',
};

// --- Main ---

const kv = await Deno.openKv();

// --- Admin auth ---

async function getAdminSecret(): Promise<string> {
  const existing = await kv.get<string>(['admin', 'secret']);
  if (existing.value) {
    console.log(`Admin secret: ${existing.value}`);
    return existing.value;
  }
  const secret = crypto.randomUUID();
  await kv.set(['admin', 'secret'], secret);
  console.log(`Admin secret (newly generated): ${secret}`);
  return secret;
}

const adminSecret = await getAdminSecret();

const HMAC_KEY_PARAMS = { name: 'HMAC', hash: 'SHA-256' } as const;
const ADMIN_PAYLOAD = new TextEncoder().encode('graveyard-admin');

async function getHmacKey(): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(adminSecret);
  return crypto.subtle.importKey('raw', keyData, HMAC_KEY_PARAMS, false, ['sign', 'verify']);
}

const hmacKey = await getHmacKey();

async function signToken(): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', hmacKey, ADMIN_PAYLOAD);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const bytes = new Uint8Array(token.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    return crypto.subtle.verify('HMAC', hmacKey, bytes, ADMIN_PAYLOAD);
  } catch {
    return false;
  }
}

function parseCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  const match = header.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : undefined;
}

async function isAdmin(request: Request): Promise<boolean> {
  const token = parseCookie(request, 'admin_token');
  if (!token) return false;
  return verifyToken(token);
}

async function seed() {
  // Check if any tombstones exist
  const existing = await kv.list({ prefix: ['tombstone'] }, { limit: 1 });
  const first = await existing.next();
  if (!first.done) return; // already seeded

  console.log('Seeding KV with initial tombstone data...');
  for (let i = 0; i < epitaphs.length; i++) {
    const pos = tombstonePositions[i];
    const record: TombstoneRecord = {
      id: `seed_${i}`,
      position: pos,
      size: { x: 128, y: 128 },
      text: epitaphs[i],
    };
    const cx = toChunkCoord(pos.x);
    const cy = toChunkCoord(pos.y);
    await kv.set(['tombstone', cx, cy, record.id], record);
  }
  console.log(`Seeded ${epitaphs.length} tombstones.`);
}

await seed();

async function handleChunksGet(url: URL): Promise<Response> {
  const keysParam = url.searchParams.get('keys');
  if (!keysParam) {
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const chunkKeys = keysParam.split(';').filter(Boolean);
  const result: Record<string, TombstoneRecord[]> = {};

  for (const ck of chunkKeys) {
    const [cxStr, cyStr] = ck.split(',');
    const cx = parseInt(cxStr, 10);
    const cy = parseInt(cyStr, 10);
    if (isNaN(cx) || isNaN(cy)) continue;

    const records: TombstoneRecord[] = [];
    const entries = kv.list({ prefix: ['tombstone', cx, cy] });
    for await (const entry of entries) {
      records.push(entry.value as TombstoneRecord);
    }
    result[ck] = records;
  }

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleMeGet(request: Request): Promise<Response> {
  const admin = await isAdmin(request);
  return new Response(JSON.stringify({ role: admin ? 'admin' : 'anonymous' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleTombstonePost(request: Request): Promise<Response> {
  if (!(await isAdmin(request))) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { position, text } = body;

  if (!position || typeof text !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: TombstoneRecord = {
    id,
    position: { x: position.x, y: position.y },
    size: { x: 128, y: 128 },
    text,
  };

  const cx = toChunkCoord(position.x);
  const cy = toChunkCoord(position.y);
  await kv.set(['tombstone', cx, cy, id], record);

  return new Response(JSON.stringify(record), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleStaticFile(pathname: string): Promise<Response> {
  let filePath = resolve(buildDir, pathname.slice(1));

  // Default to index.html for root
  if (pathname === '/') {
    filePath = resolve(buildDir, 'index.html');
  }

  try {
    const file = await Deno.readFile(filePath);
    const ext = extname(filePath);
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    return new Response(file, {
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
}

Deno.serve({ port: 4507 }, async (request: Request) => {
  const url = new URL(request.url);
  const { pathname } = url;

  // API routes
  if (pathname === '/api/chunks' && request.method === 'GET') {
    return handleChunksGet(url);
  }
  if (pathname === '/api/me' && request.method === 'GET') {
    return handleMeGet(request);
  }
  if (pathname === '/api/tombstone' && request.method === 'POST') {
    return handleTombstonePost(request);
  }

  // Admin login via query param
  if (url.searchParams.has('admin')) {
    const secret = url.searchParams.get('admin');
    if (secret === adminSecret) {
      const token = await signToken();
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/',
          'Set-Cookie': `admin_token=${token}; HttpOnly; Path=/; SameSite=Strict`,
        },
      });
    }
  }

  // Static files
  return handleStaticFile(pathname);
});
