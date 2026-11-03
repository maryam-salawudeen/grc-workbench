import type { Lab } from './types.ts';

export const WEEK3: Lab[] = [
  {
    id: 'bia-targets',
    week: 3,
    level: 'Hard',
    title: 'Recovery targets for the warehouse system',
    client: 'Pinecrest Logistics',
    from: { name: 'Grace Adeyemi', role: 'Chief Operating Officer' },
    channel: 'Email',
    received: 'Monday 9:30',
    priority: 'High',
    minutes: 20,
    domain: 7,
    skills: ['Business impact analysis', 'RTO and RPO', 'Disaster recovery'],
    message: [
      'Hi,',
      'The board wants recovery targets for StackWare, our warehouse management system. My notes from operations are attached.',
      'What should our targets be, and does our current disaster recovery set-up meet them?',
      'Grace',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Operations notes: if StackWare goes down',
        body: [
          'Shipping stops completely. We have no paper process.',
          'After 24 hours, three retail customers start charging penalties of $25,000 per day each.',
          'After 72 hours, our largest customer can cancel the contract.',
          'Orders arrive all day. The team can re-key up to 4 hours of orders by hand. More than that is not realistic.',
          'Current set-up: nightly backup at 01:00. StackWare estimates 48 hours to restore into a new environment.',
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'What is the maximum tolerable downtime (MTD)?',
        options: [
          { text: '4 hours', why: 'Four hours is about data, not downtime.' },
          { text: '24 hours', why: 'Penalties start here, which is painful, but the business survives.' },
          { text: '72 hours', correct: true, why: 'Beyond 72 hours the largest contract can be cancelled. That is the point the business cannot tolerate.' },
          { text: '1 week', why: 'Too late: the contract could already be gone.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What recovery time objective (RTO) should Grace set?',
        options: [
          { text: '72 hours, the same as the MTD', why: 'An RTO equal to the MTD leaves no time to check data and catch up on work.' },
          { text: '24 hours or less', correct: true, why: 'It stays well inside the MTD and avoids the penalties.' },
          { text: '48 hours, what the vendor offers', why: 'Targets come from the business impact, not from what the current set-up happens to give.' },
          { text: '1 week', why: 'Longer than the MTD.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What recovery point objective (RPO) should she set?',
        options: [
          { text: '4 hours', correct: true, why: 'The team can only re-key 4 hours of orders, so no more than 4 hours of data can be lost.' },
          { text: '24 hours', why: 'A day of lost orders could not be re-keyed.' },
          { text: '72 hours', why: 'That is the downtime limit, not the data loss limit.' },
          { text: 'Zero', why: 'Ideal but expensive. The business can tolerate up to 4 hours.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Does the current set-up meet those targets?',
        options: [
          { text: 'Yes', why: 'Nightly backups could lose up to 24 hours of data, and the 48-hour restore is longer than a 24-hour RTO.' },
          { text: 'It meets the RTO but not the RPO', why: 'The 48-hour restore misses a 24-hour RTO too.' },
          { text: 'No, neither the RPO nor the RTO is met', correct: true, why: 'Nightly backups give an RPO of up to 24 hours and the restore takes 48.' },
          { text: 'It cannot be known without a test', why: 'A test would confirm it, but the stated design already misses both targets.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What would you recommend?',
        options: [
          { text: 'Back up or replicate at least every 4 hours', correct: true, why: 'Meets the RPO.' },
          { text: 'Negotiate a faster restore or a warm standby with StackWare', correct: true, why: 'Needed to get the restore under 24 hours.' },
          { text: 'Design a basic manual fallback for picking and shipping', correct: true, why: 'Buys time and lowers the impact of any outage.' },
          { text: 'Test the recovery and time it', correct: true, why: 'Targets mean little until a test shows you can meet them.' },
          { text: 'Change the MTD to one week so the current set-up passes', why: 'The MTD comes from the business impact. Changing it to fit the technology hides the problem.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Business impact analysis is a conversation with operations about money, contracts and people. Turn their answers into time-based targets, then compare those with what IT can actually do.',
        'The gap between the targets and reality is the finding. Your job is to make it visible to the people who fund the fix.',
      ],
      examTip: 'MTD (also called MAO) is the longest the business can survive an outage. RTO must be shorter than MTD. RPO is the maximum acceptable data loss, measured backwards from the incident. Work recovery time (WRT) is the time to verify data after systems are back: RTO + WRT ≤ MTD.',
    },
  },

  {
    id: 'leaver-control-test',
    week: 3,
    level: 'Hard',
    title: 'Test the leaver control for the SOC 2 sample',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Priya Natarajan', role: 'Compliance & Audit Lead' },
    channel: 'Email',
    received: 'Tuesday 10:00',
    priority: 'Normal',
    minutes: 25,
    domain: 6,
    skills: ['Control testing', 'Sampling', 'Writing findings'],
    message: [
      'Hi,',
      'Before the auditors arrive, could you test this control: "Access to core banking is removed within 1 business day of termination." The sample of 10 leavers is attached.',
      'There were no public holidays in the period, so only weekends are non-business days.',
      'Priya',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Leaver sample, September 2026',
        columns: ['Leaver', 'Termination date', 'Core banking access removed'],
        rows: [
          ['A', 'Mon 14 Sep', 'Mon 14 Sep'],
          ['B', 'Tue 15 Sep', 'Wed 16 Sep'],
          ['C', 'Thu 17 Sep', 'Tue 22 Sep'],
          ['D', 'Fri 18 Sep', 'Mon 21 Sep'],
          ['E', 'Mon 21 Sep', 'Mon 21 Sep'],
          ['F', 'Tue 22 Sep', 'Fri 25 Sep'],
          ['G', 'Thu 24 Sep', 'Fri 25 Sep'],
          ['H', 'Fri 25 Sep', 'Fri 25 Sep'],
          ['I', 'Mon 28 Sep', 'Not removed'],
          ['J', 'Tue 29 Sep', 'Wed 30 Sep'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which leavers are exceptions?',
        hint: 'Count business days only. Friday to Monday is one business day.',
        options: [
          { text: 'C', correct: true, why: 'Thursday to the following Tuesday is 3 business days.' },
          { text: 'F', correct: true, why: 'Tuesday to Friday is 3 business days.' },
          { text: 'I', correct: true, why: 'Access was never removed.' },
          { text: 'D', why: 'Friday to Monday is 1 business day, within the limit.' },
          { text: 'B', why: 'The next day, within the limit.' },
          { text: 'G', why: 'The next day, within the limit.' },
        ],
      },
      { type: 'number', prompt: 'What is the exception rate in the sample?', answer: 30, tolerance: 0.5, unit: '%', working: '3 exceptions (C, F, I) out of 10 = 30%.' },
      {
        type: 'single',
        prompt: 'What do you conclude?',
        options: [
          { text: 'The control is effective', why: 'Three failures in ten, one never removed, is not effective.' },
          { text: 'Effective, with minor exceptions', why: '30% is not minor, and an open account is a direct risk.' },
          { text: 'Not operating effectively. Raise a finding', correct: true, why: 'The control failed in a large share of the sample.' },
          { text: 'Test a new sample until one passes', why: 'Re-sampling to get a better answer is not acceptable testing.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Leaver I still has access today. What happens first?',
        options: [
          { text: 'Note it in the finding and move on', why: 'You found a live risk. It needs fixing now, not just reporting.' },
          { text: 'Ask IT to remove it now and check whether it was used after 28 September', correct: true, why: 'Close the exposure and find out whether it was used.' },
          { text: 'Wait for the auditors', why: 'Leaving a known open account is worse than any audit finding.' },
          { text: 'Remove it yourself', why: 'You should not have admin rights to make the change, and doing it yourself breaks separation of duties.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write the finding using condition, criteria, cause, effect and recommendation.',
        model: [
          'Condition: In a sample of 10 September leavers, 3 (30%) did not have core banking access removed within 1 business day. Two were removed after 3 business days and one had not been removed at the time of testing.',
          'Criteria: The access control standard requires removal within 1 business day of termination.',
          'Cause: To be confirmed with IT. HR termination notices appear to reach IT by email with no tracked ticket.',
          'Effect: Former employees could use core banking after leaving, including approving transactions.',
          'Recommendation: Create a ticket automatically from HR terminations with a 1-day deadline, review leavers against access weekly, and remove leaver I\'s access immediately and check for use after termination.',
        ],
        rubric: [
          'Condition with the numbers from the sample',
          'Criteria: the requirement that was not met',
          'Cause, or a note that it still needs confirming',
          'Effect in business terms',
          'Specific recommendations, including the immediate fix',
        ],
      },
    ],
    debrief: {
      work: [
        'Control testing is careful, slightly tedious work, and it is where analysts earn the trust of auditors and control owners. Count business days properly, record every exception and never adjust the sample.',
        'Condition, criteria, cause, effect is the structure most audit teams use for findings. Learn it and your write-ups will be taken seriously.',
      ],
      examTip: 'Domain 6 distinguishes control design (would it work?) from operating effectiveness (did it work over time?). This test checks operating effectiveness, the same thing a SOC 2 Type II report covers.',
    },
  },

  {
    id: 'soa-applicability',
    week: 3,
    level: 'Hard',
    title: 'Help with our ISO 27001 Statement of Applicability',
    client: 'Aurora Pay',
    from: { name: 'Fatima Noor', role: 'Chief Compliance Officer' },
    channel: 'Email',
    received: 'Wednesday 13:20',
    priority: 'Normal',
    minutes: 15,
    domain: 1,
    skills: ['ISO 27001', 'Statement of Applicability', 'Shared responsibility'],
    message: [
      'Hello,',
      'We are starting ISO 27001. Jordan thinks we can mark most of the physical controls in Annex A as not applicable because everything runs in the cloud. I want a second opinion before we write the Statement of Applicability.',
      'For context: 85 staff in one Toronto office, laptops for everyone, no data centre of our own, software built in-house plus two contract development firms.',
      'Fatima',
    ],
    attachments: [],
    steps: [
      {
        type: 'single',
        prompt: 'Can Aurora mark the physical controls (A.7) as not applicable?',
        options: [
          { text: 'Yes, the cloud provider handles physical security', why: 'The provider covers its data centres. Aurora still has an office, laptops and paper.' },
          { text: 'No. Most apply to the office and laptops, and Aurora must check the provider\'s controls through its reports', correct: true, why: 'Controls like physical entry, clear desk and off-premises equipment clearly apply. For the data centres, Aurora relies on the provider and checks its SOC 2 report.' },
          { text: 'Only if the auditor agrees in advance', why: 'Aurora decides applicability and must justify it. The auditor then assesses that justification.' },
          { text: 'Yes, physical controls are optional in ISO 27001', why: 'Every Annex A control must be considered. Exclusions need a justification.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Which Annex A controls clearly apply, given what Fatima told you?',
        options: [
          { text: 'A.8.30 Outsourced development', correct: true, why: 'Two contract firms write code.' },
          { text: 'A.5.23 Information security for use of cloud services', correct: true, why: 'Everything runs in the cloud.' },
          { text: 'A.8.4 Access to source code', correct: true, why: 'They build software in-house.' },
          { text: 'A.7.9 Security of assets off-premises', correct: true, why: 'Staff take laptops home.' },
          { text: 'None of A.8, because the provider runs the technology', why: 'Aurora configures, codes and administers its own systems in the cloud.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What must the SoA record for each Annex A control?',
        options: [
          { text: 'Only the ones that apply', why: 'All 93 must be listed, including exclusions.' },
          { text: 'Whether it applies, why it is included or excluded, and whether it is implemented', correct: true, why: 'That is what auditors check the SoA against.' },
          { text: 'The cost of each control', why: 'Useful for planning, but not part of the SoA.' },
          { text: 'The name of the auditor', why: 'Not part of the SoA.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Who is responsible for physical security of the servers running Aurora\'s app?',
        options: [
          { text: 'Aurora', why: 'Aurora has no access to the provider\'s data centres.' },
          { text: 'The cloud provider, and Aurora verifies it through the provider\'s reports', correct: true, why: 'This is the shared responsibility model: the provider does it, and the customer gets assurance.' },
          { text: 'Nobody, it is in the cloud', why: 'Cloud servers still sit in physical buildings.' },
          { text: 'The contract developers', why: 'They have nothing to do with the data centres.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Statements of Applicability are where scoping arguments happen. Cloud-first companies often try to exclude too much. The useful question is: "Do we have any of this, anywhere?"',
        'When you rely on a provider, the control does not disappear. It becomes "verify the provider", which usually means reading their SOC 2 report every year.',
      ],
      examTip: 'ISO 27001 certifies an ISMS; ISO 27002 gives guidance on the controls. The SoA lists every Annex A control with its applicability, justification and implementation status.',
    },
  },

  {
    id: 'contract-clauses',
    week: 3,
    level: 'Medium',
    title: 'Security input on the VerifyMe contract renewal',
    client: 'Aurora Pay',
    from: { name: 'Sara Kim', role: 'VP Partnerships' },
    channel: 'Email',
    received: 'Thursday 9:45',
    priority: 'High',
    minutes: 15,
    domain: 1,
    skills: ['Contract review', 'Third-party risk', 'Risk transfer'],
    message: [
      'Hi,',
      'Legal asked for security\'s view on the VerifyMe renewal. VerifyMe checks the ID documents of every new customer. The current clause summary is attached.',
      'Is anything missing?',
      'Sara',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'VerifyMe contract: clause summary',
        columns: ['Clause', 'Summary'],
        rows: [
          ['1. Service levels', '99.5% monthly availability'],
          ['2. Fees', 'Per verification, invoiced monthly'],
          ['3. Confidentiality', 'Both parties keep each other\'s information confidential'],
          ['4. Liability', 'Capped at 12 months of fees (about $180,000)'],
          ['5. Indemnity', 'VerifyMe indemnifies Aurora for third-party claims caused by its negligence'],
          ['6. Term', '2 years, auto-renews'],
          ['7. Data processing', 'VerifyMe processes customer data to provide the services'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which security terms are missing?',
        options: [
          { text: 'Breach notification within a fixed time', correct: true, why: 'Aurora has its own notification duties and needs to hear fast.' },
          { text: 'Right to audit, or an annual SOC 2 Type II report', correct: true, why: 'Ongoing proof that controls work.' },
          { text: 'A list of subprocessors and approval of changes', correct: true, why: 'ID documents should not end up with unknown parties.' },
          { text: 'Where data is stored and processed', correct: true, why: 'Matters for privacy law and for regulators.' },
          { text: 'Return and deletion of data at the end', correct: true, why: 'Stops ID documents lingering after the contract ends.' },
          { text: 'Lower fees', why: 'A commercial point, not a security one.' },
        ],
      },
      {
        type: 'single',
        prompt: 'A breach at VerifyMe could expose ID documents for 400,000 people. What do you say about the liability cap?',
        options: [
          { text: 'It is fine, $180,000 is a lot', why: 'A breach of this size would cost far more in notification, legal and regulatory costs.' },
          { text: 'Ask for a higher cap for data breaches and confirm VerifyMe\'s cyber insurance', correct: true, why: 'A separate, higher cap for data protection failures is common, and insurance makes it collectable.' },
          { text: 'Remove all liability limits', why: 'Vendors rarely agree, and pushing for it can stall the deal.' },
          { text: 'Liability does not matter if the vendor is reputable', why: 'Reputable vendors have breaches too.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What does the indemnity clause actually transfer?',
        options: [
          { text: 'Some of the financial impact of claims', correct: true, why: 'Indemnities move costs. Customers and regulators still hold Aurora accountable.' },
          { text: 'All of the risk', why: 'Reputational harm and regulatory accountability stay with Aurora.' },
          { text: 'Accountability for protecting customer data', why: 'Accountability cannot be transferred.' },
          { text: 'Nothing', why: 'It does shift some costs.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Contracts are a security control. Legal teams often welcome a short list of missing security terms, but it lands better if you explain why each one matters.',
        'Keep commercial points (price, term) out of your comments unless asked. Your credibility comes from sticking to risk.',
      ],
      examTip: 'Transferring risk through contracts or insurance shares the financial impact. The organisation remains accountable. Expect questions on SLAs, right to audit and the difference between liability caps and indemnities.',
    },
  },

  {
    id: 'sod-review',
    week: 3,
    level: 'Medium',
    title: 'Auditor flagged our accounting system roles',
    client: 'Northline Outfitters',
    from: { name: 'Hannah Lee', role: 'Finance Manager' },
    channel: 'Email',
    received: 'Thursday 16:05',
    priority: 'Normal',
    minutes: 15,
    domain: 5,
    skills: ['Segregation of duties', 'Fraud risk'],
    message: [
      'Hi,',
      'Our external accountant mentioned "segregation of duties issues" in the finance system but didn\'t say which ones. Our role export is attached. We\'re a small team, so please be realistic.',
      'Hannah',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Finance system permissions',
        columns: ['User', 'Create vendors', 'Approve invoices', 'Release payments', 'Reconcile bank'],
        rows: [
          ['Hannah Lee (Finance Manager)', '', 'Yes', 'Yes', ''],
          ['Raj Mehta (AP clerk)', 'Yes', '', '', ''],
          ['Mei Ito (AP clerk)', 'Yes', '', 'Yes', ''],
          ['Tom Wills (Procurement)', 'Yes', '', '', ''],
          ['Sam Okoro (Bookkeeper)', '', '', 'Yes', 'Yes'],
          ['Ben Kowalski (Operations Director)', '', 'Yes', '', ''],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Who has a conflicting combination?',
        options: [
          { text: 'Hannah: approves invoices and releases payments', correct: true, why: 'One person can approve and pay the same invoice.' },
          { text: 'Mei: creates vendors and releases payments', correct: true, why: 'She could set up a fake vendor and pay it. This is the classic fraud pattern.' },
          { text: 'Sam: releases payments and reconciles the bank', correct: true, why: 'He could make a payment and hide it during reconciliation.' },
          { text: 'Raj: creates vendors only', why: 'One duty on its own is fine.' },
          { text: 'Ben: approves invoices only', why: 'One duty on its own is fine.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The team is too small to split every duty. What is a realistic compensating control?',
        options: [
          { text: 'Accept the conflicts without any further action', why: 'The conflicts allow fraud. Something needs to offset them.' },
          { text: 'Someone outside the payment process (Ben) reviews new vendors and the payment register every month and signs off', correct: true, why: 'Independent review catches fake vendors and unusual payments after the fact.' },
          { text: 'Give everyone a stronger password', why: 'Passwords do not stop a legitimate user from misusing their own access.' },
          { text: 'Move finance to a new system', why: 'The new system would have the same role problem.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Requiring two people to release any payment over $10,000 is called what?',
        options: [
          { text: 'Dual control', correct: true, why: 'Two people must act together to complete one task.' },
          { text: 'Separation of duties', why: 'Close, but separation splits different steps between people. Dual control needs two people for the same step.' },
          { text: 'Job rotation', why: 'Job rotation moves people between roles to expose fraud.' },
          { text: 'Least privilege', why: 'Least privilege limits each person\'s access.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Small organisations can rarely separate every duty. "Be realistic" means pairing the conflicts you cannot remove with a review by someone independent, and writing that down.',
        'Look for the three classic conflicts: create plus pay, approve plus pay, and pay plus reconcile.',
      ],
      examTip: 'Know separation of duties, dual control, two-person integrity, job rotation and mandatory vacations. Job rotation and mandatory vacations are detective controls: they expose fraud that someone has been hiding.',
    },
  },

  {
    id: 'vuln-priorities',
    week: 3,
    level: 'Medium',
    title: 'We can fix three of these this week. Which ones?',
    client: 'Town of Riverside',
    from: { name: 'Marcus Bell', role: 'IT Manager' },
    channel: 'Teams message',
    received: 'Friday 8:50',
    priority: 'High',
    minutes: 15,
    domain: 7,
    skills: ['Vulnerability management', 'Prioritisation'],
    message: [
      'Morning. Scanner results below. With three of us I can realistically do three fixes this week. Which three, and in what order?',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Vulnerability scan summary',
        columns: ['ID', 'Issue', 'CVSS', 'System', 'Internet-facing', 'Exploited in the wild'],
        rows: [
          ['V1', 'Authentication bypass', '9.8', 'Remote access VPN appliance', 'Yes', 'Yes'],
          ['V2', 'SMB remote code execution', '8.1', 'PermitPro server (Windows 2012)', 'No', 'Yes'],
          ['V3', 'Outdated JavaScript library', '6.1', 'Library events website (static)', 'Yes', 'No'],
          ['V4', 'Default admin password', 'n/a', 'Water SCADA operator screen', 'No (OT network)', 'n/a'],
          ['V5', 'TLS 1.0 still enabled', '5.3', 'Tax payment portal (vendor hosted)', 'Yes', 'No'],
          ['V6', 'Print driver privilege escalation', '7.8', 'Town hall print server', 'No', 'No'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Pick the three to fix this week.',
        options: [
          { text: 'V1 VPN authentication bypass', correct: true, why: 'Internet-facing, critical and actively exploited. This is how ransomware gangs get in.' },
          { text: 'V4 default password on the SCADA screen', correct: true, why: 'No CVE score, but a public safety system with a password anyone can look up. The fix takes minutes.' },
          { text: 'V2 SMB flaw on PermitPro', correct: true, why: 'Actively exploited and used to spread inside networks. The server cannot be patched, so isolate it or restrict SMB.' },
          { text: 'V6 print driver', why: 'High score, but not exposed and not known to be exploited. Next week.' },
          { text: 'V3 JavaScript library', why: 'Low impact on a static site.' },
          { text: 'V5 TLS 1.0', why: 'Worth fixing, but it is on the vendor\'s system. Raise it with them rather than using your team\'s time.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Why fix V4 when it has no CVSS score?',
        options: [
          { text: 'It is a quick fix with a public safety impact', correct: true, why: 'Risk depends on impact and how easy the attack is, not only on a score.' },
          { text: 'Every issue should be fixed in scan order', why: 'Scan order has nothing to do with risk.' },
          { text: 'It should not be fixed: no score means no risk', why: 'Default passwords are a configuration issue, not a software flaw, so they have no CVE. They are still very easy to exploit.' },
          { text: 'Because the auditors asked', why: 'Nobody asked. It is simply risky.' },
        ],
      },
      {
        type: 'single',
        prompt: 'V5 is on a vendor-hosted portal. What do you do?',
        options: [
          { text: 'Ignore it, it is the vendor\'s system', why: 'Residents\' payments go through it, so it is still the town\'s risk.' },
          { text: 'Raise it with the vendor, ask for a fix date and track it in third-party risk', correct: true, why: 'You cannot patch it yourself, but you can hold the vendor to it.' },
          { text: 'Log in to the vendor portal and disable TLS 1.0 yourself', why: 'You should not change a vendor\'s production systems.' },
          { text: 'Block the portal', why: 'Residents need it to pay taxes.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Vulnerability management in small IT teams is about choosing. Combine severity with exposure, active exploitation and what the system does. A spreadsheet sorted by CVSS alone sends people to the wrong fixes.',
        'For problems on vendor systems, your fix is a tracked request, not a patch.',
      ],
      examTip: 'CVSS measures how severe a vulnerability is, not the risk to your organisation. Risk also depends on the asset, its exposure and the threat. Expect questions that test whether you combine these.',
    },
  },
];
