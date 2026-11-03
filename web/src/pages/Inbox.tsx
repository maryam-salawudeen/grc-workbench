import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CISSP_DOMAINS, LABS, LEVELS, LEVEL_THEMES } from '../../../shared/labs/index.ts';
import { useAllLabProgress } from '../labProgress';
import { Explained } from '../components/Explain';
import { PageHeader, complianceColor } from '../components/ui';

const PRIORITY_TONE: Record<string, string> = { Urgent: 'bad', High: 'warn', Normal: '' };

export function Inbox() {
  const progress = useAllLabProgress();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');
  const [level, setLevel] = useState('');

  const visible = useMemo(
    () =>
      LABS.filter((l) => {
        const p = progress[l.id];
        if (domain && String(l.domain) !== domain) return false;
        if (level && l.level !== level) return false;
        if (status === 'todo' && p.done) return false;
        if (status === 'done' && !p.done) return false;
        return true;
      }),
    [progress, domain, status, level],
  );

  const done = LABS.filter((l) => progress[l.id].done);
  const average = done.length ? Math.round(done.reduce((s, l) => s + progress[l.id].score, 0) / done.length) : null;
  const next = LABS.find((l) => !progress[l.id].done);

  return (
    <div className="page">
      <PageHeader
        title="Work inbox"
        description="Requests from your clients, from quick everyday questions to work for the board. Pick a difficulty or start at the top."
        actions={next && <Link className="btn primary" to={`/inbox/${next.id}`}>Open next request</Link>}
      />

      <div className="inbox-summary">
        <div className="bar" style={{ flex: 1, maxWidth: 260 }}><span style={{ width: `${(done.length / LABS.length) * 100}%`, background: 'var(--accent)' }} /></div>
        <span className="small"><b>{done.length}</b> of {LABS.length} done</span>
        {average != null && <span className="small muted">Average score <b style={{ color: complianceColor(average) }}>{average}%</b></span>}
        <span className="small muted">{new Set(done.map((l) => l.domain)).size} of 8 CISSP domains covered</span>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="CISSP domain">
              <option value="">All CISSP domains</option>
              {CISSP_DOMAINS.slice(1).map((d, i) => <option key={d} value={i + 1}>Domain {i + 1}: {d}</option>)}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Difficulty">
              <option value="">All difficulties</option>
              {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="">All requests</option>
              <option value="todo">Still to do</option>
              <option value="done">Completed</option>
            </select>
          </div>
          <span className="small muted">{visible.length} requests</span>
        </div>
        {LEVELS.map((lv) => {
          const labs = visible.filter((l) => l.level === lv);
          if (!labs.length) return null;
          return (
            <section key={lv}>
              <h3 className="inbox-week">{LEVEL_THEMES[lv]}</h3>
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
                          <span className={`badge level-${l.level.toLowerCase()}`}>{l.level}</span>
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
