// Framework catalogues. Requirement titles are short reference names only;
// consult the published standards for the full requirement text.

export interface FrameworkDef {
  code: string;
  name: string;
  version: string;
  description: string;
  requirements: [ref: string, title: string, domain: string][];
}

const nist = (fn: string, items: [string, string][]) => items.map(([r, t]) => [r, t, fn] as [string, string, string]);

export const NIST_CSF: FrameworkDef = {
  code: 'NIST-CSF',
  name: 'NIST Cybersecurity Framework',
  version: '2.0',
  description: 'Six functions and 22 categories for managing cybersecurity risk, published by NIST in 2024.',
  requirements: [
    ...nist('Govern', [
      ['GV.OC', 'Organizational Context'],
      ['GV.RM', 'Risk Management Strategy'],
      ['GV.RR', 'Roles, Responsibilities, and Authorities'],
      ['GV.PO', 'Policy'],
      ['GV.OV', 'Oversight'],
      ['GV.SC', 'Cybersecurity Supply Chain Risk Management'],
    ]),
    ...nist('Identify', [
      ['ID.AM', 'Asset Management'],
      ['ID.RA', 'Risk Assessment'],
      ['ID.IM', 'Improvement'],
    ]),
    ...nist('Protect', [
      ['PR.AA', 'Identity Management, Authentication, and Access Control'],
      ['PR.AT', 'Awareness and Training'],
      ['PR.DS', 'Data Security'],
      ['PR.PS', 'Platform Security'],
      ['PR.IR', 'Technology Infrastructure Resilience'],
    ]),
    ...nist('Detect', [
      ['DE.CM', 'Continuous Monitoring'],
      ['DE.AE', 'Adverse Event Analysis'],
    ]),
    ...nist('Respond', [
      ['RS.MA', 'Incident Management'],
      ['RS.AN', 'Incident Analysis'],
      ['RS.CO', 'Incident Response Reporting and Communication'],
      ['RS.MI', 'Incident Mitigation'],
    ]),
    ...nist('Recover', [
      ['RC.RP', 'Incident Recovery Plan Execution'],
      ['RC.CO', 'Incident Recovery Communication'],
    ]),
  ],
};

const iso = (theme: string, items: string[], clause: number) =>
  items.map((t, i) => [`A.${clause}.${i + 1}`, t, theme] as [string, string, string]);

export const ISO_27001: FrameworkDef = {
  code: 'ISO-27001',
  name: 'ISO/IEC 27001 Annex A',
  version: '2022',
  description: '93 information security controls in four themes: organizational, people, physical and technological.',
  requirements: [
    ...iso('Organizational', [
      'Policies for information security',
      'Information security roles and responsibilities',
      'Segregation of duties',
      'Management responsibilities',
      'Contact with authorities',
      'Contact with special interest groups',
      'Threat intelligence',
      'Information security in project management',
      'Inventory of information and other associated assets',
      'Acceptable use of information and other associated assets',
      'Return of assets',
      'Classification of information',
      'Labelling of information',
      'Information transfer',
      'Access control',
      'Identity management',
      'Authentication information',
      'Access rights',
      'Information security in supplier relationships',
      'Addressing information security within supplier agreements',
      'Managing information security in the ICT supply chain',
      'Monitoring, review and change management of supplier services',
      'Information security for use of cloud services',
      'Information security incident management planning and preparation',
      'Assessment and decision on information security events',
      'Response to information security incidents',
      'Learning from information security incidents',
      'Collection of evidence',
      'Information security during disruption',
      'ICT readiness for business continuity',
      'Legal, statutory, regulatory and contractual requirements',
      'Intellectual property rights',
      'Protection of records',
      'Privacy and protection of PII',
      'Independent review of information security',
      'Compliance with policies, rules and standards for information security',
      'Documented operating procedures',
    ], 5),
    ...iso('People', [
      'Screening',
      'Terms and conditions of employment',
      'Information security awareness, education and training',
      'Disciplinary process',
      'Responsibilities after termination or change of employment',
      'Confidentiality or non-disclosure agreements',
      'Remote working',
      'Information security event reporting',
    ], 6),
    ...iso('Physical', [
      'Physical security perimeters',
      'Physical entry',
      'Securing offices, rooms and facilities',
      'Physical security monitoring',
      'Protecting against physical and environmental threats',
      'Working in secure areas',
      'Clear desk and clear screen',
      'Equipment siting and protection',
      'Security of assets off-premises',
      'Storage media',
      'Supporting utilities',
      'Cabling security',
      'Equipment maintenance',
      'Secure disposal or re-use of equipment',
    ], 7),
    ...iso('Technological', [
      'User endpoint devices',
      'Privileged access rights',
      'Information access restriction',
      'Access to source code',
      'Secure authentication',
      'Capacity management',
      'Protection against malware',
      'Management of technical vulnerabilities',
      'Configuration management',
      'Information deletion',
      'Data masking',
      'Data leakage prevention',
      'Information backup',
      'Redundancy of information processing facilities',
      'Logging',
      'Monitoring activities',
      'Clock synchronization',
      'Use of privileged utility programs',
      'Installation of software on operational systems',
      'Networks security',
      'Security of network services',
      'Segregation of networks',
      'Web filtering',
      'Use of cryptography',
      'Secure development life cycle',
      'Application security requirements',
      'Secure system architecture and engineering principles',
      'Secure coding',
      'Security testing in development and acceptance',
      'Outsourced development',
      'Separation of development, test and production environments',
      'Change management',
      'Test information',
      'Protection of information systems during audit testing',
    ], 8),
  ],
};

