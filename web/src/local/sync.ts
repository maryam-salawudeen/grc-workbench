// Keeps this browser's work in step with the user's other devices.
// Everything is bundled, encrypted with the sync code and stored by /api/sync.
// The newest copy wins: a device pulls when it opens or comes back into view,
// and pushes a few seconds after any change.
import { clearAll, loadAll, saveBytes } from './storage';
import { fromBase64, newSyncCode, normaliseCode, openBundle, sealBundle, syncId, toBase64, type SyncBundle } from './syncCrypto';

const K = { code: 'grc-sync-code', etag: 'grc-sync-etag', syncedAt: 'grc-sync-at', changedAt: 'grc-sync-changed' };

/** Per-device preferences that should not follow the user between a phone and a laptop. */
const DEVICE_ONLY = [/^grc-sync-/, /^grc-theme-/, /^grc-guide-closed-/, /^grc-brief-open$/, /^grc-brief-tab$/, /^grc-explain-mode$/];
const isSynced = (key: string) => key.startsWith('grc-') && !DEVICE_ONLY.some((r) => r.test(key));

export type SyncState = 'off' | 'idle' | 'syncing' | 'error';
export interface SyncStatus {
  state: SyncState;
  code: string | null;
  syncedAt: number | null;
  message?: string;
}

const ls = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v);
    } catch {
      // Storage blocked: sync cannot remember its state on this device.
    }
  },
};

let status: SyncStatus = { state: ls.get(K.code) ? 'idle' : 'off', code: ls.get(K.code), syncedAt: Number(ls.get(K.syncedAt)) || null };
const listeners = new Set<(s: SyncStatus) => void>();
const setStatus = (patch: Partial<SyncStatus>) => {
  status = { ...status, ...patch };
  listeners.forEach((l) => l(status));
};
export const getStatus = () => status;
export const subscribe = (fn: (s: SyncStatus) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

async function buildBundle(): Promise<SyncBundle> {
  const dbs = await loadAll();
  const local: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (isSynced(k)) local[k] = localStorage.getItem(k)!;
  }
  return {
    v: 1,
    savedAt: Number(ls.get(K.changedAt)) || Date.now(),
    workspaces: Object.fromEntries([...dbs].map(([id, bytes]) => [id, toBase64(bytes)])),
    local,
  };
}

async function applyBundle(b: SyncBundle) {
  await clearAll();
  for (const [id, b64] of Object.entries(b.workspaces)) await saveBytes(id, fromBase64(b64));
  const existing: string[] = [];
  for (let i = 0; i < localStorage.length; i++) existing.push(localStorage.key(i)!);
  for (const k of existing) if (isSynced(k) && !(k in b.local)) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(b.local)) localStorage.setItem(k, v);
  ls.set(K.changedAt, String(b.savedAt));
}

async function request(method: 'GET' | 'PUT' | 'DELETE', code: string, body?: Uint8Array) {
  const headers: Record<string, string> = {};
  const etag = ls.get(K.etag);
  if (method === 'PUT') {
    headers['content-type'] = 'application/octet-stream';
    if (etag) headers['if-match'] = etag;
  }
  return fetch(`/api/sync?id=${await syncId(code)}`, { method, headers, body: body as BodyInit | undefined, cache: 'no-store' });
}

