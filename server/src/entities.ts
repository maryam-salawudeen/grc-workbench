import { z } from 'zod';
import {
  RISK_APPETITE,
  addMonths,
  dueState,
  quantitative,
  riskLevel,
  riskScore,
  vendorTier,
} from '../../shared/scoring.ts';

export type Row = Record<string, any>;

const text = z.string().trim().max(5000).nullable().optional();
const name = z.string().trim().min(1, 'Required').max(200);
const fk = z.number().int().positive().nullable().optional();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .nullable()
  .optional()
  .or(z.literal('').transform(() => null));
const scale = z.number().int().min(1).max(5);
const money = z.number().min(0).nullable().optional();

export interface Entity {
  /** URL segment and activity-log name. */
  name: string;
  label: string;
  table: string;
  alias: string;
  /** Prefix for human-readable references such as RSK-001. */
  prefix?: string;
  schema: z.AnyZodObject;
  select: string;
  order: string;
  titleField: string;
  decorate?: (row: Row, today: string) => Row;
  beforeWrite?: (data: Row, today: string) => Row;
}

const OWNER_JOIN = (alias: string) => `LEFT JOIN people p ON p.id = ${alias}.owner_id`;

export const ENTITIES: Record<string, Entity> = {
  people: {
    name: 'people',
    label: 'Person',
    table: 'people',
    alias: 'x',
    schema: z.object({ name, title: text, department: text, email: text }),
    select: 'SELECT x.* FROM people x',
    order: 'x.name',
    titleField: 'name',
  },

  assets: {
    name: 'assets',
    label: 'Asset',
    table: 'assets',
    alias: 'x',
    schema: z.object({
      name,
      type: z.enum(['application', 'data', 'infrastructure', 'identity', 'saas', 'endpoint', 'facility', 'process']),
      classification: z.enum(['public', 'internal', 'confidential', 'restricted']),
      criticality: scale,
      value: money,
      owner_id: fk,
      description: text,
    }),
    select: `SELECT x.*, p.name AS owner_name,
      (SELECT COUNT(*) FROM risks r WHERE r.asset_id = x.id AND r.status != 'closed') AS risk_count
      FROM assets x ${OWNER_JOIN('x')}`,
    order: 'x.criticality DESC, x.name',
    titleField: 'name',
  },

  risks: {
    name: 'risks',
    label: 'Risk',
    table: 'risks',
    alias: 'x',
    prefix: 'RSK',
    schema: z.object({
      title: name,
      description: text,
      category: z.enum(['Cyber', 'Data privacy', 'Third party', 'Compliance', 'Operational', 'Business continuity', 'People', 'Fraud']),
      asset_id: fk,
      owner_id: fk,
      threat: text,
      vulnerability: text,
      likelihood: scale,
      impact: scale,
      residual_likelihood: scale.nullable().optional(),
      residual_impact: scale.nullable().optional(),
      treatment: z.enum(['mitigate', 'accept', 'transfer', 'avoid']),
      treatment_plan: text,
      status: z.enum(['open', 'in_treatment', 'accepted', 'closed']),
      due_date: date,
      asset_value: money,
      exposure_factor: z.number().min(0).max(100).nullable().optional(),
      aro: z.number().min(0).max(365).nullable().optional(),
    }),
    select: `SELECT x.*, p.name AS owner_name, a.name AS asset_name,
      (SELECT COUNT(*) FROM risk_controls rc WHERE rc.risk_id = x.id) AS control_count
      FROM risks x ${OWNER_JOIN('x')} LEFT JOIN assets a ON a.id = x.asset_id`,
    order: 'x.id',
    titleField: 'title',
    decorate: decorateRisk,
    beforeWrite: (data, today) => ({ ...data, updated_at: today }),
  },

  controls: {
    name: 'controls',
    label: 'Control',
    table: 'controls',
    alias: 'x',
    prefix: 'CTL',
    schema: z.object({
      title: name,
      description: text,
      domain: text,
      type: z.enum(['preventive', 'detective', 'corrective', 'deterrent', 'recovery', 'compensating']),
      nature: z.enum(['administrative', 'technical', 'physical']),
      owner_id: fk,
      status: z.enum(['implemented', 'partial', 'planned', 'not_implemented', 'not_applicable']),
      effectiveness: scale.nullable().optional(),
      last_tested: date,
      test_frequency_months: z.number().int().min(1).max(60),
    }),
    select: `SELECT x.*, p.name AS owner_name,
      (SELECT COUNT(*) FROM control_requirements cr WHERE cr.control_id = x.id) AS mapping_count,
      (SELECT COUNT(*) FROM risk_controls rc WHERE rc.control_id = x.id) AS risk_count
      FROM controls x ${OWNER_JOIN('x')}`,
    order: 'x.id',
    titleField: 'title',
    decorate: (row, today) => {
      const next_test = row.last_tested ? addMonths(row.last_tested, row.test_frequency_months) : null;
      const testState = row.status === 'not_applicable' ? 'none' : row.last_tested ? dueState(next_test, today) : 'never';
      return { ...row, next_test, test_state: testState };
    },
  },

  assessments: {
    name: 'assessments',
    label: 'Assessment',
    table: 'assessments',
    alias: 'x',
    prefix: 'ASM',
    schema: z.object({
      title: name,
      framework_id: z.number().int().positive(),
      scope: text,
      status: z.enum(['planned', 'in_progress', 'complete']),
      lead_id: fk,
      start_date: date,
      end_date: date,
      summary: text,
    }),
    select: `SELECT x.*, f.code AS framework_code, f.name AS framework_name, p.name AS lead_name,
      (SELECT COUNT(*) FROM assessment_items i WHERE i.assessment_id = x.id) AS item_count,
      (SELECT COUNT(*) FROM assessment_items i WHERE i.assessment_id = x.id AND i.result != 'not_assessed') AS assessed_count,
      (SELECT COUNT(*) FROM assessment_items i WHERE i.assessment_id = x.id AND i.result = 'compliant') AS compliant_count,
      (SELECT COUNT(*) FROM assessment_items i WHERE i.assessment_id = x.id AND i.result = 'partial') AS partial_count,
      (SELECT COUNT(*) FROM assessment_items i WHERE i.assessment_id = x.id AND i.result = 'non_compliant') AS non_compliant_count,
      (SELECT COUNT(*) FROM findings fd WHERE fd.assessment_id = x.id) AS finding_count
      FROM assessments x JOIN frameworks f ON f.id = x.framework_id LEFT JOIN people p ON p.id = x.lead_id`,
    order: 'x.start_date DESC',
    titleField: 'title',
  },

  findings: {
    name: 'findings',
    label: 'Finding',
    table: 'findings',
    alias: 'x',
    prefix: 'FND',
    schema: z.object({
      title: name,
      description: text,
      assessment_id: fk,
      requirement_id: fk,
      risk_id: fk,
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      status: z.enum(['open', 'in_progress', 'closed', 'risk_accepted']),
      owner_id: fk,
      due_date: date,
      remediation: text,
      closed_date: date,
    }),
    select: `SELECT x.*, p.name AS owner_name, a.ref AS assessment_ref, a.title AS assessment_title,
      q.ref AS requirement_ref, q.title AS requirement_title, f.code AS framework_code, r.ref AS risk_ref
      FROM findings x ${OWNER_JOIN('x')}
      LEFT JOIN assessments a ON a.id = x.assessment_id
      LEFT JOIN requirements q ON q.id = x.requirement_id
      LEFT JOIN frameworks f ON f.id = q.framework_id
      LEFT JOIN risks r ON r.id = x.risk_id`,
    order: `CASE x.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, x.due_date`,
    titleField: 'title',
    decorate: (row, today) => ({
      ...row,
      due_state: isOpenFinding(row.status) ? dueState(row.due_date, today, 14) : 'none',
    }),
    beforeWrite: (data, today) => {
      if (data.status === 'closed' && !data.closed_date) return { ...data, closed_date: today };
      if (data.status && data.status !== 'closed') return { ...data, closed_date: null };
      return data;
    },
  },

  policies: {
    name: 'policies',
    label: 'Policy',
    table: 'policies',
    alias: 'x',
    prefix: 'POL',
    schema: z.object({
      title: name,
      category: text,
      owner_id: fk,
      version: text,
      status: z.enum(['draft', 'in_review', 'approved', 'retired']),
      approved_date: date,
      review_months: z.number().int().min(1).max(60),
      summary: text,
    }),
    select: `SELECT x.*, p.name AS owner_name FROM policies x ${OWNER_JOIN('x')}`,
    order: 'x.id',
    titleField: 'title',
    decorate: (row, today) => {
      const next_review = row.approved_date && row.status !== 'retired' ? addMonths(row.approved_date, row.review_months) : null;
      return { ...row, next_review, review_state: dueState(next_review, today) };
    },
  },

  vendors: {
    name: 'vendors',
    label: 'Vendor',
    table: 'vendors',
    alias: 'x',
    schema: z.object({
      name,
      service: text,
      owner_id: fk,
      data_access: z.enum(['none', 'internal', 'confidential', 'restricted']),
      criticality: z.enum(['low', 'medium', 'high']),
      system_access: z.boolean(),
      certifications: text,
      last_assessed: date,
      contract_end: date,
      status: z.enum(['onboarding', 'active', 'offboarding', 'terminated']),
      notes: text,
    }),
    select: `SELECT x.*, p.name AS owner_name FROM vendors x ${OWNER_JOIN('x')}`,
    order: 'x.name',
    titleField: 'name',
    decorate: (row, today) => {
      const { tier, points, reviewMonths } = vendorTier(row as any);
      const next_assessment = row.last_assessed ? addMonths(row.last_assessed, reviewMonths) : null;
      const inScope = row.status !== 'terminated';
      const assessment_state = !inScope ? 'none' : row.last_assessed ? dueState(next_assessment, today) : 'never';
      return { ...row, system_access: !!row.system_access, tier, tier_points: points, review_months: reviewMonths, next_assessment, assessment_state };
    },
  },
};

export function isOpenFinding(status: string) {
  return status === 'open' || status === 'in_progress';
}

export function decorateRisk(row: Row): Row {
  const inherent = riskScore(row.likelihood, row.impact);
  const hasResidual = row.residual_likelihood != null && row.residual_impact != null;
  const residual = hasResidual ? riskScore(row.residual_likelihood, row.residual_impact) : inherent;
  const quant =
    row.asset_value != null && row.exposure_factor != null && row.aro != null
      ? quantitative(row.asset_value, row.exposure_factor, row.aro)
      : { sle: null, ale: null };
  return {
    ...row,
    inherent_score: inherent,
    inherent_level: riskLevel(inherent),
    residual_score: residual,
    residual_level: riskLevel(residual),
    residual_assessed: hasResidual,
    above_appetite: row.status !== 'closed' && residual > RISK_APPETITE,
    ...quant,
  };
}
