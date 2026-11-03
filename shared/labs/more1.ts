import type { Lab } from './types.ts';

export const MORE1: Lab[] = [
  {
    id: 'password-guidance',
    week: 5,
    level: 'Easy',
    title: 'Can you rewrite the password rules for the staff handbook?',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Sofia Alvarez', role: 'Director of People' },
    channel: 'Email',
    received: 'Monday 10:20',
    priority: 'Normal',
    minutes: 15,
    domain: 5,
    skills: ['Password policy', 'Authentication'],
    message: [
      'Hi,',
      'Staff keep complaining about our password rules, and the help desk says half its calls are lockouts after the monthly change. I am updating the handbook. Could you tell me what the rules should be now? Our current section is attached.',
      'Sofia',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Staff handbook, section 7.3 (current)',
        body: [
          'Passwords must be at least 8 characters and include an uppercase letter, a number and a symbol.',
          'Passwords must be changed every 30 days and cannot reuse the last 12.',
          'Write your password down only if you keep it in a locked drawer.',
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which changes match current good practice (for example NIST SP 800-63B)?',
        options: [
          { text: 'Favour longer passphrases over complexity rules', correct: true, why: 'Length adds far more strength than forcing a symbol, and long phrases are easier to remember.' },
          { text: 'Stop forcing a change every 30 days; change only if there is a sign of compromise', correct: true, why: 'Forced changes lead to predictable patterns like Spring2026! then Summer2026!, and they cause the lockouts.' },
          { text: 'Check new passwords against lists of known breached passwords', correct: true, why: 'Blocks passwords attackers already have in their lists.' },
          { text: 'Encourage a password manager instead of writing passwords down', correct: true, why: 'A manager makes long, unique passwords practical for every system.' },
          { text: 'Keep the 30-day change but make it 60 days', why: 'Still a scheduled change with the same problems, just less often.' },
          { text: 'Require two symbols instead of one', why: 'More composition rules add frustration without much extra strength.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What matters most for staff accounts, whatever the password rules say?',
        options: [
          { text: 'Multi-factor authentication', correct: true, why: 'A stolen password on its own is then not enough to get in.' },
          { text: 'A longer lockout after failed attempts', why: 'Lockouts slow guessing but cause help desk calls, and they do nothing against phished passwords.' },
          { text: 'Hiding the password field while typing', why: 'Common already, and a minor protection.' },
          { text: 'Security questions as a backup', why: 'Answers like a mother\'s maiden name are easy to find or guess.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write the new handbook section in a few plain sentences.',
        model: [
          '7.3 Passwords. Use a passphrase of at least 15 characters, such as four or more unrelated words. You do not need symbols or capital letters.',
          'Use a different password for every system. The credit union provides a password manager so you only need to remember one.',
          'You will not be asked to change your password on a schedule. Change it straight away if you think someone else knows it, and tell the IT help desk.',
          'Multi-factor authentication is required for email and remote access. Never approve a sign-in prompt you did not start.',
        ],
        rubric: [
          'Asks for length (a passphrase) rather than complexity',
          'Drops the scheduled change, but says to change it after a suspected compromise',
          'Recommends unique passwords and a password manager',
          'Mentions MFA',
          'Written in plain language for staff',
        ],
      },
    ],
    debrief: {
      work: [
        'Policy rewrites like this are frequent, and HR often owns the handbook. Your job is to translate the standard into rules people can follow, and to point out where an old rule causes the very problems they are complaining about.',
        'Expect pushback from people who learned the old rules. Quote the standard and the help desk numbers.',
      ],
      examTip: 'The CISSP covers authentication factors (something you know, have, are) and password policy. Know that current NIST guidance favours length, breached-password checks and MFA over complexity and forced rotation.',
    },
  },

  {
    id: 'policy-reviews',
    week: 5,
    level: 'Easy',
    title: 'Which policies are overdue for review?',
    client: 'Town of Riverside',
    from: { name: 'Diane Wong', role: 'Town Clerk (privacy lead)' },
    channel: 'Email',
    received: 'Tuesday 9:05',
    priority: 'Normal',
    minutes: 10,
    domain: 1,
    skills: ['Policy management', 'Governance'],
    message: [
      'Hello,',
      'The auditor is coming in January and I would like our policy list in order first. Today is 3 November 2026. Our rule is that every policy is reviewed at least once a year. Can you help me work out what needs doing?',
      'Diane',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Policy register',
        columns: ['Policy', 'Owner', 'Version', 'Last approved', 'Status'],
        rows: [
          ['Information Security Policy', 'Omar Siddiqui', '3.1', '14 Feb 2026', 'Approved'],
          ['Acceptable Use Policy', 'Diane Wong', '2.0', '2 Aug 2025', 'Approved'],
          ['Records Retention Schedule', 'Diane Wong', '4.2', '20 Oct 2025', 'Approved'],
          ['Remote Access Standard', 'Marcus Bell', '1.0', 'never', 'Draft'],
          ['Incident Response Plan', 'Marcus Bell', '1.3', '1 Dec 2025', 'Approved'],
          ['Privacy Breach Procedure', 'Diane Wong', '2.1', '5 Mar 2024', 'Approved'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which policies are overdue (approved more than 12 months ago)?',
        options: [
          { text: 'Acceptable Use Policy (Aug 2025)', correct: true, why: 'More than 12 months ago.' },
          { text: 'Records Retention Schedule (Oct 2025)', correct: true, why: 'Just past a year, so overdue by about two weeks.' },
          { text: 'Privacy Breach Procedure (Mar 2024)', correct: true, why: 'Well over two years. This one needs the most urgent attention.' },
          { text: 'Incident Response Plan (Dec 2025)', why: 'Under a year old, but due next month. Put it on the list.' },
          { text: 'Information Security Policy (Feb 2026)', why: 'Reviewed this year.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The Remote Access Standard is still a draft. What is the risk?',
        options: [
          { text: 'None, a draft is fine for now', why: 'Staff cannot be held to an unapproved document, and auditors treat it as missing.' },
          { text: 'Staff have no approved rules for remote access, so the town cannot enforce them', correct: true, why: 'Get it approved by its owner and communicated.' },
          { text: 'It will be approved automatically after a year', why: 'Approval has to be a deliberate decision by the owner.' },
          { text: 'Only the auditor can approve it', why: 'Management approves policies; auditors review them.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What does a policy review actually involve?',
        options: [
          { text: 'Changing the date at the bottom', why: 'Auditors look for evidence that someone checked the content.' },
          { text: 'Checking it still matches the law, the systems and how people work, updating it, and having the owner re-approve it with a new version and date', correct: true, why: 'That leaves a record an auditor can follow.' },
          { text: 'Rewriting it from scratch every year', why: 'Not needed if it is still accurate.' },
          { text: 'Asking staff whether they like it', why: 'Feedback helps, but the owner has to check it and approve it.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Keeping the policy register current is unglamorous, and it is checked in almost every audit. A simple list with owners and dates, reviewed monthly, prevents most findings.',
        'Chase the oldest and the drafts first. An unapproved policy is a gap, however good the text is.',
      ],
      examTip: 'Know the hierarchy: policies (management intent, mandatory), standards (specific mandatory requirements), procedures (step-by-step how-to), guidelines (recommended, optional) and baselines (minimum configurations).',
    },
  },

  {
    id: 'awareness-plan',
    week: 5,
    level: 'Easy',
    title: 'Help me plan security training for next year',
    client: 'Harbourview Family Clinic',
    from: { name: 'Nadia Rahman', role: 'Practice Manager' },
    channel: 'Teams message',
    received: 'Wednesday 13:40',
    priority: 'Normal',
    minutes: 15,
    domain: 1,
    skills: ['Security awareness', 'Programme planning'],
    message: [
      'After the phishing test I want a proper training plan for next year. We have 12 staff and very little time between patients. What should we do, and how do I know if it is working?',
    ],
    attachments: [],
    steps: [
      {
        type: 'match',
        prompt: 'Match each topic to the group that most needs it.',
        choices: ['Everyone', 'Front desk', 'Physicians and nurses', 'Practice manager'],
        items: [
          { text: 'Spotting phishing and reporting it', answer: 'Everyone', why: 'Every inbox is a target.' },
          { text: 'Checking two identifiers before sharing results by phone or email', answer: 'Front desk', why: 'They handle most patient requests, and made last month\'s mistake.' },
          { text: 'Keeping laptops encrypted and locked when working from home', answer: 'Physicians and nurses', why: 'They take devices home to finish notes.' },
          { text: 'Handling a privacy breach and notifying patients', answer: 'Practice manager', why: 'Nadia is the privacy lead and makes the notification decisions.' },
        ],
      },
      {
        type: 'single',
        prompt: 'With so little time, what format works best?',
        options: [
          { text: 'One three-hour session a year', why: 'People forget most of it within weeks.' },
          { text: 'Short sessions of 10 to 15 minutes every month or two, plus regular phishing tests', correct: true, why: 'Little and often fits a clinic\'s day and keeps security in mind.' },
          { text: 'Emailing the policy and asking staff to read it', why: 'Few will, and nobody can tell who understood it.' },
          { text: 'Training only after someone makes a mistake', why: 'Reactive only, and it feels like punishment.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Which measures show whether the programme is working?',
        options: [
          { text: 'Phishing report rate going up', correct: true, why: 'The behaviour you most want.' },
          { text: 'Phishing click rate going down over several tests', correct: true, why: 'Useful as a trend, if test difficulty stays similar.' },
          { text: 'Fewer privacy incidents caused by staff mistakes', correct: true, why: 'The real outcome the training aims for.' },
          { text: 'Training completion rate', correct: true, why: 'A basic measure, and auditors ask for it.' },
          { text: 'How many slides were in the training', why: 'Says nothing about what people learned.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Awareness programmes in small organisations live or die on time. Short, role-specific sessions tied to real incidents get far better results than a yearly lecture.',
        'Report the measures to management twice a year, so the programme keeps its budget.',
      ],
      examTip: 'The CISSP distinguishes awareness (keeping security in mind), training (teaching specific skills) and education (deeper understanding). Programmes should be role based, periodic and measured.',
    },
  },

  {
    id: 'vendor-offboarding',
    week: 5,
    level: 'Easy',
    title: 'We are ending the contract with our web agency',
    client: 'Northline Outfitters',
    from: { name: 'Ben Kowalski', role: 'Operations Director' },
    channel: 'Email',
    received: 'Thursday 15:15',
    priority: 'High',
    minutes: 15,
    domain: 1,
    skills: ['Third-party risk', 'Offboarding'],
    message: [
      'Hi,',
      'We have given Pixel & Pine notice. Their last day is Friday. They have store admin logins, access to our code repository, the shared marketing password vault, and copies of customer exports they used for testing.',
      'What do we need to do so we are properly done with them?',
      'Ben',
    ],
    attachments: [],
    steps: [
      {
        type: 'order',
        prompt: 'Put the offboarding steps in a sensible order.',
        items: [
          { text: 'List every system, account and dataset the agency can reach', why: 'You cannot remove access you do not know about.' },
          { text: 'Remove their store admin and code repository accounts on their last day', why: 'Access ends when the work ends.' },
          { text: 'Change any shared passwords and keys they knew, including the marketing vault', why: 'Removing accounts does not help if they still know a shared password.' },
          { text: 'Ask for the customer exports to be deleted, with written confirmation', why: 'Their copies of customer data are your responsibility under privacy law.' },
          { text: 'Mark the vendor as offboarded in the vendor register', why: 'Keeps the register accurate for audits.' },
        ],
      },
      {
        type: 'single',
        prompt: 'The agency says the test exports are "just on a developer laptop". What do you ask for?',
        options: [
          { text: 'Nothing, it is their laptop', why: 'It holds your customers\' personal information.' },
          { text: 'A signed confirmation that every copy has been deleted, including backups', correct: true, why: 'Written confirmation is the evidence you keep.' },
          { text: 'The laptop itself', why: 'Unreasonable. Confirmation of deletion is the normal ask.' },
          { text: 'A screenshot of the empty folder', why: 'Weak evidence, and it misses other copies.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What should the next agency contract include to make this easier?',
        options: [
          { text: 'A clause on returning and deleting data, and removing access, at the end of the contract', correct: true, why: 'Exit terms are much easier to agree at the start than at the end.' },
          { text: 'A longer notice period', why: 'Helps planning but does not deal with access or data.' },
          { text: 'A lower hourly rate', why: 'A commercial point.' },
          { text: 'Nothing, offboarding is always informal', why: 'Informal is how access gets forgotten.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Vendor offboarding is often forgotten until an old agency login turns up in an incident. Treat it like a staff leaver: list access, remove it, rotate shared secrets and get data back or destroyed.',
        'The shared secrets step is the one people most often skip.',
      ],
      examTip: 'Third-party management covers the whole life of the relationship: due diligence, contracting, monitoring and termination. Exam answers usually favour terms written into the contract up front.',
    },
  },

  {
    id: 'register-cleanup',
    week: 5,
    level: 'Medium',
    title: 'Our risk register is a mess. Where do we start?',
    client: 'Town of Riverside',
    from: { name: 'Omar Siddiqui', role: 'Chief Administrative Officer' },
    channel: 'Email',
    received: 'Monday 8:40',
    priority: 'Normal',
    minutes: 20,
    domain: 1,
    skills: ['Risk register', 'Writing risk statements'],
    message: [
      'Hello,',
      'Council wants our corporate risk register tidied up before budget season. Every department added entries over the years and nobody has looked at it since. A sample is attached. What is wrong with it, and how should a good entry read?',
      'Omar',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Corporate risk register (sample)',
        columns: ['#', 'Risk', 'Owner', 'Score', 'Last reviewed'],
        rows: [
          ['1', 'Cyber', 'IT', '25', '2022'],
          ['2', 'Hackers', '', '20', '2023'],
          ['3', 'Water plant could be attacked through vendor remote access, disrupting treatment', 'Robert Fraser', '10', 'Jan 2026'],
          ['4', 'Not enough staff', 'HR', '12', '2021'],
          ['5', 'Ransomware', 'Marcus Bell', '20', '2023'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'What is wrong with the register?',
        options: [
          { text: 'Vague titles like "Cyber" and "Hackers" that do not say what could happen', correct: true, why: 'Nobody can score or treat "Cyber". A risk needs a cause, an event and an effect.' },
          { text: 'Rows 1, 2 and 5 overlap', correct: true, why: 'Duplicates inflate the count and split the ownership.' },
          { text: 'Owners are departments or blank, not named people', correct: true, why: 'Accountability needs a person.' },
          { text: 'Most entries have not been reviewed for years', correct: true, why: 'Scores from 2021 or 2022 cannot be trusted.' },
          { text: 'Row 3 is too specific', why: 'Row 3 is the best entry here: a clear cause, event and effect, with a named owner.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Which version of "Cyber" is the best risk statement?',
        options: [
          { text: 'Cyber attacks', why: 'Still vague.' },
          { text: 'Because staff can be phished and backups sit on the same network, ransomware could encrypt finance and tax systems, stopping payments and services for weeks', correct: true, why: 'It names the cause, the event and the impact, so it can be scored and treated.' },
          { text: 'IT security is bad', why: 'A judgement, not a risk.' },
          { text: 'We need a new firewall', why: 'That is a solution, not a risk.' },
        ],
      },
      {
        type: 'single',
        prompt: 'How should the overlapping rows 1, 2 and 5 be handled?',
        options: [
          { text: 'Keep all three, more entries show we take cyber seriously', why: 'Duplicates make reporting misleading.' },
          { text: 'Merge them into specific risks such as the ransomware statement above, each with a named owner, and close the vague ones', correct: true, why: 'Fewer, clearer risks are easier to manage and report.' },
          { text: 'Delete them all', why: 'The underlying risk is real.' },
          { text: 'Average the scores', why: 'Averaging vague entries does not make them meaningful.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Rewrite risk 4 ("Not enough staff") as a proper risk statement with an owner.',
        model: [
          'Because the IT team has three people and only the IT manager knows how key systems are configured, the illness or departure of one person could leave the town unable to recover finance, permit or water plant systems after an outage. Owner: Omar Siddiqui (CAO), with Marcus Bell responsible for the documentation work.',
        ],
        rubric: [
          'States a cause (why it could happen)',
          'States the event (what happens)',
          'States the impact on the town',
          'Names a person as owner',
        ],
      },
    ],
    debrief: {
      work: [
        'Inheriting a messy register is common. Start by merging duplicates, rewriting vague entries as cause, event and effect, and giving each a named owner. Then rescore and set review dates.',
        'A shorter register that people trust is worth more than a long one nobody reads.',
      ],
      examTip: 'Risk identification and analysis sit in Domain 1. A clear risk statement links a threat, a vulnerability and an impact on an asset; that structure is what makes it possible to choose controls and measure residual risk.',
    },
  },

  {
    id: 'kri-thresholds',
    week: 5,
    level: 'Medium',
    title: 'Set warning levels for our risk indicators',
    client: 'Pinecrest Logistics',
    from: { name: 'Grace Adeyemi', role: 'Chief Operating Officer' },
    channel: 'Email',
    received: 'Tuesday 11:00',
    priority: 'Normal',
    minutes: 15,
    domain: 1,
    skills: ['Key risk indicators', 'Reporting'],
    message: [
      'Hi,',
      'The board wants a monthly dashboard with green, amber and red for a few cyber indicators. I have the numbers below but no idea where to set the lines. Can you help?',
      'Grace',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Indicators, last three months',
        columns: ['Indicator', 'August', 'September', 'October', 'Policy or target'],
        rows: [
          ['Critical patches older than 14 days', '4', '9', '17', 'Policy: patch critical within 14 days'],
          ['Leaver accounts still active after 1 day', '2', '3', '6', 'Policy: remove within 1 day'],
          ['Staff clicking the phishing test', '14%', '11%', '9%', 'Target: under 10%'],
          ['Backup restore tests completed', '0', '0', '1', 'Policy: one per month'],
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'What makes these key risk indicators rather than performance indicators?',
        options: [
          { text: 'They warn that exposure is rising before something goes wrong', correct: true, why: 'Overdue patches and active leaver accounts both raise the chance of an incident.' },
          { text: 'They are shown to the board', why: 'Boards see both kinds.' },
          { text: 'They use percentages', why: 'Format does not matter.' },
          { text: 'They are about IT', why: 'KRIs exist in every area of risk.' },
        ],
      },
      {
        type: 'match',
        prompt: 'What colour should each indicator be for October, using green for on target, amber for a small gap and red for a growing or serious breach?',
        choices: ['Green', 'Amber', 'Red'],
        items: [
          { text: 'Critical patches older than 14 days: 17 and rising each month', answer: 'Red', why: 'Rising fast and well past policy.' },
          { text: 'Leaver accounts still active: 6, doubling since September', answer: 'Red', why: 'A growing breach of policy that links directly to the cargo theft risk.' },
          { text: 'Phishing click rate: 9%, under the 10% target', answer: 'Green', why: 'On target and improving.' },
          { text: 'Restore tests: 1 in October after two months of none', answer: 'Amber', why: 'Improving, but there is no track record yet.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Why show the three-month trend and not just October?',
        options: [
          { text: 'Direction matters: a number getting worse each month needs action sooner than a stable one', correct: true, why: 'Trends turn indicators into early warnings.' },
          { text: 'Boards like longer tables', why: 'They usually prefer less, so include only what changes decisions.' },
          { text: 'To fill the page', why: 'Not a reason.' },
          { text: 'It is required by ISO 27001', why: 'ISO 27001 requires monitoring and measurement but does not prescribe this format.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Setting thresholds is a judgement call made with the business. Anchor them to policy where you can (14 days, 1 day) so the colours are hard to argue with.',
        'Each red should come with an owner and an action, otherwise the dashboard just makes people uneasy.',
      ],
      examTip: 'KRIs measure risk exposure and give early warning; KPIs measure how well a process performs. Expect questions asking you to tell them apart.',
    },
  },

  {
    id: 'emr-roles',
    week: 5,
    level: 'Medium',
    title: 'Who should be able to do what in the EMR?',
    client: 'Harbourview Family Clinic',
    from: { name: 'Dr. Samuel Osei', role: 'Lead Physician' },
    channel: 'Email',
    received: 'Wednesday 18:10',
    priority: 'Normal',
    minutes: 15,
    domain: 5,
    skills: ['Role-based access', 'Least privilege'],
    message: [
      'Hello,',
      'ClinicCloud is moving us to role-based access. Right now everyone can do everything. I need to tell them which roles get which permissions. Can you suggest a sensible set-up?',
      'Samuel',
    ],
    attachments: [],
    steps: [
      {
        type: 'match',
        prompt: 'Who should be able to do each task?',
        choices: ['Physicians only', 'Physicians and nurses', 'Front desk', 'Practice manager'],
        items: [
          { text: 'Write prescriptions', answer: 'Physicians only', why: 'A regulated act for physicians.' },
          { text: 'Read and add clinical notes', answer: 'Physicians and nurses', why: 'Both provide care and need the clinical record.' },
          { text: 'Book appointments and update contact details', answer: 'Front desk', why: 'Their job, with no need for clinical notes.' },
          { text: 'Create accounts and run audit reports', answer: 'Practice manager', why: 'Administration and oversight, kept apart from clinical work.' },
        ],
      },
      {
        type: 'single',
        prompt: 'A front desk worker sometimes needs to read a note to answer a patient question. What is the best approach?',
        options: [
          { text: 'Give the front desk full clinical access just in case', why: 'Breaks least privilege, and invites snooping.' },
          { text: 'Keep notes hidden from the front desk, and route clinical questions to a nurse', correct: true, why: 'Need to know: the front desk does not need clinical detail to do its job.' },
          { text: 'Share a nurse\'s login when needed', why: 'Shared logins remove accountability.' },
          { text: 'Let each person decide', why: 'Access needs consistent rules.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What else should the clinic switch on alongside the roles?',
        options: [
          { text: 'Monthly review of who opened which records', correct: true, why: 'A detective control that catches snooping, which roles alone cannot prevent.' },
          { text: 'Longer passwords for physicians only', why: 'Strong sign-in matters for everyone.' },
          { text: 'Nothing, roles are enough', why: 'People with legitimate access can still look where they should not.' },
          { text: 'Printing all records weekly', why: 'Creates more privacy risk.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Designing roles means sitting with the people who do the work. Start from tasks, not job titles, and give each role only what those tasks need.',
        'Roles prevent; access reviews detect. Most health privacy cases involve staff looking at records they had no reason to open.',
      ],
      examTip: 'Know the access control models: discretionary (owner decides), mandatory (labels and clearances), role-based (by job role), rule-based and attribute-based. Need to know and least privilege apply in every model.',
    },
  },
];
