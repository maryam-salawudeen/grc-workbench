import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmtDate, useApi, type Row } from '../api';
import { useLookups } from '../lookups';
import { DataTable, matches } from '../components/DataTable';
import { EntityForm } from '../components/EntityForm';
import { LevelBadge, Loading, Modal, PageHeader, StatusBadge, toast } from '../components/ui';
import { FINDING_FIELDS } from './registers';
import { REQUIREMENT_EXPLAINED } from '../../../shared/explain/requirements.ts';

const RESULTS: [string, string][] = [
  ['not_assessed', 'Not assessed'],
  ['compliant', 'Compliant'],
  ['partial', 'Partially compliant'],
  ['non_compliant', 'Non-compliant'],
  ['not_applicable', 'Not applicable'],
];

const ASSESSMENT_FIELDS = [
  { name: 'title', label: 'Title', type: 'text' as const, required: true, full: true },
  { name: 'status', label: 'Status', type: 'select' as const, options: [['planned', 'Planned'], ['in_progress', 'In progress'], ['complete', 'Complete']] as [string, string][], required: true },
  { name: 'lead_id', label: 'Lead assessor', type: 'person' as const },
  { name: 'start_date', label: 'Start', type: 'date' as const },
  { name: 'end_date', label: 'End', type: 'date' as const },
  { name: 'scope', label: 'Scope', type: 'textarea' as const },
  { name: 'summary', label: 'Summary / conclusion', type: 'textarea' as const },
];