const strong = (etag: string | null) => etag?.replace(/^W\//, '') ?? null;

const synced = (etag: string | null) => {
  ls.set(K.etag, strong(etag));
  const now = Date.now();
  ls.set(K.syncedAt, String(now));
  setStatus({ state: 'idle', syncedAt: now, message: undefined });
};

/**
 * Upload this device's work. On a conflict, pull once to decide which copy is newer.
 * `retry` stops a second conflict from looping: it is reported as an error instead.
 */
export async function push(retry = true): Promise<void> {
  const code = status.code;
  if (!code) return;
  setStatus({ state: 'syncing' });
  try {
    const res = await request('PUT', code, await sealBundle(code, await buildBundle()));
    if (res.status === 409) {
      if (!retry) throw new Error('Your other device is saving at the same time. Try "Sync now" in a moment.');
      return void (await pull({ afterConflict: true }));
    }
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Sync failed (${res.status})`);
    synced((await res.json()).etag);
  } catch (e) {
    setStatus({ state: 'error', message: e instanceof Error ? e.message : String(e) });
  }
}

/**
 * Download the synced copy. If it is newer than this device's last change, replace
 * local work with it and reload; otherwise upload this device's copy.
 */
export async function pull({ afterConflict = false } = {}): Promise<'updated' | 'unchanged' | 'pushed'> {
  const code = status.code;
  if (!code) return 'unchanged';
  setStatus({ state: 'syncing' });
  try {
    const res = await request('GET', code);
    if (res.status === 404) {
      ls.set(K.etag, null);
      await push();
      return 'pushed';
    }
    if (!res.ok) throw new Error(`Sync failed (${res.status})`);
    const etag = strong(res.headers.get('etag'));
    if (etag && etag === ls.get(K.etag) && !afterConflict) {
      setStatus({ state: 'idle' });
      return 'unchanged';
    }
    const remote = await openBundle(code, new Uint8Array(await res.arrayBuffer()));
    const localChangedAt = Number(ls.get(K.changedAt)) || 0;
    ls.set(K.etag, etag);
    if (remote.savedAt >= localChangedAt) {
      await applyBundle(remote);
      synced(etag);
      return 'updated';
    }
    await push(!afterConflict);
    return 'pushed';
  } catch (e) {
    setStatus({ state: 'error', message: e instanceof Error && e.name === 'OperationError' ? 'This sync code does not match the stored data.' : e instanceof Error ? e.message : String(e) });
    return 'unchanged';
  }
}

let timer: ReturnType<typeof setTimeout> | undefined;
/** Record a local change and upload it shortly afterwards. */
export function markChanged() {
  ls.set(K.changedAt, String(Date.now()));
  if (!status.code) return;
  clearTimeout(timer);
  timer = setTimeout(() => void push(), 2500);
}

/** Start syncing with a new code, uploading this device's work. */
export async function enable(): Promise<string> {
  const code = newSyncCode();
  ls.set(K.code, code);
  ls.set(K.etag, null);
  setStatus({ code, state: 'idle' });
  markChanged();
  await push();
  return code;
}

/** Join an existing code from another device. Replaces this device's work with the synced copy. */
export async function join(input: string): Promise<boolean> {
  const code = normaliseCode(input);
  if (!code) throw new Error('That does not look like a sync code. It has 24 letters and numbers.');
  const res = await fetch(`/api/sync?id=${await syncId(code)}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('No synced work was found for that code. Check it on your other device.');
  if (!res.ok) throw new Error(`Could not reach sync (${res.status})`);
  const remote = await openBundle(code, new Uint8Array(await res.arrayBuffer()));
  ls.set(K.code, code);
  await applyBundle(remote);
  setStatus({ code });
  synced(res.headers.get('etag'));
  return true;
}

/** Stop syncing on this device. Work stays here and in the synced copy. */
export function disable() {
  clearTimeout(timer);
  for (const k of Object.values(K)) ls.set(k, null);
  setStatus({ state: 'off', code: null, syncedAt: null, message: undefined });
}

/** Delete the synced copy for everyone using this code, then stop syncing here. */
export async function deleteRemote() {
  if (status.code) await request('DELETE', status.code);
  disable();
}

/** Pull when the app opens and whenever the tab comes back into view; push on local changes. */
export function startSync(onRemoteUpdate: () => void) {
  window.addEventListener('grc-persist', (e) => {
    const key = (e as CustomEvent<string>).detail;
    if (isSynced(key)) markChanged();
  });
  const check = async () => {
    if (status.code && (await pull()) === 'updated') onRemoteUpdate();
  };
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && void check());
  void check();
}
