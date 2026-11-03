import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db-node.ts';
import { createApp } from '../src/app.ts';
import { seed } from '../src/seed.ts';

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  const db = openDb(':memory:');
  seed(db);
  app = createApp(db);
});

const json = (method: string, body: unknown) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('seeded register is decorated with scores', async () => {
  const risks = await (await app.request('/api/risks')).json();
  assert.equal(risks.length, 15);
  const ransomware = risks.find((r: any) => r.ref === 'RSK-001');
  assert.equal(ransomware.inherent_score, 20);
  assert.equal(ransomware.inherent_level, 'critical');
  assert.equal(ransomware.residual_score, 8);
  assert.equal(ransomware.ale, 160_000);
  assert.equal(ransomware.owner_name, 'Amara Okafor');
});

test('creating a risk validates input and assigns a reference', async () => {
  const bad = await app.request('/api/risks', json('POST', { title: '', likelihood: 9 }));
  assert.equal(bad.status, 400);

  const res = await app.request('/api/risks', json('POST', { title: 'Test risk', category: 'Cyber', likelihood: 3, impact: 4, treatment: 'mitigate', status: 'open' }));
  assert.equal(res.status, 201);
  const risk = await res.json();
  assert.equal(risk.ref, 'RSK-016');
  assert.equal(risk.residual_score, 12);
  assert.equal(risk.above_appetite, true);

  const updated = await (await app.request(`/api/risks/${risk.id}`, json('PUT', { residual_likelihood: 1, residual_impact: 4 }))).json();
  assert.equal(updated.residual_score, 4);
  assert.equal(updated.above_appetite, false);
});

test('framework compliance reflects control status changes', async () => {
  const frameworks = await (await app.request('/api/frameworks')).json();
  const iso = frameworks.find((f: any) => f.code === 'ISO-27001');
  assert.equal(iso.total, 93);
  const before = iso.score;

  const controls = await (await app.request('/api/controls')).json();
  const dlp = controls.find((c: any) => c.title === 'Data loss prevention');
  await app.request(`/api/controls/${dlp.id}`, json('PUT', { status: 'implemented' }));

  const after = (await (await app.request(`/api/frameworks/${iso.id}`)).json()).score;
  assert.ok(after > before, `expected ${after} > ${before}`);
});

test('new assessments get one item per requirement and can be pre-filled', async () => {
  const fw = (await (await app.request('/api/frameworks')).json()).find((f: any) => f.code === 'SOC2');
  const created = await (await app.request('/api/assessments', json('POST', { title: 'SOC 2 Type II', framework_id: fw.id, status: 'planned' }))).json();
  assert.equal(created.item_count, 33);
  assert.equal(created.assessed_count, 0);

  const { updated } = await (await app.request(`/api/assessments/${created.id}/prefill`, { method: 'POST' })).json();
  assert.equal(updated, 33);
  const items = await (await app.request(`/api/assessments/${created.id}/items`)).json();
  assert.ok(items.every((i: any) => i.result !== 'not_assessed'));
});

test('closing a finding stamps the closed date', async () => {
  const findings = await (await app.request('/api/findings')).json();
  const open = findings.find((f: any) => f.status === 'open');
  const closed = await (await app.request(`/api/findings/${open.id}`, json('PUT', { status: 'closed' }))).json();
  assert.match(closed.closed_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(closed.due_state, 'none');
});

test('dashboard aggregates every module', async () => {
  const d = await (await app.request('/api/dashboard')).json();
  assert.equal(d.frameworks.length, 3);
  assert.ok(d.riskCounts.aboveAppetite > 0);
  assert.ok(d.findings.overdue >= 2);
  assert.ok(d.upcoming.length > 0);
});

test('unknown resources return 404', async () => {
  assert.equal((await app.request('/api/nope')).status, 404);
  assert.equal((await app.request('/api/risks/999')).status, 404);
});
