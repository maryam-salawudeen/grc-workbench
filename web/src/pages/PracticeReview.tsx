import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api, fmtMoney, humanize, useApi, type Row } from '../api';
import { useWorkspace } from '../workspace';
import { Loading, PageHeader, Ring, Score, complianceColor, toast } from '../components/ui';

const verdict = (v: number) => (v >= 0.99 ? ['good', 'Spot on'] : v >= 0.5 ? ['close', 'Close'] : ['off', 'Off']);

function Verdict({ value, show = true }: { value: number; show?: boolean }) {
  if (!show) return null;
  const [cls, label] = verdict(value);
  return <span className={`verdict ${cls}`}>{label}</span>;
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div className="bar-row" style={{ gridTemplateColumns: '150px 1fr 48px' }}>
      <span className="name">{label}</span>
      <div className="bar"><span style={{ width: `${value * 100}%`, background: complianceColor(value * 100) }} /></div>
      <span className="pct">{Math.round(value * 100)}%</span>
    </div>
  );
}

function ResultCard({ r, userRisks, onMatch }: { r: Row; userRisks: Row[]; onMatch: (key: string, value: string) => void }) {
  const [reveal, setReveal] = useState(false);
  const m = r.model;
  const u = r.matched;
  const showModel = !!u || reveal;

  return (
    <div className="card">
      <div className="card-head" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div className="small muted">{r.category} · {r.asset}</div>
          <h2 style={{ marginTop: 2 }}>{showModel ? r.title : 'A risk you have not recorded yet'}</h2>
          {!u && !reveal && (
            <p className="small muted" style={{ marginTop: 4 }}>
              Hint: look again at what the brief says about the <b>{r.asset}</b>.{' '}
              <button className="btn sm ghost" onClick={() => setReveal(true)}>Reveal the answer</button>
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', flex: 'none' }}>
          <div style={{ fontWeight: 600, fontSize: 18 }} className="num">{Math.round(r.scores.total * 100)}%</div>
          <div className="small muted">{u ? `Matched ${u.ref}` : 'Not found'}</div>
        </div>
      </div>
      {showModel && (
        <div className="card-body grid" style={{ gap: 14 }}>
          <div className="table-wrap">
            <table className="compare">
              <thead>
                <tr><th></th><th>Yours</th><th>Model answer</th><th></th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="muted">Inherent</td>
                  <td>{u ? <><Score value={u.inherent} /> <span className="small muted">L{u.likelihood} × I{u.impact}</span></> : '—'}</td>
                  <td><Score value={m.inherent} /> <span className="small muted">L{m.likelihood} × I{m.impact}</span></td>
                  <td><Verdict value={r.scores.inherent} show={!!u} /></td>
                </tr>
                <tr>
                  <td className="muted">Residual</td>
                  <td>{u ? (u.residual_assessed ? <><Score value={u.residual} /> <span className="small muted">L{u.residual_likelihood} × I{u.residual_impact}</span></> : <span className="faint">Not scored</span>) : '—'}</td>
                  <td><Score value={m.residual} /> <span className="small muted">L{m.residual_likelihood} × I{m.residual_impact}</span></td>
                  <td><Verdict value={r.scores.residual} show={!!u} /></td>
                </tr>
                <tr>
                  <td className="muted">Treatment</td>
                  <td>{u ? humanize(u.treatment) : '—'}</td>
                  <td>{humanize(m.treatment)}{m.alsoAccept.length ? <span className="small muted"> (or {m.alsoAccept.join(', ')})</span> : ''}</td>
                  <td><Verdict value={r.scores.treatment} show={!!u} /></td>
                </tr>
                <tr>
                  <td className="muted">Controls</td>
                  <td className="small">
                    {u ? (u.controls.length ? u.controls.map((c: string) => <div key={c}>{m.controls.includes(c) ? '✓' : '·'} {c}</div>) : <span className="faint">None linked</span>) : '—'}
                  </td>
                  <td className="small">{m.controls.length ? m.controls.map((c: string) => <div key={c}>{c}</div>) : <span className="faint">None needed</span>}</td>
                  <td><Verdict value={r.scores.controls} show={!!u} /></td>
                </tr>
                {m.ale != null && (
                  <tr>
                    <td className="muted">ALE</td>
                    <td>{u ? fmtMoney(u.ale) : '—'}</td>
                    <td className="small">
                      {fmtMoney(m.ale)} <span className="muted">(AV {fmtMoney(m.quant.asset_value)} × EF {m.quant.exposure_factor}% × ARO {m.quant.aro})</span>
                    </td>
                    <td>{u && <span className={`verdict ${u.ale != null && Math.abs(u.ale - m.ale) <= m.ale * 0.1 ? 'good' : 'off'}`}>{u.ale == null ? 'Missing' : Math.abs(u.ale - m.ale) <= m.ale * 0.1 ? 'Spot on' : 'Check'}</span>}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {u && r.missingControls.length > 0 && (
            <p className="small"><b>Controls to consider linking:</b> {r.missingControls.join(', ')}.</p>
          )}
          <div className="why callout">
            <p><b>Scoring.</b> {r.why.scoring}</p>
            <p><b>Treatment.</b> {r.why.treatment}</p>
            <p><b>Controls.</b> {r.why.controls}</p>
          </div>
        </div>
      )}
      <div className="card-body" style={{ borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="small muted" htmlFor={`match-${r.key}`}>Pair with</label>
        <select id={`match-${r.key}`} style={{ width: 'auto', maxWidth: '100%' }} value={r.manual ? String(u?.id ?? 0) : 'auto'} onChange={(e) => onMatch(r.key, e.target.value)}>
          <option value="auto">Automatic{u && !r.manual ? ` (${u.ref})` : ''}</option>
          <option value="0">None of my risks</option>
          {userRisks.map((x) => <option key={x.id} value={x.id}>{x.ref} {x.title}</option>)}
        </select>
        {u && <Link className="small" to={`/risks/${u.id}`}>Edit {u.ref}</Link>}
      </div>
    </div>
  );
}

export function PracticeReview() {
  const { scenario, loaded } = useWorkspace();
  const { data, error, reload } = useApi<Row>(scenario ? '/practice/review' : null);
  if (loaded && !scenario) return <Navigate to="/practice" replace />;
  if (!data) return <div className="page"><Loading error={error} /></div>;

  const match = async (key: string, value: string) => {
    await api('/practice/matches', { method: 'PUT', body: { model_key: key, risk_id: value === 'auto' ? null : Number(value) } });
    toast('Pairing updated');
    reload();
  };

  const b = data.breakdown;
  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/practice">Practice scenarios</Link> / <Link to="/practice/brief">{data.scenario.org}</Link></>}
        title="Check my work"
        description="Your register compared with the model answer. Update your risks and come back: the review recalculates every time you open it."
        actions={<><Link className="btn" to="/practice/brief">Back to brief</Link><Link className="btn primary" to="/risks">Edit my register</Link></>}
      />

      <div className="split" style={{ marginBottom: 16 }}>
        <div className="card card-pad" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
          <Ring value={data.score} size={120} color={complianceColor(data.score)} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2 style={{ fontSize: 20 }}>{data.band}</h2>
            <p className="small muted" style={{ margin: '4px 0 10px' }}>You found {b.found} of {b.total} model risks.</p>
            <Breakdown label="Risks found" value={b.found / b.total} />
            <Breakdown label="Inherent scoring" value={b.inherent} />
            <Breakdown label="Residual scoring" value={b.residual} />
            <Breakdown label="Treatment" value={b.treatment} />
            <Breakdown label="Controls" value={b.controls} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Register checks</h2></div>
          <ul className="list">
            {data.checks.map((c: Row, i: number) => (
              <li key={i}>
                <span className={`verdict ${c.ok ? 'good' : 'off'}`} style={{ width: 16 }}>{c.ok ? '✓' : '!'}</span>
                <span className="small">{c.text}</span>
              </li>
            ))}
            {data.extras.length > 0 && (
              <li>
                <span className="verdict close" style={{ width: 16 }}>+</span>
                <span className="small">
                  {data.extras.length} of your risks aren't paired with a model risk: {data.extras.map((x: Row) => x.ref).join(', ')}. That's fine if the brief supports them; otherwise pair them below or merge duplicates.
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid" style={{ gap: 14 }}>
        {[...data.results]
          .sort((a: Row, b: Row) => Number(!!b.matched) - Number(!!a.matched))
          .map((r: Row) => <ResultCard key={r.key} r={r} userRisks={data.userRisks} onMatch={match} />)}
      </div>
    </div>
  );
}
