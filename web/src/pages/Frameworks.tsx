import { Link } from 'react-router-dom';
import { useApi, type Row } from '../api';
import { CoverageBar, Loading, PageHeader, Ring, complianceColor } from '../components/ui';

export function Frameworks() {
  const { data, error } = useApi<Row[]>('/frameworks');
  if (!data) return <div className="page"><Loading error={error} /></div>;
  return (
    <div className="page">
      <PageHeader
        title="Frameworks"
        description="Compliance is calculated from the controls mapped to each requirement: implemented counts 1, partial 0.5, planned or not implemented 0. A requirement with no mapped control is a gap."
      />
      <div className="grid cols-3">
        {data.map((f) => (
          <Link key={f.id} to={`/frameworks/${f.id}`} className="card card-pad" style={{ color: 'inherit', textDecoration: 'none' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Ring value={f.score} color={complianceColor(f.score)} />
              <div>
                <h2>{f.name}</h2>
                <div className="small muted">Version {f.version} · {f.total} requirements</div>
              </div>
            </div>
            <p className="small muted" style={{ margin: '14px 0' }}>{f.description}</p>
            <CoverageBar counts={f.counts} total={f.total} />
            <div className="legend">
              <span><i style={{ background: 'var(--low)' }} />{f.counts.met} met</span>
              <span><i style={{ background: 'var(--medium)' }} />{f.counts.partial} partial</span>
              <span><i style={{ background: 'var(--high)' }} />{f.counts.not_met} not met</span>
              <span><i style={{ background: 'var(--critical)' }} />{f.counts.gap} no control</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
