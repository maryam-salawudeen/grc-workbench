import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fmtMoney, humanize, type Row } from '../api';
import { useWorkspace } from '../workspace';
import { useBriefOpen, useChecklist, usePersistentState } from '../persist';
import { Explained } from './Explain';
import { Icon } from './icons';

type Tab = 'brief' | 'values' | 'tasks' | 'notes';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="brief-copy"
      title="Copy this paragraph"
      aria-label="Copy this paragraph"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // Clipboard blocked: the text can still be selected by hand.
        }
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/** The scenario brief, docked beside every page while a practice scenario is active. */
export function BriefPanel() {
  const { scenario: s } = useWorkspace();
  const [open, setOpen] = useBriefOpen();
  const [tab, setTab] = usePersistentState<Tab>('grc-brief-tab', 'brief');

  const active = !!s && open;
  useEffect(() => {
    document.body.classList.toggle('brief-open', active);
    return () => document.body.classList.remove('brief-open');
  }, [active]);

  if (!s) return null;
  if (!open) {
    return (
      <button type="button" className="brief-fab" onClick={() => setOpen(true)}>
        <Icon name="policy" /> Brief
      </button>
    );
  }
  return (
    <aside className="brief-panel" aria-label={`${s.org} brief`}>
      <div className="brief-panel-head">
        <div style={{ minWidth: 0 }}>
          <div className="small muted">Practice brief</div>
          <h2>{s.org}</h2>
        </div>
        <button className="btn ghost sm" onClick={() => setOpen(false)} aria-label="Close the brief">
          <Icon name="close" />
        </button>
      </div>
      <div className="tabs brief-tabs" role="tablist">
        {(['brief', 'values', 'tasks', 'notes'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {humanize(t)}
          </button>
        ))}
      </div>
      <div className="brief-panel-body">
        {tab === 'brief' && <BriefText s={s} />}
        {tab === 'values' && <Values s={s} />}
        {tab === 'tasks' && <Tasks s={s} />}
        {tab === 'notes' && <Notes s={s} />}
      </div>
    </aside>
  );
}

function BriefText({ s }: { s: Row }) {
  return (
    <div className="grid" style={{ gap: 16 }}>
      {s.brief.map((section: { heading: string; body: string[] }) => (
        <section key={section.heading}>
          <h3 style={{ marginBottom: 6 }}>{section.heading}</h3>
          {section.body.map((p, i) => (
            <div key={i} className="brief-para">
              <p><Explained text={p} /></p>
              <CopyButton text={p} />
            </div>
          ))}
        </section>
      ))}
      <p className="small muted">
        Tip: each weakness plus a threat is a risk. Recent incidents mean likelihood is high. <Link to="/practice/brief">Open the full brief page</Link>
      </p>
    </div>
  );
}

function Values({ s }: { s: Row }) {
  return (
    <div className="grid" style={{ gap: 14 }}>
      <p className="small muted">Use the asset value as AV in quantitative analysis. The brief's "Values for quantitative analysis" section gives EF and ARO.</p>
      <table className="brief-table">
        <thead>
          <tr><th>Asset</th><th>Value (AV)</th></tr>
        </thead>
        <tbody>
          {s.assets.map((a: [string, string, string, number, number, number, string]) => (
            <tr key={a[0]}>
              <td>
                <div style={{ fontWeight: 500 }}>{a[0]}</div>
                <div className="small muted">{humanize(a[2])} · criticality {a[3]}/5</div>
              </td>
              <td className="num nowrap">{fmtMoney(a[4])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {s.brief
        .filter((b: Row) => /quantitative/i.test(b.heading))
        .map((b: Row) => (
          <div key={b.heading} className="callout small">
            {b.body.map((p: string, i: number) => <p key={i}><Explained text={p} /></p>)}
          </div>
        ))}
      <div>
        <h3 style={{ marginBottom: 6 }}>Vendors</h3>
        <ul className="brief-list">
          {s.vendors.map((v: Row) => (
            <li key={v[0]}>
              <b>{v[0]}</b> <span className="muted small">· {v[1]} · data: {v[3]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Tasks({ s }: { s: Row }) {
  const [done, toggle] = useChecklist(s.id, s.tasks.length);
  return (
    <div>
      {s.tasks.map((t: string, i: number) => (
        <label key={i} className={`task ${done[i] ? 'done' : ''}`}>
          <input type="checkbox" checked={!!done[i]} onChange={() => toggle(i)} />
          <span><Explained text={t} /></span>
        </label>
      ))}
      <Link className="btn sm primary" style={{ marginTop: 12 }} to="/practice/review">Check my work</Link>
    </div>
  );
}

function Notes({ s }: { s: Row }) {
  const [notes, setNotes] = usePersistentState<string>(`grc-notes-${s.id}`, '');
  return (
    <div className="grid" style={{ gap: 8 }}>
      <label htmlFor="brief-notes" className="small muted">
        Jot down weaknesses, threats and numbers as you read. Notes are saved in this browser.
      </label>
      <textarea
        id="brief-notes"
        className="brief-notes"
        value={notes}
        placeholder={'e.g.\n• No MFA on email + phishing last month → likelihood 5\n• Backups on USB, never restored → ransomware impact 5'}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
}
