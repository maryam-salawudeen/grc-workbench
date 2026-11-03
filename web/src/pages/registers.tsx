import { vendorTier, type Criticality, type DataAccess } from '../../../shared/scoring.ts';
import { fmtDate, fmtMoney, humanize, type Row } from '../api';
import { CrudPage, opts, type CrudConfig } from '../components/CrudPage';
import { LevelBadge, StatusBadge } from '../components/ui';

const ref = { key: 'ref', label: 'Ref', render: (r: Row) => <span className="mono">{r.ref}</span>, className: 'nowrap' };
const owner = { key: 'owner_name', label: 'Owner', render: (r: Row) => r.owner_name ?? <span className="faint">Unassigned</span> };
const date = (key: string, label: string) => ({ key, label, render: (r: Row) => <span className="nowrap">{fmtDate(r[key])}</span> });
const titled = (key: string, label: string, sub?: (r: Row) => string | null | undefined) => ({
  key,
  label,
  render: (r: Row) => (
    <div>
      <div className="title">{r[key]}</div>
      {sub?.(r) && <div className="small muted">{sub(r)}</div>}
    </div>
  ),
});
const overdueRow = (key: string) => (r: Row) => (r[key] === 'overdue' || r[key] === 'never' ? 'row-overdue' : '');

// ---- Assets -----------------------------------------------------------------

const ASSET_TYPES = ['application', 'data', 'infrastructure', 'identity', 'saas', 'endpoint', 'facility', 'process'];
const CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted'];

const assets: CrudConfig = {
  entity: 'assets',
  title: 'Assets',
  singular: 'Asset',
  description: 'Information assets in scope. Asset value feeds the quantitative risk calculation (AV).',
  searchKeys: ['name', 'type', 'owner_name', 'description'],
  filters: [
    { key: 'type', label: 'Type', options: opts(ASSET_TYPES) },
    { key: 'classification', label: 'Classification', options: opts(CLASSIFICATIONS) },
  ],
  columns: [
    titled('name', 'Asset', (r) => r.description),
    { key: 'type', label: 'Type', render: (r) => humanize(r.type) },
    { key: 'classification', label: 'Classification', render: (r) => <span className={`badge ${r.classification === 'restricted' ? 'critical' : r.classification === 'confidential' ? 'high' : ''}`}>{humanize(r.classification)}</span> },
    { key: 'criticality', label: 'Criticality', render: (r) => `${r.criticality}/5` },
    { key: 'value', label: 'Value', render: (r) => <span className="num nowrap">{fmtMoney(r.value)}</span> },
    { key: 'risk_count', label: 'Open risks' },
    owner,
  ],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, full: true },
    { name: 'type', label: 'Type', type: 'select', options: opts(ASSET_TYPES), required: true },
    { name: 'classification', label: 'Classification', type: 'select', options: opts(CLASSIFICATIONS), required: true },
    { name: 'criticality', label: 'Business criticality', type: 'scale', required: true, help: '5 = critical to operations.' },
    { name: 'value', label: 'Asset value (CAD)', type: 'number', min: 0 },
    { name: 'owner_id', label: 'Asset owner', type: 'person' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  defaults: { type: 'application', classification: 'internal', criticality: 3 },
};

// ---- Controls ---------------------------------------------------------------

export const CONTROL_STATUSES = ['implemented', 'partial', 'planned', 'not_implemented', 'not_applicable'];
const CONTROL_TYPES = ['preventive', 'detective', 'corrective', 'deterrent', 'recovery', 'compensating'];
const CONTROL_NATURES = ['administrative', 'technical', 'physical'];

