import type { Database } from 'sql.js';
import type { DB, Statement } from '../../../server/src/db.ts';

/** sql.js binds numbers, strings, null and bytes only. */
const bindable = (params: unknown[]) => params.map((v) => (v === undefined ? null : typeof v === 'boolean' ? Number(v) : v)) as any[];

/** Gives a sql.js database the same interface as node:sqlite, so the API code runs unchanged. */
export class SqlJsDb implements DB {
  dirty = false;
  raw: Database;

  constructor(raw: Database) {
    this.raw = raw;
    raw.exec('PRAGMA foreign_keys = ON;');
  }

  exec(sql: string) {
    this.raw.exec(sql);
    this.dirty = true;
  }

  prepare(sql: string): Statement {
    const raw = this.raw;
    const rows = (params: unknown[], limit = Infinity) => {
      const st = raw.prepare(sql);
      try {
        st.bind(bindable(params));
        const out: Record<string, unknown>[] = [];
        while (out.length < limit && st.step()) out.push(st.getAsObject());
        return out;
      } finally {
        st.free();
      }
    };
    return {
      all: (...params) => rows(params),
      get: (...params) => rows(params, 1)[0],
      run: (...params) => {
        const st = raw.prepare(sql);
        try {
          st.run(bindable(params));
        } finally {
          st.free();
        }
        this.dirty = true;
        const changes = raw.getRowsModified();
        const id = raw.exec('SELECT last_insert_rowid()')[0]?.values[0][0];
        return { changes, lastInsertRowid: Number(id ?? 0) };
      },
    };
  }

  close() {
    this.raw.close();
  }

  /** Serialise for storage. sql.js reopens the database, which resets pragmas, so re-enable foreign keys. */
  export(): Uint8Array {
    const bytes = this.raw.export();
    this.raw.exec('PRAGMA foreign_keys = ON;');
    this.dirty = false;
    return bytes;
  }
}
