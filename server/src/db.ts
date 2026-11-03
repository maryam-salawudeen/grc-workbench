// The schema and helpers here run anywhere: Node (node:sqlite, see db-node.ts)
// or the browser (sql.js, see web/src/local). Both provide this small interface.

export interface Statement {
  all(...params: any[]): unknown[];
  get(...params: any[]): unknown;
  run(...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

export interface DB {
  exec(sql: string): void;
  prepare(sql: string): Statement;
  close(): void;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  department TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  classification TEXT NOT NULL DEFAULT 'internal',
  criticality INTEGER NOT NULL DEFAULT 3,
  value REAL,
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS risks (
  id INTEGER PRIMARY KEY,
  ref TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  threat TEXT,
  vulnerability TEXT,
  likelihood INTEGER NOT NULL,
  impact INTEGER NOT NULL,
  residual_likelihood INTEGER,
  residual_impact INTEGER,
  treatment TEXT NOT NULL DEFAULT 'mitigate',
  treatment_plan TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  due_date TEXT,
  asset_value REAL,
  exposure_factor REAL,
  aro REAL,
  created_at TEXT NOT NULL DEFAULT (date('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (date('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS controls (
  id INTEGER PRIMARY KEY,
  ref TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  type TEXT NOT NULL DEFAULT 'preventive',
  nature TEXT NOT NULL DEFAULT 'technical',
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_implemented',
  effectiveness INTEGER,
  last_tested TEXT,
  test_frequency_months INTEGER NOT NULL DEFAULT 12
);

CREATE TABLE IF NOT EXISTS frameworks (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY,
  framework_id INTEGER NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  ref TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  UNIQUE (framework_id, ref)
);

CREATE TABLE IF NOT EXISTS control_requirements (
  control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  requirement_id INTEGER NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  PRIMARY KEY (control_id, requirement_id)
);

CREATE TABLE IF NOT EXISTS risk_controls (
  risk_id INTEGER NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
  control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  PRIMARY KEY (risk_id, control_id)
);

CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY,
  ref TEXT UNIQUE,
  title TEXT NOT NULL,
  framework_id INTEGER NOT NULL REFERENCES frameworks(id),
  scope TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  lead_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  start_date TEXT,
  end_date TEXT,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS assessment_items (
  id INTEGER PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id INTEGER NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  result TEXT NOT NULL DEFAULT 'not_assessed',
  notes TEXT,
  evidence TEXT,
  UNIQUE (assessment_id, requirement_id)
);

CREATE TABLE IF NOT EXISTS findings (
  id INTEGER PRIMARY KEY,
  ref TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  assessment_id INTEGER REFERENCES assessments(id) ON DELETE SET NULL,
  requirement_id INTEGER REFERENCES requirements(id) ON DELETE SET NULL,
  risk_id INTEGER REFERENCES risks(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  due_date TEXT,
  remediation TEXT,
  closed_date TEXT
);

CREATE TABLE IF NOT EXISTS policies (
  id INTEGER PRIMARY KEY,
  ref TEXT UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  version TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_date TEXT,
  review_months INTEGER NOT NULL DEFAULT 12,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  service TEXT,
  owner_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  data_access TEXT NOT NULL DEFAULT 'none',
  criticality TEXT NOT NULL DEFAULT 'low',
  system_access INTEGER NOT NULL DEFAULT 0,
  certifications TEXT,
  last_assessed TEXT,
  contract_end TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Practice mode: a learner's manual pairing of a model-answer risk with one of their risks (risk_id 0 = no match).
CREATE TABLE IF NOT EXISTS practice_matches (
  model_key TEXT PRIMARY KEY,
  risk_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS site_checks (
  id INTEGER PRIMARY KEY,
  url TEXT NOT NULL,
  host TEXT NOT NULL,
  checked_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  items TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY,
  at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  entity TEXT NOT NULL,
  entity_id INTEGER,
  action TEXT NOT NULL,
  summary TEXT NOT NULL
);
`;

export function initSchema(db: DB) {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
}

export function transaction<T>(db: DB, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function logActivity(db: DB, entity: string, entityId: number | null, action: string, summary: string) {
  db.prepare('INSERT INTO activity (entity, entity_id, action, summary) VALUES (?, ?, ?, ?)').run(entity, entityId, action, summary);
}

export function getSetting(db: DB, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(db: DB, key: string, value: string | null) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
}
