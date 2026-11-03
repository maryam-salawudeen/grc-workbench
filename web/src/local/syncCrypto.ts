// Sync codes and encryption. The code is the only secret: it names the stored bundle
// (through a one-way hash) and derives the AES key, so the server never sees either.

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I, which are easy to mix up

export function newSyncCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const chars = [...bytes].map((b) => ALPHABET[b % 32]).join('');
  return chars.match(/.{4}/g)!.join('-');
}

/** Accepts codes typed with spaces, lower case or missing dashes. */
export function normaliseCode(input: string): string | null {
  const chars = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (chars.length !== 24 || [...chars].some((c) => !ALPHABET.includes(c))) return null;
  return chars.match(/.{4}/g)!.join('-');
}

const enc = new TextEncoder();
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function syncId(code: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(`grc-sync-id:${code}`)));
}

async function syncKey(code: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest('SHA-256', enc.encode(`grc-sync-key:${code}`));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  return new Uint8Array(await new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream)).arrayBuffer());
}

export interface SyncBundle {
  v: 1;
  savedAt: number;
  /** Workspace databases (demo and case studies), base64. */
  workspaces: Record<string, string>;
  /** Synced browser settings and progress (labs, tasks, notes, active workspace). */
  local: Record<string, string>;
}

export function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** JSON, gzip, then AES-GCM with a fresh IV. Output is IV followed by ciphertext. */
export async function sealBundle(code: string, bundle: SyncBundle): Promise<Uint8Array> {
  const packed = await pipe(enc.encode(JSON.stringify(bundle)), new CompressionStream('gzip'));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await syncKey(code), packed as BufferSource));
  const out = new Uint8Array(iv.length + sealed.length);
  out.set(iv);
  out.set(sealed, iv.length);
  return out;
}

export async function openBundle(code: string, data: Uint8Array): Promise<SyncBundle> {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.slice(0, 12) }, await syncKey(code), data.slice(12));
  const json = await pipe(new Uint8Array(plain), new DecompressionStream('gzip'));
  const bundle = JSON.parse(new TextDecoder().decode(json)) as SyncBundle;
  if (bundle.v !== 1) throw new Error('Unsupported sync format');
  return bundle;
}
