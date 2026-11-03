import { Link } from 'react-router-dom';
import { CISSP_DOMAINS } from '../../../shared/labs/index.ts';
import { FRAMEWORK_EXPLAINED } from '../../../shared/explain/frameworks.ts';
import { Explained } from '../components/Explain';
import { PageHeader } from '../components/ui';

const CHAIN: { id: string; label: string; to: string; short: string }[] = [
  { id: 'assets', label: 'Assets', to: '/assets', short: 'What you protect' },
  { id: 'risks', label: 'Risks', to: '/risks', short: 'What could go wrong' },
  { id: 'controls', label: 'Controls', to: '/controls', short: 'What reduces it' },
  { id: 'frameworks', label: 'Frameworks', to: '/frameworks', short: 'The standard you measure against' },
  { id: 'assessments', label: 'Assessments', to: '/assessments', short: 'Checking the controls work' },
  { id: 'findings', label: 'Findings', to: '/findings', short: 'Problems to fix' },
];

const SECTIONS: { id: string; title: string; to: string; body: string[]; inApp: string }[] = [
  {
    id: 'assets',
    title: 'Assets: what you are protecting',
    to: '/assets',
    body: [
      'An asset is anything of value: customer data, a payments system, laptops, a building, a business process. Each asset has an owner who is accountable for it, a classification that says how sensitive it is, and often a value in dollars.',
      'Everything else in GRC points back to assets. A risk is always a risk to an asset, and a control always protects one.',
    ],
    inApp: 'The Assets page lists each organisation\'s assets with owner, classification, criticality and value. The value feeds AV in quantitative analysis.',
  },
  {
    id: 'risks',
    title: 'Risks: what could go wrong',
    to: '/risks',
    body: [
      'A risk is a threat exploiting a vulnerability to harm an asset. You score how likely it is and how bad it would be, before your planned fixes (inherent risk) and after them (residual risk).',
      'The organisation\'s risk appetite says how much risk it will live with. Anything above appetite needs treatment: mitigate it with controls, transfer it (insurance, contracts), avoid it, or have a senior person formally accept it.',
    ],
    inApp: 'The risk register holds each risk with its scores, owner, treatment and linked controls. The heat map shows where risks sit.',
  },
  {
    id: 'controls',
    title: 'Controls: what reduces the risk',
    to: '/controls',
    body: [
      'A control is anything that lowers a risk: a technical tool like MFA, an administrative rule like a policy or a review, or a physical measure like a locked door. Controls are also described by what they do: prevent, detect, correct, deter, recover or compensate.',
      'Good practice is one common set of controls for the whole organisation. Each control is linked to the risks it reduces and mapped to the framework requirements it satisfies, so it is built once, tested once and counted everywhere.',
    ],
    inApp: 'The Controls page shows each control\'s implementation status. Open one to see what it is, how it works, the evidence that proves it, and its mappings.',
  },
  {
    id: 'frameworks',
    title: 'Frameworks: the standard you are measured against',
    to: '/frameworks',
    body: [
      'A framework is a published list of good security practices. Organisations choose frameworks because customers, regulators or the board ask for them, or simply to have a structured baseline.',
      'This app uses three, each with a different purpose:',
    ],
    inApp: 'Each framework page shows every requirement in plain English, which controls cover it and the evidence an auditor would expect. Requirements with no control are your gaps.',
  },
  {
    id: 'assessments',
    title: 'Assessments: checking it all works',
    to: '/assessments',
    body: [
      'An assessment (or audit) goes through a framework requirement by requirement and asks: is this met, and what is the evidence? The usual steps are planning the scope, collecting evidence, testing a sample, recording a result for each requirement and reporting findings.',
      'Results are compliant, partially compliant, non-compliant or not applicable. Internal assessments help you get ready; external audits lead to a certificate (ISO 27001) or a report (SOC 2).',
    ],
    inApp: 'The Assessments page creates a checklist with one item per requirement. You can pre-fill results from control status, add notes and evidence, and raise findings.',
  },
  {
    id: 'findings',
    title: 'Findings: the problems to fix',
    to: '/findings',
    body: [
      'A finding is a gap found by an assessment, audit, test or check. A well-written finding states the condition (what is wrong), the criteria (the requirement it breaks), the cause, the effect and a recommendation.',
      'Each finding gets a severity, an owner and a due date, and is tracked until it is fixed and the fix is checked. Findings often link to a risk in the register, which closes the loop back to the start.',
    ],
    inApp: 'The Findings page tracks every open item; overdue ones are highlighted. The website check and assessments can raise findings for you.',
  },
];

