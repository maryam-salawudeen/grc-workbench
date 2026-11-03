import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, downloadCsv, fmtDate, fmtMoney, humanize, useApi, type Row } from '../api';
import { useLookups } from '../lookups';
import { DataTable, matches, type Column } from '../components/DataTable';
import { EntityForm } from '../components/EntityForm';
import { HeatMap, cellOf, type HeatMode } from '../components/HeatMap';
import { Icon } from '../components/icons';
import { Loading, Modal, PageHeader, Score, StatusBadge, toast } from '../components/ui';
import { RISK_CATEGORIES, RISK_DEFAULTS, RISK_FIELDS, RISK_STATUSES, RiskPreview } from './riskFields';
import { LEVELS } from '../../../shared/scoring.ts';

export const RISK_COLUMNS: Column[] = [
  { key: 'ref', label: 'Ref', render: (r) => <span className="mono">{r.ref}</span>, className: 'nowrap' },
  {
    key: 'title',
    label: 'Risk',
    render: (r) => (
      <div>
        <div className="title">{r.title}</div>
        <div className="small muted">
          {r.category}
          {r.asset_name ? ` · ${r.asset_name}` : ''}
        </div>
      </div>
    ),
  },
  { key: 'inherent_score', label: 'Inherent', render: (r) => <Score value={r.inherent_score} /> },
  {
    key: 'residual_score',
    label: 'Residual',
    render: (r) => (
      <span title={r.residual_assessed ? undefined : 'Residual not assessed yet: showing inherent'}>
        <Score value={r.residual_score} />
        {!r.residual_assessed && <span className="faint small"> *</span>}
      </span>
    ),
  },
  { key: 'treatment', label: 'Treatment', render: (r) => humanize(r.treatment) },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  { key: 'owner_name', label: 'Owner', render: (r) => r.owner_name ?? <span className="faint">Unassigned</span> },
  { key: 'ale', label: 'ALE', render: (r) => <span className="num">{fmtMoney(r.ale)}</span>, className: 'nowrap' },
  { key: 'due_date', label: 'Target', render: (r) => <span className="nowrap">{fmtDate(r.due_date)}</span> },
];

const CSV_COLUMNS = [
  { key: 'ref', label: 'Ref' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'asset_name', label: 'Asset' },
  { key: 'threat', label: 'Threat' },
  { key: 'vulnerability', label: 'Vulnerability' },
  { key: 'likelihood', label: 'Likelihood' },
  { key: 'impact', label: 'Impact' },
  { key: 'inherent_score', label: 'Inherent score' },
  { key: 'residual_score', label: 'Residual score' },
  { key: 'residual_level', label: 'Residual level' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'status', label: 'Status' },
  { key: 'owner_name', label: 'Owner' },
  { key: 'due_date', label: 'Target date' },
  { key: 'sle', label: 'SLE (CAD)' },
  { key: 'ale', label: 'ALE (CAD)' },
];

export function Risks() {
  const { data, error } = useApi<Row[]>('/risks');
  const { reloadLookups } = useLookups();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<HeatMode>('residual');
  const [cell, setCell] = useState<[number, number] | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(params.get('status') ?? 'active');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState(params.get('level') ?? '');
  const [creating, setCreating] = useState(false);

  const scoped = useMemo(
    () =>
      (data ?? []).filter(
        (r) =>
          (status === 'active' ? r.status !== 'closed' : status === 'appetite' ? r.above_appetite : !status || r.status === status) &&
          (!category || r.category === category) &&
          (!level || r[`${mode}_level`] === level) &&
          matches(r, q, ['ref', 'title', 'category', 'asset_name', 'owner_name', 'threat']),
      ),
    [data, status, category, level, q, mode],
  );
  const rows = cell ? scoped.filter((r) => { const [l, i] = cellOf(r, mode); return l === cell[0] && i === cell[1]; }) : scoped;

  if (!data) return <div className="page"><Loading error={error} /></div>;

  const active = data.filter((r) => r.status !== 'closed');
  const totalAle = active.reduce((s, r) => s + (r.ale ?? 0), 0);

  return (
    <div className="page">
      <PageHeader
        title="Risk register"
        description="Each risk is scored on a 5 × 5 likelihood × impact matrix, before controls (inherent) and after treatment (residual)."
        actions={
          <>
            <button className="btn" onClick={() => downloadCsv('risk-register.csv', rows, CSV_COLUMNS)}>
              <Icon name="download" /> Export CSV
            </button>
            <button className="btn primary" onClick={() => setCreating(true)}>
              <Icon name="plus" /> New risk
            </button>
          </>
        }
      />

      <div className="split" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <h2>Heat map</h2>
            <div className="tabs" role="tablist">
              {(['inherent', 'residual'] as HeatMode[]).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setCell(null); }}>
                  {humanize(m)}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <HeatMap risks={scoped} mode={mode} selected={cell} onSelect={setCell} />
          </div>
        </div>
        <div className="grid">
          <div className="card kpi">
            <div className="label">Active risks</div>
            <div className="value">{active.length}</div>
            <div className="sub">
              <b style={{ color: 'var(--critical)' }}>{active.filter((r) => r.above_appetite).length}</b> above appetite
            </div>
          </div>
          <div className="card kpi">
            <div className="label">Residual profile</div>
            <div className="actions" style={{ marginTop: 8 }}>
              {LEVELS.slice().reverse().map((lv) => (
                <span key={lv} className={`badge ${lv}`}>
                  {active.filter((r) => r.residual_level === lv).length} {lv}
                </span>
              ))}
            </div>
          </div>
          <div className="card kpi">
            <div className="label">Annualised loss expectancy</div>
            <div className="value">{fmtMoney(totalAle)}</div>
            <div className="sub">Sum of ALE for {active.filter((r) => r.ale != null).length} quantified risks (inherent)</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" type="search" placeholder="Search risks…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search risks" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="active">Active (not closed)</option>
              <option value="appetite">Above appetite</option>
              <option value="">All statuses</option>
              {RISK_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option value="">All categories</option>
              {RISK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
              <option value="">Any {mode} level</option>
              {LEVELS.map((l) => <option key={l} value={l}>{humanize(l)}</option>)}
            </select>
            {cell && (
              <button className="btn sm" onClick={() => setCell(null)}>
                L{cell[0]} × I{cell[1]} <Icon name="close" />
              </button>
            )}
          </div>
          <span className="small muted">{rows.length} risks</span>
        </div>
        <DataTable rows={rows} columns={RISK_COLUMNS} onRowClick={(r) => navigate(`/risks/${r.id}`)} rowClassName={(r) => (r.above_appetite ? 'row-overdue' : '')} empty="No risks match these filters." />
        <div className="small faint" style={{ padding: '8px 14px' }}>
          * Residual not assessed yet; inherent score shown. Rows tinted red are above appetite.
        </div>
      </div>

      {creating && (
        <Modal title="New risk" onClose={() => setCreating(false)} wide>
          <EntityForm
            fields={RISK_FIELDS}
            initial={RISK_DEFAULTS}
            aside={(v) => <RiskPreview values={v} />}
            submitLabel="Create risk"
            onCancel={() => setCreating(false)}
            onSubmit={async (payload) => {
              const created = await api('/risks', { method: 'POST', body: payload });
              reloadLookups();
              toast(`${created.ref} created`);
              navigate(`/risks/${created.id}`);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

