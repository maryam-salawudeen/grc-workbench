import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { downloadCsv, useApi, type Row } from '../api';
import { DataTable, matches } from '../components/DataTable';
import { Icon } from '../components/icons';
import { CoverageBar, Loading, PageHeader, Ring, StatusBadge, complianceColor } from '../components/ui';
import { Explained } from '../components/Explain';
import { FRAMEWORK_EXPLAINED } from '../../../shared/explain/frameworks.ts';
import { REQUIREMENT_EXPLAINED } from '../../../shared/explain/requirements.ts';

const STATUS_ORDER = ['gap', 'not_met', 'partial', 'met', 'not_applicable'];

export function FrameworkDetail() {
  const { id } = useParams();
  const { data, error } = useApi<Row>(`/frameworks/${id}`);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [domain, setDomain] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);

  const rows = useMemo(
    () => (data?.requirements ?? []).filter((r: Row) => (!status || r.status === status) && (!domain || r.domain === domain) && matches(r, q, ['ref', 'title'])),
    [data, q, status, domain],
  );

  if (!data) return <div className="page"><Loading error={error} /></div>;

  return (
    <div className="page">
      <PageHeader
        crumbs={<><Link to="/frameworks">Frameworks</Link> / {data.code}</>}
        title={`${data.name} ${data.version}`}
        description={data.description}
        actions={
          <button
            className="btn"
            onClick={() =>
              downloadCsv(`${data.code}-gap-analysis.csv`, data.requirements, [
                { key: 'ref', label: 'Requirement' },
                { key: 'title', label: 'Title' },
                { key: 'domain', label: 'Domain' },
                { key: 'status', label: 'Coverage' },
                { key: 'controls', label: 'Mapped controls', csv: (r) => r.controls.map((c: Row) => `${c.ref} (${c.status})`).join('; ') },
              ])
            }
          >
            <Icon name="download" /> Gap analysis CSV
          </button>
        }
      />

      {FRAMEWORK_EXPLAINED[data.code] && <AboutFramework code={data.code} />}

      <div className="split" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><h2>Coverage by domain</h2></div>
          <div className="card-body">
            {data.domains.map((d: Row) => (
              <div key={d.domain} className="bar-row" style={{ cursor: 'pointer' }} onClick={() => setDomain(domain === d.domain ? '' : d.domain)}>
                <span className="name" style={{ fontWeight: domain === d.domain ? 600 : 400 }} title={FRAMEWORK_EXPLAINED[data.code]?.domains[d.domain]}>{d.domain}</span>
                <CoverageBar counts={d.counts} total={d.total} />
                <span className="pct">{Math.round(d.score)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Ring value={data.score} size={110} color={complianceColor(data.score)} />
          <div className="grid" style={{ gap: 6 }}>
            {STATUS_ORDER.map((s) => (
              <button key={s} className="btn ghost sm" style={{ justifyContent: 'flex-start' }} onClick={() => setStatus(status === s ? '' : s)}>
                <StatusBadge value={s} /> <b className="num">{data.counts[s]}</b>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" type="search" placeholder="Search requirements…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requirements" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Coverage">
              <option value="">All coverage</option>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{s === 'gap' ? 'No control' : s.replace('_', ' ')}</option>)}
            </select>
            <select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Domain">
              <option value="">All domains</option>
              {data.domains.map((d: Row) => <option key={d.domain}>{d.domain}</option>)}
            </select>
            <label className="small" style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={showEvidence} onChange={(e) => setShowEvidence(e.target.checked)} /> Show the evidence an auditor looks for
            </label>
          </div>
          <span className="small muted">{rows.length} requirements</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: 'ref', label: 'Ref', render: (r) => <span className="mono nowrap">{r.ref}</span> },
            {
              key: 'title',
              label: 'Requirement',
              render: (r) => {
                const [meaning, evidence] = REQUIREMENT_EXPLAINED[r.ref] ?? [];
                return (
                  <div>
                    <div className="title">{r.title}</div>
                    {meaning && <div className="small">{meaning}</div>}
                    {showEvidence && evidence && <div className="small muted" style={{ marginTop: 3 }}><b>Evidence:</b> {evidence}</div>}
                    <div className="small faint">{r.domain}</div>
                  </div>
                );
              },
              csv: (r) => r.title,
            },
            { key: 'status', label: 'Coverage', render: (r) => <StatusBadge value={r.status} />, sortValue: (r) => STATUS_ORDER.indexOf(r.status) },
            {
              key: 'controls',
              label: 'Mapped controls',
              sortValue: (r) => r.controls.length,
              render: (r) =>
                r.controls.length ? (
                  <div className="chips">
                    {r.controls.map((c: Row) => (
                      <Link key={c.id} to={`/controls/${c.id}`} className="chip" title={`${c.title} (${c.status.replace('_', ' ')})`}>
                        <span className="dot" style={{ color: c.status === 'implemented' ? 'var(--low)' : c.status === 'partial' ? 'var(--medium)' : 'var(--critical)' }} />
                        {c.ref}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span className="faint small">None: map a control to close this gap</span>
                ),
            },
          ]}
          empty="No requirements match."
        />
      </div>
    </div>
  );
}

function AboutFramework({ code }: { code: string }) {
  const f = FRAMEWORK_EXPLAINED[code];
  return (
    <details className="card about-card" style={{ marginBottom: 16 }}>
      <summary><span>About this framework</span><span className="small muted">what it is, who asks for it and how it is organised</span></summary>
      <div className="card-body grid" style={{ gap: 12 }}>
        <dl className="dl">
          <dt>What it is</dt><dd><Explained text={f.what} /></dd>
          <dt>Certification</dt><dd><Explained text={f.certifiable} /></dd>
          <dt>Who asks for it</dt><dd><Explained text={f.whoAsks} /></dd>
          <dt>Published by</dt><dd>{f.publisher}</dd>
          <dt>How it is organised</dt><dd><Explained text={f.structure} /></dd>
          <dt>Reading references</dt><dd>{f.readingRefs}</dd>
        </dl>
        <div>
          <h3 style={{ marginBottom: 8 }}>The parts of the framework</h3>
          <dl className="dl">
            {Object.entries(f.domains).map(([name, text]) => (
              <div key={name} style={{ display: 'contents' }}>
                <dt><b>{name}</b></dt>
                <dd><Explained text={text} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </details>
  );
}
