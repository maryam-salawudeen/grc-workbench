// Scoring rules shared by the API and the UI, so a score previewed in a form
// is exactly the score the server stores and reports.

export type Level = 'low' | 'medium' | 'high' | 'critical';
export const LEVELS: Level[] = ['low', 'medium', 'high', 'critical'];

/** Highest residual score the organisation is willing to carry without escalation. */
export const RISK_APPETITE = 9;

export const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
export const IMPACT_LABELS = ['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'];

/** Qualitative risk score on a 5 x 5 matrix: likelihood x impact, 1 to 25. */
export function riskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function riskLevel(score: number): Level {
  if (score >= 20) return 'critical';
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * Quantitative risk (CISSP): SLE = AV x EF, ALE = SLE x ARO.
 * Exposure factor is a percentage (0 to 100).
 */
export function quantitative(assetValue: number, exposureFactorPct: number, aro: number) {
  const sle = assetValue * (exposureFactorPct / 100);
  return { sle, ale: sle * aro };
}

/** Value of a safeguard to the organisation: ALE before - ALE after - annual cost of the safeguard. */
export function safeguardValue(aleBefore: number, aleAfter: number, annualCost: number): number {
  return aleBefore - aleAfter - annualCost;
}

// ---- Compliance -----------------------------------------------------------

export type ControlStatus = 'implemented' | 'partial' | 'planned' | 'not_implemented' | 'not_applicable';
export type CoverageStatus = 'met' | 'partial' | 'not_met' | 'gap' | 'not_applicable';

const CONTROL_WEIGHT: Record<Exclude<ControlStatus, 'not_applicable'>, number> = {
  implemented: 1,
  partial: 0.5,
  planned: 0,
  not_implemented: 0,
};

/**
 * Coverage of one framework requirement from the status of the controls mapped to it.
 * No mapped controls is a gap; all mapped controls N/A makes the requirement N/A.
 */
export function requirementCoverage(statuses: ControlStatus[]): { score: number | null; status: CoverageStatus } {
  if (statuses.length === 0) return { score: 0, status: 'gap' };
  const applicable = statuses.filter((s) => s !== 'not_applicable') as Exclude<ControlStatus, 'not_applicable'>[];
  if (applicable.length === 0) return { score: null, status: 'not_applicable' };
  const score = applicable.reduce((sum, s) => sum + CONTROL_WEIGHT[s], 0) / applicable.length;
  return { score, status: score === 1 ? 'met' : score > 0 ? 'partial' : 'not_met' };
}

// ---- Third-party risk -----------------------------------------------------

export type DataAccess = 'none' | 'internal' | 'confidential' | 'restricted';
export type Criticality = 'low' | 'medium' | 'high';

const DATA_POINTS: Record<DataAccess, number> = { none: 0, internal: 1, confidential: 2, restricted: 3 };
const CRIT_POINTS: Record<Criticality, number> = { low: 0, medium: 1, high: 2 };
const REVIEW_MONTHS = { 1: 12, 2: 24, 3: 36 } as const;

/** Inherent vendor tier from the data it touches, how critical the service is and whether it reaches our systems. */
export function vendorTier(v: { data_access: DataAccess; criticality: Criticality; system_access: boolean | number }) {
  const points = DATA_POINTS[v.data_access] + CRIT_POINTS[v.criticality] + (v.system_access ? 1 : 0);
  const tier: 1 | 2 | 3 = points >= 5 ? 1 : points >= 3 ? 2 : 3;
  return { tier, points, reviewMonths: REVIEW_MONTHS[tier] };
}

// ---- Dates ----------------------------------------------------------------

/** Today's date in local time as YYYY-MM-DD. */
export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function addMonths(date: string, months: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** 'overdue' when past, 'due_soon' within `soonDays`, otherwise 'ok'. */
export function dueState(due: string | null | undefined, today: string, soonDays = 30): 'overdue' | 'due_soon' | 'ok' | 'none' {
  if (!due) return 'none';
  const days = daysBetween(today, due);
  if (days < 0) return 'overdue';
  if (days <= soonDays) return 'due_soon';
  return 'ok';
}
