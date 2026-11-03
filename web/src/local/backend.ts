// The hosted version runs the whole API in the browser. Each visitor gets
// private workspaces saved in IndexedDB; only the website check calls a server.
import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { Hono } from 'hono';
import { createApp } from '../../../server/src/app.ts';
import { initSchema } from '../../../server/src/db.ts';
import { createWorkspaces, workspaceRoutes, type Workspaces } from '../../../server/src/practice.ts';
import { SiteCheckError, type SiteReport } from '../../../server/src/sitecheck-core.ts';
import { SqlJsDb } from './sqljs';
import { loadAll, removeBytes, saveBytes } from './storage';
import { getStatus, markChanged, pull, startSync } from './sync';

const ACTIVE_KEY = 'grc-active-workspace';

let app: Hono;
let workspaces: Workspaces;
let saved = new Map<string, Uint8Array>();
const removals = new Set<string>();
/** False when the browser blocks storage (some private windows): work is kept until the tab closes. */
export let persistent = true;

async function remoteSiteCheck(url: string): Promise<SiteReport> {
  const res = await fetch('/api/site-check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new SiteCheckError(data.error ?? `Website check failed (${res.status})`);
  return data as SiteReport;
}

export async function initLocalBackend() {
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });
  // With sync on, fetch newer work from the user's other device before loading anything.
  // Give up after a few seconds so the app still opens offline.
  if (getStatus().code) await Promise.race([pull(), new Promise((r) => setTimeout(r, 4000))]);
  try {
    saved = await loadAll();
  } catch {
    persistent = false;
  }
  workspaces = createWorkspaces({
    exists: (id) => saved.has(id),
    open: (id) => {
      const bytes = saved.get(id);
      const db = new SqlJsDb(bytes ? new SQL.Database(bytes) : new SQL.Database());
      initSchema(db);
      // A freshly created database still needs seeding and saving; a loaded one is unchanged.
      db.dirty = !bytes;
      return db;
    },
    remove: (id) => {
      saved.delete(id);
      removals.add(id);
    },
    loadActive: () => {
      try {
        return localStorage.getItem(ACTIVE_KEY);
      } catch {
        return null;
      }
    },
    saveActive: (id) => {
      try {
        localStorage.setItem(ACTIVE_KEY, id);
      } catch {
        // ignore
      }
    },
  });
  app = createApp(workspaces.db, { extend: workspaceRoutes(workspaces), runSiteCheck: remoteSiteCheck });
  // Create (and seed) the active workspace now, so the first page loads quickly.
  workspaces.db();
  await persist();
  startSync(() => location.reload());
}

async function persist() {
  if (!persistent) return;
  let changed = removals.size > 0;
  try {
    for (const id of removals) await removeBytes(id);
    removals.clear();
    for (const [id, db] of workspaces.open()) {
      const sdb = db as SqlJsDb;
      if (!sdb.dirty) continue;
      const bytes = sdb.export();
      saved.set(id, bytes);
      await saveBytes(id, bytes);
      changed = true;
    }
  } catch {
    persistent = false;
  }
  if (changed) markChanged();
}

/** Handle an /api request in the browser, then save whatever changed. */
export async function localFetch(path: string, init: RequestInit): Promise<Response> {
  const res = await app.fetch(new Request(new URL(`/api${path}`, location.origin), init));
  await persist();
  return res;
}
