// `node src/seed-cli.ts --reset` rebuilds the demo database from scratch.
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openDb } from './db-node.ts';
import { isEmpty, seed } from './seed.ts';

const file = process.env.DB_PATH ?? fileURLToPath(new URL('../../data/grc.db', import.meta.url));
if (process.argv.includes('--reset')) for (const f of [file, `${file}-wal`, `${file}-shm`]) rmSync(f, { force: true });
const db = openDb(file);
if (isEmpty(db)) {
  seed(db);
  console.log(`Seeded demo data into ${file}`);
} else {
  console.log(`${file} already has data; pass --reset to rebuild it.`);
}
