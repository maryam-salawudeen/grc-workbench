import type { Lab } from './types.ts';

export const MORE2: Lab[] = [
  {
    id: 'cloud-posture',
    week: 6,
    level: 'Medium',
    title: 'Our cloud security report has 40 findings. Which first?',
    client: 'Aurora Pay',
    from: { name: 'Jordan Blake', role: 'Head of Platform Engineering' },
    channel: 'Teams message',
    received: 'Monday 9:50',
    priority: 'High',
    minutes: 15,
    domain: 3,
    skills: ['Cloud security', 'Prioritisation'],
    message: [
      'We turned on the cloud provider\'s security posture tool and it flagged 40 things. The top ones are below. The team can fix a handful this sprint. What goes first?',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Posture findings (top 6)',
        columns: ['Finding', 'Where', 'Tool severity'],
        rows: [
          ['Storage bucket allows public read', 'kyc-uploads-prod', 'Critical'],
          ['Root account has no MFA', 'Organisation root', 'Critical'],
          ['Access key unused for 200 days', 'ci-legacy user', 'Medium'],
          ['Audit logging switched off', 'Secondary region', 'High'],
          ['Disk not encrypted', 'dev-scratch volume (test data only)', 'Medium'],
          ['Security group allows SSH from anywhere', 'bastion-dev', 'High'],
        ],
      },
    ],
    steps: [
      {
        type: 'order',
        prompt: 'Rank these fixes, most urgent first.',
        items: [
          { text: 'Block public read on kyc-uploads-prod', why: 'Customer identity documents may be exposed right now.' },
          { text: 'Add MFA to the root account', why: 'Root can do anything, including deleting every log and backup.' },
          { text: 'Restrict SSH on bastion-dev to known addresses', why: 'An open admin entry point that attackers scan for constantly.' },
          { text: 'Turn audit logging back on in the secondary region', why: 'Without logs you cannot tell what happened if something goes wrong there.' },
          { text: 'Remove the unused ci-legacy access key', why: 'Low effort and removes a forgotten credential.' },
          { text: 'Encrypt the dev-scratch volume', why: 'Worth doing, but it holds only test data.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The bucket was public for an unknown time. What else must happen besides closing it?',
        options: [
          { text: 'Nothing, it is closed now', why: 'You still need to know whether anyone downloaded the documents.' },
          { text: 'Check the access logs for downloads and involve the compliance officer about possible notification', correct: true, why: 'This may be a privacy breach involving ID documents.' },
          { text: 'Delete the bucket', why: 'You would lose customer data and the evidence.' },
          { text: 'Rename the bucket', why: 'A new name does not change who could read it.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Under the shared responsibility model, whose job was it to keep the bucket private?',
        options: [
          { text: 'Aurora\'s', correct: true, why: 'The provider supplies the setting; the customer configures it.' },
          { text: 'The cloud provider\'s', why: 'Providers secure the platform, not each customer\'s settings.' },
          { text: 'Shared equally', why: 'Configuration is the customer\'s side of the line.' },
          { text: 'Nobody\'s', why: 'Someone always owns a setting.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Posture tools rate findings in general. Your job is to rank them for this business: what data is involved, whether it is reachable from the internet, and how much an attacker could do with it.',
        'A finding that may already have exposed data is an incident, not just a fix.',
      ],
      examTip: 'Domain 3 includes cloud security. Most cloud breaches are customer misconfigurations such as public storage and weak identity controls, which sit on the customer\'s side of the shared responsibility model.',
    },
  },

  {
    id: 'dpia-location',
    week: 6,
    level: 'Medium',
    title: 'Privacy review for the new location feature',
    client: 'Aurora Pay',
    from: { name: 'Fatima Noor', role: 'Chief Compliance Officer' },
    channel: 'Email',
    received: 'Tuesday 14:30',
    priority: 'Normal',
    minutes: 20,
    domain: 2,
    skills: ['Privacy impact assessment', 'Data minimisation'],
    message: [
      'Hello,',
      'Product wants to collect users\' precise location every five minutes, all day, to help spot fraud. The proposal is attached. Before we build it, I need a privacy impact assessment. Could you start it?',
      'Fatima',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Feature proposal (summary)',
        body: [
          'Collect precise GPS location every 5 minutes, even when the app is closed.',
          'Keep the location history forever, in case it is useful later.',
          'Share location data with our marketing partner to improve targeting.',
          'Purpose: compare the location of a payment with the user\'s usual locations to flag fraud.',
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which parts of the proposal go beyond what fraud detection needs?',
        options: [
          { text: 'Tracking every five minutes, even when the app is closed', correct: true, why: 'Fraud checks need location at the moment of a payment, not all day.' },
          { text: 'Keeping location history forever', correct: true, why: 'Keep data only as long as the purpose needs it.' },
          { text: 'Sharing with the marketing partner', correct: true, why: 'A different purpose from fraud, which users did not agree to.' },
          { text: 'Checking location at the time of a payment', why: 'That directly supports the stated purpose.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which version of the feature would you recommend?',
        options: [
          { text: 'Capture approximate location only when a payment is made, keep it for 90 days, and use it only for fraud', correct: true, why: 'Meets the fraud purpose with far less data and risk.' },
          { text: 'Build it as proposed but mention it in the privacy policy', why: 'Disclosure does not make excessive collection acceptable.' },
          { text: 'Collect everything but encrypt it', why: 'Encryption protects data; it does not justify collecting more than needed.' },
          { text: 'Drop fraud checks entirely', why: 'Fraud prevention is a legitimate purpose that can be met in a lighter way.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What does Canadian privacy law (PIPEDA) expect before collecting location data like this?',
        options: [
          { text: 'Meaningful consent and a clear explanation of the purpose', correct: true, why: 'Users must understand what is collected and why. Location is sensitive.' },
          { text: 'Nothing, payment apps are exempt', why: 'They are not.' },
          { text: 'Only approval from the board', why: 'Internal approval does not replace the user\'s consent.' },
          { text: 'A public announcement', why: 'Not required, and not the same as consent.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Privacy assessments are where GRC meets product teams. Lead with the purpose, then push every data point through "do we need this for that purpose?". Teams usually accept a lighter design once they see it still meets their goal.',
        'Write the outcome down: a privacy impact assessment is evidence you considered the risk before building.',
      ],
      examTip: 'Know the privacy principles: purpose limitation, data minimisation, retention limits, consent, accuracy and security. Collecting "in case it is useful later" breaks purpose limitation.',
    },
  },

  {
    id: 'customer-questionnaire',
    week: 6,
    level: 'Medium',
    title: 'A bank sent us their security questionnaire',
    client: 'Aurora Pay',
    from: { name: 'Sara Kim', role: 'VP Partnerships' },
    channel: 'Email',
    received: 'Wednesday 10:15',
    priority: 'Urgent',
    minutes: 15,
    domain: 1,
    skills: ['Customer due diligence', 'Honest answers'],
    message: [
      'Hi,',
      'A big bank wants to partner with us and sent a security questionnaire. Sales wants every answer to say "Yes". The facts from engineering are attached. How should we answer?',
      'Sara',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Facts from engineering',
        columns: ['Topic', 'Current state'],
        rows: [
          ['SOC 2', 'Type II audit in progress, report expected in May'],
          ['MFA', 'Required for all staff since September'],
          ['Penetration test', 'Last done 18 months ago'],
          ['Encryption', 'All customer data encrypted at rest and in transit'],
          ['Incident response plan', 'Drafted, not yet tested'],
        ],
      },
    ],
    steps: [
      {
        type: 'match',
        prompt: 'How should each question be answered?',
        choices: ['Yes', 'Partly, with an explanation', 'No, with a plan and date'],
        items: [
          { text: 'Do you require MFA for all staff?', answer: 'Yes', why: 'True since September.' },
          { text: 'Is customer data encrypted at rest and in transit?', answer: 'Yes', why: 'True.' },
          { text: 'Do you have a current SOC 2 Type II report?', answer: 'No, with a plan and date', why: 'Not yet. Say the audit is in progress and the report is due in May.' },
          { text: 'Do you have a tested incident response plan?', answer: 'Partly, with an explanation', why: 'There is a plan but it has not been tested. Say when the tabletop will happen.' },
          { text: 'Have you had a penetration test in the last 12 months?', answer: 'No, with a plan and date', why: 'Eighteen months ago. Commit to a date for the next one.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The bank asks for evidence behind your "Yes" on MFA. What do you send?',
        options: [
          { text: 'A report or screenshot from the identity system showing MFA is enforced for all staff accounts, with the date', correct: true, why: 'Evidence from the system itself, dated, is what reviewers trust.' },
          { text: 'A note from the CTO confirming it', why: 'A statement is weaker than the system\'s own record.' },
          { text: 'The MFA policy document', why: 'The policy shows the rule, not that it is enforced.' },
          { text: 'Nothing, they should trust the answer', why: 'Banks expect evidence for key controls.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Sales says a "No" will lose the deal. What is the risk of answering "Yes" anyway?',
        options: [
          { text: 'False answers can become contract terms; if found out, they can mean losing the deal, legal claims and lost trust', correct: true, why: 'Banks check answers, often by asking for evidence.' },
          { text: 'None, nobody checks', why: 'Banks routinely ask for reports and evidence.' },
          { text: 'A small fine', why: 'The damage is usually far bigger than a fine.' },
          { text: 'Only reputational', why: 'Misrepresentation in a contract has legal consequences as well.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Answering customer questionnaires is a big part of GRC at technology companies. The skill is being honest without being unhelpful: "Not yet, here is the plan and date" often satisfies a buyer.',
        'Keep a library of approved answers with evidence, so each new questionnaire takes hours, not weeks.',
      ],
      examTip: 'The (ISC)² Code of Ethics asks members to act honourably, honestly, justly, responsibly and legally. Questions about misrepresenting security to customers test this canon.',
    },
  },

  {
    id: 'pci-scope',
    week: 7,
    level: 'Hard',
    title: 'Can we shrink our PCI scope before the assessment?',
    client: 'Northline Outfitters',
    from: { name: 'Hannah Lee', role: 'Finance Manager' },
    channel: 'Email',
    received: 'Monday 13:00',
    priority: 'High',
    minutes: 20,
    domain: 1,
    skills: ['PCI DSS', 'Scope reduction'],
    message: [
      'Hi,',
      'Our acquiring bank says we need to complete our PCI DSS assessment by March. Our current set-up is attached. Someone told me we could make this much easier by changing how we take payments. Is that true?',
      'Hannah',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'How card data moves today',
        columns: ['System', 'What it does with card data'],
        rows: [
          ['Online checkout', 'Card number typed into our own form, then sent to PayFast'],
          ['Customer service phone line', 'Agents type card numbers into the store admin for phone orders'],
          ['Order database', 'Stores the last 4 digits and expiry date'],
          ['Marketing laptop', 'Received a spreadsheet of full card numbers by email last year'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which systems are in scope for PCI DSS today?',
        options: [
          { text: 'The online checkout form', correct: true, why: 'Card numbers pass through Northline\'s own page.' },
          { text: 'The customer service phone process and the PCs agents use', correct: true, why: 'Agents handle full card numbers.' },
          { text: 'The marketing laptop', correct: true, why: 'It holds full card numbers, which should never have been emailed.' },
          { text: 'The order database, for the last 4 digits only', why: 'Storing only the last four digits is not storing cardholder data, though the database must still be protected.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What change shrinks the online scope the most?',
        options: [
          { text: 'Use PayFast\'s hosted payment page or embedded field, so card numbers never touch Northline\'s servers', correct: true, why: 'With payment fields hosted by the processor, Northline\'s site no longer receives card data, which usually means a much smaller self-assessment.' },
          { text: 'Encrypt the checkout form', why: 'Encryption is required anyway, but Northline still handles the card data.' },
          { text: 'Move the store to a new host', why: 'Scope follows the card data, not the hosting company.' },
          { text: 'Only take payments at night', why: 'Timing does not change scope.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What should happen with the spreadsheet on the marketing laptop?',
        options: [
          { text: 'Securely delete it, check where else it was sent or copied, and treat it as a possible incident', correct: true, why: 'Full card numbers outside the payment environment are a serious problem.' },
          { text: 'Password-protect the file', why: 'The data should not exist there at all.' },
          { text: 'Leave it, it is old', why: 'Old card numbers can still be valid.' },
          { text: 'Move it to the shared drive', why: 'That spreads it further.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write a short recommendation to Hannah.',
        model: [
          'Yes, we can make the assessment much smaller. Today card numbers pass through our own checkout form, through the store admin for phone orders, and through a spreadsheet on a marketing laptop. All three are in scope.',
          'I recommend: switching the checkout to PayFast\'s hosted payment fields; taking phone orders through PayFast\'s virtual terminal or a payment link instead of our admin; and deleting the spreadsheet now and checking where else it went.',
          'Once card data no longer touches our systems, the assessment is far simpler. We still need to protect the checkout page and keep the order database secure.',
        ],
        rubric: [
          'Confirms scope can be reduced',
          'Names the systems in scope today',
          'Recommends hosted payment fields for the website',
          'Deals with the phone orders',
          'Handles the spreadsheet as urgent',
          'Notes some requirements still apply',
        ],
      },
    ],
    debrief: {
      work: [
        'Scope reduction is the most useful PCI advice you can give a small merchant. Follow the card number: every system it touches is in scope, along with systems connected to them.',
        'Look for stray copies in email and spreadsheets. They turn up in almost every review.',
      ],
      examTip: 'PCI DSS applies to anyone storing, processing or transmitting cardholder data. Tokenisation and outsourcing payment handling reduce scope; they do not remove all responsibility.',
    },
  },

  {
    id: 'audit-plan',
    week: 7,
    level: 'Hard',
    title: 'Draft next year\'s internal audit plan',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Priya Natarajan', role: 'Compliance & Audit Lead' },
    channel: 'Email',
    received: 'Tuesday 9:30',
    priority: 'Normal',
    minutes: 20,
    domain: 6,
    skills: ['Audit planning', 'Risk-based auditing'],
    message: [
      'Hi,',
      'I have budget for four internal IT audits next year. The audit universe with risk scores and last audit dates is attached. Which four would you pick, and why?',
      'Priya',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'IT audit universe',
        columns: ['Area', 'Residual risk', 'Last audited', 'Notes'],
        rows: [
          ['Privileged access management', 'High', 'Never', 'Two findings this year'],
          ['Backup and recovery', 'High', '2023', 'Restore tests not done'],
          ['Third-party risk', 'Medium', '2022', 'Regulator interest in outsourcing'],
          ['Change management', 'Low', '2025', 'Clean audit last year'],
          ['Physical security', 'Low', '2024', 'No incidents'],
          ['Vulnerability management', 'High', '2024', 'Patch backlog doubling'],
          ['Security awareness', 'Medium', '2025', 'Click rate improving'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Pick four areas for next year.',
        options: [
          { text: 'Privileged access management', correct: true, why: 'High risk, never audited, findings this year.' },
          { text: 'Backup and recovery', correct: true, why: 'High risk and restore tests are not being done.' },
          { text: 'Vulnerability management', correct: true, why: 'High risk and getting worse.' },
          { text: 'Third-party risk', correct: true, why: 'Medium risk, not audited since 2022, and the regulator is interested.' },
          { text: 'Change management', why: 'Low risk and audited cleanly last year.' },
          { text: 'Physical security', why: 'Low risk, recently audited.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What principle drives these choices?',
        options: [
          { text: 'Risk-based audit planning: focus effort where risk is high, conditions are changing or an area has not been looked at for a long time', correct: true, why: 'Limited audit time should go where it reduces the most risk.' },
          { text: 'Audit each area in rotation, one per year', why: 'Ignores risk, so high-risk areas could wait years.' },
          { text: 'Audit areas with the fewest problems to show good results', why: 'That defeats the purpose of audit.' },
          { text: 'Let each department choose', why: 'Audit independence means audit sets its own plan.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Who should approve the audit plan?',
        options: [
          { text: 'The board\'s audit or risk committee', correct: true, why: 'Approval by the board keeps internal audit independent of the management it audits.' },
          { text: 'The CISO', why: 'Several of these audits look at the CISO\'s own areas.' },
          { text: 'The IT Operations Manager', why: 'Not independent of the areas being audited.' },
          { text: 'Nobody, it is internal', why: 'An approved plan is a basic requirement for internal audit.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Audit planning is about trade-offs: you will never have time for everything. Show your reasoning against risk, time since the last audit and outside pressure, so the committee can challenge it.',
        'Areas left out this year should appear in a multi-year plan, so nothing goes unexamined forever.',
      ],
      examTip: 'Domain 6 covers audit strategy. Internal audit reports to the board or audit committee to stay independent. Audits can be internal, external or third party (for example a customer auditing you).',
    },
  },

  {
    id: 'ransom-decision',
    week: 7,
    level: 'Hard',
    title: 'Council is asking whether we should pay the ransom',
    client: 'Town of Riverside',
    from: { name: 'Omar Siddiqui', role: 'Chief Administrative Officer' },
    channel: 'Email',
    received: 'Wednesday 6:45',
    priority: 'Urgent',
    minutes: 20,
    domain: 7,
    skills: ['Incident response', 'Crisis decisions', 'Briefing executives'],
    message: [
      'We were hit overnight. Finance and tax servers are encrypted and there is a ransom note asking for $400,000 in cryptocurrency within 72 hours. The mayor wants to pay so services come back fast. Council meets at 10. I need advice I can stand behind.',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'What we know at 6:30',
        body: [
          'Offsite immutable backups were set up in March. The last successful backup was yesterday at 01:00.',
          'The attackers say they also copied resident data and will publish it if not paid.',
          'The cyber insurer has been called and is sending its incident response firm.',
          'Police have not been contacted yet.',
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'What should happen before anyone decides about paying?',
        options: [
          { text: 'Report to the police and the Canadian Centre for Cyber Security', correct: true, why: 'They may know the group, and reporting is expected.' },
          { text: 'Follow the insurer\'s process and let its response firm assess the attack', correct: true, why: 'Policies often require this, and the firm can check what was taken.' },
          { text: 'Get legal advice on sanctions and on notifying residents', correct: true, why: 'Paying some groups can break sanctions law. The data theft may need privacy notifications regardless.' },
          { text: 'Find out whether the backups are clean and how long a restore would take', correct: true, why: 'Good backups may make the decryption key unnecessary.' },
          { text: 'Pay quickly to get a discount', why: 'Rushing removes every other option and gives no guarantee.' },
        ],
      },
      {
        type: 'single',
        prompt: 'If the town pays, what does it actually get?',
        options: [
          { text: 'No guarantee: decryption tools often fail or are slow, and stolen data may still be published or sold', correct: true, why: 'Paying buys a promise from criminals.' },
          { text: 'All systems back within hours', why: 'Decryption is often slow and incomplete.' },
          { text: 'A guarantee the data is deleted', why: 'There is no way to verify it.' },
          { text: 'Protection from future attacks', why: 'Paying victims are often targeted again.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write Omar\'s three or four sentence briefing for council.',
        model: [
          'Last night attackers encrypted our finance and tax systems and claim to have copied resident data. We have clean offsite backups from yesterday, and the insurer\'s response team is checking whether a restore is safe and how long it will take.',
          'I recommend we do not decide on payment this morning. Paying gives no guarantee of recovery or that the data will not be published, and it may be illegal if the group is sanctioned.',
          'We are reporting to police and the Canadian Centre for Cyber Security, getting legal advice on notifying residents, and will brief council again by 4 p.m. with recovery timings.',
        ],
        rubric: [
          'States plainly what happened',
          'Mentions the backups and the recovery assessment',
          'Explains the main risks of paying',
          'Gives a clear recommendation',
          'Says what happens next and when council will hear again',
        ],
      },
    ],
    debrief: {
      work: [
        'Ransom decisions belong to senior leaders, not IT. The GRC role is to make sure the decision is informed: legal and sanctions advice, the insurer, law enforcement and a realistic view of the backups.',
        'This is when investment in immutable backups pays off. It turns an impossible choice into a recovery project.',
      ],
      examTip: 'The CISSP expects incidents to be handled under a documented plan, with evidence preserved and law enforcement involved where appropriate. Senior management makes decisions with legal or financial impact.',
    },
  },

  {
    id: 'soc-report-review',
    week: 7,
    level: 'Hard',
    title: 'Review CloudScale\'s SOC 2 report for us',
    client: 'Aurora Pay',
    from: { name: 'Fatima Noor', role: 'Chief Compliance Officer' },
    channel: 'Email',
    received: 'Thursday 11:25',
    priority: 'Normal',
    minutes: 20,
    domain: 6,
    skills: ['SOC 2 reports', 'Third-party assurance'],
    message: [
      'Hello,',
      'CloudScale sent their SOC 2 Type II report. Our auditors will ask whether we reviewed it. The key sections are summarised below. What do we need to take from it?',
      'Fatima',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'CloudScale SOC 2 Type II: summary',
        columns: ['Section', 'What it says'],
        rows: [
          ['Opinion', 'Unqualified (clean), except as noted below'],
          ['Period', '1 Jan to 31 Dec 2025'],
          ['Exceptions', '2 of 40 sampled employee leavers kept access for over 30 days'],
          ['Subservice organisations', 'Data centre facilities provider, carved out (not tested)'],
          ['Complementary user entity controls', 'Customers must manage their own user access, enable MFA, and configure encryption and logging'],
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'The period ended 31 December 2025. It is now November 2026. What should Aurora ask for?',
        options: [
          { text: 'A bridge letter from CloudScale covering the gap since the period ended', correct: true, why: 'A bridge (gap) letter is management\'s statement that nothing significant changed since the report period.' },
          { text: 'Nothing, the report is still valid', why: 'It says nothing about the last 11 months.' },
          { text: 'A brand new audit immediately', why: 'Unrealistic. The next report and a bridge letter are the normal path.' },
          { text: 'The auditor\'s working papers', why: 'Customers do not normally get these.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What does "complementary user entity controls" mean for Aurora?',
        options: [
          { text: 'Controls Aurora must run itself for CloudScale\'s controls to work as the report describes', correct: true, why: 'If Aurora skips them, the report\'s assurance does not fully apply.' },
          { text: 'Optional extras', why: 'They are assumptions the report depends on.' },
          { text: 'Controls CloudScale runs for free', why: 'They are on Aurora\'s side.' },
          { text: 'Controls the auditor recommends', why: 'They are listed by the service organisation, not recommendations.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What should Aurora record in its vendor review?',
        options: [
          { text: 'The leaver exception, and whether CloudScale has fixed it', correct: true, why: 'An exception in the report is worth following up.' },
          { text: 'That the data centre provider was carved out, and how Aurora gets assurance for it', correct: true, why: 'Carved-out subservice organisations were not tested in this report.' },
          { text: 'Evidence that Aurora runs each complementary control, such as MFA and logging', correct: true, why: 'Ties the report back to Aurora\'s own controls.' },
          { text: 'That the opinion is clean, so no further action is needed', why: 'A clean opinion with exceptions and carve-outs still needs follow-up.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Reading SOC 2 reports is a core vendor-risk skill. Go straight to the opinion, the period, the exceptions, the carve-outs and the complementary user entity controls. Those five parts hold most of what matters.',
        'Keep a short review note per vendor per year. Auditors will ask for it.',
      ],
      examTip: 'A SOC 2 Type II tests operating effectiveness over a period. The carve-out method excludes a subservice organisation\'s controls; the inclusive method tests them. Complementary user entity controls are the customer\'s responsibility.',
    },
  },
];
