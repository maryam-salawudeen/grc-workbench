import type { DB } from './db.ts';
import type { Row } from './entities.ts';
import { requirementCoverage, type ControlStatus, type CoverageStatus } from '../../shared/scoring.ts';

export interface RequirementCoverage {
  id: number;
  ref: string;
  title: string;
  domain: string;
  controls: { id: number; ref: string; title: string; status: ControlStatus }[];
  score: number | null;
  status: CoverageStatus;
}

/** Every requirement of a framework with its mapped controls and computed coverage. */
export function frameworkCoverage(db: DB, frameworkId: number): RequirementCoverage[] {
  const rows = db
    .prepare(
      `SELECT q.id, q.ref, q.title, q.domain, c.id AS cid, c.ref AS cref, c.title AS ctitle, c.status AS cstatus
       FROM requirements q
       LEFT JOIN control_requirements cr ON cr.requirement_id = q.id
       LEFT JOIN controls c ON c.id = cr.control_id
       WHERE q.framework_id = ?
       ORDER BY q.id, c.id`,
    )
    .all(frameworkId) as Row[];

  const byId = new Map<number, RequirementCoverage>();
  for (const r of rows) {
    let req = byId.get(r.id);
    if (!req) {
      req = { id: r.id, ref: r.ref, title: r.title, domain: r.domain, controls: [], score: 0, status: 'gap' };
      byId.set(r.id, req);
    }
    if (r.cid != null) req.controls.push({ id: r.cid, ref: r.cref, title: r.ctitle, status: r.cstatus });
  }
  for (const req of byId.values()) Object.assign(req, requirementCoverage(req.controls.map((c) => c.status)));
  return [...byId.values()];
}

export function summarise(reqs: RequirementCoverage[]) {
  const counts: Record<CoverageStatus, number> = { met: 0, partial: 0, not_met: 0, gap: 0, not_applicable: 0 };
  for (const r of reqs) counts[r.status]++;
  const scored = reqs.filter((r) => r.score != null);
  const score = scored.length ? scored.reduce((s, r) => s + (r.score ?? 0), 0) / scored.length : 0;
  return { total: reqs.length, counts, score: Math.round(score * 1000) / 10 };
}

export function domainBreakdown(reqs: RequirementCoverage[]) {
  const domains = new Map<string, RequirementCoverage[]>();
  for (const r of reqs) domains.set(r.domain, [...(domains.get(r.domain) ?? []), r]);
  return [...domains.entries()].map(([domain, list]) => ({ domain, ...summarise(list) }));
}

export function frameworkSummaries(db: DB) {
  const frameworks = db.prepare('SELECT * FROM frameworks ORDER BY id').all() as Row[];
  return frameworks.map((f) => ({ ...f, ...summarise(frameworkCoverage(db, f.id)) }));
}

/** Assessment result suggested by the current control coverage of a requirement. */
export function suggestedResult(status: CoverageStatus): string {
  switch (status) {
    case 'met':
      return 'compliant';
    case 'partial':
      return 'partial';
    case 'not_applicable':
      return 'not_applicable';
    default:
      return 'non_compliant';
  }
}
