export interface TombstoneRecord {
  id: string;
  position: {x: number; y: number};
  size: {x: number; y: number};
  text: string;
  assetId: string;
}

export async function fetchChunks(keys: string[]): Promise<Map<string, TombstoneRecord[]>> {
  const param = keys.join(';');
  const response = await fetch(`/api/chunks?keys=${encodeURIComponent(param)}`);
  const json = await response.json();

  const result = new Map<string, TombstoneRecord[]>();
  for (const [key, records] of Object.entries(json)) {
    result.set(key, records as TombstoneRecord[]);
  }
  return result;
}

export async function fetchRole(): Promise<'admin' | 'anonymous'> {
  const res = await fetch('/api/me');
  const json = await res.json();
  return json.role;
}

export async function placeTombstone(
  position: {x: number; y: number},
  text: string,
): Promise<TombstoneRecord> {
  const response = await fetch('/api/tombstone', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({position, text}),
  });
  return response.json();
}
