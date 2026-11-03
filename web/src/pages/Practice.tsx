import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate, useApi, type Row } from '../api';
import { switchWorkspace } from '../workspace';
import { Loading, PageHeader, toast } from '../components/ui';
import { Explained } from '../components/Explain';

export function Difficulty({ level }: { level: number }) {
  return (
    <span className="difficulty" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= level ? 'on' : ''} />)}
    </span>
  );
}

export function Practice() {
  const { data, error, reload } = useApi<Row[]>('/workspaces');
  const [busy, setBusy] = useState<string | null>(null);
  if (!data) return <div className="page"><Loading error={error} /></div>;
  const demo = data.find((w) => w.demo)!;
  const scenarios = data.filter((w) => !w.demo);

  const go = async (id: string) => {
    setBusy(id);
    await switchWorkspace(id);
  };

  const reset = async (w: Row) => {
    if (!confirm(`Reset ${w.org}? Your risks, links and review for this scenario will be deleted.`)) return;
    await api(`/workspaces/${w.id}/reset`, { method: 'POST' });
    toast(`${w.org} reset`);
    if (w.active) window.location.assign('/practice/brief');
    else reload();
  };

  return (
    <div className="page">
      <PageHeader
        title="Case studies"
        description="Bigger engagements alongside your inbox work. Each client has its own empty risk register: read the brief, build the register, then check your work against a model answer. The demo organisation is kept separately."
      />

      <div className="grid cols-2">
        {scenarios.map((w) => (
          <div key={w.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: w.active ? 'var(--accent)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div className="small muted">{w.sector}</div>
                <h2 style={{ fontSize: 17 }}>{w.org}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Difficulty level={w.difficulty} />
                <div className="small muted" style={{ marginTop: 4 }}>{w.level} · ~{w.minutes} min</div>
              </div>
            </div>
            <p className="small"><Explained text={w.summary} /></p>
            <div className="chips">
              {w.focus.map((f: string) => <span key={f} className="badge accent" style={{ margin: '0 6px 6px 0' }}>{f}</span>)}
            </div>
            <div className="small muted">
              {w.active && <span className="badge info" style={{ marginRight: 8 }}>Active</span>}
              {!w.started
                ? `Not started · ${w.modelRiskCount} risks in the model answer`
                : `${w.riskCount} risk(s) recorded${w.lastScore != null ? ` · last check ${w.lastScore}% on ${fmtDate(w.reviewedAt)}` : ''}`}
            </div>
            <div className="actions" style={{ marginTop: 'auto' }}>
              {w.active ? (
                <>
                  <Link className="btn primary" to="/practice/brief">Open brief</Link>
                  <Link className="btn" to="/practice/review">Check my work</Link>
                </>
              ) : (
                <button className="btn primary" disabled={busy != null} onClick={() => go(w.id)}>
                  {busy === w.id ? 'Opening…' : w.started ? 'Continue' : 'Start scenario'}
                </button>
              )}
              {w.started && <button className="btn ghost danger" onClick={() => reset(w)}>Reset</button>}
            </div>
          </div>
        ))}

        <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, borderColor: demo.active ? 'var(--accent)' : undefined }}>
          <div className="small muted">{demo.sector} · fully worked example</div>
          <h2 style={{ fontSize: 17 }}>{demo.org}</h2>
          <p className="small">The demo organisation, with a complete register, assessments, findings, policies and vendors. Use it to see what a finished programme looks like.</p>
          <div className="actions" style={{ marginTop: 'auto' }}>
            {demo.active ? <span className="badge info">Active</span> : <button className="btn" onClick={() => go('demo')}>Back to demo</button>}
          </div>
        </div>
      </div>

      <div className="callout" style={{ marginTop: 16 }}>
        <b>How marking works.</b> Each model risk is worth the same. You earn credit for finding it, then for how close your inherent score is (35%), your residual score (20%), the treatment (20%) and the controls you linked (25%). Scores within a point of the model still earn most of the credit, because risk scoring involves judgement.
      </div>
    </div>
  );
}
