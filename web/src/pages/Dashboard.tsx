import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RISK_APPETITE } from '../../../shared/scoring.ts';
import { fmtCompact, fmtDate, humanize, useApi, type Row } from '../api';
import { HeatMap, cellOf, type HeatMode } from '../components/HeatMap';
import { useWorkspace } from '../workspace';
import { LABS } from '../../../shared/labs/index.ts';
import { useAllLabProgress } from '../labProgress';
import { Explained } from '../components/Explain';
import { CoverageBar, LevelBadge, Loading, PageHeader, Ring, Score, StatusBadge, complianceColor } from '../components/ui';

export function Dashboard() {
  const { data, error } = useApi<Row>('/dashboard');
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const [mode, setMode] = useState<HeatMode>('residual');
  const [cell, setCell] = useState<[number, number] | null>(null);

  if (!data) return <div className="page"><Loading error={error} /></div>;

  const overall = data.frameworks.reduce((s: number, f: Row) => s + f.score, 0) / data.frameworks.length;
  const top = [...data.risks]
    .filter((r: Row) => !cell || (cellOf(r, mode)[0] === cell[0] && cellOf(r, mode)[1] === cell[1]))
    .sort((a: Row, b: Row) => b[`${mode}_score`] - a[`${mode}_score`])
    .slice(0, cell ? 20 : 6);

  return (
    <div className="page">
      <PageHeader
        title="Risk & compliance overview"
        description={`${workspace.org_name} · as of ${fmtDate(data.today)}`}
        actions={<Link className="btn" to="/lab">How scores work</Link>}
      />

      <div className="kpis">
        <Link to="/risks" className="card kpi">
          <div className="label"><Explained text="Active risks" /></div>
          <div className="value">{data.riskCounts.open}</div>
          <div className="sub"><b style={{ color: 'var(--critical)' }}>{data.riskCounts.aboveAppetite}</b> above appetite (&gt; {RISK_APPETITE})</div>
        </Link>
        <Link to="/frameworks" className="card kpi">
          <div className="label"><Explained text="Average compliance" /></div>
          <div className="value" style={{ color: complianceColor(overall) }}>{Math.round(overall)}%</div>
          <div className="sub">across {data.frameworks.length} frameworks</div>
        </Link>
        <Link to="/findings" className="card kpi">
          <div className="label"><Explained text="Open findings" /></div>
          <div className="value">{data.findings.open}</div>
          <div className="sub"><b style={{ color: data.findings.overdue ? 'var(--critical)' : undefined }}>{data.findings.overdue}</b> overdue</div>
        </Link>
        <Link to="/controls" className="card kpi">
          <div className="label"><Explained text="Controls implemented" /></div>
          <div className="value">{data.controls.implemented}<span className="muted" style={{ fontSize: 16 }}>/{data.controls.total}</span></div>
          <div className="sub"><b>{data.controls.testsOverdue}</b> tests overdue or never run</div>
        </Link>
        <Link to="/policies" className="card kpi">
          <div className="label"><Explained text="Policy reviews" /></div>
          <div className="value">{data.policies.overdue + data.policies.dueSoon}</div>
          <div className="sub"><b style={{ color: data.policies.overdue ? 'var(--critical)' : undefined }}>{data.policies.overdue}</b> overdue · {data.policies.dueSoon} due in 30 days</div>
        </Link>
        <Link to="/vendors" className="card kpi">
          <div className="label"><Explained text="Vendors needing review" /></div>
          <div className="value">{data.vendors.overdue}</div>
          <div className="sub">{data.vendors.tier1} Tier 1 of {data.vendors.total} vendors</div>
        </Link>
      </div>

      <TodaysWork />

      <div className="split" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2><Explained text="Risk heat map" /></h2>
              <div className="small muted">Annualised loss expectancy of active risks: {fmtCompact(data.riskCounts.ale)}</div>
            </div>
            <div className="tabs">
              {(['inherent', 'residual'] as HeatMode[]).map((m) => (
                <button key={m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setCell(null); }}>{humanize(m)}</button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <HeatMap risks={data.risks} mode={mode} selected={cell} onSelect={setCell} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>{cell ? `Risks at L${cell[0]} × I${cell[1]}` : `Top risks (${mode})`}</h2>
            <Link to="/risks" className="small">View register</Link>
          </div>
          <ul className="list">
            {top.map((r: Row) => (
              <li key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/risks/${r.id}`)}>
                <Score value={r[`${mode}_score`]} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{r.title}</div>
                  <div className="small muted">
                    <span className="mono">{r.ref}</span> · {r.owner_name ?? 'Unassigned'} · {humanize(r.status)}
                  </div>
                </div>
                {r.above_appetite && <span className="badge critical">Above appetite</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        {data.frameworks.map((f: Row) => (
          <Link key={f.id} to={`/frameworks/${f.id}`} className="card card-pad" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: 16, alignItems: 'center' }}>
            <Ring value={f.score} size={76} color={complianceColor(f.score)} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{f.name}</div>
              <div className="small muted" style={{ marginBottom: 8 }}>
                {f.counts.met} met · {f.counts.partial} partial · {f.counts.gap + f.counts.not_met} gaps of {f.total}
              </div>
              <CoverageBar counts={f.counts} total={f.total} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-head">
            <h2>Coming up and overdue</h2>
            <span className="small muted">next 60 days</span>
          </div>
          {data.upcoming.length ? (
            <ul className="list">
              {data.upcoming.map((u: Row, i: number) => {
                const overdue = u.date < data.today;
                return (
                  <li key={i} style={{ cursor: 'pointer' }} onClick={() => navigate(u.link)}>
                    <span className="date" style={{ color: overdue ? 'var(--critical)' : undefined, fontWeight: overdue ? 600 : 400 }}>{fmtDate(u.date).replace(/, \d{4}$/, '')}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div>{u.title}</div>
                      <div className="small muted">{u.kind} · <span className="mono">{u.ref}</span></div>
                    </div>
                    {overdue && <StatusBadge value="overdue" />}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="empty">Nothing due in the next 60 days.</div>
          )}
        </div>

        <div className="grid">
          <div className="card">
            <div className="card-head"><h2>Open findings by severity</h2></div>
            <div className="card-body actions">
              {['critical', 'high', 'medium', 'low'].map((s) => (
                <Link key={s} to={`/findings?severity=${s}`} style={{ textDecoration: 'none' }}>
                  <LevelBadge level={s} /> <b className="num" style={{ color: 'var(--text)' }}>{data.findings.bySeverity[s]}</b>
                </Link>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Recent activity</h2></div>
            <ul className="list">
              {data.activity.map((a: Row) => (
                <li key={a.id}>
                  <span className="date faint">{fmtDate(a.at).replace(/, \d{4}$/, '')}</span>
                  <span className="small">{a.summary}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The next few requests in the work inbox, so the day starts with work like a real job. */
function TodaysWork() {
  const progress = useAllLabProgress();
  const todo = LABS.filter((l) => !progress[l.id].done);
  const done = LABS.length - todo.length;
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-head">
        <div>
          <h2>Your inbox</h2>
          <div className="small muted">{done} of {LABS.length} client requests done</div>
        </div>
        <Link to="/inbox" className="small">Open the work inbox</Link>
      </div>
      {todo.length ? (
        <ul className="list">
          {todo.slice(0, 3).map((l) => (
            <li key={l.id}>
              <span className="date faint">{l.received.split(' ')[0]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/inbox/${l.id}`} style={{ fontWeight: 500 }}>{l.title}</Link>
                <div className="small muted">{l.from.name}, {l.client} · CISSP Domain {l.domain}</div>
              </div>
              {l.priority !== 'Normal' && <span className={`badge ${l.priority === 'Urgent' ? 'bad' : 'warn'}`}>{l.priority}</span>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">Inbox zero. Every request is done; try a case study next.</div>
      )}
    </div>
  );
}
