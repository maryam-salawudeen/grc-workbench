import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb } from '../src/db-node.ts';
import type { DB } from '../src/db.ts';
import { createApp } from '../src/app.ts';
import { normalise, seedScenario, workspaceRoutes } from '../src/practice.ts';
import { nodeWorkspaces } from '../src/workspaces-node.ts';
import { CONTROL_TITLES } from '../src/seed.ts';
import { SCENARIOS, type Scenario } from '../src/scenarios.ts';

const json = (method: string, body: unknown) => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

function scenarioApp(s: Scenario) {
  const db = openDb(':memory:');
  seedScenario(db, s);
  return { db, app: createApp(db) };
}

/** Enter the model answer through the API, the way a learner would. */
async function enterModelAnswer(db: DB, app: ReturnType<typeof createApp>, s: Scenario) {
  const assets = await (await app.request('/api/assets')).json();
  const controls = db.prepare('SELECT id, title FROM controls').all() as { id: number; title: string }[];
  for (const m of s.risks) {
    const res = await app.request(
      '/api/risks',
      json('POST', {
        title: m.title,
        category: m.category,
        asset_id: assets.find((a: any) => a.name === m.asset).id,
        owner_id: 1,
        likelihood: m.likelihood,
        impact: m.impact,
        residual_likelihood: m.residual_likelihood,
        residual_impact: m.residual_impact,
        treatment: m.treatment,
        status: 'open',
        ...(m.quant ?? {}),
      }),
    );
    assert.equal(res.status, 201, `${s.id}/${m.key}: ${await res.clone().text()}`);
    const risk = await res.json();
    await app.request(`/api/risks/${risk.id}/controls`, json('PUT', { ids: m.controls.map((t) => controls.find((c) => c.title === t)!.id) }));
  }
}

test('scenario data is internally consistent', () => {
  assert.equal(SCENARIOS.length, 5);
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, 5);
  for (const s of SCENARIOS) {
    const assetNames = s.assets.map((a) => a[0]);
    for (const title of Object.keys(s.controls)) assert.ok(CONTROL_TITLES.has(title), `${s.id}: unknown control ${title}`);
    for (const [, , owner] of s.vendors) assert.ok(owner < s.people.length, `${s.id}: vendor owner index`);
    for (const a of s.assets) assert.ok(a[5] < s.people.length, `${s.id}: asset owner index`);
    for (const m of s.risks) {
      assert.ok(assetNames.includes(m.asset), `${s.id}/${m.key}: asset ${m.asset}`);
      for (const t of m.controls) assert.ok(CONTROL_TITLES.has(t), `${s.id}/${m.key}: control ${t}`);
      for (const k of m.keywords) assert.equal(k, k.toLowerCase(), `${s.id}/${m.key}: keyword case`);
      assert.ok(m.residual_likelihood * m.residual_impact <= m.likelihood * m.impact, `${s.id}/${m.key}: residual above inherent`);
      assert.ok(m.keywords.some((k) => normalise(m.title).includes(normalise(k))), `${s.id}/${m.key}: title matches none of its keywords`);
    }
  }
});

test('an empty register scores zero', async () => {
  const { app } = scenarioApp(SCENARIOS[0]);
  const review = await (await app.request('/api/practice/review')).json();
  assert.equal(review.score, 0);
  assert.equal(review.breakdown.found, 0);
});

for (const s of SCENARIOS) {
  test(`model answer for ${s.id} scores 100 and matches every risk`, async () => {
    const { db, app } = scenarioApp(s);
    await enterModelAnswer(db, app, s);
    const review = await (await app.request('/api/practice/review')).json();
    for (const r of review.results) assert.equal(r.matched?.title, r.title, `${s.id}/${r.key} matched ${r.matched?.title}`);
    assert.equal(review.score, 100);
    assert.equal(review.extras.length, 0);
    assert.ok(review.checks.every((c: any) => c.ok), JSON.stringify(review.checks.filter((c: any) => !c.ok)));
  });
}

test('partial answers earn partial credit, and manual matching overrides keywords', async () => {
  const s = SCENARIOS[0];
  const { app } = scenarioApp(s);
  const created = await (
    await app.request('/api/risks', json('POST', { title: 'Staff click bad links', category: 'Cyber', likelihood: 3, impact: 3, treatment: 'accept', status: 'open' }))
  ).json();
  let review = await (await app.request('/api/practice/review')).json();
  assert.equal(review.breakdown.found, 0);
  assert.equal(review.extras.length, 1);

  await app.request('/api/practice/matches', json('PUT', { model_key: 'phishing', risk_id: created.id }));
  review = await (await app.request('/api/practice/review')).json();
  const phishing = review.results.find((r: any) => r.key === 'phishing');
  assert.equal(phishing.matched.id, created.id);
  assert.equal(phishing.scores.treatment, 0);
  assert.ok(phishing.scores.inherent > 0 && phishing.scores.inherent < 1);
  assert.ok(review.score > 0 && review.score < 20);
});

test('workspaces switch, keep separate data and reset', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'grc-'));
  try {
    const ws = nodeWorkspaces(join(dir, 'demo.db'), join(dir, 'practice'));
    const app = createApp(ws.db, { extend: workspaceRoutes(ws) });
    assert.equal((await (await app.request('/api/workspace')).json()).org_name, 'Maple Ridge Credit Union');

    await app.request('/api/workspaces/store/activate', { method: 'POST' });
    const workspace = await (await app.request('/api/workspace')).json();
    assert.equal(workspace.org_name, 'Northline Outfitters');
    assert.equal(workspace.scenario.risks, undefined, 'model answer must not leak to the brief');
    assert.equal((await (await app.request('/api/risks')).json()).length, 0);
    assert.equal((await (await app.request('/api/assets')).json()).length, 5);

    await app.request('/api/risks', json('POST', { title: 'x', category: 'Cyber', likelihood: 1, impact: 1, treatment: 'accept', status: 'open' }));
    assert.equal((await (await app.request('/api/risks')).json()).length, 1);
    await app.request('/api/workspaces/store/reset', { method: 'POST' });
    assert.equal((await (await app.request('/api/risks')).json()).length, 0);

    await app.request('/api/workspaces/demo/activate', { method: 'POST' });
    assert.equal((await (await app.request('/api/risks')).json()).length, 15);
    const list = await (await app.request('/api/workspaces')).json();
    assert.equal(list.length, 6);
    assert.equal(list.find((w: any) => w.id === 'store').started, true);

    // The active workspace survives a restart.
    await app.request('/api/workspaces/clinic/activate', { method: 'POST' });
    const ws2 = nodeWorkspaces(join(dir, 'demo.db'), join(dir, 'practice'));
    assert.equal(ws2.activeId(), 'clinic');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
