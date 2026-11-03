import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRAMEWORKS } from '../src/frameworks.ts';
import { CONTROL_TITLES } from '../src/seed.ts';
import { REQUIREMENT_EXPLAINED } from '../../shared/explain/requirements.ts';
import { CONTROL_EXPLAINED } from '../../shared/explain/controls.ts';
import { FRAMEWORK_EXPLAINED } from '../../shared/explain/frameworks.ts';

const allText = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allText) : v && typeof v === 'object' ? Object.values(v).flatMap(allText) : []);

test('every framework requirement has a meaning and evidence', () => {
  const refs = FRAMEWORKS.flatMap((f) => f.requirements.map((r) => r[0]));
  assert.equal(refs.length, 148);
  for (const ref of refs) {
    const e = REQUIREMENT_EXPLAINED[ref];
    assert.ok(e && e[0] && e[1], `${ref} needs an explanation`);
  }
  assert.deepEqual(Object.keys(REQUIREMENT_EXPLAINED).filter((r) => !refs.includes(r)), [], 'no explanations for unknown refs');
});

test('every control and framework domain is explained', () => {
  for (const t of CONTROL_TITLES) assert.ok(CONTROL_EXPLAINED[t]?.what, `control "${t}"`);
  for (const f of FRAMEWORKS) {
    const fe = FRAMEWORK_EXPLAINED[f.code];
    assert.ok(fe, f.code);
    for (const d of new Set(f.requirements.map((r) => r[2]))) assert.ok(fe.domains[d], `${f.code} domain "${d}"`);
  }
});

test('explanations follow the house style: no em or en dashes', () => {
  for (const t of allText([REQUIREMENT_EXPLAINED, CONTROL_EXPLAINED, FRAMEWORK_EXPLAINED])) assert.ok(!/[—–]/.test(t), t.slice(0, 60));
});
