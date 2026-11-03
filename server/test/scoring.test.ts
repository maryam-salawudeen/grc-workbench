import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, dueState, quantitative, requirementCoverage, riskLevel, riskScore, safeguardValue, vendorTier } from '../../shared/scoring.ts';

test('risk levels follow the 5x5 matrix bands', () => {
  assert.equal(riskLevel(riskScore(1, 4)), 'low');
  assert.equal(riskLevel(riskScore(3, 3)), 'medium');
  assert.equal(riskLevel(riskScore(2, 5)), 'high');
  assert.equal(riskLevel(riskScore(4, 5)), 'critical');
});

test('quantitative risk: SLE = AV x EF, ALE = SLE x ARO', () => {
  const { sle, ale } = quantitative(200_000, 25, 0.5);
  assert.equal(sle, 50_000);
  assert.equal(ale, 25_000);
  assert.equal(safeguardValue(25_000, 5_000, 8_000), 12_000);
});

test('requirement coverage from mapped control status', () => {
  assert.deepEqual(requirementCoverage([]), { score: 0, status: 'gap' });
  assert.deepEqual(requirementCoverage(['implemented', 'implemented']), { score: 1, status: 'met' });
  assert.deepEqual(requirementCoverage(['implemented', 'planned']), { score: 0.5, status: 'partial' });
  assert.deepEqual(requirementCoverage(['planned', 'not_implemented']), { score: 0, status: 'not_met' });
  assert.deepEqual(requirementCoverage(['not_applicable']), { score: null, status: 'not_applicable' });
  assert.deepEqual(requirementCoverage(['implemented', 'not_applicable']), { score: 1, status: 'met' });
});

test('vendor tiering', () => {
  assert.equal(vendorTier({ data_access: 'restricted', criticality: 'high', system_access: true }).tier, 1);
  assert.equal(vendorTier({ data_access: 'confidential', criticality: 'low', system_access: true }).tier, 2);
  assert.equal(vendorTier({ data_access: 'none', criticality: 'medium', system_access: false }).tier, 3);
});

test('dates', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2026-11-02', 12), '2027-11-02');
  assert.equal(dueState('2026-11-01', '2026-11-02'), 'overdue');
  assert.equal(dueState('2026-11-20', '2026-11-02'), 'due_soon');
  assert.equal(dueState('2027-03-01', '2026-11-02'), 'ok');
  assert.equal(dueState(null, '2026-11-02'), 'none');
});
