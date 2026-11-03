import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABS, scoreStep, shuffledOrder, type Answer, type Step } from '../../shared/labs/index.ts';

/** The best possible answer for a step. */
function perfect(step: Step): { answer: Answer; ticked?: number[] } {
  switch (step.type) {
    case 'single':
      return { answer: step.options.findIndex((o) => o.correct) };
    case 'multi':
      return { answer: step.options.flatMap((o, i) => (o.correct ? [i] : [])) };
    case 'number':
      return { answer: step.answer };
    case 'match':
      return { answer: Object.fromEntries(step.items.map((it, i) => [i, it.answer])) };
    case 'order':
      return { answer: step.items.map((_, i) => i) };
    case 'write':
      return { answer: step.model.join(' '), ticked: step.rubric.map((_, i) => i) };
  }
}

const allText = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allText) : v && typeof v === 'object' ? Object.values(v).flatMap(allText) : []);

test('there are 20+ labs with unique ids covering all eight CISSP domains', () => {
  assert.ok(LABS.length >= 20, `${LABS.length} labs`);
  assert.equal(new Set(LABS.map((l) => l.id)).size, LABS.length);
  assert.deepEqual([...new Set(LABS.map((l) => l.domain))].sort(), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const lv of ['Easy', 'Medium', 'Hard']) assert.ok(LABS.filter((l) => l.level === lv).length >= 5, `at least 5 ${lv} labs`);
});

test('every step has a valid answer key', () => {
  for (const lab of LABS) {
    assert.ok(lab.steps.length >= 3, `${lab.id}: at least 3 steps`);
    assert.ok(lab.message.length && lab.debrief.work.length && lab.debrief.examTip, `${lab.id}: message and debrief`);
    lab.steps.forEach((s, i) => {
      const where = `${lab.id} step ${i + 1}`;
      if (s.type === 'single') assert.equal(s.options.filter((o) => o.correct).length, 1, `${where}: exactly one correct option`);
      if (s.type === 'multi') assert.ok(s.options.some((o) => o.correct) && s.options.some((o) => !o.correct), `${where}: right and wrong options`);
      if (s.type === 'single' || s.type === 'multi') for (const o of s.options) assert.ok(o.why, `${where}: every option explains why`);
      if (s.type === 'match') for (const it of s.items) assert.ok(s.choices.includes(it.answer), `${where}: "${it.answer}" is a choice`);
      if (s.type === 'order') assert.ok(s.items.length >= 3, `${where}: order needs 3+ items`);
      if (s.type === 'write') assert.ok(s.rubric.length >= 3 && s.model.length, `${where}: rubric and model`);
      if (s.type === 'number') assert.ok(Number.isFinite(s.answer) && s.working, `${where}: answer and working`);
    });
  }
});

test('a perfect answer scores 100% on every step', () => {
  for (const lab of LABS) {
    lab.steps.forEach((s, i) => {
      const { answer, ticked } = perfect(s);
      assert.equal(scoreStep(s, answer, ticked), 1, `${lab.id} step ${i + 1}`);
    });
  }
});

test('wrong answers lose marks', () => {
  for (const lab of LABS) {
    for (const s of lab.steps) {
      if (s.type === 'single') assert.equal(scoreStep(s, s.options.findIndex((o) => !o.correct)), 0);
      if (s.type === 'multi') assert.ok(scoreStep(s, s.options.map((_, i) => i)) < 1, `${lab.id}: ticking everything is not full marks`);
      if (s.type === 'number') assert.equal(scoreStep(s, s.answer + Math.abs(s.answer) + 1000), 0);
      if (s.type === 'order') assert.ok(scoreStep(s, s.items.map((_, i) => i).reverse()) === 0);
    }
  }
});

test('order steps start shuffled, the same way each visit', () => {
  for (const n of [3, 5, 7]) {
    const a = shuffledOrder(n, `x-${n}`);
    assert.deepEqual([...a].sort(), [...Array(n).keys()]);
    assert.notDeepEqual(a, [...Array(n).keys()]);
    assert.deepEqual(a, shuffledOrder(n, `x-${n}`));
  }
});

test('lab text follows the house style: no em or en dashes', () => {
  for (const lab of LABS) {
    for (const t of allText(lab)) assert.ok(!/[—–]/.test(t), `${lab.id}: dash in "${t.slice(0, 60)}"`);
  }
});
