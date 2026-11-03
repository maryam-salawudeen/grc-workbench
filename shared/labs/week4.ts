import type { Lab } from './types.ts';

export const WEEK4: Lab[] = [
  {
    id: 'board-slide',
    week: 4,
    title: 'One slide for the board risk committee',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Amara Okafor', role: 'Chief Information Security Officer' },
    channel: 'Email',
    received: 'Monday 8:15',
    priority: 'High',
    minutes: 20,
    domain: 1,
    skills: ['Board reporting', 'Key risk indicators', 'Writing for executives'],
    message: [
      'Hi,',
      'The board risk committee meets on Thursday and I get one slide for cyber. The register summary and our indicators are attached.',
      'Tell me what goes on the slide and draft a short summary I can say out loud. They are not technical.',
      'Amara',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Open risks (residual score; appetite is 9 or less)',
        columns: ['Ref', 'Risk', 'Residual', 'Trend'],
        rows: [
          ['RSK-009', 'Privileged access not reviewed', '12', 'No change'],
          ['RSK-015', 'Backups fail to restore when needed', '10', 'No change'],
          ['RSK-014', 'Slow breach detection from weak logging', '9', 'Improving'],
          ['RSK-001', 'Ransomware encrypts core banking', '8', 'Improving'],
          ['RSK-003', 'Exploitation of the banking app', '8', 'No change'],
          ['', '9 other risks', '4 to 9', 'Stable'],
        ],
      },
      {
        kind: 'table',
        title: 'Key risk indicators',
        columns: ['Indicator', 'Last quarter', 'This quarter', 'Target'],
        rows: [
          ['Staff clicking phishing tests', '18%', '9%', 'Under 10%'],
          ['Critical patches overdue', '11', '23', '0'],
          ['High findings overdue', '0', '1', '0'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'What belongs on the slide?',
        options: [
          { text: 'The two risks above appetite (RSK-009 and RSK-015), in plain words', correct: true, why: 'The board decides on risks outside appetite.' },
          { text: 'Overdue critical patches doubling to 23', correct: true, why: 'A worsening indicator they should hear about before it becomes an incident.' },
          { text: 'The phishing click rate halving', correct: true, why: 'Good news shows the programme works and earns credibility.' },
          { text: 'What you need from the board: decisions or funding', correct: true, why: 'Boards act on asks, not on status updates.' },
          { text: 'All 14 risks with their scores', why: 'Too much for one slide. Show what needs their attention.' },
          { text: 'The CVE numbers of the overdue patches', why: 'Technical detail the committee cannot use.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Overdue critical patches is a key risk indicator. What makes it a KRI rather than a KPI?',
        options: [
          { text: 'It warns that risk is rising before an incident happens', correct: true, why: 'KRIs are early warnings about exposure.' },
          { text: 'It measures how well a team is performing against a goal', why: 'That describes a KPI.' },
          { text: 'It is reported to the board', why: 'Boards see both kinds.' },
          { text: 'It has a target', why: 'Both kinds can have targets.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write Amara\'s short spoken summary for the board.',
        model: [
          'Overall, cyber risk is close to appetite, and phishing resilience has improved, with staff clicking half as often as last quarter.',
          'Two risks are above appetite: we have not yet reviewed who holds powerful administrator access, and we have not proved we can restore our systems from backup. Both are funded and due to be fixed by the end of the next quarter.',
          'We ask the committee to note that overdue critical security updates have doubled, and to support moving two IT staff onto patching for six weeks to clear them.',
        ],
        rubric: [
          'Gives an overall position against appetite',
          'Names the risks above appetite in plain language',
          'Says what is being done and by when',
          'Includes one clear ask or decision for the board',
          'Avoids technical jargon and acronyms',
        ],
      },
    ],
    debrief: {
      work: [
        'Writing for executives is one of the most valuable skills in GRC. Lead with the position, name the few things that need their attention, and end with the ask.',
        'If a summary needs a glossary, it is not ready for the board.',
      ],
      examTip: 'The CISSP expects security to support business goals, with senior management accountable for risk. Governance questions often have the "most correct" answer being the one that involves senior management making an informed decision.',
    },
  },

  {
    id: 'shared-responsibility',
    week: 4,
    title: 'Who handles what in the cloud? (onboarding doc)',
    client: 'Aurora Pay',
    from: { name: 'Jordan Blake', role: 'Head of Platform Engineering' },
    channel: 'Teams message',
    received: 'Tuesday 11:30',
    priority: 'Normal',
    minutes: 10,
    domain: 3,
    skills: ['Cloud security', 'Shared responsibility'],
    message: [
      'New engineers keep asking who is responsible for what in our cloud setup (we use virtual machines, managed storage and a few SaaS tools). Can you sort this list for the onboarding doc?',
    ],
    attachments: [],
    steps: [
      {
        type: 'match',
        prompt: 'Who is responsible for each item?',
        choices: ['Cloud provider', 'Aurora', 'Shared'],
        items: [
          { text: 'Physical security of the data centres', answer: 'Cloud provider', why: 'Aurora never enters the buildings.' },
          { text: 'Patching the hypervisor that runs the virtual machines', answer: 'Cloud provider', why: 'The virtualisation layer belongs to the provider.' },
          { text: 'Patching the operating system on Aurora\'s virtual machines', answer: 'Aurora', why: 'With infrastructure as a service, everything from the OS up is the customer\'s.' },
          { text: 'Settings on who can access each storage bucket', answer: 'Aurora', why: 'The provider gives the tools. Misconfiguration is the customer\'s problem.' },
          { text: 'Staff identities and MFA', answer: 'Aurora', why: 'The customer always owns its users and their access.' },
          { text: 'Encryption at rest: the provider offers it, Aurora switches it on and manages keys', answer: 'Shared', why: 'Each side has part of the job.' },
          { text: 'Network security: the provider secures its backbone, Aurora sets firewall rules', answer: 'Shared', why: 'Each side controls a different layer.' },
          { text: 'Security of Aurora\'s application code', answer: 'Aurora', why: 'Aurora writes it.' },
        ],
      },
      {
        type: 'single',
        prompt: 'For SaaS tools such as code hosting, what always stays with Aurora?',
        options: [
          { text: 'Its data and who can access it', correct: true, why: 'Even in SaaS, the customer controls accounts, permissions and what data goes in.' },
          { text: 'Patching the SaaS application', why: 'The SaaS provider patches its own application.' },
          { text: 'The SaaS provider\'s servers', why: 'Those belong to the provider.' },
          { text: 'Nothing, SaaS moves all responsibility to the provider', why: 'Data and access always stay with the customer.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which cloud model leaves the customer with the most responsibility?',
        options: [
          { text: 'Infrastructure as a service (IaaS)', correct: true, why: 'The customer manages everything from the operating system up.' },
          { text: 'Platform as a service (PaaS)', why: 'The provider also manages the OS and runtime.' },
          { text: 'Software as a service (SaaS)', why: 'The customer manages the least.' },
          { text: 'They are all the same', why: 'Responsibility shifts towards the provider as you move from IaaS to SaaS.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Most cloud breaches come from the customer\'s side of the line: open storage, weak identities, unpatched VMs. Onboarding documents that make the line clear prevent real incidents.',
        'For each SaaS vendor, write down what Aurora still owns: users, permissions, data and configuration.',
      ],
      examTip: 'Domain 3 covers cloud service models (IaaS, PaaS, SaaS) and deployment models (public, private, community, hybrid). Responsibility for data and access always stays with the customer.',
    },
  },

  {
    id: 'tabletop-lessons',
    week: 4,
    title: 'Turn the ransomware tabletop into actions',
    client: 'Pinecrest Logistics',
    from: { name: 'Grace Adeyemi', role: 'Chief Operating Officer' },
    channel: 'Email',
    received: 'Wednesday 9:05',
    priority: 'Normal',
    minutes: 20,
    domain: 7,
    skills: ['Incident response', 'Lessons learned', 'Action tracking'],
    message: [
      'Hi,',
      'We ran a ransomware tabletop exercise yesterday. It was eye-opening. My notes are attached.',
      'Can you turn them into lessons learned with owners and dates so this doesn\'t just sit in a drawer?',
      'Grace',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Tabletop notes',
        body: [
          'It took 2 hours to reach Paul (IT Director). There is no on-call list.',
          'Nobody knew who could authorise cutting the connection to StackWare.',
          'Backups exist, but nobody knew how long a restore would take.',
          'Two drivers posted on Facebook that "Pinecrest got hacked".',
          'Legal was unsure whether customers had to be told.',
          'Nobody had the cyber insurer\'s 24-hour hotline number.',
        ],
      },
    ],
    steps: [
      {
        type: 'match',
        prompt: 'Match each problem to the fix that addresses it.',
        choices: ['On-call contacts and escalation list', 'Decision authority in the incident plan', 'Timed restore test', 'Staff communications guidance', 'Notification checklist agreed with legal', 'Insurer details in the plan'],
        items: [
          { text: 'Two hours to reach the IT Director', answer: 'On-call contacts and escalation list', why: 'Names, phone numbers and backups for every key role.' },
          { text: 'Nobody knew who could cut the StackWare connection', answer: 'Decision authority in the incident plan', why: 'Decide in advance who may disconnect systems.' },
          { text: 'Unknown restore time', answer: 'Timed restore test', why: 'Only a real test gives a real number.' },
          { text: 'Drivers posting on Facebook', answer: 'Staff communications guidance', why: 'Tell staff what to say and where to send questions.' },
          { text: 'Legal unsure about telling customers', answer: 'Notification checklist agreed with legal', why: 'Work out contract and legal duties before the incident.' },
          { text: 'Insurer hotline unknown', answer: 'Insurer details in the plan', why: 'Many policies require early notice and provide response firms.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Lessons learned belongs to which incident response phase?',
        options: [
          { text: 'Preparation', why: 'The fixes will improve preparation, but the review itself is post-incident.' },
          { text: 'Detection and analysis', why: 'Not here.' },
          { text: 'Containment', why: 'Not here.' },
          { text: 'Post-incident activity', correct: true, why: 'Review what happened and feed improvements back into preparation.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write a short lessons-learned summary with at least three actions, each with an owner and a date.',
        model: [
          'Tabletop exercise, ransomware scenario: lessons learned',
          'The exercise showed that Pinecrest could not reach key people quickly, had no agreed decision-makers, and did not know its recovery time.',
          'Actions:',
          '1. Create an on-call and escalation list for IT, operations and leadership. Owner: Paul Lindqvist. Due: 2 weeks.',
          '2. Add decision authority to the incident plan, including who can disconnect StackWare and shut down systems. Owner: Grace Adeyemi. Due: 1 month.',
          '3. Run a timed restore test of StackWare data and record the result. Owner: Paul Lindqvist. Due: 6 weeks.',
          '4. Agree a customer and regulator notification checklist with legal, and add the insurer hotline to the plan. Owner: Grace Adeyemi. Due: 1 month.',
          '5. Brief all staff, including drivers, on what to do and say during an incident. Owner: Monique Hall. Due: 6 weeks.',
          'We will rerun the exercise in six months to confirm the fixes.',
        ],
        rubric: [
          'Briefly summarises what the exercise found',
          'Lists at least three specific actions',
          'Each action has a named owner',
          'Each action has a due date',
          'Plans a follow-up exercise or check',
        ],
      },
    ],
    debrief: {
      work: [
        'Tabletops are cheap and reveal a lot. The GRC part is making sure the findings become tracked actions with owners, and checking they get done.',
        'Add each action to the findings tracker so it shows up in reporting until it is closed.',
      ],
      examTip: 'The CISSP lists several kinds of business continuity and incident tests: read-through (checklist), structured walk-through (tabletop), simulation, parallel and full interruption. A tabletop is a walk-through: low cost and no impact on operations.',
    },
  },

  {
    id: 'management-response',
    week: 4,
    title: 'Management response to the SOC 2 finding',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Priya Natarajan', role: 'Compliance & Audit Lead' },
    channel: 'Email',
    received: 'Thursday 14:10',
    priority: 'High',
    minutes: 20,
    domain: 6,
    skills: ['Audit findings', 'Root cause', 'Writing'],
    message: [
      'Hi,',
      'The SOC 2 auditors issued the finding below. Marc owns the response and it is due Friday. Could you draft it for him?',
      'Priya',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Auditor finding SOC2-03',
        columns: ['Part', 'Detail'],
        rows: [
          ['Condition', '4 of 25 sampled privileged access changes had no approval ticket.'],
          ['Criteria', 'CC6.3 requires access changes to be authorised.'],
          ['Cause', 'Emergency access was granted after phone requests, with no ticket raised afterwards.'],
          ['Effect', 'Unauthorised privileged access could be granted and go unnoticed.'],
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'What makes a good management response?',
        options: [
          { text: 'Agreeing or disagreeing with evidence, and setting out actions that fix the cause, with an owner and date', correct: true, why: 'Auditors and boards look for a credible fix to the root cause.' },
          { text: 'Explaining which staff made the mistakes', why: 'Blaming individuals does not fix the process.' },
          { text: 'Arguing that 4 of 25 is a small number', why: 'The sample shows a pattern, and the auditors will not accept the argument without evidence.' },
          { text: 'Promising to be more careful', why: 'Vague promises do not change anything.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Which actions address the root cause?',
        options: [
          { text: 'An emergency access procedure that requires a ticket within 24 hours', correct: true, why: 'Keeps the speed of emergencies but records and approves them afterwards.' },
          { text: 'Make the access tool require a ticket number to grant privileged access', correct: true, why: 'A technical control that stops changes without a ticket.' },
          { text: 'A monthly check of privileged changes against tickets', correct: true, why: 'A detective control that finds any gaps that remain.' },
          { text: 'An email reminding staff to raise tickets', why: 'Weak on its own. Reminders fade.' },
          { text: 'Ban all emergency access', why: 'Unrealistic. Real emergencies happen, and a ban pushes them underground.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Draft Marc\'s management response.',
        model: [
          'Management response to SOC2-03',
          'Management agrees with the finding. Emergency privileged access was granted after phone requests without a follow-up ticket.',
          'Actions:',
          '1. Introduce an emergency access procedure requiring a ticket within 24 hours, approved by the system owner. Owner: Marc Tremblay. Due: 31 January.',
          '2. Configure the privileged access tool to require a ticket number before access is granted. Owner: Marc Tremblay. Due: 31 March.',
          '3. Review all privileged changes against tickets each month and report exceptions to the CISO. Owner: Amara Okafor. First review: 28 February.',
          'Effectiveness will be checked by internal audit in Q2 by re-testing a sample of 25 changes.',
        ],
        rubric: [
          'States whether management agrees',
          'Identifies the root cause',
          'Gives specific actions, including at least one preventive control',
          'Names an owner for each action',
          'Gives target dates',
          'Says how effectiveness will be checked',
        ],
      },
    ],
    debrief: {
      work: [
        'Management responses are written by GRC analysts more often than by the managers who sign them. Short, specific and tied to the root cause is what auditors want to see.',
        'Track each action in the findings register. Auditors will check next year whether they were done.',
      ],
      examTip: 'Corrective actions should address root causes. Combining a preventive control (ticket required) with a detective control (monthly review) is the kind of layered answer the exam favours.',
    },
  },

  {
    id: 'media-disposal',
    week: 4,
    title: 'Disposing of old records and drives',
    client: 'Town of Riverside',
    from: { name: 'Diane Wong', role: 'Town Clerk (privacy lead)' },
    channel: 'Email',
    received: 'Friday 10:40',
    priority: 'Normal',
    minutes: 15,
    domain: 2,
    skills: ['Data retention', 'Media sanitisation'],
    message: [
      'Hello,',
      'The records room is full. We have boxes and old equipment that are past their retention period. How should we get rid of each kind properly?',
      'Diane',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Items for disposal',
        columns: ['Item', 'Contents', 'Plan'],
        rows: [
          ['42 archive boxes', 'Paper tax files with resident information', 'Dispose'],
          ['12 encrypted laptops (SSD)', 'Staff files', 'Reissue to new staff'],
          ['30 backup tapes (LTO)', 'Old finance backups', 'Dispose'],
          ['8 failed server SSDs', 'Unknown, from the old file server', 'Dispose'],
          ['15 desktop PCs (hard drives)', 'Staff files', 'Donate to a local school'],
        ],
      },
    ],
    steps: [
      {
        type: 'match',
        prompt: 'Choose the right method for each item.',
        choices: ['Cross-cut shredding by a certified service', 'Cryptographic erase', 'Degauss, then destroy', 'Physical destruction (shred or crush)', 'Overwrite (purge) and verify'],
        items: [
          { text: 'Paper tax files', answer: 'Cross-cut shredding by a certified service', why: 'Standard for confidential paper, with a certificate of destruction.' },
          { text: 'Encrypted laptops being reissued', answer: 'Cryptographic erase', why: 'Destroying the encryption keys makes the old data unreadable and keeps the drive usable.' },
          { text: 'Magnetic backup tapes', answer: 'Degauss, then destroy', why: 'Degaussing wipes magnetic media; destroying them afterwards removes any doubt.' },
          { text: 'Failed SSDs', answer: 'Physical destruction (shred or crush)', why: 'Failed drives cannot be erased, and degaussing does not work on flash memory.' },
          { text: 'Hard drives in donated PCs', answer: 'Overwrite (purge) and verify', why: 'Overwriting with verification lets the school reuse them safely.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What must Diane confirm before anything is destroyed?',
        options: [
          { text: 'That the records are past retention and not under a legal hold', correct: true, why: 'Destroying records under a legal hold, such as a lawsuit or information request, can be unlawful even after retention ends.' },
          { text: 'That IT agrees', why: 'IT helps with the equipment, but retention and legal hold decide whether records can go.' },
          { text: 'That nobody will need them again', why: 'That is what the retention schedule decides.' },
          { text: 'Nothing, past retention means they can go', why: 'Legal holds override retention.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Degaussing does not work on which kind of media?',
        options: [
          { text: 'Solid-state drives and other flash memory', correct: true, why: 'Flash stores data electrically, not magnetically.' },
          { text: 'Hard disk drives', why: 'Degaussing works on HDDs, though it ruins them.' },
          { text: 'Magnetic tape', why: 'This is what degaussing is designed for.' },
          { text: 'Floppy disks', why: 'These are magnetic too.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What record should the town keep afterwards?',
        options: [
          { text: 'A certificate of destruction from the vendor, filed with the disposal log', correct: true, why: 'Proves what was destroyed, how and when.' },
          { text: 'Nothing, the items are gone', why: 'Auditors and the IPC may ask for proof.' },
          { text: 'Photos of the empty room', why: 'Photos do not show what was destroyed or how.' },
          { text: 'A copy of the data before destruction', why: 'That would defeat the point of disposal.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Retention and disposal is everyday work for privacy and records teams. Always check for legal holds first, then match the method to the media and whether it will be reused.',
        'Keep the certificates. "We shredded it" without proof is a finding waiting to happen.',
      ],
      examTip: 'Know the sanitisation terms: clearing (overwriting so normal tools cannot recover data), purging (stronger, for reuse in less secure settings), destruction (the media cannot be reused). Data remanence is the data left behind; SSDs need crypto erase or destruction.',
    },
  },
];