export function HowItFits() {
  return (
    <div className="page">
      <PageHeader
        title="How GRC fits together"
        description="Governance, risk and compliance is one connected cycle. Read this page once and the rest of the app (and most GRC jobs) will make more sense."
      />

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 12 }}>The cycle</h2>
        <ol className="gr-chain">
          {CHAIN.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="gr-chain-step">
                <span className="gr-chain-num">{i + 1}</span>
                <span>
                  <b>{c.label}</b>
                  <span className="small muted">{c.short}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
        <p className="small muted" style={{ marginTop: 12 }}>
          Findings feed back into the risk register, so the cycle repeats. Around it sit governance (policies, roles and oversight) and third-party risk (the same cycle applied to suppliers).
        </p>
      </div>

      <div className="grid" style={{ gap: 16 }}>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id} className="card card-pad gr-section">
            <div className="small muted">Step {i + 1}</div>
            <h2>{s.title}</h2>
            {s.body.map((p, j) => <p key={j}><Explained text={p} /></p>)}
            {s.id === 'frameworks' && (
              <div className="table-wrap" style={{ margin: '6px 0' }}>
                <table className="gr-compare">
                  <thead>
                    <tr><th></th><th>NIST CSF 2.0</th><th>ISO/IEC 27001</th><th>SOC 2</th></tr>
                  </thead>
                  <tbody>
                    {([
                      ['What it is', 'what'],
                      ['Can you be certified?', 'certifiable'],
                      ['Who asks for it', 'whoAsks'],
                      ['Published by', 'publisher'],
                    ] as const).map(([label, key]) => (
                      <tr key={key}>
                        <th scope="row">{label}</th>
                        {(['NIST-CSF', 'ISO-27001', 'SOC2'] as const).map((code) => <td key={code} data-label={code}>{FRAMEWORK_EXPLAINED[code][key]}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="callout small">
              <b>In this app.</b> <Explained text={s.inApp} /> <Link to={s.to}>Open {s.title.split(':')[0].toLowerCase()}</Link>
            </div>
          </section>
        ))}

        <section id="governance" className="card card-pad gr-section">
          <h2>Around the cycle: governance and suppliers</h2>
          <p><Explained text="Governance is how decisions get made: policies approved by management, named owners, a risk appetite set by the board, and regular reporting. It gives the cycle its authority." /></p>
          <p><Explained text="Third-party risk applies the same cycle to suppliers: list them (assets), tier them by risk, check their controls through questionnaires and SOC 2 reports (assessment), and track problems as findings or contract changes." /></p>
          <div className="actions">
            <Link className="btn sm" to="/policies">Policies</Link>
            <Link className="btn sm" to="/vendors">Vendors</Link>
          </div>
        </section>

        <section id="cissp" className="card card-pad gr-section">
          <h2>Where the CISSP domains show up</h2>
          <p className="small muted">The work inbox labs are tagged with these domains, so you can practise one area at a time.</p>
          <div className="table-wrap">
            <table className="gr-compare">
              <thead><tr><th>Domain</th><th>Where you practise it</th></tr></thead>
              <tbody>
                {[
                  'Risk register, Risk lab, policies, vendors, risk acceptance and board reporting labs',
                  'Data classification and media disposal labs, asset classification',
                  'Cloud shared responsibility lab, secure configuration controls',
                  'Firewall rule review lab, website check (HTTPS and headers)',
                  'Access review and segregation of duties labs, identity controls',
                  'Assessments, control testing and audit evidence labs',
                  'Incident triage, recovery targets, tabletop and vulnerability labs',
                  'Change review lab, secure SDLC control',
                ].map((where, i) => (
                  <tr key={i}>
                    <th scope="row">{i + 1}. {CISSP_DOMAINS[i + 1]}</th>
                    <td>{where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions" style={{ marginTop: 10 }}>
            <Link className="btn primary sm" to="/inbox">Open the work inbox</Link>
            <Link className="btn sm" to="/glossary">Glossary</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
