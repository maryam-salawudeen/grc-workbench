import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GLOSSARY } from '../glossary';
import { useExplain } from '../components/Explain';
import { PageHeader } from '../components/ui';

export function Glossary() {
  const [params] = useSearchParams();
  const focus = params.get('term');
  const [q, setQ] = useState('');
  const { open } = useExplain();

  const groups = useMemo(() => {
    const needle = q.toLowerCase();
    const map = new Map<string, typeof GLOSSARY>();
    for (const t of GLOSSARY) {
      if (needle && !`${t.term} ${t.aliases.join(' ')} ${t.short} ${t.explain}`.toLowerCase().includes(needle)) continue;
      map.set(t.group, [...(map.get(t.group) ?? []), t]);
    }
    return [...map.entries()];
  }, [q]);

  useEffect(() => {
    if (focus) document.getElementById(`term-${focus}`)?.scrollIntoView({ block: 'center' });
  }, [focus]);

  return (
    <div className="page">
      <PageHeader title="Glossary" description={`${GLOSSARY.length} terms, explained for someone new to governance, risk and compliance.`} />
      <input className="search" style={{ maxWidth: 420, marginBottom: 16 }} type="search" placeholder="Search terms, e.g. residual, MFA, ALE…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the glossary" />
      <div className="grid" style={{ gap: 16 }}>
        {groups.map(([group, terms]) => (
          <section key={group} className="card">
            <div className="card-head"><h2>{group}</h2><span className="small muted">{terms.length}</span></div>
            <dl className="glossary-list">
              {terms.map((t) => (
                <div key={t.id} id={`term-${t.id}`} className={`glossary-item ${focus === t.id ? 'focus' : ''}`}>
                  <dt>{t.term}</dt>
                  <dd>
                    <p><b>{t.short}</b></p>
                    <p>{t.explain}</p>
                    {t.example && <p className="muted"><b>Example.</b> {t.example}</p>}
                    {t.why && <p className="muted"><b>Why it matters.</b> {t.why}</p>}
                    {t.related && (
                      <div className="explain-related">
                        {t.related.map((r) => {
                          const rt = GLOSSARY.find((x) => x.id === r);
                          return rt ? <button key={r} className="chip" onClick={() => open(r)}>{rt.term}</button> : null;
                        })}
                      </div>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        {!groups.length && <div className="empty">No terms match “{q}”.</div>}
      </div>
    </div>
  );
}
