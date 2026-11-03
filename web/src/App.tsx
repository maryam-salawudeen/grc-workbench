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
import { Risks } from './pages/Risks';
import { RiskDetail } from './pages/RiskDetail';
import { ControlDetail } from './pages/ControlDetail';
import { Frameworks } from './pages/Frameworks';
import { FrameworkDetail } from './pages/FrameworkDetail';
import { AssessmentDetail } from './pages/AssessmentDetail';
import { RiskLab } from './pages/RiskLab';
import { Assessments, Assets, Controls, Findings, People, Policies, Vendors } from './pages/registers';

const NAV: { group: string; items: [to: string, label: string, icon: string][] }[] = [
  { group: 'My work', items: [['/inbox', 'Work inbox', 'inbox'], ['/practice', 'Case studies', 'case'], ['/', 'Dashboard', 'dashboard'], ['/sync', 'Sync devices', 'activity']] },
  { group: 'Risk', items: [['/risks', 'Risk register', 'risk'], ['/assets', 'Assets', 'asset']] },
  {
    group: 'Compliance',
    items: [
      ['/controls', 'Controls', 'control'],
      ['/frameworks', 'Frameworks', 'framework'],
      ['/assessments', 'Assessments', 'assessment'],
      ['/findings', 'Findings', 'finding'],
      ['/website-check', 'Website check', 'globe'],
    ],
  },
  { group: 'Governance', items: [['/policies', 'Policies', 'policy'], ['/vendors', 'Vendors', 'vendor'], ['/people', 'People', 'people']] },
  { group: 'Learn', items: [['/learn', 'How GRC fits together', 'framework'], ['/lab', 'Risk lab', 'learn'], ['/glossary', 'Glossary', 'book']] },
];

export function App() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const workspace = useWorkspace();
  const [briefOpen, setBriefOpen] = useBriefOpen();
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
        <div style={{ padding: '0 10px 14px' }}>
          <ExplainToggle />
        </div>
        {NAV.map((g) => (
          <div className="nav-group" key={g.group}>
            <span>{g.group}</span>
            {g.items.map(([to, label, icon]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon name={icon} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="org">
          <div style={{ color: '#fff', fontWeight: 500 }}>{workspace.org_name}</div>
          <div>{workspace.scenario ? 'Practice scenario' : 'Demo organisation'} · <Link to="/practice" style={{ color: '#7fd6cd' }}>Switch</Link></div>
          {LOCAL_BACKEND && <SyncLine />}
        </div>
      </aside>
      <div className="main">
        <div className="mobile-bar">
          <button onClick={() => setOpen((o) => !o)} aria-label="Open navigation">
            <Icon name="menu" size={22} />
          </button>
          <strong>GRC Workbench</strong>
          <span style={{ marginLeft: 'auto' }}><ExplainToggle compact /></span>
        </div>
        {workspace.scenario && (
          <div className="practice-bar">
            <span><b>Practice:</b> {workspace.org_name}</span>
            <span className="actions">
              <button className="btn sm" onClick={() => setBriefOpen(!briefOpen)} aria-pressed={briefOpen}>
                {briefOpen ? 'Hide brief' : 'Show brief beside'}
              </button>
              <Link to="/practice/review" className="btn sm primary">Check my work</Link>
            </span>
          </div>
        )}
        {open && <div className="overlay" style={{ zIndex: 35, background: 'rgb(0 0 0 / 0.4)' }} onClick={() => setOpen(false)} />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
  const text = !s.code ? 'Saved on this device only.' : s.state === 'syncing' ? 'Syncing…' : s.state === 'error' ? 'Sync problem.' : `Synced ${syncedAgo(s.syncedAt)}.`;
  return (
    <div style={{ marginTop: 8, color: '#8a98a6' }}>
      {text} <Link to="/sync" style={{ color: '#7fd6cd' }}>{s.code ? 'Sync settings' : 'Sync with your phone'}</Link>
    </div>
  );
}
