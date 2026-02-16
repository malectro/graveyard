import { resolve, extname } from 'https://deno.land/std/path/mod.ts';
import { buildDir } from './common.ts';

const CHUNK_SIZE = 512;
const MIN_CLUSTER_GAP = 200;
const MIN_TOMBSTONE_SPACING = 96;
const CLUSTER_RADIUS_MIN = 300;
const CLUSTER_RADIUS_MAX = 500;
const CLUSTER_CAPACITY_THRESHOLD = 0.8;
const NEARBY_CLUSTER_RANGE = 2000;

function toChunkCoord(worldPos: number): number {
  return Math.floor(worldPos / CHUNK_SIZE);
}

// --- Seed data ---

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

interface TombstoneRecord {
  id: string;
  position: { x: number; y: number };
  size: { x: number; y: number };
  text: string;
  assetId: string;
}

interface ClusterRecord {
  id: string;
  center: { x: number; y: number };
  radius: number;
  tombstoneCount: number;
  maxTombstones: number;
}

const TOMBSTONE_ASSET_IDS = ['1', '10', '11', '12', '13', '14', '15'];

function randomAssetId(): string {
  return TOMBSTONE_ASSET_IDS[Math.floor(Math.random() * TOMBSTONE_ASSET_IDS.length)];
}

// --- Cluster system ---

let clusters: ClusterRecord[] = [];

function clusterMaxTombstones(radius: number): number {
  return Math.floor(Math.PI * radius * radius / (200 * 200));
}

