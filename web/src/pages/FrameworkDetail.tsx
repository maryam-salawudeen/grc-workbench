import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { downloadCsv, useApi, type Row } from '../api';
import { DataTable, matches } from '../components/DataTable';
import { Icon } from '../components/icons';
import { CoverageBar, Loading, PageHeader, Ring, StatusBadge, complianceColor } from '../components/ui';

const STATUS_ORDER = ['gap', 'not_met', 'partial', 'met', 'not_applicable'];

export function FrameworkDetail() {
  const { id } = useParams();
  const { data, error } = useApi<Row>(`/frameworks/${id}`);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [domain, setDomain] = useState('');

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

      <div className="split" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><h2>Coverage by domain</h2></div>
          <div className="card-body">
            {data.domains.map((d: Row) => (
              <div key={d.domain} className="bar-row" style={{ cursor: 'pointer' }} onClick={() => setDomain(domain === d.domain ? '' : d.domain)}>
                <span className="name" style={{ fontWeight: domain === d.domain ? 600 : 400 }}>{d.domain}</span>
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
          </div>
          <span className="small muted">{rows.length} requirements</span>
        </div>
        <DataTable
          rows={rows}
          columns={[
            { key: 'ref', label: 'Ref', render: (r) => <span className="mono nowrap">{r.ref}</span> },
            { key: 'title', label: 'Requirement', render: (r) => <div><div className="title">{r.title}</div><div className="small muted">{r.domain}</div></div> },
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
