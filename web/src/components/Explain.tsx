import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GLOSSARY, termById } from '../glossary';
import { Icon } from './icons';

interface ExplainState {
  on: boolean;
  setOn: (on: boolean) => void;
  open: (id: string) => void;
  /** Which text block on the current page owns the underline for each term. */
  claims: { current: { path: string; owners: Map<string, string> } };
}

const Ctx = createContext<ExplainState>({ on: false, setOn: () => {}, open: () => {}, claims: { current: { path: '', owners: new Map() } } });
export const useExplain = () => useContext(Ctx);

const STORAGE_KEY = 'grc-explain-mode';

export function ExplainProvider({ children }: { children: ReactNode }) {
  const [on, setOnState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'off';
    } catch {
      return true;
    }
  });
  const [current, setCurrent] = useState<string | null>(null);

  const setOn = useCallback((value: boolean) => {
    setOnState(value);
    if (!value) setCurrent(null);
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch {
      // Storage unavailable: the choice lasts for this visit only.
    }
  }, []);
  const claims = useRef({ path: '', owners: new Map<string, string>() });
  const value = useMemo(() => ({ on, setOn, open: setCurrent, claims }), [on, setOn]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {current && <ExplainPanel id={current} onOpen={setCurrent} onClose={() => setCurrent(null)} />}
    </Ctx.Provider>
  );
}

function ExplainPanel({ id, onOpen, onClose }: { id: string; onOpen: (id: string) => void; onClose: () => void }) {
  const t = termById(id);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!t) return null;
  return (
    <aside className="explain-panel" role="dialog" aria-label={`Explanation: ${t.term}`}>
      <div className="explain-head">
        <div>
          <div className="small muted">{t.group}</div>
          <h2>{t.term}</h2>
        </div>
        <button className="btn ghost sm" onClick={onClose} aria-label="Close explanation">
          <Icon name="close" />
        </button>
      </div>
      <p className="explain-short">{t.short}</p>
      <p>{t.explain}</p>
      {t.example && (
        <p>
          <b>Example.</b> {t.example}
        </p>
      )}
      {t.why && (
        <p>
          <b>Why it matters.</b> {t.why}
        </p>
      )}
      {t.related && t.related.length > 0 && (
        <div className="explain-related">
          <span className="small muted">Related:</span>
          {t.related.map((r) => {
            const rt = termById(r);
            return rt ? (
              <button key={r} className="chip" onClick={() => onOpen(r)}>
                {rt.term}
              </button>
            ) : null;
          })}
        </div>
      )}
      <Link className="small" to={`/glossary?term=${t.id}`} onClick={onClose}>
        See every term in the glossary
      </Link>
    </aside>
  );
}

/** A word the reader can click to get a beginner explanation. */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const { on, open } = useExplain();
  if (!on || !termById(id)) return <>{children}</>;
  const activate = (e: React.SyntheticEvent) => {
    // Stop the click from also sorting a column, following a link or focusing an input.
    e.preventDefault();
    e.stopPropagation();
    open(id);
  };
  return (
    <span
      className="term"
      role="button"
      tabIndex={0}
      title="Click for an explanation"
      onClick={activate}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && activate(e)}
    >
      {children}
    </span>
  );
}

// Match the longest alias first, as whole words, case-sensitively.
const aliasToId = new Map<string, string>();
for (const t of GLOSSARY) for (const a of t.aliases) if (!aliasToId.has(a)) aliasToId.set(a, t.id);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PATTERN = new RegExp(
  `(?<![\\w-])(${[...aliasToId.keys()].sort((a, b) => b.length - a.length).map(escape).join('|')})(?![\\w-])`,
  'g',
);

/**
 * Text with glossary terms made explainable. Each term is underlined once per page,
 * at its first appearance, so pages stay readable.
 */
export function Explained({ text }: { text: ReactNode }) {
  const { on, claims } = useExplain();
  const self = useId();
  const { pathname } = useLocation();
  if (!on || typeof text !== 'string') return <>{text}</>;
  if (claims.current.path !== pathname) claims.current = { path: pathname, owners: new Map() };
  const owners = claims.current.owners;
  const parts: ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(PATTERN)) {
    const id = aliasToId.get(m[1])!;
    if (seen.has(id)) continue;
    const owner = owners.get(id);
    if (owner && owner !== self) continue;
    owners.set(id, self);
    seen.add(id);
    parts.push(text.slice(last, m.index));
    parts.push(
      <Term key={m.index} id={id}>
        {m[1]}
      </Term>,
    );
    last = m.index! + m[1].length;
  }
  if (!parts.length) return <>{text}</>;
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/** The on/off switch shown in the sidebar and mobile bar. */
export function ExplainToggle({ compact }: { compact?: boolean }) {
  const { on, setOn } = useExplain();
  return (
    <label className={`explain-toggle ${compact ? 'compact' : ''}`} title="Underline jargon so you can click it for a plain-English explanation">
      <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
      <span>Explain mode{compact ? '' : on ? ': on' : ': off'}</span>
    </label>
  );
}
