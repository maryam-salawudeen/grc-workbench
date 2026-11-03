import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RISK_APPETITE } from '../../../shared/scoring.ts';
import { api, fmtDate, fmtMoney, humanize, useApi, type Row } from '../api';
import { useLookups } from '../lookups';
import { EntityForm } from '../components/EntityForm';
import { Picker } from '../components/Picker';
import { Icon } from '../components/icons';
import { LevelBadge, Loading, PageHeader, Score, StatusBadge, toast } from '../components/ui';
import { RISK_FIELDS, RiskPreview } from './riskFields';

export function RiskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lookups, reloadLookups } = useLookups();
  const risk = useApi<Row>(`/risks/${id}`);
  const links = useApi<{ controls: Row[]; findings: Row[] }>(`/risks/${id}/links`);
  const [picking, setPicking] = useState(false);
  const [formKey, setFormKey] = useState(0);

  if (!risk.data || !links.data) return <div className="page"><Loading error={risk.error ?? links.error} /></div>;
  const r = risk.data;

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/risks">Risk register</Link> / <span className="mono">{r.ref}</span></>}
        title={r.title}
        description={
          <span className="actions">
            <StatusBadge value={r.status} />
            <span className="badge">{r.category}</span>
            {r.above_appetite && <span className="badge critical">Above appetite</span>}
            <span className="small">Owner: {r.owner_name ?? 'Unassigned'} · Updated {fmtDate(r.updated_at)}</span>
          </span>
        }
      />

      <div className="split">
        <div className="card card-pad">
          <EntityForm
            key={formKey}
            fields={RISK_FIELDS}
            initial={r}
            aside={(v) => <RiskPreview values={v} />}
            submitLabel="Save changes"
            onSubmit={async (payload) => {
              risk.setData(await api(`/risks/${r.id}`, { method: 'PUT', body: payload }));
              toast(`${r.ref} saved`);
              reloadLookups();
              setFormKey((k) => k + 1);
            }}
            onDelete={async () => {
              await api(`/risks/${r.id}`, { method: 'DELETE' });
              reloadLookups();
              toast(`${r.ref} deleted`);
              navigate('/risks');
            }}
          />
        </div>

        <div className="grid">
          <div className="card card-pad">
            <h3 style={{ marginBottom: 12 }}>Risk score</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <Score value={r.inherent_score} />
                <div className="small muted" style={{ marginTop: 4 }}>Inherent</div>
                <div className="small faint">L{r.likelihood} × I{r.impact}</div>
              </div>
              <Icon name="arrow" size={20} />
              <div style={{ textAlign: 'center' }}>
                <Score value={r.residual_score} />
                <div className="small muted" style={{ marginTop: 4 }}>Residual</div>
                <div className="small faint">{r.residual_assessed ? `L${r.residual_likelihood} × I${r.residual_impact}` : 'Not assessed'}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <LevelBadge level={r.residual_level} />
                <div className="small muted" style={{ marginTop: 6 }}>
                  {r.inherent_score > r.residual_score ? `${Math.round((1 - r.residual_score / r.inherent_score) * 100)}% reduction` : 'No reduction yet'}
                </div>
              </div>
            </div>
            <p className="small muted" style={{ marginTop: 12 }}>
              Appetite is a residual score of {RISK_APPETITE} or less. {r.above_appetite ? 'This risk needs further treatment or a formal acceptance by the owner.' : 'This risk is within appetite.'}
            </p>
            {r.ale != null && (
              <div className="formula" style={{ marginTop: 12 }}>
                SLE = {fmtMoney(r.asset_value)} × {r.exposure_factor}% = <b>{fmtMoney(r.sle)}</b>
                <br />
                ALE = {fmtMoney(r.sle)} × {r.aro} = <b>{fmtMoney(r.ale)}</b> / year
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Mitigating controls</h2>
              <button className="btn sm" onClick={() => setPicking(true)}>Manage</button>
            </div>
            {links.data.controls.length ? (
              <ul className="list">
                {links.data.controls.map((c) => (
                  <li key={c.id}>
                    <span className="mono">{c.ref}</span>
                    <div style={{ flex: 1 }}>
                      <Link to={`/controls/${c.id}`}>{c.title}</Link>
                      <div className="small muted">{humanize(c.type)}{c.effectiveness ? ` · effectiveness ${c.effectiveness}/5` : ''}</div>
                    </div>
                    <StatusBadge value={c.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">No controls linked. Link the controls that reduce this risk.</div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Related findings</h2>
            </div>
            {links.data.findings.length ? (
              <ul className="list">
                {links.data.findings.map((f) => (
                  <li key={f.id}>
                    <span className="mono">{f.ref}</span>
                    <div style={{ flex: 1 }}>
                      <Link to={`/findings?open=${f.id}`}>{f.title}</Link>
                      <div className="small muted">Due {fmtDate(f.due_date)}</div>
                    </div>
                    <LevelBadge level={f.severity} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">No audit findings linked to this risk.</div>
            )}
          </div>
        </div>
      </div>

      {picking && (
        <Picker
          title={`Controls mitigating ${r.ref}`}
          items={lookups.controls.map((c) => ({ id: c.id, label: `${c.ref} ${c.title}`, sub: humanize(c.status) }))}
          selected={links.data.controls.map((c) => c.id)}
          onClose={() => setPicking(false)}
          onSave={async (ids) => {
            await api(`/risks/${r.id}/controls`, { method: 'PUT', body: { ids } });
            toast('Controls updated');
            setPicking(false);
            links.reload();
            risk.reload();
            setFormKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
