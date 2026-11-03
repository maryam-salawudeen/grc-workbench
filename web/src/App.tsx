import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useWorkspace } from './workspace';
import { LOCAL_BACKEND } from './api';
import { Practice } from './pages/Practice';
import { PracticeBrief } from './pages/PracticeBrief';
import { PracticeReview } from './pages/PracticeReview';
import { Glossary } from './pages/Glossary';
import { Inbox } from './pages/Inbox';
import { HowItFits } from './pages/HowItFits';
import { Sync } from './pages/Sync';
import { syncedAgo, useSyncStatus } from './useSync';
import { LabPlayer } from './pages/LabPlayer';
import { WebsiteCheck } from './pages/WebsiteCheck';
import { ExplainToggle } from './components/Explain';
import { BriefPanel } from './components/BriefPanel';
import { useBriefOpen } from './persist';
import { Icon } from './components/icons';
import { Toaster } from './components/ui';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Risks } from './pages/Risks';
import { RiskDetail } from './pages/RiskDetail';
import { ControlDetail } from './pages/ControlDetail';
import { Frameworks } from './pages/Frameworks';
import { FrameworkDetail } from './pages/FrameworkDetail';
import { AssessmentDetail } from './pages/AssessmentDetail';
import { RiskLab } from './pages/RiskLab';
import { Assessments, Assets, Controls, Findings, People, Policies, Vendors } from './pages/registers';

type NavItem = [to: string, label: string, icon: string];

const WORK: NavItem[] = [
  ['/inbox', 'Work inbox', 'inbox'],
  ['/practice', 'Case studies', 'case'],
];
const WORKSPACE: NavItem[] = [
  ['/dashboard', 'Overview', 'dashboard'],
  ['/risks', 'Risk register', 'risk'],
  ['/controls', 'Controls', 'control'],
  ['/frameworks', 'Frameworks', 'framework'],
  ['/assessments', 'Assessments', 'assessment'],
  ['/findings', 'Findings', 'finding'],
];
const MORE: NavItem[] = [
  ['/assets', 'Assets', 'asset'],
  ['/policies', 'Policies', 'policy'],
  ['/vendors', 'Vendors', 'vendor'],
  ['/people', 'People', 'people'],
  ['/website-check', 'Website check', 'globe'],
];
const LEARN: NavItem[] = [
  ['/learn', 'Start here', 'book'],
  ['/lab', 'Risk lab', 'learn'],
  ['/glossary', 'Glossary', 'book'],
];

function NavItems({ items }: { items: NavItem[] }) {
  return (
    <>
      {items.map(([to, label, icon]) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Icon name={icon} />
          {label}
        </NavLink>
      ))}
    </>
  );
}

export function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const workspace = useWorkspace();
  const [briefOpen, setBriefOpen] = useBriefOpen();
  const inMore = MORE.some(([to]) => location.pathname.startsWith(to));
  const [moreOpen, setMoreOpen] = useState(inMore);
  useEffect(() => {
    if (inMore) setMoreOpen(true);
  }, [inMore]);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 2 4 7v8c0 7.5 5.1 13.4 12 15 6.9-1.6 12-7.5 12-15V7z" fill="#3fb7ad" />
            <path d="M11 16l3.5 3.5L21 13" fill="none" stroke="#0a1016" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            GRC Workbench
            <small>GRC work simulator</small>
          </div>
        </div>
        <nav className="nav-body">
          <NavItems items={[['/', 'Home', 'dashboard']]} />
          <div className="nav-group">
            <span>Work</span>
            <NavItems items={WORK} />
          </div>
          <div className="nav-group">
            <span>Client workspace</span>
            <div className="nav-client" title={workspace.org_name}>{workspace.org_name}</div>
            <NavItems items={WORKSPACE} />
            <details className="nav-more" open={moreOpen} onToggle={(e) => setMoreOpen((e.target as HTMLDetailsElement).open)}>
              <summary className="nav-link">
                <Icon name="plus" />
                More records
              </summary>
              <NavItems items={MORE} />
            </details>
          </div>
          <div className="nav-group">
            <span>Learn</span>
            <NavItems items={LEARN} />
          </div>
        </nav>
        <div className="nav-foot">
          <div className="small">
            <span style={{ color: '#fff' }}>{workspace.scenario ? 'Case study' : 'Demo client'}</span> · <Link to="/practice" style={{ color: '#7fd6cd' }}>Switch</Link>
          </div>
          {LOCAL_BACKEND && <SyncLine />}
          <ExplainToggle />
        </div>
      </aside>
      <div className="main">
        <div className="mobile-bar">
          <button onClick={() => setOpen((o) => !o)} aria-label="Open navigation">
            <Icon name="menu" size={22} />
          </button>
          <strong>GRC Workbench</strong>
        </div>
        {workspace.scenario && (
          <div className="practice-bar">
            <span><b>Case study:</b> {workspace.org_name}</span>
            <span className="actions">
              <button className="btn sm" onClick={() => setBriefOpen(!briefOpen)} aria-pressed={briefOpen}>
                {briefOpen ? 'Hide brief' : 'Brief'}
              </button>
              <Link to="/practice/review" className="btn sm primary">Check my work</Link>
            </span>
          </div>
        )}
        {open && <div className="overlay" style={{ zIndex: 35, background: 'rgb(0 0 0 / 0.4)' }} onClick={() => setOpen(false)} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/risks/:id" element={<RiskDetail />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/controls/:id" element={<ControlDetail />} />
          <Route path="/frameworks" element={<Frameworks />} />
          <Route path="/frameworks/:id" element={<FrameworkDetail />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/assessments/:id" element={<AssessmentDetail />} />
          <Route path="/findings" element={<Findings />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/people" element={<People />} />
          <Route path="/lab" element={<RiskLab />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/learn" element={<HowItFits />} />
          <Route path="/sync" element={<Sync />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:id" element={<LabPlayer />} />
          <Route path="/website-check" element={<WebsiteCheck />} />
          <Route path="/practice/brief" element={<PracticeBrief />} />
          <Route path="/practice/review" element={<PracticeReview />} />
          <Route path="*" element={<div className="page"><h1>Page not found</h1></div>} />
        </Routes>
      </div>
      <BriefPanel />
      <Toaster />
    </div>
  );
}

function SyncLine() {
  const s = useSyncStatus();
  const text = !s.code ? 'Sync with your phone' : s.state === 'syncing' ? 'Syncing…' : s.state === 'error' ? 'Sync problem' : `Synced ${syncedAgo(s.syncedAt)}`;
  return (
    <Link to="/sync" className="nav-sync small">
      <Icon name="activity" size={14} /> {text}
    </Link>
  );
}