export function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reloadLookups } = useLookups();
  const assessment = useApi<Row>(`/assessments/${id}`);
  const itemsApi = useApi<Row[]>(`/assessments/${id}/items`);
  const findingsApi = useApi<Row[]>('/findings');
  const [items, setItems] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [result, setResult] = useState('');
  const [editing, setEditing] = useState(false);
  const [noteFor, setNoteFor] = useState<Row | null>(null);
  const [raiseFor, setRaiseFor] = useState<Row | null>(null);

  useEffect(() => {
    if (itemsApi.data) setItems(itemsApi.data);
  }, [itemsApi.data]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const i of items) s[i.result] = (s[i.result] ?? 0) + 1;
    return s;
  }, [items]);

  const rows = useMemo(() => items.filter((i) => (!result || i.result === result) && matches(i, q, ['ref', 'title', 'domain', 'notes'])), [items, q, result]);

  if (!assessment.data || !itemsApi.data) return <div className="page"><Loading error={assessment.error ?? itemsApi.error} /></div>;
  const a = assessment.data;
  const findings = (findingsApi.data ?? []).filter((f) => f.assessment_id === a.id);
  const assessed = items.length - (stats.not_assessed ?? 0);

  const saveItem = async (item: Row, patch: Row) => {
    const updated = await api(`/assessment-items/${item.id}`, { method: 'PUT', body: patch });
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...updated } : i)));
    assessment.reload();
  };

  const prefill = async () => {
    if (!confirm('Pre-fill every "not assessed" item from the current status of its mapped controls? You can still change each result afterwards.')) return;
    const { updated } = await api(`/assessments/${a.id}/prefill`, { method: 'POST' });
    toast(`${updated} item(s) pre-filled`);
    itemsApi.reload();
    assessment.reload();
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/assessments">Assessments</Link> / <span className="mono">{a.ref}</span></>}
        title={a.title}
        description={
          <span className="actions">
            <StatusBadge value={a.status} />
            <span className="small">
              {a.framework_name} · Lead: {a.lead_name ?? 'Unassigned'} · {fmtDate(a.start_date)} to {fmtDate(a.end_date)}
            </span>
          </span>
        }
        actions={
          <>
            <button className="btn" onClick={() => setEditing(true)}>Edit details</button>
            <button className="btn primary" onClick={prefill} disabled={!stats.not_assessed}>
              Pre-fill from controls
            </button>
          </>
        }
      />

      <div className="kpis">
        <div className="card kpi">
          <div className="label">Progress</div>
          <div className="value">{Math.round((assessed / items.length) * 100)}%</div>
          <div className="sub">{assessed} of {items.length} requirements assessed</div>
        </div>
        {RESULTS.slice(1).map(([k, label]) => (
          <button key={k} className="card kpi" style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer', borderColor: result === k ? 'var(--accent)' : undefined }} onClick={() => setResult(result === k ? '' : k)}>
            <div className="label">{label}</div>
            <div className="value">{stats[k] ?? 0}</div>
          </button>
        ))}
      </div>
      {a.scope && <p className="muted" style={{ marginBottom: 16 }}><b>Scope:</b> {a.scope}</p>}
      <details className="card about-card" style={{ marginBottom: 16 }}>
        <summary><span>How an assessment works</span><span className="small muted">the steps, and what each result means</span></summary>
        <div className="card-body grid" style={{ gap: 10 }}>
          <ol className="gr-steps">
            <li><b>Plan.</b> Agree the scope (which systems, sites and period) and the framework.</li>
            <li><b>Collect evidence.</b> Ask control owners for records: logs, tickets, settings, signed reviews. Each requirement below says what to look for.</li>
            <li><b>Test.</b> Check the evidence actually shows the requirement is met, usually on a sample.</li>
            <li><b>Record a result</b> for each requirement, with notes on what you saw.</li>
            <li><b>Raise findings</b> for anything partial or non-compliant, with an owner and a due date.</li>
            <li><b>Report</b> the results and track the findings until they are fixed.</li>
          </ol>
          <dl className="dl">
            <dt>Compliant</dt><dd>The evidence shows the requirement is fully met.</dd>
            <dt>Partially compliant</dt><dd>Some of it is in place, for example for some systems only, or the evidence has gaps.</dd>
            <dt>Non-compliant</dt><dd>The requirement is not met, or there is no evidence that it is.</dd>
            <dt>Not applicable</dt><dd>It does not apply to this scope. Write down why: auditors will ask.</dd>
          </dl>
        </div>
      </details>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div className="filters">
              <input className="search" type="search" placeholder="Search requirements…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requirements" />
              <select value={result} onChange={(e) => setResult(e.target.value)} aria-label="Result">
                <option value="">All results</option>
                {RESULTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <span className="small muted">{rows.length} items</span>
          </div>
          <DataTable
            rows={rows}
            columns={[
              { key: 'ref', label: 'Ref', render: (r) => <span className="mono nowrap">{r.ref}</span> },
              {
                key: 'title',
                label: 'Requirement',
                render: (r) => (
                  <div>
                    <div className="title">{r.title}</div>
                    {REQUIREMENT_EXPLAINED[r.ref] && <div className="small">{REQUIREMENT_EXPLAINED[r.ref][0]}</div>}
                    <div className="small muted">
                      Controls: <StatusBadge value={r.coverage} />
                      {r.notes && <> · {r.notes.length > 80 ? `${r.notes.slice(0, 80)}…` : r.notes}</>}
                    </div>
                  </div>
                ),
              },
              {
                key: 'result',
                label: 'Result',
                render: (r) => (
                  <select value={r.result} onChange={(e) => saveItem(r, { result: e.target.value })} aria-label={`Result for ${r.ref}`} style={{ minWidth: 150 }}>
                    {RESULTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <div className="actions" style={{ flexWrap: 'nowrap' }}>
                    <button className="btn sm" onClick={() => setNoteFor(r)}>Notes</button>
                    {(r.result === 'non_compliant' || r.result === 'partial') && (
                      <button className="btn sm" onClick={() => setRaiseFor(r)}>{r.finding_count ? `Findings (${r.finding_count})` : 'Raise finding'}</button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>

        <div className="card">
          <div className="card-head"><h2>Findings ({findings.length})</h2></div>
          {findings.length ? (
            <ul className="list">
              {findings.map((f) => (
                <li key={f.id}>
                  <span className="mono">{f.ref}</span>
                  <div style={{ flex: 1 }}>
                    <Link to={`/findings?open=${f.id}`}>{f.title}</Link>
                    <div className="small muted">
                      {f.requirement_ref} · due {fmtDate(f.due_date)} · <StatusBadge value={f.status} />
                    </div>
                  </div>
                  <LevelBadge level={f.severity} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">No findings raised. Mark an item non-compliant or partial to raise one.</div>
          )}
          {a.summary && <div className="card-body small" style={{ borderTop: '1px solid var(--border)' }}><b>Summary:</b> {a.summary}</div>}
        </div>
      </div>

      {editing && (
        <Modal title={`Edit ${a.ref}`} onClose={() => setEditing(false)}>
          <EntityForm
            fields={ASSESSMENT_FIELDS}
            initial={a}
            onCancel={() => setEditing(false)}
            onSubmit={async (payload) => {
              await api(`/assessments/${a.id}`, { method: 'PUT', body: payload });
              toast('Assessment saved');
              setEditing(false);
              assessment.reload();
            }}
            onDelete={async () => {
              await api(`/assessments/${a.id}`, { method: 'DELETE' });
              reloadLookups();
              toast(`${a.ref} deleted`);
              navigate('/assessments');
            }}
          />
        </Modal>
      )}

      {noteFor && (
        <Modal title={`${noteFor.ref} · ${noteFor.title}`} onClose={() => setNoteFor(null)}>
          <EntityForm
            fields={[
              { name: 'result', label: 'Result', type: 'select', options: RESULTS, required: true },
              { name: 'notes', label: 'Assessor notes', type: 'textarea' },
              { name: 'evidence', label: 'Evidence reviewed', type: 'textarea', placeholder: 'Document names, links, sample IDs, interview dates…' },
            ]}
            initial={noteFor}
            aside={() => (
              <div className="grid" style={{ gap: 8 }}>
              {REQUIREMENT_EXPLAINED[noteFor.ref] && (
                <div className="callout small">
                  <p><b>What this means.</b> {REQUIREMENT_EXPLAINED[noteFor.ref][0]}</p>
                  <p style={{ marginTop: 4 }}><b>Evidence to look for.</b> {REQUIREMENT_EXPLAINED[noteFor.ref][1]}</p>
                </div>
              )}
              {noteFor.controls.length ? (
                <div className="small muted">
                  Mapped controls:{' '}
                  {noteFor.controls.map((c: Row) => (
                    <Link key={c.id} to={`/controls/${c.id}`} className="chip">{c.ref} {c.status.replace('_', ' ')}</Link>
                  ))}
                </div>
              ) : (
                <div className="small muted">No control is mapped to this requirement.</div>
              )}
              </div>
            )}
            onCancel={() => setNoteFor(null)}
            onSubmit={async (payload) => {
              await saveItem(noteFor, payload);
              toast('Item saved');
              setNoteFor(null);
            }}
          />
        </Modal>
      )}

      {raiseFor && (
        <Modal title={`Raise finding for ${raiseFor.ref}`} onClose={() => setRaiseFor(null)}>
          <EntityForm
            fields={FINDING_FIELDS}
            initial={{ title: `${raiseFor.title}: ${raiseFor.result === 'partial' ? 'partially' : 'not'} implemented`, severity: raiseFor.result === 'partial' ? 'medium' : 'high', status: 'open', description: raiseFor.notes }}
            submitLabel="Raise finding"
            onCancel={() => setRaiseFor(null)}
            onSubmit={async (payload) => {
              const f = await api('/findings', { method: 'POST', body: { ...payload, assessment_id: a.id, requirement_id: raiseFor.requirement_id } });
              toast(`${f.ref} raised`);
              setRaiseFor(null);
              findingsApi.reload();
              itemsApi.reload();
              assessment.reload();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
