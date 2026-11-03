import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyse, assertPublicHost, checkSite, grade, isPrivateAddress, normaliseUrl, SiteCheckError, type Observations } from '../src/sitecheck.ts';
import { openDb } from '../src/db-node.ts';
import { createApp } from '../src/app.ts';
import { seed } from '../src/seed.ts';

test('addresses are normalised and unsafe input refused', () => {
  assert.equal(normaliseUrl('example.com').toString(), 'https://example.com/');
  assert.equal(normaliseUrl('http://example.com/shop').pathname, '/shop');
  for (const bad of ['', 'ftp://example.com', 'https://user:pw@example.com', 'https://example.com:8080', 'intranet', 'not a url at all']) {
    assert.throws(() => normaliseUrl(bad), SiteCheckError, bad);
  }
});

test('private and internal addresses are recognised', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1']) {
    assert.ok(isPrivateAddress(ip), ip);
  }
  for (const ip of ['8.8.8.8', '93.184.215.14', '172.32.0.1', '2606:4700::1111']) assert.ok(!isPrivateAddress(ip), ip);
});

test('local hosts are refused before any request is made', async () => {
  for (const host of ['localhost', 'app.localhost', 'printer.local', '127.0.0.1', '10.0.0.5', '[::1]']) {
    await assert.rejects(assertPublicHost(host), SiteCheckError, host);
  }
});

const strong: Observations = {
  url: 'https://good.example/',
  host: 'good.example',
  https: {
    ok: true,
    status: 200,
    headers: {
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'content-security-policy': "default-src 'self'; frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=()',
      server: 'nginx',
    },
    cookies: ['session=abc; Path=/; Secure; HttpOnly; SameSite=Lax'],
  },
  http: { servesHttp: true, redirectsToHttps: true },
  cert: { valid: true, validTo: '2027-06-01', daysLeft: 200, issuer: 'Example CA' },
  securityTxt: true,
};

test('a well-configured site passes every check and grades A', () => {
  const items = analyse(strong);
  assert.equal(items.length, 12);
  assert.deepEqual(items.filter((i) => i.status !== 'pass').map((i) => i.id), []);
  assert.deepEqual(grade(items), { score: 100, letter: 'A' });
  for (const i of items) assert.ok(i.explain && i.why && i.fix && i.analyst && i.refs.length, i.id);
});

test('only inline scripts weaken a CSP, not inline styles', () => {
  const withCsp = (csp: string) => analyse({ ...strong, https: { ...strong.https, headers: { ...strong.https.headers, 'content-security-policy': csp } } }).find((i) => i.id === 'csp')!.status;
  assert.equal(withCsp("default-src 'self'; style-src 'self' 'unsafe-inline'"), 'pass');
  assert.equal(withCsp("default-src 'self'; script-src 'self' 'unsafe-inline'"), 'warn');
  assert.equal(withCsp("default-src 'self' 'unsafe-inline'"), 'warn');
});

test('a weak site gets explained warnings and a lower grade', () => {
  const weak: Observations = {
    ...strong,
    https: { ok: true, status: 200, headers: { server: 'Apache/2.4.29', 'x-powered-by': 'PHP/7.2' }, cookies: ['PHPSESSID=1; Path=/'] },
    http: { servesHttp: true, redirectsToHttps: false },
    cert: { valid: true, validTo: '2026-11-10', daysLeft: 7, issuer: 'Example CA' },
    securityTxt: false,
  };
  const items = analyse(weak);
  const byId = Object.fromEntries(items.map((i) => [i.id, i.status]));
  assert.equal(byId.hsts, 'warn');
  assert.equal(byId.csp, 'warn');
  assert.equal(byId.clickjacking, 'warn');
  assert.equal(byId.cookies, 'warn');
  assert.equal(byId.disclosure, 'warn');
  assert.equal(byId['http-redirect'], 'warn');
  assert.equal(byId.certificate, 'warn');
  assert.ok(grade(items).score < 50);

  const down = analyse({ ...weak, https: { ok: false, headers: {}, cookies: [], error: 'connect ECONNREFUSED' }, cert: null });
  assert.equal(down.find((i) => i.id === 'https')!.status, 'fail');
  assert.equal(grade(down).letter, 'F');
});

test('the API requires permission and refuses internal targets', async () => {
  const db = openDb(':memory:');
  seed(db);
  const app = createApp(db, { runSiteCheck: checkSite });
  const post = (body: unknown) => app.request('/api/site-checks', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await post({ url: 'example.com' })).status, 400);
  const local = await post({ url: 'http://localhost:8787', permission: true });
  assert.equal(local.status, 400);
  assert.match((await local.json()).error, /ports|Local/);
  const internal = await post({ url: 'https://10.0.0.5', permission: true });
  assert.equal(internal.status, 400);
});

test('problems from a check become findings mapped to ISO 27001', async () => {
  const db = openDb(':memory:');
  seed(db);
  const app = createApp(db);
  const items = analyse({ ...strong, https: { ...strong.https, headers: {} } });
  const id = Number(db.prepare('INSERT INTO site_checks (url, host, score, grade, items) VALUES (?, ?, ?, ?, ?)').run('https://good.example/', 'good.example', 50, 'D', JSON.stringify(items)).lastInsertRowid);
  const res = await app.request(`/api/site-checks/${id}/findings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ids: ['hsts', 'csp', 'https'] }) });
  assert.equal((await res.json()).created, 2, 'passing checks are skipped');
  const findings = await (await app.request('/api/findings')).json();
  const hsts = findings.find((f: any) => f.title.startsWith('good.example: hsts'));
  assert.equal(hsts.requirement_ref, 'A.8.24');
  assert.equal(hsts.severity, 'medium');
  assert.match(hsts.ref, /^FND-\d{3}$/);
});
