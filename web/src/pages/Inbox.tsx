import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CISSP_DOMAINS, EMPLOYER, LABS, WEEK_THEMES } from '../../../shared/labs/index.ts';
import { useAllLabProgress } from '../labProgress';
import { Explained } from '../components/Explain';
import { PageHeader, complianceColor } from '../components/ui';

const PRIORITY_TONE: Record<string, string> = { Urgent: 'bad', High: 'warn', Normal: '' };

export function Inbox() {
  const progress = useAllLabProgress();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');

  const visible = useMemo(
    () =>
      LABS.filter((l) => {
        const p = progress[l.id];
        if (domain && String(l.domain) !== domain) return false;
        if (status === 'todo' && p.done) return false;
        if (status === 'done' && !p.done) return false;
        return true;
      }),
    [progress, domain, status],
  );

  const done = LABS.filter((l) => progress[l.id].done);
  const average = done.length ? Math.round(done.reduce((s, l) => s + progress[l.id].score, 0) / done.length) : null;
  const next = LABS.find((l) => !progress[l.id].done);

  return (
    <div className="page">
      <PageHeader
        title="Work inbox"
        description={`You have just joined ${EMPLOYER.name} as a junior GRC analyst. Requests from your clients arrive here in the order you would get them during your first month. Open one, work from the attachments and send back the deliverable.`}
        actions={next && <Link className="btn primary" to={`/inbox/${next.id}`}>Open next request</Link>}
      />

      <div className="kpis">
        <div className="card kpi">
          <div className="label">Requests completed</div>
          <div className="value">{done.length}<span className="muted" style={{ fontSize: 16 }}>/{LABS.length}</span></div>
          <div className="bar" style={{ marginTop: 8 }}><span style={{ width: `${(done.length / LABS.length) * 100}%`, background: 'var(--accent)' }} /></div>
        </div>
        <div className="card kpi">
          <div className="label">Average score</div>
          <div className="value" style={{ color: average == null ? undefined : complianceColor(average) }}>{average == null ? '—' : `${average}%`}</div>
          <div className="sub">across completed requests</div>
        </div>
        <div className="card kpi">
          <div className="label">CISSP domains covered</div>
          <div className="value">{new Set(done.map((l) => l.domain)).size}<span className="muted" style={{ fontSize: 16 }}>/8</span></div>
          <div className="sub">by the requests you have finished</div>
        </div>
        <Link to="/practice" className="card kpi">
          <div className="label">Client case studies</div>
          <div className="value">5</div>
          <div className="sub">Build a full risk register from a brief</div>
        </Link>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="CISSP domain">
              <option value="">All CISSP domains</option>
              {CISSP_DOMAINS.slice(1).map((d, i) => <option key={d} value={i + 1}>Domain {i + 1}: {d}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="">All requests</option>
              <option value="todo">Still to do</option>
              <option value="done">Completed</option>
            </select>
          </div>
          <span className="small muted">{visible.length} requests</span>
        </div>
        {[1, 2, 3, 4].map((week) => {
          const labs = visible.filter((l) => l.week === week);
          if (!labs.length) return null;
          return (
            <section key={week}>
              <h3 className="inbox-week">{WEEK_THEMES[week]}</h3>
              <ul className="inbox-list">
                {labs.map((l) => {
                  const p = progress[l.id];
                  return (
                    <li key={l.id} className={`inbox-row ${p.started ? '' : 'unread'}`} onClick={() => navigate(`/inbox/${l.id}`)}>
                      <span className="inbox-dot" aria-hidden="true" />
                      <div className="inbox-from">
                        <div className="inbox-name">{l.from.name}</div>
                        <div className="small muted">{l.client}</div>
                      </div>
                      <div className="inbox-subject">
                        <Link to={`/inbox/${l.id}`} onClick={(e) => e.stopPropagation()} className="inbox-title">{l.title}</Link>
                        <div className="small muted inbox-preview">{l.message.find((m) => m.length > 20) ?? l.message[0]}</div>
                        <div className="chips" style={{ marginTop: 6 }}>
                          <span className="badge">{l.channel}</span>
                          {l.priority !== 'Normal' && <span className={`badge ${PRIORITY_TONE[l.priority]}`}>{l.priority}</span>}
                          <span className="badge accent">CISSP D{l.domain}</span>
                          <span className="badge">~{l.minutes} min</span>
                        </div>
                      </div>
                      <div className="inbox-status">
                        <div className="small muted">{l.received}</div>
                        {p.done ? (
                          <span className="badge" style={{ color: complianceColor(p.score), background: 'var(--surface-2)' }}>{p.score}%</span>
                        ) : p.started ? (
                          <span className="badge info">{p.stepsDone}/{l.steps.length} steps</span>
                        ) : (
                          <span className="badge">New</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {!visible.length && <div className="empty">No requests match these filters.</div>}
      </div>
      <p className="small muted" style={{ marginTop: 12 }}>
        <Explained text="Every request maps to a CISSP domain and ends with an exam tip. Your answers are saved in this browser." />
      </p>
    </div>
  );
}
