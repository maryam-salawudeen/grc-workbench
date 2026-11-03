// What each control in the common control library is, how it reduces risk and
// what proves it works. Keyed by the control title used in server/src/seed.ts.

export interface ControlExplained {
  what: string;
  how: string;
  evidence: string;
}

export const CONTROL_EXPLAINED: Record<string, ControlExplained> = {
  'Information security policy framework': {
    what: 'A set of approved policies that say what the organisation expects on security, with an owner and review date for each.',
    how: 'Gives every other control its authority. Without a policy, staff and auditors have nothing to measure against.',
    evidence: 'Signed policies, a review log, staff acknowledgements.',
  },
  'Enterprise risk management methodology': {
    what: 'An agreed way of finding, scoring, treating and reporting risk, including the risk appetite.',
    how: 'Makes risk decisions consistent, so the same kind of risk gets the same score whoever assesses it.',
    evidence: 'The written methodology, an approved appetite statement, the risk register.',
  },
  'Security roles, responsibilities & segregation of duties': {
    what: 'Named owners for security tasks, and rules that split conflicting duties between people.',
    how: 'Stops tasks falling through the gaps and makes fraud or serious mistakes need more than one person.',
    evidence: 'A RACI chart, job descriptions, a segregation of duties matrix.',
  },
  'Asset inventory & data classification': {
    what: 'A list of systems, devices and data, each with an owner and a sensitivity label.',
    how: 'You cannot protect what you do not know you have. Classification tells people how carefully to handle each item.',
    evidence: 'The asset register with owners and classifications, and the classification scheme.',
  },
  'Multi-factor authentication': {
    what: 'Signing in with something extra beyond a password, such as an app prompt, code or security key.',
    how: 'A stolen or guessed password is no longer enough to get in, which blocks most account takeovers.',
    evidence: 'MFA settings showing which systems and users are covered, and any exceptions.',
  },
  'Joiner-mover-leaver access provisioning': {
    what: 'A process that gives access when people join, changes it when they move and removes it when they leave.',
    how: 'Keeps access matched to the job and closes the accounts of people who have gone.',
    evidence: 'Onboarding and leaver tickets with dates, and HR reports matched against access removals.',
  },
  'Privileged access management & reviews': {
    what: 'Tight control of administrator accounts: separate admin logins, access only when needed, recorded sessions and regular reviews.',
    how: 'Admin accounts can change anything, so limiting and watching them shrinks the damage an attacker or insider can do.',
    evidence: 'A list of privileged accounts, review sign-offs, tool configuration.',
  },
  'Security awareness training & phishing simulation': {
    what: 'Regular training for staff and fake phishing emails to practise spotting real ones.',
    how: 'Makes staff less likely to fall for scams and more likely to report them early.',
    evidence: 'Training completion records and phishing test results over time.',
  },
  'Pre-employment screening & NDAs': {
    what: 'Background checks before hiring, and confidentiality agreements for staff and contractors.',
    how: 'Reduces the chance of hiring someone with a history of fraud, and gives legal protection for confidential information.',
    evidence: 'Screening records and signed NDAs.',
  },
  'Endpoint detection & response (EDR)': {
    what: 'Security software on laptops and servers that blocks malware and records suspicious behaviour.',
    how: 'Stops many attacks on the device and lets the security team investigate and isolate an infected machine.',
    evidence: 'A coverage report showing every device has the agent, plus alert records.',
  },
  'Vulnerability & patch management': {
    what: 'Regular scanning for known weaknesses and installing security updates within set deadlines.',
    how: 'Closes the holes attackers already know about, which is how many breaches start.',
    evidence: 'Scan reports and patching times measured against the SLA.',
  },
  'Secure configuration baselines (CIS)': {
    what: 'A standard secure set-up for each type of system, often based on CIS Benchmarks.',
    how: 'Removes risky defaults such as open services and default passwords.',
    evidence: 'The baseline documents and configuration scan results.',
  },
  'Full-disk encryption on endpoints': {
    what: 'Scrambling everything on a laptop\'s drive so it cannot be read without signing in.',
    how: 'Turns a lost or stolen laptop from a data breach into the cost of a new laptop.',
    evidence: 'Device management reports showing encryption status for every device.',
  },
  'Encryption in transit and at rest': {
    what: 'Encrypting data as it moves across networks (TLS) and where it is stored (databases, storage, backups).',
    how: 'Data that is intercepted or copied cannot be read without the keys.',
    evidence: 'TLS settings, storage encryption settings, the key management process.',
  },
  'Data loss prevention': {
    what: 'Tools that spot sensitive data, such as card or health information, leaving by email, upload or USB, and block or warn.',
    how: 'Catches both mistakes and deliberate leaks before the data is gone.',
    evidence: 'DLP policies and records of alerts and how they were handled.',
  },
  'Centralised logging & SIEM monitoring': {
    what: 'Collecting logs from systems in one place, keeping them, and alerting on suspicious patterns.',
    how: 'Lets you detect attacks early and investigate what happened afterwards.',
    evidence: 'A list of log sources, retention settings, alert rules and triage records.',
  },
  'Incident response plan & tabletop exercises': {
    what: 'A written plan for handling security incidents, practised through walk-through exercises.',
    how: 'People know their roles, who decides and who to call, so the first hours are not wasted.',
    evidence: 'The plan, exercise reports and incident tickets.',
  },
  'Immutable offsite backups': {
    what: 'Backups stored away from the main systems that cannot be changed or deleted, even by an administrator.',
    how: 'Ransomware cannot encrypt or delete them, so you can recover without paying.',
    evidence: 'Backup configuration showing immutability, and backup job logs.',
  },
  'Backup restore testing': {
    what: 'Regularly restoring data from backup to prove it works and to time how long it takes.',
    how: 'Finds broken backups before you need them, and shows whether you can meet your recovery targets.',
    evidence: 'Restore test records with dates, what was restored and how long it took.',
  },
  'Disaster recovery & business continuity plan': {
    what: 'Plans for keeping the business running and recovering IT after a major disruption, with recovery targets.',
    how: 'Shortens outages and keeps the most important work going.',
    evidence: 'The plans, the business impact analysis and test results.',
  },
  'Third-party risk management programme': {
    what: 'Tiering suppliers by risk, checking them before signing, putting security into contracts and reviewing them regularly.',
    how: 'Reduces the chance that a supplier\'s weakness becomes your breach.',
    evidence: 'The vendor inventory with tiers, questionnaires, SOC 2 reviews and contract clauses.',
  },
  'Network segmentation & firewall management': {
    what: 'Dividing the network into zones with firewall rules between them, and reviewing the rules.',
    how: 'Contains attacks: a compromised guest device or server cannot reach everything else.',
    evidence: 'Network diagrams, the firewall rule set and rule review records.',
  },
  'Secure SDLC & code review': {
    what: 'Building security into software development: requirements, peer review, scanning and testing before release.',
    how: 'Catches flaws while they are cheap to fix, before customers or attackers find them.',
    evidence: 'Pull request reviews, scan results and security test reports.',
  },
  'Change advisory board': {
    what: 'A group that reviews and approves significant changes before they go live.',
    how: 'Prevents untested or unauthorised changes from breaking systems or opening gaps.',
    evidence: 'Change tickets with approvals, and CAB meeting minutes.',
  },
  'Physical access control & CCTV': {
    what: 'Badges, locks, visitor logs and cameras that control and record who enters buildings and rooms.',
    how: 'Keeps unauthorised people away from equipment and paper records, and provides evidence if something happens.',
    evidence: 'Badge access logs, visitor logs and access lists for secure rooms.',
  },
  'Privacy programme & breach notification': {
    what: 'Policies and procedures for handling personal information lawfully, including how to respond to and report breaches.',
    how: 'Keeps the organisation within privacy law and limits harm to people when something goes wrong.',
    evidence: 'The privacy policy, privacy impact assessments and the breach log.',
  },
  'Internal audit & management review': {
    what: 'Independent checks of whether controls work, and regular reviews by management of the results.',
    how: 'Finds weaknesses before external auditors or attackers do, and keeps leadership informed.',
    evidence: 'Audit reports, management review minutes and finding follow-ups.',
  },
  'Payment change call-back verification': {
    what: 'Calling a supplier on a number already on file before changing their bank details.',
    how: 'Stops the most common payment fraud, where criminals email fake new bank details.',
    evidence: 'Call-back records attached to each bank detail change.',
  },
  'Secure disposal of media & equipment': {
    what: 'Wiping or destroying drives, devices and paper before disposal, with proof.',
    how: 'Prevents data being recovered from old equipment.',
    evidence: 'Certificates of destruction and a disposal log.',
  },
  'Board risk committee oversight': {
    what: 'A board committee that regularly reviews key risks and holds management accountable.',
    how: 'Makes sure important risk decisions are made at the right level and resources follow.',
    evidence: 'Committee charter, minutes and risk reports to the board.',
  },
};
