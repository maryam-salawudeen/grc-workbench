// Practice mode: one SQLite file per scenario, plus the review that compares a
// learner's register with the scenario's model answer.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getSetting, logActivity, openDb, setSetting, transaction, type DB } from './db.ts';
import { decorateRisk, type Row } from './entities.ts';
import { isEmpty, seed, seedControlLibrary, seedFrameworks } from './seed.ts';
import { SCENARIOS, scenarioById, LEVEL_NAMES, type ModelRisk, type Scenario } from './scenarios.ts';
import { RISK_APPETITE, quantitative } from '../../shared/scoring.ts';

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-CA');
};

export function seedScenario(db: DB, s: Scenario) {
  transaction(db, () => {
    const { reqIds } = seedFrameworks(db);
    setSetting(db, 'org_name', s.org);
    setSetting(db, 'scenario_id', s.id);
    setSetting(db, 'started_at', day(0));

    const person = db.prepare('INSERT INTO people (name, title, department) VALUES (?, ?, ?)');
    for (const p of s.people) person.run(...p);

    const asset = db.prepare('INSERT INTO assets (name, type, classification, criticality, value, owner_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const [name, type, cls, crit, value, owner, desc] of s.assets) asset.run(name, type, cls, crit, value, owner + 1, desc);

    const vendor = db.prepare(
      'INSERT INTO vendors (name, service, owner_id, data_access, criticality, system_access, certifications, last_assessed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const [name, svc, owner, data, crit, sys, certs, ago, status] of s.vendors) {
      vendor.run(name, svc, owner + 1, data, crit, sys ? 1 : 0, certs || null, ago == null ? null : day(-ago), status);
    }

    seedControlLibrary(db, reqIds, (title) => s.controls[title] ?? 'not_implemented');
    logActivity(db, 'system', null, 'started', `Started practice scenario: ${s.org}`);
  });
}

/** A scenario without its model answer, for the brief page. */
export function publicScenario(s: Scenario) {
  const { risks, ...rest } = s;
  return { ...rest, level: LEVEL_NAMES[s.difficulty], modelRiskCount: risks.length };
}

// ---- Review -----------------------------------------------------------------

/** Lowercase, with hyphens and underscores as spaces, so "wi-fi" matches "wi fi". */
export const normalise = (s: string) => s.toLowerCase().replace(/[-_]/g, ' ');
const textOf = (r: Row) => normalise([r.title, r.threat, r.vulnerability, r.description, r.treatment_plan].filter(Boolean).join(' '));

function matchScore(m: ModelRisk, r: Row) {
  const text = textOf(r);
  const hits = m.keywords.filter((k) => text.includes(normalise(k))).length;
  return hits ? hits + (r.asset_name === m.asset ? 0.5 : 0) : 0;
}

const closeness = (dl: number, di: number) => Math.max(0, 1 - (Math.abs(dl) + Math.abs(di)) * 0.25);

export function reviewScenario(db: DB, s: Scenario) {
  const risks = (
    db
      .prepare('SELECT r.*, a.name AS asset_name FROM risks r LEFT JOIN assets a ON a.id = r.asset_id ORDER BY r.id')
      .all() as Row[]
  ).map((r) => decorateRisk({ ...r }));
  const links = db.prepare('SELECT rc.risk_id, c.title FROM risk_controls rc JOIN controls c ON c.id = rc.control_id').all() as Row[];
  const controlsOf = (id: number) => links.filter((l) => l.risk_id === id).map((l) => l.title as string);
  const manual = new Map((db.prepare('SELECT model_key, risk_id FROM practice_matches').all() as Row[]).map((m) => [m.model_key as string, m.risk_id as number]));

  // Manual pairings first, then the best keyword matches, one-to-one.
  const pairs = new Map<string, Row>();
  const used = new Set<number>();
  for (const m of s.risks) {
    const rid = manual.get(m.key);
    if (rid == null) continue;
    used.add(rid);
    const r = risks.find((x) => x.id === rid);
    if (r) pairs.set(m.key, r);
  }
  const candidates: [ModelRisk, Row, number][] = [];
  for (const m of s.risks) {
    if (manual.has(m.key)) continue;
    for (const r of risks) {
      const score = matchScore(m, r);
      if (score > 0) candidates.push([m, r, score]);
    }
  }
  candidates.sort((a, b) => b[2] - a[2]);
  for (const [m, r] of candidates) {
    if (pairs.has(m.key) || used.has(r.id)) continue;
    pairs.set(m.key, r);
    used.add(r.id);
  }

  const results = s.risks.map((m) => {
    const r = pairs.get(m.key);
    const model = {
      likelihood: m.likelihood,
      impact: m.impact,
      inherent: m.likelihood * m.impact,
      residual_likelihood: m.residual_likelihood,
      residual_impact: m.residual_impact,
      residual: m.residual_likelihood * m.residual_impact,
      treatment: m.treatment,
      alsoAccept: m.alsoAccept ?? [],
      controls: m.controls,
      ale: m.quant ? quantitative(m.quant.asset_value, m.quant.exposure_factor, m.quant.aro).ale : null,
      quant: m.quant ?? null,
    };
    const base = { key: m.key, title: m.title, category: m.category, asset: m.asset, why: m.why, model, manual: manual.has(m.key) };
    if (!r) return { ...base, matched: null, scores: { inherent: 0, residual: 0, treatment: 0, controls: 0, total: 0 }, missingControls: m.controls, extraControls: [] };

    const userControls = controlsOf(r.id);
    const inherent = closeness(r.likelihood - m.likelihood, r.impact - m.impact);
    const residual = r.residual_assessed ? closeness(r.residual_likelihood - m.residual_likelihood, r.residual_impact - m.residual_impact) : 0;
    const treatment = r.treatment === m.treatment || (m.alsoAccept ?? []).includes(r.treatment) ? 1 : 0;
    const overlap = m.controls.filter((t) => userControls.includes(t)).length;
    const controls = m.controls.length ? overlap / m.controls.length : userControls.length <= 1 ? 1 : 0.5;
    const total = 0.35 * inherent + 0.2 * residual + 0.2 * treatment + 0.25 * controls;
    return {
      ...base,
      matched: {
        id: r.id,
        ref: r.ref,
        title: r.title,
        likelihood: r.likelihood,
        impact: r.impact,
        inherent: r.inherent_score,
        residual_assessed: r.residual_assessed,
        residual_likelihood: r.residual_likelihood,
        residual_impact: r.residual_impact,
        residual: r.residual_score,
        treatment: r.treatment,
        controls: userControls,
        ale: r.ale,
        owner_id: r.owner_id,
      },
      scores: { inherent, residual, treatment, controls, total },
      missingControls: m.controls.filter((t) => !userControls.includes(t)),
      extraControls: userControls.filter((t) => !m.controls.includes(t)),
    };
  });

  const n = results.length;
  const avg = (k: 'inherent' | 'residual' | 'treatment' | 'controls') => results.reduce((sum, x) => sum + x.scores[k], 0) / n;
  const found = results.filter((x) => x.matched).length;
  const score = Math.round((results.reduce((sum, x) => sum + x.scores.total, 0) / n) * 100);

  const checks: { ok: boolean; text: string }[] = [];
  const noOwner = risks.filter((r) => !r.owner_id).length;
  checks.push({ ok: noOwner === 0, text: noOwner ? `${noOwner} risk(s) have no owner. Every risk needs someone accountable for the treatment decision.` : 'Every risk has an owner.' });
  const noResidual = risks.filter((r) => !r.residual_assessed).length;
  checks.push({ ok: noResidual === 0, text: noResidual ? `${noResidual} risk(s) have no residual score, so you cannot tell whether treatment brings them within appetite.` : 'Every risk has a residual score.' });
  const badAccept = risks.filter((r) => r.treatment === 'accept' && r.residual_score > RISK_APPETITE).length;
  checks.push({ ok: badAccept === 0, text: badAccept ? `${badAccept} accepted risk(s) are above appetite (> ${RISK_APPETITE}). Acceptance above appetite needs senior sign-off and a strong reason.` : 'No risk above appetite has been accepted.' });
  const noControls = risks.filter((r) => r.treatment === 'mitigate' && !controlsOf(r.id).length).length;
  checks.push({ ok: noControls === 0, text: noControls ? `${noControls} risk(s) are marked "mitigate" but have no linked controls.` : 'Every mitigated risk has at least one linked control.' });
  // Not naming unrecorded risks here keeps the model answer hidden until the learner reveals it.
  const quantMissing = results.filter((x) => x.model.quant && (!x.matched || x.matched.ale == null)).length;
  if (results.some((x) => x.model.quant)) {
    checks.push({
      ok: quantMissing === 0,
      text: quantMissing
        ? `The brief gives values for quantitative analysis: ${quantMissing} risk still needs AV, EF and ARO.`
        : 'Quantitative analysis completed where the brief asked for it.',
    });
  }

  const matchedIds = new Set([...pairs.values()].map((p) => p.id));
  const extras = risks.filter((r) => !matchedIds.has(r.id)).map((r) => ({ id: r.id, ref: r.ref, title: r.title }));

  setSetting(db, 'last_score', String(score));
  setSetting(db, 'reviewed_at', day(0));

  return {
    scenario: { id: s.id, org: s.org },
    score,
    band: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Developing' : 'Keep practising',
    breakdown: { found, total: n, inherent: avg('inherent'), residual: avg('residual'), treatment: avg('treatment'), controls: avg('controls') },
    results,
    extras,
    checks,
    userRisks: risks.map((r) => ({ id: r.id, ref: r.ref, title: r.title })),
  };
}

// ---- Workspaces -------------------------------------------------------------

export type Workspaces = ReturnType<typeof createWorkspaces>;

/** Demo plus one database per practice scenario; the active one is remembered across restarts. */
export function createWorkspaces(demoFile: string, practiceDir: string) {
  const conns = new Map<string, DB>();
  const stateFile = join(practiceDir, 'active.json');
  const fileFor = (id: string) => (id === 'demo' ? demoFile : join(practiceDir, `${id}.db`));
  const valid = (id: string) => id === 'demo' || !!scenarioById(id);

  const open = (id: string) => {
    let db = conns.get(id);
    if (db) return db;
    db = openDb(fileFor(id));
    if (isEmpty(db)) id === 'demo' ? seed(db) : seedScenario(db, scenarioById(id)!);
    conns.set(id, db);
    return db;
  };

  let active = 'demo';
  try {
    const saved = JSON.parse(readFileSync(stateFile, 'utf8')).active;
    if (valid(saved)) active = saved;
  } catch {
    // First run: start on the demo.
  }

  const save = () => {
    mkdirSync(practiceDir, { recursive: true });
    writeFileSync(stateFile, JSON.stringify({ active }));
  };

  return {
    db: () => open(active),
    activeId: () => active,
    activate(id: string) {
      if (!valid(id)) throw new HTTPException(404, { message: `Unknown workspace ${id}` });
      open(id);
      active = id;
      save();
    },
    reset(id: string) {
      if (!valid(id)) throw new HTTPException(404, { message: `Unknown workspace ${id}` });
      conns.get(id)?.close();
      conns.delete(id);
      for (const f of [fileFor(id), `${fileFor(id)}-wal`, `${fileFor(id)}-shm`]) rmSync(f, { force: true });
      if (active === id) open(id);
    },
    list() {
      return [
        { id: 'demo', org: getSetting(open('demo'), 'org_name') ?? 'Maple Ridge Credit Union', sector: 'Financial services', demo: true, started: true, active: active === 'demo' },
        ...SCENARIOS.map((s) => {
          const started = existsSync(fileFor(s.id));
          const db = started ? open(s.id) : null;
          const last = db ? getSetting(db, 'last_score') : null;
          return {
            ...publicScenario(s),
            brief: undefined,
            tasks: undefined,
            demo: false,
            started,
            active: active === s.id,
            riskCount: db ? (db.prepare('SELECT COUNT(*) AS n FROM risks').get() as { n: number }).n : 0,
            lastScore: last == null ? null : Number(last),
            reviewedAt: db ? getSetting(db, 'reviewed_at') : null,
          };
        }),
      ];
    },
  };
}

/** Routes that switch or reset workspaces; mounted before the generic CRUD routes. */
export function workspaceRoutes(ws: Workspaces) {
  return (api: Hono) => {
    api.get('/workspaces', (c) => c.json(ws.list()));
    api.post('/workspaces/:id/activate', (c) => {
      ws.activate(c.req.param('id'));
      return c.json({ ok: true, active: ws.activeId() });
    });
    api.post('/workspaces/:id/reset', (c) => {
      const id = c.req.param('id');
      if (id === 'demo') throw new HTTPException(400, { message: 'Use npm run seed to reset the demo' });
      ws.reset(id);
      return c.json({ ok: true });
    });
  };
}
