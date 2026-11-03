import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { guideFor } from '../guides';
import { Explained } from './Explain';
import { riskLevel, type Level } from '../../../shared/scoring.ts';
import { humanize } from '../api';
import { Icon } from './icons';

const TONES: Record<string, string> = {
  // risk status
  open: 'warn', in_treatment: 'info', accepted: '', closed: 'good',
  // control status
  implemented: 'good', partial: 'warn', planned: 'info', not_implemented: 'bad', not_applicable: '',
  // coverage
  met: 'good', not_met: 'bad', gap: 'bad',
  // findings
  in_progress: 'info', risk_accepted: '',
  // assessments
  complete: 'good', compliant: 'good', non_compliant: 'bad', not_assessed: '',
  // policies & vendors
  approved: 'good', draft: '', in_review: 'info', retired: '', active: 'good', onboarding: 'info', offboarding: 'warn', terminated: '',
  // due dates
  overdue: 'bad', due_soon: 'warn', ok: 'good', never: 'bad',
};

const LABELS: Record<string, string> = {
  gap: 'No control', not_met: 'Not met', due_soon: 'Due soon', ok: 'On track', never: 'Never done', not_applicable: 'N/A', risk_accepted: 'Risk accepted',
};

export function StatusBadge({ value, label }: { value: string | null | undefined; label?: string }) {
  if (!value || value === 'none') return <span className="faint">—</span>;
  return (
    <span className={`badge ${TONES[value] ?? ''}`}>
      <span className="dot" />
      {label ?? LABELS[value] ?? humanize(value)}
    </span>
  );
}

export function LevelBadge({ level }: { level: Level | string }) {
  return <span className={`badge ${level}`}>{humanize(level)}</span>;
}

export function Score({ value, title }: { value: number; title?: string }) {
  return (
    <span className={`score ${riskLevel(value)}`} title={title ?? `${humanize(riskLevel(value))} (${value})`}>
      {value}
    </span>
  );
}

export function PageHeader({ title, description, crumbs, actions }: { title: ReactNode; description?: ReactNode; crumbs?: ReactNode; actions?: ReactNode }) {
  return (
    <>
      <div className="page-header">
        <div>
          {crumbs && <div className="crumbs">{crumbs}</div>}
          <h1><Explained text={title} /></h1>
          {description && <p><Explained text={description} /></p>}
        </div>
        {actions && <div className="actions">{actions}</div>}
      </div>
      <PageGuide />
    </>
  );
}

/** "How to use this page" for beginners. Open until the reader closes it once. */
function PageGuide() {
  const { pathname } = useLocation();
  const guide = guideFor(pathname);
  const key = `grc-guide-closed-${pathname.startsWith('/inbox/') ? '/inbox/:id' : pathname.replace(/\/\d+$/, '/:id')}`;
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(key) !== '1';
    } catch {
      return true;
    }
  });
  if (!guide) return null;
  const toggle = (next: boolean) => {
    setOpen(next);
    try {
      if (next) localStorage.removeItem(key);
      else localStorage.setItem(key, '1');
    } catch {
      // ignore
    }
  };
  return (
    <details className="page-guide" open={open} onToggle={(e) => toggle((e.target as HTMLDetailsElement).open)}>
      <summary>New here? How to use this page</summary>
      <p><Explained text={guide.what} /></p>
      <ol>
        {guide.steps.map((s, i) => <li key={i}><Explained text={s} /></li>)}
      </ol>
      {guide.tip && <p className="small"><b>Tip.</b> <Explained text={guide.tip} /></p>}
    </details>
  );
}

export function Modal({ title, onClose, children, footer, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Ring({ value, size = 92, color = 'var(--accent)' }: { value: number; size?: number; color?: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} />
      </svg>
      <div className="ring-label" style={{ fontSize: size < 80 ? 14 : 19 }}>{Math.round(value)}%</div>
    </div>
  );
}

export const complianceColor = (pct: number) => (pct >= 75 ? 'var(--low)' : pct >= 50 ? 'var(--medium)' : 'var(--critical)');

/** Stacked bar of coverage statuses. */
export function CoverageBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  const parts: [string, string][] = [['met', 'var(--low)'], ['partial', 'var(--medium)'], ['not_met', 'var(--high)'], ['gap', 'var(--critical)']];
  return (
    <div className="bar" title={parts.map(([k]) => `${humanize(k)}: ${counts[k] ?? 0}`).join(' · ')}>
      {parts.map(([k, color]) => (counts[k] ? <span key={k} style={{ width: `${(counts[k] / total) * 100}%`, background: color }} /> : null))}
    </div>
  );
}

let toastSetter: ((msg: string | null) => void) | null = null;
export const toast = (msg: string) => toastSetter?.(msg);

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    toastSetter = setMsg;
    return () => {
      toastSetter = null;
    };
  }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

export function Loading({ error }: { error?: string | null }) {
  return <div className="spinner">{error ? `Could not load: ${error}` : 'Loading…'}</div>;
}
