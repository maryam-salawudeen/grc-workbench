// Workspace databases are saved in IndexedDB, one entry per workspace id.
const DB_NAME = 'grc-workbench';
const STORE = 'workspaces';

let opening: Promise<IDBDatabase> | null = null;

function idb(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return opening;
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return idb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function loadAll(): Promise<Map<string, Uint8Array>> {
  const keys = (await tx('readonly', (s) => s.getAllKeys())) as string[];
  const values = (await tx('readonly', (s) => s.getAll())) as Uint8Array[];
  return new Map(keys.map((k, i) => [k, values[i]]));
}

export const saveBytes = (id: string, bytes: Uint8Array) => tx('readwrite', (s) => s.put(bytes, id));
export const removeBytes = (id: string) => tx('readwrite', (s) => s.delete(id));
export const clearAll = () => tx('readwrite', (s) => s.clear());
