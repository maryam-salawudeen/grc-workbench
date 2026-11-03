import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, type Row } from '../api';
import { useWorkspace } from '../workspace';
import { Loading, PageHeader, toast } from '../components/ui';
import { Difficulty } from './Practice';
import { Explained } from '../components/Explain';
import { useBriefOpen, useChecklist } from '../persist';

export function PracticeBrief() {
  const { scenario: s, loaded } = useWorkspace();
  if (!loaded) return <div className="page"><Loading /></div>;
  if (!s) return <Navigate to="/practice" replace />;
  return <Brief s={s} />;
}

function Brief({ s }: { s: Row }) {
  const [done, toggle] = useChecklist(s.id, s.tasks.length);
  const [, setBriefOpen] = useBriefOpen();
  const navigate = useNavigate();

  const reset = async () => {
    if (!confirm(`Reset ${s.org}? Everything you have entered for this scenario will be deleted.`)) return;
    await api(`/workspaces/${s.id}/reset`, { method: 'POST' });
    try {
      localStorage.removeItem(`grc-tasks-${s.id}`);
    } catch {
      // ignore
    }
    toast('Scenario reset');
    window.location.reload();
  };

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/practice">Case studies</Link> / {s.sector}</>}
        title={s.org}
        description={
          <span className="actions">
            <Difficulty level={s.difficulty} />
            <span className="small">{s.level} · about {s.minutes} minutes · {s.focus.join(' · ')}</span>
          </span>
        }
        actions={
          <>
            <button className="btn ghost danger" onClick={reset}>Reset scenario</button>
            <button
              className="btn"
              onClick={() => {
                setBriefOpen(true);
                navigate('/risks');
              }}
            >
              Open the register with this brief beside it
            </button>
            <Link className="btn primary" to="/practice/review">Check my work</Link>
          </>
        }
      />
      <div className="split">
        <div className="card card-pad brief grid" style={{ gap: 22 }}>
          {s.brief.map((section: { heading: string; body: string[] }) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((p, i) => <p key={i}><Explained text={p} /></p>)}
            </section>
          ))}
        </div>
        <div className="grid">
          <div className="card">
            <div className="card-head">
              <h2>Your tasks</h2>
              <span className="small muted">{done.filter(Boolean).length}/{s.tasks.length}</span>
            </div>
            <div className="card-body">
              {s.tasks.map((t: string, i: number) => (
                <label key={i} className={`task ${done[i] ? 'done' : ''}`}>
                  <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} />
                  <span><Explained text={t} /></span>
                </label>
              ))}
            </div>
          </div>
          <div className="card card-pad small grid" style={{ gap: 8 }}>
            <h2>Already loaded for you</h2>
            <p>
              <Link to="/assets">{s.assets.length} assets</Link> with values for quantitative analysis, <Link to="/vendors">{s.vendors.length} vendors</Link> (tiered automatically),{' '}
              <Link to="/people">{s.people.length} people</Link> to assign as owners, and the full <Link to="/controls">control library</Link> with today's implementation status.
            </p>
            <p className="muted">
              The model answer has {s.modelRiskCount} risks. Your wording doesn't need to match: the checker looks for the key idea in your title, threat, vulnerability and description, and you can pair risks by hand on the review page.
            </p>
          </div>
          <div className="callout small">
            <b>Tip.</b> Write each risk as "threat exploits vulnerability, causing impact". Score inherent risk on the situation as the brief describes it today, before your treatment. Then link the controls you would put in place and score what is left as residual risk.
          </div>
        </div>
      </div>
    </div>
  );
}
