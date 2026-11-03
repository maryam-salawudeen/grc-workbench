import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, fmtDate, useApi, type Row } from '../api';
import { Explained, Term } from '../components/Explain';
import { LevelBadge, PageHeader, Ring, complianceColor, toast } from '../components/ui';

const STATUS: Record<string, [cls: string, label: string]> = {
  pass: ['good', 'Pass'],
  warn: ['warn', 'Needs work'],
  fail: ['bad', 'Fail'],
  info: ['info', 'Good practice'],
};

function CheckItem({ item, selected, onToggle }: { item: Row; selected: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(item.status !== 'pass');
  const [cls, label] = STATUS[item.status];
  const selectable = item.status === 'warn' || item.status === 'fail';
  return (
    <li className="site-item">
      <div className="site-item-head">
        {selectable ? (
          <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Add "${item.title}" to findings`} />
        ) : (
          <span style={{ width: 13 }} />
        )}
        <span className={`badge ${cls}`} style={{ minWidth: 92, justifyContent: 'center' }}>{label}</span>
        <div className="site-item-title">
          <div style={{ fontWeight: 600 }}><Explained text={item.title} /></div>
          <div className="small muted">{item.found}</div>
        </div>
        {selectable && <LevelBadge level={item.severity} />}
        <button className="btn sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Hide' : 'Explain'}
        </button>
      </div>
      {open && (
        <div className="site-item-body">
          <p><b>What this means.</b> <Explained text={item.explain} /></p>
          <p><b>Why it matters.</b> <Explained text={item.why} /></p>
          <p><b>How to fix it.</b> <Explained text={item.fix} /></p>
          <p><b>What a GRC analyst does next.</b> <Explained text={item.analyst} /></p>
          <div className="small muted">
            <Term id="framework">Framework</Term> requirements: {item.refs.map((r: string) => <span key={r} className="chip">{r}</span>)}
            <Term id={item.term}>Learn the term</Term>
          </div>
        </div>
      )}
    </li>
  );
}

export function WebsiteCheck() {
  const [params, setParams] = useSearchParams();
  const history = useApi<Row[]>('/site-checks');
  const [url, setUrl] = useState('');
  const [permission, setPermission] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Row | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const show = (r: Row) => {
    setReport(r);
    setSelected(new Set(r.items.filter((i: Row) => i.status === 'warn' || i.status === 'fail').map((i: Row) => i.id)));
  };

  // ?id=<check> reopens an earlier check.
  useEffect(() => {
    const id = params.get('id');
    if (id && String(report?.id) !== id) api(`/site-checks/${id}`).then(show).catch(() => {});
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await api('/site-checks', { method: 'POST', body: { url, permission } });
      show(r);
      setParams({ id: String(r.id) }, { replace: true });
      history.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const addFindings = async () => {
    const { created } = await api(`/site-checks/${report!.id}/findings`, { method: 'POST', body: { ids: [...selected] } });
    toast(`${created} finding(s) added`);
  };

  const counts = report ? (['fail', 'warn', 'pass', 'info'] as const).map((s) => [s, report.items.filter((i: Row) => i.status === s).length] as const) : [];

  return (
    <div className="page">
      <PageHeader
        title="Website check"
        description="Type a company's web address to get a passive security check of what any visitor's browser can see, with every result explained."
      />

      <div className="split" style={{ marginBottom: 16 }}>
        <form className="card card-pad grid" style={{ gap: 12 }} onSubmit={run}>
          <div className="field">
            <label htmlFor="site-url">Website address</label>
            <input id="site-url" type="text" inputMode="url" placeholder="e.g. example.com or https://www.example.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} style={{ marginTop: 3 }} />
            <span>I own this website, or I have permission to assess it (for example, it is a vendor I am reviewing or a practice target such as example.com).</span>
          </label>
          {error && <div className="error-box" style={{ marginBottom: 0 }}>{error}</div>}
          <div>
            <button className="btn primary" disabled={busy || !permission || !url.trim()}>{busy ? 'Checking… (up to 30 seconds)' : 'Check website'}</button>
          </div>
        </form>
        <div className="card card-pad small grid" style={{ gap: 8 }}>
          <h2>What this check does</h2>
          <p>
            It is a <Term id="passive-check">passive check</Term>: it loads the home page once, reads the <Term id="security-header">security headers</Term> and{' '}
            <Term id="cookie">cookie</Term> settings, inspects the <Term id="tls-certificate">TLS certificate</Term> and looks for a <Term id="security-txt">security.txt</Term> file.
          </p>
          <p className="muted">It does not log in, scan for hidden pages or try to break anything. It also cannot see inside the company: a good grade here does not mean the company is secure overall.</p>
        </div>
      </div>

      {report && (
        <div className="grid" style={{ gap: 16, marginBottom: 16 }}>
          <div className="card card-pad" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <Ring value={report.score} size={110} color={complianceColor(report.score)} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="small muted">Checked {fmtDate(report.checked_at)}</div>
              <h2 style={{ fontSize: 20 }}>
                {report.host} · grade {report.grade}
              </h2>
              <div className="actions" style={{ marginTop: 8 }}>
                {counts.map(([s, n]) => n > 0 && <span key={s} className={`badge ${STATUS[s][0]}`}>{n} {STATUS[s][1].toLowerCase()}</span>)}
              </div>
              <p className="small muted" style={{ marginTop: 8 }}>
                The grade starts at 100 and loses points for each problem, more for serious ones. Use it to compare sites, not as a verdict on the company.
              </p>
            </div>
            <div className="grid" style={{ gap: 8, justifyItems: 'start' }}>
              <button className="btn primary" disabled={!selected.size} onClick={addFindings}>Add {selected.size} to findings</button>
              <Link className="small" to="/findings">Open findings</Link>
            </div>
          </div>
          <ul className="card site-list">
            {report.items.map((i: Row) => (
              <CheckItem
                key={i.id}
                item={i}
                selected={selected.has(i.id)}
                onToggle={() =>
                  setSelected((s) => {
                    const n = new Set(s);
                    n.has(i.id) ? n.delete(i.id) : n.add(i.id);
                    return n;
                  })
                }
              />
            ))}
          </ul>
        </div>
      )}

      {!!history.data?.length && (
        <div className="card">
          <div className="card-head"><h2>Earlier checks</h2></div>
          <ul className="list">
            {history.data.map((h) => (
              <li key={h.id} style={{ cursor: 'pointer' }} onClick={() => setParams({ id: String(h.id) })}>
                <span className="date faint">{fmtDate(h.checked_at)}</span>
                <span style={{ flex: 1 }}>{h.host}</span>
                <span className="badge" style={{ background: 'var(--surface-2)', color: complianceColor(h.score) }}>{h.grade} · {h.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