const soc = (domain: string, items: [string, string][]) => items.map(([r, t]) => [r, t, domain] as [string, string, string]);

export const SOC2: FrameworkDef = {
  code: 'SOC2',
  name: 'SOC 2 Trust Services Criteria (Security)',
  version: '2017 (rev. 2022)',
  description: 'AICPA Common Criteria CC1 to CC9, which make up the Security category of a SOC 2 examination.',
  requirements: [
    ...soc('CC1 Control environment', [
      ['CC1.1', 'Commitment to integrity and ethical values'],
      ['CC1.2', 'Board independence and oversight of internal control'],
      ['CC1.3', 'Structures, reporting lines, authorities and responsibilities'],
      ['CC1.4', 'Commitment to attract, develop and retain competent people'],
      ['CC1.5', 'Accountability for internal control responsibilities'],
    ]),
    ...soc('CC2 Communication and information', [
      ['CC2.1', 'Relevant, quality information supports internal control'],
      ['CC2.2', 'Internal communication of objectives and responsibilities'],
      ['CC2.3', 'Communication with external parties'],
    ]),
    ...soc('CC3 Risk assessment', [
      ['CC3.1', 'Objectives specified clearly enough to identify risks'],
      ['CC3.2', 'Risks to objectives identified and analysed'],
      ['CC3.3', 'Potential for fraud considered'],
      ['CC3.4', 'Significant changes identified and assessed'],
    ]),
    ...soc('CC4 Monitoring activities', [
      ['CC4.1', 'Ongoing and separate evaluations of controls'],
      ['CC4.2', 'Deficiencies evaluated and communicated'],
    ]),
    ...soc('CC5 Control activities', [
      ['CC5.1', 'Control activities selected to mitigate risks'],
      ['CC5.2', 'General controls over technology'],
      ['CC5.3', 'Controls deployed through policies and procedures'],
    ]),
    ...soc('CC6 Logical and physical access', [
      ['CC6.1', 'Logical access security over protected information assets'],
      ['CC6.2', 'User registration and authorisation'],
      ['CC6.3', 'Role-based access: grant, change and remove'],
      ['CC6.4', 'Physical access restricted to authorised people'],
      ['CC6.5', 'Protections discontinued when assets are disposed of'],
      ['CC6.6', 'Protection against threats from outside system boundaries'],
      ['CC6.7', 'Transmission, movement and removal of information restricted'],
      ['CC6.8', 'Unauthorised or malicious software prevented or detected'],
    ]),
    ...soc('CC7 System operations', [
      ['CC7.1', 'Detection of configuration changes and new vulnerabilities'],
      ['CC7.2', 'Monitoring of system components for anomalies'],
      ['CC7.3', 'Security events evaluated'],
      ['CC7.4', 'Response to security incidents'],
      ['CC7.5', 'Recovery from security incidents'],
    ]),
    ...soc('CC8 Change management', [['CC8.1', 'Changes authorised, designed, tested, approved and implemented']]),
    ...soc('CC9 Risk mitigation', [
      ['CC9.1', 'Risk mitigation for business disruption'],
      ['CC9.2', 'Vendor and business partner risk managed'],
    ]),
  ],
};

export const FRAMEWORKS = [NIST_CSF, ISO_27001, SOC2];
