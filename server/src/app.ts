import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { getSetting, logActivity, transaction, type DB } from './db.ts';
import { publicScenario, reviewScenario } from './practice.ts';
import { scenarioById } from './scenarios.ts';
import { SiteCheckError, checkSite, type SiteCheckItem } from './sitecheck.ts';
import { ENTITIES, isOpenFinding, type Entity, type Row } from './entities.ts';
import { domainBreakdown, frameworkCoverage, frameworkSummaries, suggestedResult, summarise } from './compliance.ts';
import { daysBetween, todayISO } from '../../shared/scoring.ts';

const idParam = (raw: string) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HTTPException(400, { message: 'Invalid id' });
  return id;
};

const idList = z.object({ ids: z.array(z.number().int().positive()).max(500) });

/** node:sqlite binds numbers, strings and null, so booleans become 0/1. */
const toSql = (v: unknown) => (typeof v === 'boolean' ? Number(v) : v === undefined ? null : v);

export function createApp(source: DB | (() => DB), today: () => string = todayISO, extend?: (api: Hono) => void) {
  // A getter so the active practice workspace can be swapped without rebuilding the app.
  const db = typeof source === 'function' ? source : () => source;
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) }, 400);
    }
    if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
    if (err instanceof Error && /FOREIGN KEY/.test(err.message)) return c.json({ error: 'A linked record does not exist or is still in use' }, 409);
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  });

  const api = new Hono();

  // ---- Generic helpers ----------------------------------------------------

  const entityOf = (name: string): Entity => {
    const e = ENTITIES[name];
    if (!e) throw new HTTPException(404, { message: `Unknown resource: ${name}` });
    return e;
  };

  const listRows = (e: Entity, where = '', params: any[] = []) => {
    const rows = db().prepare(`${e.select} ${where} ORDER BY ${e.order}`).all(...params) as Row[];
    const t = today();
    return e.decorate ? rows.map((r) => e.decorate!({ ...r }, t)) : rows.map((r) => ({ ...r }));
  };

  const getRow = (e: Entity, id: number) => {
    const row = listRows(e, `WHERE ${e.alias}.id = ?`, [id])[0];
    if (!row) throw new HTTPException(404, { message: `${e.label} ${id} not found` });
    return row;
  };

  const describe = (e: Entity, row: Row) => (row.ref ? `${row.ref} ${row[e.titleField]}` : row[e.titleField]);

  // ---- Dashboard ----------------------------------------------------------

  api.get('/dashboard', (c) => {
    const t = today();
    const risks = listRows(ENTITIES.risks);
    const openRisks = risks.filter((r) => r.status !== 'closed');
    const findings = listRows(ENTITIES.findings);
    const openFindings = findings.filter((f) => isOpenFinding(f.status));
    const policies = listRows(ENTITIES.policies).filter((p) => p.status !== 'retired');
    const vendors = listRows(ENTITIES.vendors).filter((v) => v.status !== 'terminated');
    const controls = listRows(ENTITIES.controls);

    const upcoming: Row[] = [];
    const within = (d: string | null) => d != null && daysBetween(t, d) <= 60;
    for (const f of openFindings) if (within(f.due_date)) upcoming.push({ date: f.due_date, kind: 'Finding due', ref: f.ref, title: f.title, link: `/findings?open=${f.id}` });
    for (const r of openRisks) if (r.status !== 'accepted' && within(r.due_date)) upcoming.push({ date: r.due_date, kind: 'Risk treatment', ref: r.ref, title: r.title, link: `/risks/${r.id}` });
    for (const p of policies) if (within(p.next_review)) upcoming.push({ date: p.next_review, kind: 'Policy review', ref: p.ref, title: p.title, link: `/policies?open=${p.id}` });
    for (const v of vendors) if (within(v.next_assessment)) upcoming.push({ date: v.next_assessment, kind: 'Vendor reassessment', ref: `Tier ${v.tier}`, title: v.name, link: `/vendors?open=${v.id}` });
    for (const ctl of controls) if (within(ctl.next_test) && ctl.status !== 'not_applicable') upcoming.push({ date: ctl.next_test, kind: 'Control test', ref: ctl.ref, title: ctl.title, link: `/controls/${ctl.id}` });
    upcoming.sort((a, b) => a.date.localeCompare(b.date));

    const severity = { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>;
    for (const f of openFindings) severity[f.severity]++;

    return c.json({
      today: t,
      risks: openRisks,
      riskCounts: {
        open: openRisks.length,
        aboveAppetite: openRisks.filter((r) => r.above_appetite).length,
        ale: openRisks.reduce((s, r) => s + (r.ale ?? 0), 0),
      },
      frameworks: frameworkSummaries(db()),
      findings: {
        open: openFindings.length,
        overdue: openFindings.filter((f) => f.due_state === 'overdue').length,
        bySeverity: severity,
      },
      controls: {
        total: controls.length,
        implemented: controls.filter((x) => x.status === 'implemented').length,
        testsOverdue: controls.filter((x) => x.test_state === 'overdue' || x.test_state === 'never').length,
      },
      policies: {
        total: policies.length,
        overdue: policies.filter((p) => p.review_state === 'overdue').length,
        dueSoon: policies.filter((p) => p.review_state === 'due_soon').length,
      },
      vendors: {
        total: vendors.length,
        tier1: vendors.filter((v) => v.tier === 1).length,
        overdue: vendors.filter((v) => v.assessment_state === 'overdue' || v.assessment_state === 'never').length,
      },
      upcoming: upcoming.slice(0, 12),
      activity: db().prepare('SELECT * FROM activity ORDER BY id DESC LIMIT 12').all(),
    });
  });

  api.get('/lookups', (c) =>
    c.json({
      people: db().prepare('SELECT id, name, title FROM people ORDER BY name').all(),
      assets: db().prepare('SELECT id, name FROM assets ORDER BY name').all(),
      risks: db().prepare('SELECT id, ref, title FROM risks ORDER BY id').all(),
      controls: db().prepare('SELECT id, ref, title, status FROM controls ORDER BY id').all(),
      frameworks: db().prepare('SELECT id, code, name FROM frameworks ORDER BY id').all(),
      assessments: db().prepare('SELECT id, ref, title, framework_id FROM assessments ORDER BY id').all(),
    }),
  );

  api.get('/activity', (c) => c.json(db().prepare('SELECT * FROM activity ORDER BY id DESC LIMIT 200').all()));

  // ---- Frameworks ---------------------------------------------------------

  api.get('/frameworks', (c) => c.json(frameworkSummaries(db())));

  api.get('/frameworks/:id', (c) => {
    const id = idParam(c.req.param('id'));
    const framework = db().prepare('SELECT * FROM frameworks WHERE id = ?').get(id);
    if (!framework) throw new HTTPException(404, { message: 'Framework not found' });
    const requirements = frameworkCoverage(db(), id);
    return c.json({ ...framework, ...summarise(requirements), domains: domainBreakdown(requirements), requirements });
  });

  api.get('/requirements', (c) => {
    const frameworkId = c.req.query('framework_id');
    const sql = `SELECT q.*, f.code AS framework_code FROM requirements q JOIN frameworks f ON f.id = q.framework_id
      ${frameworkId ? 'WHERE q.framework_id = ?' : ''} ORDER BY q.id`;
    return c.json(db().prepare(sql).all(...(frameworkId ? [Number(frameworkId)] : [])));
  });

  // ---- Risk <-> control and control <-> requirement links -------------------

  api.get('/risks/:id/links', (c) => {
    const id = idParam(c.req.param('id'));
    getRow(ENTITIES.risks, id);
    return c.json({
      controls: db()
        .prepare('SELECT c.id, c.ref, c.title, c.status, c.type, c.effectiveness FROM risk_controls rc JOIN controls c ON c.id = rc.control_id WHERE rc.risk_id = ? ORDER BY c.id')
        .all(id),
      findings: listRows(ENTITIES.findings, 'WHERE x.risk_id = ?', [id]),
    });
  });

  api.put('/risks/:id/controls', async (c) => {
    const id = idParam(c.req.param('id'));
    const risk = getRow(ENTITIES.risks, id);
    const { ids } = idList.parse(await c.req.json());
    transaction(db(), () => {
      db().prepare('DELETE FROM risk_controls WHERE risk_id = ?').run(id);
      const insert = db().prepare('INSERT INTO risk_controls (risk_id, control_id) VALUES (?, ?)');
      for (const cid of new Set(ids)) insert.run(id, cid);
      logActivity(db(), 'risks', id, 'linked', `Linked ${ids.length} control(s) to ${risk.ref}`);
    });
    return c.json({ ok: true });
  });

  api.get('/controls/:id/links', (c) => {
    const id = idParam(c.req.param('id'));
    getRow(ENTITIES.controls, id);
    return c.json({
      requirements: db()
        .prepare(
          `SELECT q.id, q.ref, q.title, q.domain, f.id AS framework_id, f.code AS framework_code, f.name AS framework_name
           FROM control_requirements cr JOIN requirements q ON q.id = cr.requirement_id JOIN frameworks f ON f.id = q.framework_id
           WHERE cr.control_id = ? ORDER BY q.id`,
        )
        .all(id),
      risks: listRows(ENTITIES.risks, 'WHERE x.id IN (SELECT risk_id FROM risk_controls WHERE control_id = ?)', [id]),
    });
  });

  api.put('/controls/:id/requirements', async (c) => {
    const id = idParam(c.req.param('id'));
    const control = getRow(ENTITIES.controls, id);
    const { ids } = idList.parse(await c.req.json());
    transaction(db(), () => {
      db().prepare('DELETE FROM control_requirements WHERE control_id = ?').run(id);
      const insert = db().prepare('INSERT INTO control_requirements (control_id, requirement_id) VALUES (?, ?)');
      for (const rid of new Set(ids)) insert.run(id, rid);
      logActivity(db(), 'controls', id, 'mapped', `Mapped ${control.ref} to ${ids.length} framework requirement(s)`);
    });
    return c.json({ ok: true });
  });

  // ---- Assessments ----------------------------------------------------------

  api.get('/assessments/:id/items', (c) => {
    const id = idParam(c.req.param('id'));
    const assessment = getRow(ENTITIES.assessments, id);
    const coverage = new Map(frameworkCoverage(db(), assessment.framework_id).map((r) => [r.id, r]));
    const items = db()
      .prepare(
        `SELECT i.*, q.ref, q.title, q.domain,
          (SELECT COUNT(*) FROM findings f WHERE f.assessment_id = i.assessment_id AND f.requirement_id = i.requirement_id) AS finding_count
         FROM assessment_items i JOIN requirements q ON q.id = i.requirement_id
         WHERE i.assessment_id = ? ORDER BY q.id`,
      )
      .all(id) as Row[];
    return c.json(
      items.map((i) => {
        const cov = coverage.get(i.requirement_id);
        return { ...i, coverage: cov?.status ?? 'gap', controls: cov?.controls ?? [] };
      }),
    );
  });

  const itemSchema = z.object({
    result: z.enum(['not_assessed', 'compliant', 'partial', 'non_compliant', 'not_applicable']).optional(),
    notes: z.string().max(5000).nullable().optional(),
    evidence: z.string().max(5000).nullable().optional(),
  });

  api.put('/assessment-items/:id', async (c) => {
    const id = idParam(c.req.param('id'));
    const data = itemSchema.parse(await c.req.json());
    const keys = Object.keys(data) as (keyof typeof data)[];
    if (!keys.length) throw new HTTPException(400, { message: 'Nothing to update' });
    const res = db().prepare(`UPDATE assessment_items SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map((k) => toSql(data[k]) as any), id);
    if (!res.changes) throw new HTTPException(404, { message: 'Item not found' });
    return c.json(db().prepare('SELECT * FROM assessment_items WHERE id = ?').get(id));
  });

  api.post('/assessments/:id/prefill', (c) => {
    const id = idParam(c.req.param('id'));
    const assessment = getRow(ENTITIES.assessments, id);
    const coverage = new Map(frameworkCoverage(db(), assessment.framework_id).map((r) => [r.id, r]));
    const pending = db().prepare("SELECT id, requirement_id FROM assessment_items WHERE assessment_id = ? AND result = 'not_assessed'").all(id) as Row[];
    const update = db().prepare('UPDATE assessment_items SET result = ?, notes = ? WHERE id = ?');
    transaction(db(), () => {
      for (const item of pending) {
        const cov = coverage.get(item.requirement_id);
        const status = cov?.status ?? 'gap';
        const note =
          status === 'gap'
            ? `No control mapped to this requirement (pre-filled ${today()}).`
            : `Pre-filled ${today()} from mapped controls: ${cov!.controls.map((x) => `${x.ref} (${x.status.replace('_', ' ')})`).join(', ')}.`;
        update.run(suggestedResult(status), note, item.id);
      }
      logActivity(db(), 'assessments', id, 'prefilled', `Pre-filled ${pending.length} item(s) in ${assessment.ref} from control status`);
    });
    return c.json({ updated: pending.length });
  });

  // ---- Workspace and practice review --------------------------------------

  const activeScenario = () => {
    const id = getSetting(db(), 'scenario_id');
    return id ? scenarioById(id) : undefined;
  };

  api.get('/workspace', (c) => {
    const s = activeScenario();
    return c.json({
      id: s?.id ?? 'demo',
      org_name: getSetting(db(), 'org_name') ?? 'Maple Ridge Credit Union',
      scenario: s ? publicScenario(s) : null,
      last_score: getSetting(db(), 'last_score'),
    });
  });

  api.get('/practice/review', (c) => {
    const s = activeScenario();
    if (!s) throw new HTTPException(400, { message: 'The active workspace is not a practice scenario' });
    return c.json(reviewScenario(db(), s));
  });

  const matchSchema = z.object({ model_key: z.string().min(1), risk_id: z.number().int().min(0).nullable() });
  api.put('/practice/matches', async (c) => {
    const s = activeScenario();
    if (!s) throw new HTTPException(400, { message: 'The active workspace is not a practice scenario' });
    const { model_key, risk_id } = matchSchema.parse(await c.req.json());
    if (!s.risks.some((r) => r.key === model_key)) throw new HTTPException(404, { message: 'Unknown model risk' });
    if (risk_id == null) db().prepare('DELETE FROM practice_matches WHERE model_key = ?').run(model_key);
    else {
      transaction(db(), () => {
        // A risk can only answer one model risk.
        if (risk_id) db().prepare('DELETE FROM practice_matches WHERE risk_id = ?').run(risk_id);
        db().prepare('INSERT INTO practice_matches (model_key, risk_id) VALUES (?, ?) ON CONFLICT(model_key) DO UPDATE SET risk_id = excluded.risk_id').run(model_key, risk_id);
      });
    }
    return c.json({ ok: true });
  });

  // ---- Website check ------------------------------------------------------------

  const siteCheckRow = (id: number) => {
    const row = db().prepare('SELECT * FROM site_checks WHERE id = ?').get(id) as Row | undefined;
    if (!row) throw new HTTPException(404, { message: 'Website check not found' });
    return { ...row, host: row.host as string, items: JSON.parse(row.items) as SiteCheckItem[] };
  };

  api.get('/site-checks', (c) => c.json(db().prepare('SELECT id, url, host, checked_at, score, grade FROM site_checks ORDER BY id DESC LIMIT 50').all()));

  api.get('/site-checks/:id', (c) => c.json(siteCheckRow(idParam(c.req.param('id')))));

  api.post('/site-checks', async (c) => {
    const { url, permission } = z.object({ url: z.string().min(1).max(500), permission: z.literal(true, { errorMap: () => ({ message: 'Confirm you own the site or have permission to check it' }) }) }).parse(await c.req.json());
    let report;
    try {
      report = await checkSite(url);
    } catch (e) {
      if (e instanceof SiteCheckError) throw new HTTPException(400, { message: e.message });
      throw e;
    }
    const id = Number(
      db().prepare('INSERT INTO site_checks (url, host, score, grade, items) VALUES (?, ?, ?, ?, ?)').run(report.url, report.host, report.score, report.letter, JSON.stringify(report.items)).lastInsertRowid,
    );
    logActivity(db(), 'site_checks', id, 'checked', `Checked website ${report.host}: grade ${report.letter} (${report.score}/100)`);
    return c.json(siteCheckRow(id), 201);
  });

  api.post('/site-checks/:id/findings', async (c) => {
    const check = siteCheckRow(idParam(c.req.param('id')));
    const { ids } = z.object({ ids: z.array(z.string()).min(1).max(20) }).parse(await c.req.json());
    const chosen = check.items.filter((i) => ids.includes(i.id) && i.status !== 'pass');
    const reqId = db().prepare('SELECT id FROM requirements WHERE ref = ?');
    const insert = db().prepare(
      `INSERT INTO findings (title, description, requirement_id, severity, status, due_date, remediation) VALUES (?, ?, ?, ?, 'open', date('now', 'localtime', ?), ?)`,
    );
    const due: Record<string, string> = { critical: '+7 days', high: '+30 days', medium: '+60 days', low: '+90 days' };
    const created = transaction(db(), () =>
      chosen.map((i) => {
        const req = i.refs.map((r) => reqId.get(r) as { id: number } | undefined).find(Boolean);
        const fid = Number(insert.run(`${check.host}: ${i.title.toLowerCase()} (failed)`, `${i.found} ${i.why}`, req?.id ?? null, i.severity, due[i.severity], i.fix).lastInsertRowid);
        db().prepare('UPDATE findings SET ref = ? WHERE id = ?').run(`FND-${String(fid).padStart(3, '0')}`, fid);
        logActivity(db(), 'findings', fid, 'created', `Raised finding from website check of ${check.host}: ${i.title}`);
        return fid;
      }),
    );
    return c.json({ created: created.length });
  });

  extend?.(api);

  // ---- Generic CRUD ---------------------------------------------------------

  api.get('/:entity', (c) => c.json(listRows(entityOf(c.req.param('entity')))));

  api.get('/:entity/:id', (c) => c.json(getRow(entityOf(c.req.param('entity')), idParam(c.req.param('id')))));

  api.post('/:entity', async (c) => {
    const e = entityOf(c.req.param('entity'));
    let data: Row = e.schema.parse(await c.req.json());
    if (e.beforeWrite) data = e.beforeWrite(data, today());
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    const id = transaction(db(), () => {
      const res = db()
        .prepare(`INSERT INTO ${e.table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`)
        .run(...keys.map((k) => toSql(data[k]) as any));
      const newId = Number(res.lastInsertRowid);
      if (e.prefix) db().prepare(`UPDATE ${e.table} SET ref = ? WHERE id = ?`).run(`${e.prefix}-${String(newId).padStart(3, '0')}`, newId);
      if (e.name === 'assessments') {
        db().prepare("INSERT INTO assessment_items (assessment_id, requirement_id) SELECT ?, id FROM requirements WHERE framework_id = ?").run(newId, data.framework_id);
      }
      const row = getRow(e, newId);
      logActivity(db(), e.name, newId, 'created', `Created ${e.label.toLowerCase()} ${describe(e, row)}`);
      return newId;
    });
    return c.json(getRow(e, id), 201);
  });

  api.put('/:entity/:id', async (c) => {
    const e = entityOf(c.req.param('entity'));
    const id = idParam(c.req.param('id'));
    const before = getRow(e, id);
    let data: Row = e.schema.partial().parse(await c.req.json());
    if (e.name === 'assessments' && data.framework_id != null && data.framework_id !== before.framework_id) {
      throw new HTTPException(400, { message: 'The framework of an existing assessment cannot be changed' });
    }
    if (e.beforeWrite) data = e.beforeWrite(data, today());
    const keys = Object.keys(data).filter((k) => data[k] !== undefined);
    if (!keys.length) throw new HTTPException(400, { message: 'Nothing to update' });
    transaction(db(), () => {
      db().prepare(`UPDATE ${e.table} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map((k) => toSql(data[k]) as any), id);
      const changed = keys.filter((k) => k !== 'updated_at' && String(before[k] ?? '') !== String(toSql(data[k]) ?? ''));
      const summary = changed.includes('status')
        ? `${describe(e, before)}: status ${before.status} → ${data.status}`
        : `Updated ${describe(e, before)}${changed.length ? ` (${changed.slice(0, 3).join(', ')})` : ''}`;
      logActivity(db(), e.name, id, 'updated', summary);
    });
    return c.json(getRow(e, id));
  });

  api.delete('/:entity/:id', (c) => {
    const e = entityOf(c.req.param('entity'));
    const id = idParam(c.req.param('id'));
    const before = getRow(e, id);
    transaction(db(), () => {
      db().prepare(`DELETE FROM ${e.table} WHERE id = ?`).run(id);
      logActivity(db(), e.name, id, 'deleted', `Deleted ${e.label.toLowerCase()} ${describe(e, before)}`);
    });
    return c.json({ ok: true });
  });

  app.route('/api', api);
  return app;
}

