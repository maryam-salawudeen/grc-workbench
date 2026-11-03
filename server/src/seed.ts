// Demo data for a fictional organisation, Maple Ridge Credit Union.
// Dates are relative to today so the demo always has upcoming and overdue work.
import { rmSync } from 'node:fs';
import { logActivity, openDb, setSetting, transaction, type DB } from './db.ts';
import { FRAMEWORKS } from './frameworks.ts';
import { frameworkCoverage, suggestedResult } from './compliance.ts';

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toLocaleDateString('en-CA');
};

const PEOPLE = [
  ['Amara Okafor', 'Chief Information Security Officer', 'Information Security', 'amara.okafor@mapleridge.example'],
  ['Daniel Chen', 'IT Operations Manager', 'IT', 'daniel.chen@mapleridge.example'],
  ['Priya Natarajan', 'Compliance & Audit Lead', 'Risk & Compliance', 'priya.natarajan@mapleridge.example'],
  ['Marc Tremblay', 'Head of Infrastructure', 'IT', 'marc.tremblay@mapleridge.example'],
  ['Sofia Alvarez', 'Director of People', 'Human Resources', 'sofia.alvarez@mapleridge.example'],
  ['James Whitfield', 'Chief Financial Officer', 'Finance', 'james.whitfield@mapleridge.example'],
  ['Leila Haddad', 'Application Development Lead', 'Digital', 'leila.haddad@mapleridge.example'],
  ['Tom Becker', 'Procurement Manager', 'Finance', 'tom.becker@mapleridge.example'],
  ['Grace Mensah', 'Privacy Officer', 'Risk & Compliance', 'grace.mensah@mapleridge.example'],
] as const;
// Person ids by order above.
const [AMARA, DANIEL, PRIYA, MARC, SOFIA, JAMES, LEILA, TOM, GRACE] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const ASSETS: [string, string, string, number, number, number, string][] = [
  ['Core banking platform', 'application', 'restricted', 5, 4_000_000, MARC, 'Member accounts, loans and the general ledger.'],
  ['Member data warehouse', 'data', 'restricted', 5, 2_500_000, LEILA, 'Analytics copy of member PII and transaction history.'],
  ['Online & mobile banking', 'application', 'confidential', 5, 1_800_000, LEILA, 'Internet-facing member channel.'],
  ['Identity platform (Entra ID)', 'identity', 'confidential', 5, 900_000, DANIEL, 'Staff identities, SSO and MFA.'],
  ['Email & collaboration suite', 'saas', 'internal', 4, 400_000, DANIEL, 'Email, file sharing and chat.'],
  ['Primary data centre', 'facility', 'internal', 4, 3_000_000, MARC, 'Head-office server room and network core.'],
  ['Staff laptops', 'endpoint', 'confidential', 3, 600_000, DANIEL, '~420 managed Windows and macOS laptops.'],
  ['Card payment processing', 'process', 'restricted', 5, 1_200_000, JAMES, 'Debit card authorisation and settlement.'],
  ['HR & payroll system', 'saas', 'restricted', 4, 350_000, SOFIA, 'Employee records, salaries and banking details.'],
  ['Backup infrastructure', 'infrastructure', 'confidential', 4, 500_000, MARC, 'Backup appliance and offsite cloud vault.'],
];

