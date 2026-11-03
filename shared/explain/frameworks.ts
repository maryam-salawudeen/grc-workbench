// What each framework is, who uses it and how it is organised, written for
// someone meeting these standards for the first time.

export interface FrameworkExplained {
  publisher: string;
  what: string;
  certifiable: string;
  whoAsks: string;
  structure: string;
  readingRefs: string;
  /** Plain-English description of each domain, function or criteria group. */
  domains: Record<string, string>;
}

export const FRAMEWORK_EXPLAINED: Record<string, FrameworkExplained> = {
  'NIST-CSF': {
    publisher: 'NIST, the US National Institute of Standards and Technology. Free to use.',
    what: 'A common language for describing and improving cybersecurity. It lists outcomes to aim for (for example, "access is managed") without saying exactly how to achieve them.',
    certifiable: 'No. You cannot be certified against it. Organisations use it to measure maturity, set targets and report to leadership.',
    whoAsks: 'Boards, regulators and governments, especially in North America and critical infrastructure. Many organisations use it as their internal baseline.',
    structure: 'Six functions describe the life of a security programme: Govern sets direction, Identify works out what you have and what could go wrong, Protect puts safeguards in place, Detect spots attacks, Respond deals with incidents, and Recover gets you back to normal. Each function is split into categories (22 in this app) and further into subcategories.',
    readingRefs: 'PR.AA means the Protect function (PR), category Identity Management, Authentication and Access Control (AA).',
    domains: {
      Govern: 'Added in version 2.0. Strategy, roles, policy, risk appetite, oversight and supplier risk. It sits over all the other functions.',
      Identify: 'Know your assets, your risks and what needs improving.',
      Protect: 'Safeguards: access control, training, data protection, secure configuration and resilient infrastructure.',
      Detect: 'Monitoring and analysis that spot attacks and unusual activity.',
      Respond: 'What happens once an incident is declared: managing, analysing, communicating and containing it.',
      Recover: 'Restoring systems and services, and communicating during recovery.',
    },
  },
  'ISO-27001': {
    publisher: 'ISO and IEC, the international standards bodies. The standard is bought from ISO or national bodies such as the Standards Council of Canada.',
    what: 'The international standard for an information security management system (ISMS): a managed, risk-based way of running security that keeps improving.',
    certifiable: 'Yes. An accredited certification body audits you, then visits every year, with full recertification every three years.',
    whoAsks: 'Customers and partners worldwide, especially in Europe and for B2B contracts. Often written into supplier requirements.',
    structure: 'Two parts. Clauses 4 to 10 describe the management system: context, leadership, planning, support, operation, evaluation and improvement. Annex A lists 93 controls in four themes (organizational, people, physical, technological). You choose which controls apply based on your risk assessment and record the choices in a Statement of Applicability.',
    readingRefs: 'A.8.13 means Annex A, theme 8 (Technological), control 13 (Information backup). ISO 27002 gives detailed guidance for each control.',
    domains: {
      Organizational: 'Policies, roles, supplier management, incident management, continuity, legal and privacy. The largest theme, with 37 controls.',
      People: 'Screening, contracts, training, discipline, remote working and how staff report problems.',
      Physical: 'Buildings, rooms, equipment, cabling, clear desks and secure disposal.',
      Technological: 'Endpoints, access, malware, vulnerabilities, backups, logging, networks, cryptography and secure development.',
    },
  },
  SOC2: {
    publisher: 'The AICPA, the American Institute of Certified Public Accountants, which publishes the Trust Services Criteria.',
    what: 'An independent auditor\'s report on how a service organisation protects its customers\' data. Customers read the report to decide whether they can trust the vendor.',
    certifiable: 'Not a certificate. A licensed CPA firm issues a report with an opinion. Type I covers the design of controls at one date; Type II also tests that they worked over a period, usually 6 to 12 months.',
    whoAsks: 'Customers of SaaS and technology companies, especially in North America. A SOC 2 Type II report is often required before an enterprise will sign.',
    structure: 'Security is always in scope and is made up of the Common Criteria, CC1 to CC9 (33 in this app). Organisations can add Availability, Processing Integrity, Confidentiality and Privacy. CC1 to CC5 follow the COSO internal control framework; CC6 to CC9 cover IT-specific areas.',
    readingRefs: 'CC6.3 means Common Criteria group 6 (logical and physical access), criterion 3 (granting, changing and removing access based on roles).',
    domains: {
      'CC1 Control environment': 'Tone at the top: ethics, board oversight, structure, competence and accountability.',
      'CC2 Communication and information': 'Using good information and communicating it inside and outside the organisation.',
      'CC3 Risk assessment': 'Setting objectives, identifying risks, considering fraud and reviewing changes.',
      'CC4 Monitoring activities': 'Checking that controls work and fixing weaknesses.',
      'CC5 Control activities': 'Choosing controls and putting them in place through policies.',
      'CC6 Logical and physical access': 'Who can get into systems and buildings, and how data is protected.',
      'CC7 System operations': 'Monitoring, detecting and responding to incidents, then recovering.',
      'CC8 Change management': 'Making sure changes are approved and tested before release.',
      'CC9 Risk mitigation': 'Business disruption and vendor risk.',
    },
  },
};
