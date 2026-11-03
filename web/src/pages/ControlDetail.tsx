import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, fmtDate, humanize, useApi, type Row } from '../api';
import { useLookups } from '../lookups';
import { EntityForm } from '../components/EntityForm';
import { Picker } from '../components/Picker';
import { Loading, PageHeader, Score, StatusBadge, toast } from '../components/ui';
import { CONTROL_FIELDS } from './registers';

export function ControlDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reloadLookups } = useLookups();
  const control = useApi<Row>(`/controls/${id}`);
  const links = useApi<{ requirements: Row[]; risks: Row[] }>(`/controls/${id}/links`);
  const [picking, setPicking] = useState(false);
  const allReqs = useApi<Row[]>(picking ? '/requirements' : null);
  const [formKey, setFormKey] = useState(0);

  const byFramework = useMemo(() => {
    const m = new Map<string, Row[]>();
    for (const r of links.data?.requirements ?? []) m.set(r.framework_name, [...(m.get(r.framework_name) ?? []), r]);
    return [...m.entries()];
  }, [links.data]);

  if (!control.data || !links.data) return <div className="page"><Loading error={control.error ?? links.error} /></div>;
  const c = control.data;

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/controls">Controls</Link> / <span className="mono">{c.ref}</span></>}
        title={c.title}
        description={
          <span className="actions">
            <StatusBadge value={c.status} />
            <span className="badge">{humanize(c.type)}</span>
            <span className="badge">{humanize(c.nature)}</span>
            <span className="small">
              Owner: {c.owner_name ?? 'Unassigned'} · {c.last_tested ? `Tested ${fmtDate(c.last_tested)}, next ${fmtDate(c.next_test)}` : 'Never tested'}
            </span>
            {c.test_state === 'overdue' && <StatusBadge value="overdue" label="Test overdue" />}
          </span>
        }
      />
      <div className="split">
        <div className="card card-pad">
          <EntityForm
            key={formKey}
            fields={CONTROL_FIELDS}
            initial={c}
            submitLabel="Save changes"
            onSubmit={async (payload) => {
              control.setData(await api(`/controls/${c.id}`, { method: 'PUT', body: payload }));
              toast(`${c.ref} saved. Framework scores updated.`);
              reloadLookups();
              setFormKey((k) => k + 1);
            }}
            onDelete={async () => {
              await api(`/controls/${c.id}`, { method: 'DELETE' });
              reloadLookups();
              toast(`${c.ref} deleted`);
              navigate('/controls');
            }}
          />
        </div>
        <div className="grid">
          <div className="card">
            <div className="card-head">
              <h2>Framework mappings</h2>
              <button className="btn sm" onClick={() => setPicking(true)}>Edit mappings</button>
            </div>
            <div className="card-body">
              {byFramework.length ? (
                byFramework.map(([fw, reqs]) => (
                  <div key={fw} style={{ marginBottom: 14 }}>
                    <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>
                      <Link to={`/frameworks/${reqs[0].framework_id}`}>{fw}</Link> <span className="muted">({reqs.length})</span>
                    </div>
                    <div className="chips">
                      {reqs.map((r) => (
                        <span key={r.id} className="chip" title={r.title}>{r.ref}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="muted">Not mapped to any framework requirement yet.</p>
              )}
              <p className="small muted" style={{ marginTop: 6 }}>
                One control, many requirements: changing the implementation status updates every mapped framework.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Risks this control mitigates</h2></div>
            {links.data.risks.length ? (
              <ul className="list">
                {links.data.risks.map((r) => (
                  <li key={r.id}>
                    <span className="mono">{r.ref}</span>
                    <Link to={`/risks/${r.id}`} style={{ flex: 1 }}>{r.title}</Link>
                    <Score value={r.residual_score} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">Not linked to any risk.</div>
            )}
          </div>
        </div>
      </div>

      {picking && allReqs.data && (
        <Picker
          title={`Requirements satisfied by ${c.ref}`}
          items={allReqs.data.map((r) => ({ id: r.id, label: `${r.ref} ${r.title}`, sub: r.domain, group: r.framework_code }))}
          selected={links.data.requirements.map((r) => r.id)}
          onClose={() => setPicking(false)}
          onSave={async (ids) => {
            await api(`/controls/${c.id}/requirements`, { method: 'PUT', body: { ids } });
            toast('Mappings saved');
            setPicking(false);
            links.reload();
            control.reload();
          }}
        />
      )}
    </div>
  );
}