export const CONTROL_FIELDS: CrudConfig['fields'] = [
  { name: 'title', label: 'Control', type: 'text', required: true, full: true },
  { name: 'domain', label: 'Domain', type: 'text', placeholder: 'e.g. Identity & access' },
  { name: 'owner_id', label: 'Control owner', type: 'person' },
  { name: 'type', label: 'Function', type: 'select', options: opts(CONTROL_TYPES), required: true, help: 'What the control does: prevent, detect, correct, deter, recover or compensate.' },
  { name: 'nature', label: 'Category', type: 'select', options: opts(CONTROL_NATURES), required: true, help: 'Administrative (managerial), technical (logical) or physical.' },
  { name: 'status', label: 'Implementation', type: 'select', options: opts(CONTROL_STATUSES), required: true },
  { name: 'effectiveness', label: 'Effectiveness (1–5)', type: 'scale', help: 'Result of the last test of design and operating effectiveness.' },
  { name: 'last_tested', label: 'Last tested', type: 'date' },
  { name: 'test_frequency_months', label: 'Test every (months)', type: 'number', min: 1, max: 60, required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const controls: CrudConfig = {
  entity: 'controls',
  title: 'Controls',
  singular: 'Control',
  description: 'A common control set. Each control is mapped once and counts towards every framework it satisfies.',
  searchKeys: ['ref', 'title', 'domain', 'owner_name'],
  filters: [
    { key: 'status', label: 'Status', options: opts(CONTROL_STATUSES) },
    { key: 'nature', label: 'Category', options: opts(CONTROL_NATURES) },
    { key: 'type', label: 'Function', options: opts(CONTROL_TYPES) },
  ],
  columns: [
    ref,
    titled('title', 'Control', (r) => r.domain),
    { key: 'type', label: 'Function', render: (r) => `${humanize(r.type)} · ${r.nature}` },
    { key: 'status', label: 'Implementation', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'effectiveness', label: 'Effect.', render: (r) => (r.effectiveness ? `${r.effectiveness}/5` : <span className="faint">—</span>) },
    { key: 'mapping_count', label: 'Mappings' },
    { key: 'risk_count', label: 'Risks' },
    { key: 'next_test', label: 'Next test', render: (r) => (r.test_state === 'never' ? <StatusBadge value="never" label="Not tested" /> : <span className="nowrap">{fmtDate(r.next_test)} {r.test_state === 'overdue' && <StatusBadge value="overdue" />}</span>) },
    owner,
  ],
  fields: CONTROL_FIELDS,
  defaults: { type: 'preventive', nature: 'technical', status: 'planned', test_frequency_months: 12 },
  detailPath: (r) => `/controls/${r.id}`,
};

// ---- Assessments --------------------------------------------------------------

const assessments: CrudConfig = {
  entity: 'assessments',
  title: 'Assessments',
  singular: 'Assessment',
  description: 'Audits and readiness reviews against a framework. Creating one generates a checklist item for every requirement.',
  searchKeys: ['ref', 'title', 'framework_name', 'lead_name', 'scope'],
  filters: [{ key: 'status', label: 'Status', options: opts(['planned', 'in_progress', 'complete']) }],
  columns: [
    ref,
    titled('title', 'Assessment', (r) => r.scope),
    { key: 'framework_name', label: 'Framework' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    {
      key: 'progress',
      label: 'Progress',
      sortValue: (r) => r.assessed_count / r.item_count,
      render: (r) => (
        <div style={{ minWidth: 120 }}>
          <div className="bar">
            <span style={{ width: `${(r.compliant_count / r.item_count) * 100}%`, background: 'var(--low)' }} />
            <span style={{ width: `${(r.partial_count / r.item_count) * 100}%`, background: 'var(--medium)' }} />
            <span style={{ width: `${(r.non_compliant_count / r.item_count) * 100}%`, background: 'var(--critical)' }} />
          </div>
          <div className="small muted" style={{ marginTop: 3 }}>
            {r.assessed_count}/{r.item_count} assessed
          </div>
        </div>
      ),
    },
    { key: 'finding_count', label: 'Findings' },
    { key: 'lead_name', label: 'Lead' },
    date('start_date', 'Start'),
    date('end_date', 'End'),
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, full: true },
    { name: 'framework_id', label: 'Framework', type: 'framework', required: true, help: 'Cannot be changed after creation.' },
    { name: 'status', label: 'Status', type: 'select', options: opts(['planned', 'in_progress', 'complete']), required: true },
    { name: 'lead_id', label: 'Lead assessor', type: 'person' },
    { name: 'start_date', label: 'Start', type: 'date' },
    { name: 'end_date', label: 'End', type: 'date' },
    { name: 'scope', label: 'Scope', type: 'textarea' },
    { name: 'summary', label: 'Summary / conclusion', type: 'textarea' },
  ],
  defaults: { status: 'planned' },
  detailPath: (r) => `/assessments/${r.id}`,
};

// ---- Findings -----------------------------------------------------------------

export const FINDING_FIELDS: CrudConfig['fields'] = [
  { name: 'title', label: 'Finding', type: 'text', required: true, full: true },
  { name: 'severity', label: 'Severity', type: 'select', options: opts(['critical', 'high', 'medium', 'low']), required: true },
  { name: 'status', label: 'Status', type: 'select', options: opts(['open', 'in_progress', 'closed', 'risk_accepted']), required: true },
  { name: 'owner_id', label: 'Remediation owner', type: 'person' },
  { name: 'due_date', label: 'Due date', type: 'date' },
  { name: 'risk_id', label: 'Linked risk', type: 'risk', full: true },
  { name: 'description', label: 'Condition (what was found)', type: 'textarea' },
  { name: 'remediation', label: 'Remediation plan', type: 'textarea' },
];

const findings: CrudConfig = {
  entity: 'findings',
  title: 'Findings',
  singular: 'Finding',
  description: 'Gaps and deficiencies from assessments, tracked to closure.',
  searchKeys: ['ref', 'title', 'owner_name', 'requirement_ref', 'assessment_ref'],
  filters: [
    { key: 'status', label: 'Status', options: [['active', 'Open + in progress'], ...opts(['open', 'in_progress', 'closed', 'risk_accepted'])], test: (r, v) => (v === 'active' ? r.status === 'open' || r.status === 'in_progress' : r.status === v) },
    { key: 'severity', label: 'Severity', options: opts(['critical', 'high', 'medium', 'low']) },
    { key: 'due_state', label: 'Due', options: [['overdue', 'Overdue'], ['due_soon', 'Due in 14 days']] },
  ],
  columns: [
    ref,
    titled('title', 'Finding', (r) => [r.assessment_ref, r.requirement_ref && `${r.framework_code} ${r.requirement_ref}`, r.risk_ref].filter(Boolean).join(' · ')),
    { key: 'severity', label: 'Severity', render: (r) => <LevelBadge level={r.severity} />, sortValue: (r) => ['low', 'medium', 'high', 'critical'].indexOf(r.severity) },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    owner,
    { key: 'due_date', label: 'Due', render: (r) => <span className="nowrap">{fmtDate(r.due_date)} {r.due_state !== 'ok' && <StatusBadge value={r.due_state} />}</span> },
  ],
  fields: FINDING_FIELDS,
  defaults: { severity: 'medium', status: 'open' },
  rowClassName: overdueRow('due_state'),
};

// ---- Policies -----------------------------------------------------------------

const policies: CrudConfig = {
  entity: 'policies',
  title: 'Policies',
  singular: 'Policy',
  description: 'The policy library with approval status and review cycle.',
  searchKeys: ['ref', 'title', 'category', 'owner_name'],
  filters: [
    { key: 'status', label: 'Status', options: opts(['draft', 'in_review', 'approved', 'retired']) },
    { key: 'review_state', label: 'Review', options: [['overdue', 'Overdue'], ['due_soon', 'Due in 30 days'], ['ok', 'On track']] },
  ],
  columns: [
    ref,
    titled('title', 'Policy', (r) => r.category),
    { key: 'version', label: 'Version', render: (r) => (r.version ? `v${r.version}` : '—') },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    owner,
    date('approved_date', 'Approved'),
    { key: 'next_review', label: 'Next review', render: (r) => <span className="nowrap">{fmtDate(r.next_review)} {r.review_state !== 'ok' && <StatusBadge value={r.review_state} />}</span> },
  ],
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, full: true },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'owner_id', label: 'Policy owner', type: 'person' },
    { name: 'version', label: 'Version', type: 'text', placeholder: '1.0' },
    { name: 'status', label: 'Status', type: 'select', options: opts(['draft', 'in_review', 'approved', 'retired']), required: true },
    { name: 'approved_date', label: 'Approved on', type: 'date' },
    { name: 'review_months', label: 'Review cycle (months)', type: 'number', min: 1, max: 60, required: true },
    { name: 'summary', label: 'Summary', type: 'textarea' },
  ],
  defaults: { status: 'draft', review_months: 12, version: '1.0' },
  rowClassName: overdueRow('review_state'),
};

