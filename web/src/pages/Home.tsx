import { Link } from 'react-router-dom';
import { EMPLOYER, LABS } from '../../../shared/labs/index.ts';
import { useAllLabProgress } from '../labProgress';
import { useWorkspace } from '../workspace';
import { Icon } from '../components/icons';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** The starting point: one clear next step, two alternatives, nothing else. */
export function Home() {
  const progress = useAllLabProgress();
  const workspace = useWorkspace();
  const done = LABS.filter((l) => progress[l.id].done).length;
  const next = LABS.find((l) => !progress[l.id].done);
  const inProgress = next && progress[next.id].started;

  return (
    <div className="page home">
      <header className="home-head">
        <h1>{greeting()}</h1>
        <p className="muted">You are a junior GRC analyst at {EMPLOYER.name}. Here is where to pick up.</p>
      </header>

      {next ? (
        <Link to={`/inbox/${next.id}`} className="card home-next">
          <div className="small muted">{inProgress ? 'Continue where you left off' : 'Your next request'}</div>
          <h2>{next.title}</h2>
          <p className="muted">
            From {next.from.name}, {next.client} · about {next.minutes} minutes
          </p>
          <div className="home-progress">
            <div className="bar"><span style={{ width: `${(done / LABS.length) * 100}%`, background: 'var(--accent)' }} /></div>
            <span className="small muted">{done} of {LABS.length} requests done</span>
          </div>
          <span className="btn primary home-cta">
            {inProgress ? 'Continue' : 'Open request'} <Icon name="arrow" />
          </span>
        </Link>
      ) : (
        <div className="card home-next">
          <h2>Inbox zero</h2>
          <p className="muted">You have finished every request. Try a case study, or revisit any request to improve your score.</p>
          <Link to="/inbox" className="btn home-cta">Open the inbox</Link>
        </div>
      )}

      <div className="home-more">
        <Link to={workspace.scenario ? '/practice/brief' : '/practice'} className="card home-tile">
          <Icon name="case" size={22} />
          <div>
            <h3>{workspace.scenario ? `Case study: ${workspace.org_name}` : 'Case studies'}</h3>
            <p className="small muted">{workspace.scenario ? 'Carry on building this client\'s risk register.' : 'Assess a whole organisation and compare your register with a model answer.'}</p>
          </div>
        </Link>
        <Link to="/learn" className="card home-tile">
          <Icon name="book" size={22} />
          <div>
            <h3>New to GRC? Start here</h3>
            <p className="small muted">A short tour of how risks, controls, frameworks and audits connect.</p>
          </div>
        </Link>
      </div>

      <p className="small muted home-foot">
        Want the whole picture for {workspace.org_name}? <Link to="/dashboard">Open the client dashboard</Link>.
      </p>
    </div>
  );
}