// title, category, asset, owner, threat, vulnerability, L, I, rL, rI, treatment, status, due offset, AV, EF%, ARO, plan
type RiskSeed = [string, string, number, number, string, string, number, number, number | null, number | null, string, string, number | null, number | null, number | null, number | null, string];
const RISKS: RiskSeed[] = [
  ['Ransomware encrypts core banking and backups', 'Cyber', 1, AMARA, 'Organised ransomware groups', 'Flat network segments and backups reachable from the domain', 4, 5, 2, 4, 'mitigate', 'in_treatment', 45, 4_000_000, 40, 0.1, 'Immutable backups, EDR on all servers, network segmentation of backup VLAN.'],
  ['Phishing leads to staff account takeover', 'Cyber', 4, DANIEL, 'Credential phishing campaigns', 'Users can approve unexpected MFA prompts', 5, 4, 3, 3, 'mitigate', 'in_treatment', 30, 900_000, 15, 2, 'Phishing-resistant MFA for admins, number matching, quarterly simulations.'],
  ['Exploitation of internet-facing banking app', 'Cyber', 3, LEILA, 'External attackers', 'Patch SLA missed for critical vulnerabilities', 3, 5, 2, 4, 'mitigate', 'in_treatment', 21, 1_800_000, 30, 0.3, 'WAF tuning, 14-day critical patch SLA, annual penetration test.'],
  ['Core banking provider outage', 'Third party', 1, JAMES, 'Provider service failure', 'Single provider, no tested failover', 2, 5, 2, 4, 'transfer', 'in_treatment', 90, 4_000_000, 5, 0.5, 'Contractual SLA credits and business interruption insurance.'],
  ['Insider misuse of member data', 'Data privacy', 2, GRACE, 'Malicious or careless insider', 'Broad read access to warehouse, no DLP', 2, 5, 2, 4, 'mitigate', 'open', 120, 2_500_000, 20, 0.2, 'Role-based access to warehouse, DLP, user activity monitoring.'],
  ['Privacy breach triggers regulator notification', 'Compliance', 2, GRACE, 'Any data breach of member PII', 'Breach response steps not rehearsed', 3, 4, 2, 4, 'mitigate', 'open', 60, null, null, null, 'Breach notification runbook and annual tabletop with legal.'],
  ['Loss of primary data centre', 'Business continuity', 6, MARC, 'Fire, flood or prolonged power loss', 'DR site recovery not fully tested', 1, 5, 1, 4, 'mitigate', 'in_treatment', 150, 3_000_000, 60, 0.02, 'Annual DR failover test and generator maintenance contract.'],
  ['Lost or stolen laptop exposes data', 'Data privacy', 7, DANIEL, 'Theft or loss while travelling', 'Laptops without disk encryption', 3, 3, 1, 3, 'mitigate', 'closed', null, 600_000, 2, 6, 'BitLocker / FileVault enforced through MDM. Completed.'],
  ['Privileged access not reviewed', 'Cyber', 4, MARC, 'Misuse of stale admin accounts', 'No periodic review of privileged groups', 3, 4, null, null, 'mitigate', 'open', 30, null, null, null, 'Deploy PAM vault and quarterly privileged access reviews.'],
  ['Cardholder data exposure', 'Compliance', 8, JAMES, 'Attackers targeting card data', 'Card data in scope of legacy reporting server', 2, 5, 2, 3, 'mitigate', 'in_treatment', 75, 1_200_000, 25, 0.1, 'Tokenise card data and decommission legacy reporting server.'],
  ['Key person dependency in IT operations', 'People', 2, SOFIA, 'Departure of senior engineer', 'Undocumented runbooks', 3, 3, 3, 3, 'accept', 'accepted', null, null, null, null, 'Accepted for 12 months while runbooks are written. Reviewed by CFO.'],
  ['Shadow IT SaaS processing member data', 'Third party', 2, TOM, 'Unvetted SaaS vendors', 'No procurement gate for card-paid SaaS', 4, 3, 3, 3, 'mitigate', 'in_treatment', 40, null, null, null, 'CASB discovery and procurement security review for all SaaS.'],
  ['Business email compromise and wire fraud', 'Fraud', 5, JAMES, 'Invoice and CEO fraud', 'Payment changes accepted by email', 3, 4, 2, 3, 'mitigate', 'in_treatment', 20, 250_000, 100, 0.3, 'Call-back verification for payment detail changes, DMARC reject.'],
  ['Slow breach detection from weak logging', 'Cyber', 4, AMARA, 'Undetected intrusion', 'Partial SIEM coverage, 30-day retention', 3, 4, 3, 3, 'mitigate', 'in_treatment', 60, null, null, null, 'Onboard all critical systems to SIEM with 12-month retention.'],
  ['Backups fail to restore when needed', 'Business continuity', 10, MARC, 'Corrupt or incomplete backups', 'Restores never tested end to end', 2, 5, 2, 5, 'mitigate', 'open', -5, 4_000_000, 25, 0.1, 'Quarterly restore testing of core banking and file shares.'],
];

