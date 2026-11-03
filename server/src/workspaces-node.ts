import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openDb } from './db-node.ts';
import { createWorkspaces } from './practice.ts';

/** Workspaces stored as SQLite files: the demo at demoFile, scenarios in practiceDir. */
export function nodeWorkspaces(demoFile: string, practiceDir: string) {
  const fileFor = (id: string) => (id === 'demo' ? demoFile : join(practiceDir, `${id}.db`));
  const stateFile = join(practiceDir, 'active.json');
  return createWorkspaces({
    exists: (id) => existsSync(fileFor(id)),
    open: (id) => openDb(fileFor(id)),
    remove: (id) => {
      for (const f of [fileFor(id), `${fileFor(id)}-wal`, `${fileFor(id)}-shm`]) rmSync(f, { force: true });
    },
    loadActive: () => {
      try {
        return JSON.parse(readFileSync(stateFile, 'utf8')).active ?? null;
      } catch {
        return null;
      }
    },
    saveActive: (id) => {
      mkdirSync(practiceDir, { recursive: true });
      writeFileSync(stateFile, JSON.stringify({ active: id }));
    },
  });
}