function distanceBetween(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clustersOverlap(a: ClusterRecord, bCenter: { x: number; y: number }, bRadius: number): boolean {
  const edgeDistance = distanceBetween(a.center, bCenter) - a.radius - bRadius;
  return edgeDistance < MIN_CLUSTER_GAP;
}

function findClusterContaining(pos: { x: number; y: number }): ClusterRecord | undefined {
  return clusters.find(c => distanceBetween(c.center, pos) <= c.radius);
}

function randomPointInCluster(cluster: ClusterRecord, margin = 64): { x: number; y: number } {
  const maxR = cluster.radius - margin;
  if (maxR <= 0) return { ...cluster.center };
  const angle = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(Math.random()) * maxR; // sqrt for uniform distribution
  return {
    x: cluster.center.x + Math.cos(angle) * r,
    y: cluster.center.y + Math.sin(angle) * r,
  };
}

function createClusterRecord(center: { x: number; y: number }, radius: number): ClusterRecord {
  return {
    id: `cluster_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    center,
    radius,
    tombstoneCount: 0,
    maxTombstones: clusterMaxTombstones(radius),
  };
}

function generateNewCluster(): ClusterRecord | null {
  if (clusters.length === 0) return null;

  for (let attempt = 0; attempt < 20; attempt++) {
    const anchor = clusters[Math.floor(Math.random() * clusters.length)];
    const newRadius = CLUSTER_RADIUS_MIN + Math.random() * (CLUSTER_RADIUS_MAX - CLUSTER_RADIUS_MIN);
    const minDist = anchor.radius + newRadius + MIN_CLUSTER_GAP;
    const maxDist = minDist + 300;
    const dist = minDist + Math.random() * (maxDist - minDist);
    const angle = Math.random() * 2 * Math.PI;

    const newCenter = {
      x: anchor.center.x + Math.cos(angle) * dist,
      y: anchor.center.y + Math.sin(angle) * dist,
    };

    const overlaps = clusters.some(c => clustersOverlap(c, newCenter, newRadius));
    if (!overlaps) {
      return createClusterRecord(newCenter, newRadius);
    }
  }

  return null;
}

async function persistCluster(cluster: ClusterRecord): Promise<void> {
  await kv.set(['cluster', cluster.id], cluster);
}

async function loadClusters(): Promise<void> {
  clusters = [];
  const entries = kv.list<ClusterRecord>({ prefix: ['cluster'] });
  for await (const entry of entries) {
    clusters.push(entry.value);
  }
  console.log(`Loaded ${clusters.length} clusters from KV.`);
}

async function getNearbyTombstones(pos: { x: number; y: number }): Promise<TombstoneRecord[]> {
  const cx = toChunkCoord(pos.x);
  const cy = toChunkCoord(pos.y);
  const records: TombstoneRecord[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const entries = kv.list<TombstoneRecord>({ prefix: ['tombstone', cx + dx, cy + dy] });
      for await (const entry of entries) {
        records.push(entry.value);
      }
    }
  }

  return records;
}

async function maybeAutoGenerateCluster(cluster: ClusterRecord): Promise<void> {
  if (cluster.tombstoneCount < cluster.maxTombstones * CLUSTER_CAPACITY_THRESHOLD) return;

  // Check if any nearby cluster has room
  const hasNearbyRoom = clusters.some(c =>
    c.id !== cluster.id &&
    distanceBetween(c.center, cluster.center) < NEARBY_CLUSTER_RANGE &&
    c.tombstoneCount < c.maxTombstones
  );
  if (hasNearbyRoom) return;

  const newCluster = generateNewCluster();
  if (newCluster) {
    clusters.push(newCluster);
    await persistCluster(newCluster);
    console.log(`Auto-generated cluster ${newCluster.id} at (${Math.round(newCluster.center.x)}, ${Math.round(newCluster.center.y)}) radius=${Math.round(newCluster.radius)}`);
  }
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

if (Deno.args.includes('--reset-kv')) {
  const kv = await Deno.openKv();
  let count = 0;
  for await (const entry of kv.list({ prefix: [] })) {
    await kv.delete(entry.key);
    count++;
  }
  kv.close();
  console.log(`Deleted ${count} KV entries. Restarting fresh.`);
}

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
  // Check if any clusters exist — if so, already seeded
  const existingClusters = await kv.list({ prefix: ['cluster'] }, { limit: 1 });
  const firstCluster = await existingClusters.next();
  if (!firstCluster.done) return; // already seeded

  console.log('Seeding KV with initial clusters and tombstones...');

  // Create initial clusters near origin
  const seedClusters = [
    createClusterRecord({ x: 0, y: 0 }, 400),
    createClusterRecord({ x: -700, y: -500 }, 350),
    createClusterRecord({ x: 600, y: -400 }, 380),
    createClusterRecord({ x: -200, y: 700 }, 320),
  ];

  // Override IDs for stable seeding
  seedClusters[0].id = 'seed_cluster_0';
  seedClusters[1].id = 'seed_cluster_1';
  seedClusters[2].id = 'seed_cluster_2';
  seedClusters[3].id = 'seed_cluster_3';

  for (const cluster of seedClusters) {
    await persistCluster(cluster);
  }

  // Distribute tombstones across clusters
  let tombstoneIndex = 0;
  for (const cluster of seedClusters) {
    // Each cluster gets roughly equal share
    const count = Math.ceil(epitaphs.length / seedClusters.length);
    for (let i = 0; i < count && tombstoneIndex < epitaphs.length; i++, tombstoneIndex++) {
      const pos = randomPointInCluster(cluster);
      const record: TombstoneRecord = {
        id: `seed_${tombstoneIndex}`,
        position: { x: Math.round(pos.x), y: Math.round(pos.y) },
        size: { x: 128, y: 128 },
        text: epitaphs[tombstoneIndex],
        assetId: randomAssetId(),
      };
      const cx = toChunkCoord(record.position.x);
      const cy = toChunkCoord(record.position.y);
      await kv.set(['tombstone', cx, cy, record.id], record);
      cluster.tombstoneCount++;
    }
    // Persist updated count
    await persistCluster(cluster);
  }

  console.log(`Seeded ${seedClusters.length} clusters and ${tombstoneIndex} tombstones.`);
}

await seed();
await loadClusters();

for (const c of clusters) {
  console.log(`  Cluster ${c.id}: center=(${Math.round(c.center.x)}, ${Math.round(c.center.y)}) radius=${Math.round(c.radius)} tombstones=${c.tombstoneCount}/${c.maxTombstones}`);
}

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

function handleClustersGet(): Response {
  return new Response(JSON.stringify(clusters), {
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

  // Check position is within a cluster
  const cluster = findClusterContaining(position);
  if (!cluster) {
    return new Response(JSON.stringify({ error: 'Position is not within any cluster' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cluster capacity
  if (cluster.tombstoneCount >= cluster.maxTombstones) {
    return new Response(JSON.stringify({ error: 'Cluster is full' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check minimum spacing against nearby tombstones
  const nearby = await getNearbyTombstones(position);
  for (const existing of nearby) {
    const dist = distanceBetween(position, existing.position);
    if (dist < MIN_TOMBSTONE_SPACING) {
      return new Response(JSON.stringify({ error: 'Too close to an existing tombstone' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: TombstoneRecord = {
    id,
    position: { x: position.x, y: position.y },
    size: { x: 128, y: 128 },
    text,
    assetId: randomAssetId(),
  };

  const cx = toChunkCoord(position.x);
  const cy = toChunkCoord(position.y);
  await kv.set(['tombstone', cx, cy, id], record);

  // Update cluster count
  cluster.tombstoneCount++;
  await persistCluster(cluster);

  // Auto-generate new cluster if needed
  await maybeAutoGenerateCluster(cluster);

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
  if (pathname === '/api/clusters' && request.method === 'GET') {
    return handleClustersGet();
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