// title, domain, type, nature, owner, status, effectiveness, last tested offset, test months, framework refs, risk numbers
type ControlSeed = [string, string, string, string, number, string, number | null, number | null, number, string[], number[]];
const CONTROLS: ControlSeed[] = [
  ['Information security policy framework', 'Governance', 'preventive', 'administrative', AMARA, 'implemented', 4, -200, 12, ['GV.PO', 'A.5.1', 'A.5.37', 'CC5.3'], []],
  ['Enterprise risk management methodology', 'Governance', 'preventive', 'administrative', PRIYA, 'implemented', 4, -150, 12, ['GV.RM', 'ID.RA', 'CC3.1', 'CC3.2', 'CC3.4'], []],
  ['Security roles, responsibilities & segregation of duties', 'Governance', 'preventive', 'administrative', AMARA, 'implemented', 3, -260, 12, ['GV.RR', 'A.5.2', 'A.5.3', 'A.5.4', 'CC1.3', 'CC1.5'], []],
  ['Asset inventory & data classification', 'Asset management', 'preventive', 'administrative', DANIEL, 'partial', 2, -100, 12, ['ID.AM', 'A.5.9', 'A.5.10', 'A.5.12', 'A.5.13'], [5]],
  ['Multi-factor authentication', 'Identity & access', 'preventive', 'technical', DANIEL, 'implemented', 4, -60, 6, ['PR.AA', 'A.5.17', 'A.8.5', 'CC6.1'], [2, 13]],
  ['Joiner-mover-leaver access provisioning', 'Identity & access', 'preventive', 'administrative', SOFIA, 'implemented', 3, -90, 6, ['PR.AA', 'A.5.15', 'A.5.16', 'A.5.18', 'A.6.5', 'CC6.2', 'CC6.3'], [5, 9]],
  ['Privileged access management & reviews', 'Identity & access', 'preventive', 'technical', MARC, 'planned', null, null, 3, ['PR.AA', 'A.8.2', 'A.8.18', 'CC6.1', 'CC6.3'], [9, 1]],
  ['Security awareness training & phishing simulation', 'People', 'deterrent', 'administrative', SOFIA, 'implemented', 3, -40, 12, ['PR.AT', 'A.6.3', 'CC1.4', 'CC2.2'], [2, 13]],
  ['Pre-employment screening & NDAs', 'People', 'preventive', 'administrative', SOFIA, 'implemented', 4, -300, 12, ['A.6.1', 'A.6.2', 'A.6.6'], [5]],
  ['Endpoint detection & response (EDR)', 'Endpoint', 'detective', 'technical', DANIEL, 'implemented', 4, -30, 6, ['DE.CM', 'A.8.1', 'A.8.7', 'CC6.8'], [1]],
  ['Vulnerability & patch management', 'Platform security', 'corrective', 'technical', MARC, 'partial', 2, -45, 3, ['ID.RA', 'PR.PS', 'A.8.8', 'A.8.19', 'CC7.1'], [1, 3]],
  ['Secure configuration baselines (CIS)', 'Platform security', 'preventive', 'technical', MARC, 'partial', 2, -210, 12, ['PR.PS', 'A.8.9', 'CC5.2', 'CC7.1'], [3]],
  ['Full-disk encryption on endpoints', 'Data security', 'preventive', 'technical', DANIEL, 'implemented', 5, -70, 12, ['PR.DS', 'A.8.1', 'A.7.9', 'CC6.7'], [8]],
  ['Encryption in transit and at rest', 'Data security', 'preventive', 'technical', MARC, 'implemented', 4, -120, 12, ['PR.DS', 'A.8.24', 'CC6.1', 'CC6.7'], [5, 10]],
  ['Data loss prevention', 'Data security', 'detective', 'technical', GRACE, 'not_implemented', null, null, 12, ['PR.DS', 'A.8.12', 'A.5.14', 'CC6.7'], [5, 6, 12]],
  ['Centralised logging & SIEM monitoring', 'Detection', 'detective', 'technical', AMARA, 'partial', 2, -80, 6, ['DE.CM', 'DE.AE', 'A.8.15', 'A.8.16', 'A.8.17', 'CC7.2', 'CC7.3'], [1, 14]],
  ['Incident response plan & tabletop exercises', 'Incident response', 'corrective', 'administrative', AMARA, 'implemented', 3, -160, 12, ['RS.MA', 'RS.AN', 'RS.CO', 'RS.MI', 'A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28', 'A.6.8', 'CC7.3', 'CC7.4'], [1, 6]],
  ['Immutable offsite backups', 'Resilience', 'recovery', 'technical', MARC, 'implemented', 4, -50, 6, ['PR.DS', 'PR.IR', 'A.8.13', 'CC7.5'], [1, 15]],
  ['Backup restore testing', 'Resilience', 'recovery', 'technical', MARC, 'planned', null, null, 3, ['RC.RP', 'A.8.13', 'CC7.5'], [15]],
  ['Disaster recovery & business continuity plan', 'Resilience', 'recovery', 'administrative', MARC, 'partial', 2, -400, 12, ['PR.IR', 'RC.RP', 'RC.CO', 'A.5.29', 'A.5.30', 'A.8.14', 'CC9.1'], [4, 7]],
  ['Third-party risk management programme', 'Supply chain', 'preventive', 'administrative', TOM, 'partial', 2, -180, 12, ['GV.SC', 'A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', 'A.5.23', 'CC9.2'], [4, 12]],
  ['Network segmentation & firewall management', 'Network', 'preventive', 'technical', MARC, 'implemented', 4, -95, 6, ['PR.IR', 'A.8.20', 'A.8.21', 'A.8.22', 'CC6.6'], [1, 10]],
  ['Secure SDLC & code review', 'Application security', 'preventive', 'administrative', LEILA, 'partial', 3, -110, 12, ['PR.PS', 'A.8.4', 'A.8.25', 'A.8.26', 'A.8.27', 'A.8.28', 'A.8.29', 'A.8.31'], [3]],
  ['Change advisory board', 'Application security', 'preventive', 'administrative', DANIEL, 'implemented', 4, -25, 6, ['PR.PS', 'A.8.32', 'CC8.1'], []],
  ['Physical access control & CCTV', 'Physical', 'deterrent', 'physical', MARC, 'implemented', 4, -140, 12, ['PR.AA', 'A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'CC6.4'], [7]],
  ['Privacy programme & breach notification', 'Privacy', 'corrective', 'administrative', GRACE, 'partial', 2, -230, 12, ['GV.OC', 'A.5.31', 'A.5.33', 'A.5.34', 'CC2.3'], [6]],
  ['Internal audit & management review', 'Assurance', 'detective', 'administrative', PRIYA, 'implemented', 4, -60, 12, ['GV.OV', 'ID.IM', 'A.5.35', 'A.5.36', 'CC2.1', 'CC4.1', 'CC4.2'], []],
  ['Payment change call-back verification', 'Fraud', 'preventive', 'administrative', JAMES, 'implemented', 4, -35, 6, ['CC3.3', 'CC5.1'], [13]],
  ['Secure disposal of media & equipment', 'Physical', 'preventive', 'physical', DANIEL, 'implemented', 4, -190, 12, ['A.7.10', 'A.7.14', 'A.8.10', 'CC6.5'], [8]],
  ['Board risk committee oversight', 'Governance', 'detective', 'administrative', JAMES, 'implemented', 4, -75, 12, ['GV.OV', 'GV.OC', 'CC1.2'], []],
];

// title, category, owner, version, status, approved offset, review months, summary
const POLICIES: [string, string, number, string, string, number | null, number, string][] = [
  ['Information Security Policy', 'Governance', AMARA, '4.1', 'approved', -300, 12, 'Top-level policy setting security objectives, roles and the policy framework.'],
  ['Acceptable Use Policy', 'People', SOFIA, '3.0', 'approved', -385, 12, 'Rules for staff use of devices, email, internet and member data.'],
  ['Access Control Policy', 'Identity & access', DANIEL, '2.3', 'approved', -100, 12, 'Least privilege, MFA, joiner-mover-leaver and access reviews.'],
  ['Data Classification & Handling Standard', 'Data security', GRACE, '2.0', 'approved', -200, 12, 'Four classification levels and handling rules for each.'],
  ['Incident Response Policy', 'Incident response', AMARA, '3.2', 'approved', -342, 12, 'Severity levels, escalation, regulator and member notification.'],
  ['Business Continuity & DR Policy', 'Resilience', MARC, '1.4', 'in_review', -410, 12, 'RTO/RPO targets and the testing programme.'],
  ['Third-Party Risk Management Policy', 'Supply chain', TOM, '1.1', 'approved', -40, 12, 'Vendor tiering, due diligence and ongoing monitoring.'],
  ['Cryptography Standard', 'Data security', MARC, '0.9', 'draft', null, 24, 'Approved algorithms, key lengths and key management.'],
  ['Privacy Policy', 'Privacy', GRACE, '5.0', 'approved', -500, 24, 'How member personal information is collected, used and protected.'],
  ['Change Management Policy', 'Operations', DANIEL, '2.1', 'approved', -150, 12, 'Standard, normal and emergency changes and CAB approval.'],
  ['Remote Working Standard', 'People', SOFIA, '1.0', 'retired', -900, 12, 'Superseded by the Acceptable Use Policy v3.0.'],
];

// name, service, owner, data access, criticality, system access, certifications, last assessed offset, contract end offset, status, notes
const VENDORS: [string, string, number, string, string, boolean, string, number | null, number, string, string][] = [
  ['CoreLedger Systems', 'Core banking platform (SaaS)', JAMES, 'restricted', 'high', true, 'SOC 2 Type II, ISO 27001', -200, 900, 'active', 'Annual SOC 2 bridge letter received.'],
  ['CloudNorth Hosting', 'IaaS for DR and analytics', MARC, 'confidential', 'high', true, 'ISO 27001, SOC 2 Type II', -390, 500, 'active', 'Reassessment overdue; questionnaire sent.'],
  ['PayStream Processing', 'Card authorisation & settlement', JAMES, 'restricted', 'high', true, 'PCI DSS AOC', -120, 700, 'active', 'PCI AOC valid until next year.'],
  ['PeopleFirst HR', 'HR and payroll SaaS', SOFIA, 'restricted', 'medium', false, 'SOC 2 Type II', -500, 300, 'active', 'Payroll banking data in scope.'],
  ['SecureMail Gateway', 'Email filtering', DANIEL, 'internal', 'medium', true, 'ISO 27001', -300, 400, 'active', ''],
  ['PrintRight Services', 'Statement printing & mailing', TOM, 'confidential', 'low', false, '', -600, 200, 'active', 'Receives member names and addresses.'],
  ['Officeclean Ltd', 'Facilities cleaning', TOM, 'none', 'low', false, '', -700, 150, 'active', 'Escorted access to server room only.'],
  ['DocuVault Records', 'Offsite records storage', PRIYA, 'confidential', 'medium', false, 'ISO 27001', -250, 600, 'active', ''],
  ['Chatterbox Analytics', 'Marketing analytics SaaS', LEILA, 'internal', 'low', false, '', null, 365, 'onboarding', 'Security review pending before go-live.'],
];

/** Load the three framework catalogues; returns requirement and framework ids by reference. */
export function seedFrameworks(db: DB) {
  const reqIds = new Map<string, number>();
  const fwIds = new Map<string, number>();
  for (const f of FRAMEWORKS) {
    const fid = Number(db.prepare('INSERT INTO frameworks (code, name, version, description) VALUES (?, ?, ?, ?)').run(f.code, f.name, f.version, f.description).lastInsertRowid);
    fwIds.set(f.code, fid);
    const insert = db.prepare('INSERT INTO requirements (framework_id, ref, title, domain) VALUES (?, ?, ?, ?)');
    for (const [ref, title, domain] of f.requirements) reqIds.set(ref, Number(insert.run(fid, ref, title, domain).lastInsertRowid));
  }
  return { reqIds, fwIds };
}

/** The common control library with framework mappings, for organisations other than the demo. */
export function seedControlLibrary(db: DB, reqIds: Map<string, number>, status: (title: string) => string) {
  const control = db.prepare('INSERT INTO controls (ref, title, domain, type, nature, status, test_frequency_months) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const mapReq = db.prepare('INSERT INTO control_requirements (control_id, requirement_id) VALUES (?, ?)');
  CONTROLS.forEach(([title, domain, type, nature, , , , , freq, refs], i) => {
    const cid = Number(control.run(`CTL-${String(i + 1).padStart(3, '0')}`, title, domain, type, nature, status(title), freq).lastInsertRowid);
    for (const ref of refs) mapReq.run(cid, reqIds.get(ref)!);
  });
}

export const CONTROL_TITLES = new Set(CONTROLS.map((c) => c[0]));

export function seed(db: DB) {
  transaction(db, () => {
    const { reqIds, fwIds } = seedFrameworks(db);
    setSetting(db, 'org_name', 'Maple Ridge Credit Union');

    const person = db.prepare('INSERT INTO people (name, title, department, email) VALUES (?, ?, ?, ?)');
    for (const p of PEOPLE) person.run(...p);

    const asset = db.prepare('INSERT INTO assets (name, type, classification, criticality, value, owner_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const a of ASSETS) asset.run(...a);

    const risk = db.prepare(
      `INSERT INTO risks (ref, title, category, asset_id, owner_id, threat, vulnerability, likelihood, impact, residual_likelihood, residual_impact,
        treatment, status, due_date, asset_value, exposure_factor, aro, treatment_plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    RISKS.forEach((r, i) => {
      const [title, cat, assetId, owner, threat, vuln, l, im, rl, ri, treatment, status, due, av, ef, aro, plan] = r;
      risk.run(`RSK-${String(i + 1).padStart(3, '0')}`, title, cat, assetId, owner, threat, vuln, l, im, rl, ri, treatment, status, due == null ? null : day(due), av, ef, aro, plan, day(-200 + i * 9), day(-30 + i));
    });

    const control = db.prepare(
      `INSERT INTO controls (ref, title, domain, type, nature, owner_id, status, effectiveness, last_tested, test_frequency_months)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const mapReq = db.prepare('INSERT INTO control_requirements (control_id, requirement_id) VALUES (?, ?)');
    const mapRisk = db.prepare('INSERT INTO risk_controls (risk_id, control_id) VALUES (?, ?)');
    CONTROLS.forEach((c, i) => {
      const [title, domain, type, nature, owner, status, eff, tested, freq, refs, risks] = c;
      const cid = Number(control.run(`CTL-${String(i + 1).padStart(3, '0')}`, title, domain, type, nature, owner, status, eff, tested == null ? null : day(tested), freq).lastInsertRowid);
      for (const ref of refs) {
        const rid = reqIds.get(ref);
        if (!rid) throw new Error(`Unknown requirement ${ref}`);
        mapReq.run(cid, rid);
      }
      for (const r of risks) mapRisk.run(r, cid);
    });

    const policy = db.prepare('INSERT INTO policies (ref, title, category, owner_id, version, status, approved_date, review_months, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    POLICIES.forEach(([title, cat, owner, ver, status, approved, months, summary], i) =>
      policy.run(`POL-${String(i + 1).padStart(3, '0')}`, title, cat, owner, ver, status, approved == null ? null : day(approved), months, summary),
    );

    const vendor = db.prepare(
      'INSERT INTO vendors (name, service, owner_id, data_access, criticality, system_access, certifications, last_assessed, contract_end, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    );
    for (const [n, svc, owner, data, crit, sys, certs, last, end, status, notes] of VENDORS) {
      vendor.run(n, svc, owner, data, crit, sys ? 1 : 0, certs || null, last == null ? null : day(last), day(end), status, notes || null);
    }

    // Assessments: one in progress, one complete, one planned.
    const assessment = db.prepare('INSERT INTO assessments (ref, title, framework_id, scope, status, lead_id, start_date, end_date, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const items = db.prepare('INSERT INTO assessment_items (assessment_id, requirement_id) SELECT ?, id FROM requirements WHERE framework_id = ?');
    const defs: [string, string, string, string, number, number, number, string | null, number][] = [
      ['ISO 27001:2022 internal audit', 'ISO-27001', 'All Annex A controls across head office and branches', 'in_progress', PRIYA, -30, 30, 'Stage 1 readiness ahead of certification audit.', 0.6],
      ['SOC 2 Type I readiness review', 'SOC2', 'Online & mobile banking platform and supporting infrastructure', 'complete', PRIYA, -120, -90, 'Readiness review complete. Vendor management and logging gaps raised as findings.', 1],
      ['NIST CSF 2.0 maturity baseline', 'NIST-CSF', 'Enterprise-wide', 'planned', AMARA, 20, 50, null, 0],
    ];
    const assessmentIds: number[] = [];
    defs.forEach(([title, code, scope, status, lead, start, end, summary, fraction], i) => {
      const fid = fwIds.get(code)!;
      const aid = Number(assessment.run(`ASM-${String(i + 1).padStart(3, '0')}`, title, fid, scope, status, lead, day(start), day(end), summary).lastInsertRowid);
      assessmentIds.push(aid);
      items.run(aid, fid);
      const coverage = frameworkCoverage(db, fid);
      const toAssess = Math.round(coverage.length * fraction);
      const update = db.prepare('UPDATE assessment_items SET result = ?, notes = ? WHERE assessment_id = ? AND requirement_id = ?');
      coverage.slice(0, toAssess).forEach((req) => {
        const note = req.controls.length
          ? `Evidence reviewed for ${req.controls.map((c) => c.ref).join(', ')}.`
          : 'No documented control. Raised with control owner.';
        update.run(suggestedResult(req.status), note, aid, req.id);
      });
    });

    // title, assessment idx, requirement ref, risk number, severity, status, owner, due offset, remediation, description
    const FINDINGS: [string, number | null, string | null, number | null, string, string, number, number, string, string][] = [
      ['Privileged accounts not reviewed in 9 months', 0, 'A.8.2', 9, 'high', 'open', MARC, 14, 'Complete a review of all Domain Admin and cloud admin roles; then quarterly.', '14 of 31 privileged accounts belong to staff who changed roles.'],
      ['No data loss prevention for email or endpoints', 0, 'A.8.12', 5, 'high', 'in_progress', GRACE, 45, 'Deploy DLP policies for PII in email and on endpoints.', 'Member PII can be emailed externally without detection.'],
      ['Backup restores not tested in 12 months', 0, 'A.8.13', 15, 'critical', 'open', MARC, -5, 'Run a full restore of core banking to the isolated test environment.', 'No evidence of a successful restore test since the backup platform migration.'],
      ['Security reviews missing for four SaaS vendors', 1, 'CC9.2', 12, 'medium', 'in_progress', TOM, -12, 'Complete tiering questionnaires and obtain SOC 2 reports.', 'Vendors onboarded via credit card without procurement review.'],
      ['Critical patches outside 14-day SLA', 0, 'A.8.8', 3, 'high', 'open', MARC, 7, 'Patch the 23 overdue criticals; add SLA reporting to the monthly risk pack.', '23 critical vulnerabilities older than 30 days on internet-facing hosts.'],
      ['Clear desk not followed in branch offices', 0, 'A.7.7', null, 'low', 'open', SOFIA, 60, 'Include clear desk in branch manager monthly checklist.', 'Member documents left on desks in 3 of 5 branches visited.'],
      ['Log retention 30 days, below 12-month requirement', 1, 'CC7.2', 14, 'medium', 'closed', AMARA, -40, 'Increase SIEM retention to 13 months with cold storage.', 'Retention insufficient for incident investigation.'],
      ['Code of conduct not acknowledged annually', 1, 'CC1.1', null, 'low', 'risk_accepted', SOFIA, -60, 'Accepted until HR system upgrade adds e-acknowledgement.', 'Acknowledgement only captured at onboarding.'],
    ];
    const finding = db.prepare(
      `INSERT INTO findings (ref, title, assessment_id, requirement_id, risk_id, severity, status, owner_id, due_date, remediation, description, closed_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    FINDINGS.forEach(([title, aIdx, reqRef, riskNo, sev, status, owner, due, remediation, desc], i) => {
      finding.run(
        `FND-${String(i + 1).padStart(3, '0')}`, title, aIdx == null ? null : assessmentIds[aIdx], reqRef ? reqIds.get(reqRef)! : null, riskNo, sev, status, owner, day(due), remediation, desc,
        status === 'closed' ? day(due + 20) : null,
      );
    });

    logActivity(db, 'system', null, 'seeded', 'Loaded demo data for Maple Ridge Credit Union');
  });
}

export function isEmpty(db: DB) {
  return (db.prepare('SELECT COUNT(*) AS n FROM frameworks').get() as { n: number }).n === 0;
}

// `node src/seed.ts --reset` rebuilds the database from scratch.
if (import.meta.main) {
  const file = process.env.DB_PATH ?? new URL('../../data/grc.db', import.meta.url).pathname;
  if (process.argv.includes('--reset')) for (const f of [file, `${file}-wal`, `${file}-shm`]) rmSync(f, { force: true });
  const db = openDb(file);
  if (isEmpty(db)) {
    seed(db);
    console.log(`Seeded demo data into ${file}`);
  } else {
    console.log(`${file} already has data; pass --reset to rebuild it.`);
  }
}