// ---- Vendors ------------------------------------------------------------------

const DATA_ACCESS = ['none', 'internal', 'confidential', 'restricted'];

function TierPreview({ values }: { values: Row }) {
  if (!values.data_access || !values.criticality) return null;
  const t = vendorTier({ data_access: values.data_access as DataAccess, criticality: values.criticality as Criticality, system_access: !!values.system_access });
  return (
    <div className="callout">
      <b>Tier {t.tier}</b> ({t.points} points): reassess every {t.reviewMonths} months. Points: data access 0–3, criticality 0–2, system access +1. Tier 1 ≥ 5, Tier 2 ≥ 3.
    </div>
  );
}

const vendors: CrudConfig = {
  entity: 'vendors',
  title: 'Vendors',
  singular: 'Vendor',
  description: 'Third-party risk. Vendors are tiered by the data they handle, how critical they are and whether they reach our systems.',
  searchKeys: ['name', 'service', 'owner_name', 'certifications'],
  filters: [
    { key: 'tier', label: 'Tier', options: [['1', 'Tier 1'], ['2', 'Tier 2'], ['3', 'Tier 3']] },
    { key: 'assessment_state', label: 'Assessment', options: [['overdue', 'Overdue'], ['never', 'Never assessed'], ['due_soon', 'Due in 30 days']] },
    { key: 'status', label: 'Status', options: opts(['onboarding', 'active', 'offboarding', 'terminated']) },
  ],
  columns: [
    titled('name', 'Vendor', (r) => r.service),
    { key: 'tier', label: 'Tier', render: (r) => <span className={`badge ${r.tier === 1 ? 'critical' : r.tier === 2 ? 'medium' : 'low'}`}>Tier {r.tier}</span> },
    { key: 'data_access', label: 'Data', render: (r) => humanize(r.data_access) },
    { key: 'criticality', label: 'Criticality', render: (r) => humanize(r.criticality) },
    { key: 'certifications', label: 'Assurance', render: (r) => r.certifications || <span className="faint">None on file</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'next_assessment', label: 'Next assessment', render: (r) => (r.assessment_state === 'never' ? <StatusBadge value="never" label="Not assessed" /> : <span className="nowrap">{fmtDate(r.next_assessment)} {r.assessment_state !== 'ok' && <StatusBadge value={r.assessment_state} />}</span>) },
    owner,
  ],
  fields: [
    { name: 'name', label: 'Vendor', type: 'text', required: true },
    { name: 'service', label: 'Service provided', type: 'text' },
    { name: 'data_access', label: 'Highest data classification accessed', type: 'select', options: opts(DATA_ACCESS), required: true },
    { name: 'criticality', label: 'Business criticality', type: 'select', options: opts(['low', 'medium', 'high']), required: true },
    { name: 'system_access', label: 'Has network or system access', type: 'checkbox' },
    { name: 'status', label: 'Status', type: 'select', options: opts(['onboarding', 'active', 'offboarding', 'terminated']), required: true },
    { name: 'certifications', label: 'Assurance on file', type: 'text', placeholder: 'SOC 2 Type II, ISO 27001…' },
    { name: 'owner_id', label: 'Relationship owner', type: 'person' },
    { name: 'last_assessed', label: 'Last assessed', type: 'date' },
    { name: 'contract_end', label: 'Contract end', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  defaults: { data_access: 'internal', criticality: 'medium', system_access: false, status: 'onboarding' },
  rowClassName: overdueRow('assessment_state'),
  formAside: (v) => <TierPreview values={v} />,
};

// ---- People -------------------------------------------------------------------

const people: CrudConfig = {
  entity: 'people',
  title: 'People',
  singular: 'Person',
  description: 'Risk, control, policy and vendor owners.',
  searchKeys: ['name', 'title', 'department', 'email'],
  columns: [titled('name', 'Name', (r) => r.email), { key: 'title', label: 'Title' }, { key: 'department', label: 'Department' }],
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'title', label: 'Job title', type: 'text' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
  ],
  defaults: {},
};

export const Assets = () => <CrudPage cfg={assets} />;
export const Controls = () => <CrudPage cfg={controls} />;
export const Assessments = () => <CrudPage cfg={assessments} />;
export const Findings = () => <CrudPage cfg={findings} />;
export const Policies = () => <CrudPage cfg={policies} />;
export const Vendors = () => <CrudPage cfg={vendors} />;
export const People = () => <CrudPage cfg={people} />;
