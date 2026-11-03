import type { Lab } from './types.ts';

export const WEEK1: Lab[] = [
  {
    id: 'access-review',
    week: 1,
    level: 'Easy',
    title: 'Q3 privileged access review for core banking',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Daniel Chen', role: 'IT Operations Manager' },
    channel: 'Email',
    received: 'Monday 9:12',
    priority: 'High',
    minutes: 20,
    domain: 5,
    skills: ['Access review', 'Least privilege', 'Audit evidence'],
    message: [
      'Hi,',
      'The quarterly access review for core banking privileged roles is due to the auditors on Friday. I have attached this morning\'s export from the system.',
      'Before I send it to the managers for sign-off, can you go through it and flag anything that needs to change? Let me know what evidence we should keep as well. Last year the auditor said our pack was thin.',
      'Thanks,\nDaniel',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'core-banking-privileged-users.csv',
        columns: ['Account', 'Role', 'Department', 'HR status', 'Last login', 'Notes'],
        rows: [
          ['a.okafor', 'Security Admin', 'Information Security', 'Active', '2 days ago', ''],
          ['j.ramos', 'Teller Supervisor, Loan Approver', 'Branch Operations', 'Active', 'Today', 'Moved from Lending to Branch Ops in June'],
          ['k.liu', 'Database Admin', 'IT', 'Active', 'Yesterday', ''],
          ['p.singh', 'Loan Approver', 'Lending', 'Terminated 30 Aug', '2 Sept', ''],
          ['svc_backup', 'Service account', 'IT', 'n/a', 'Today', 'Owner: blank'],
          ['m.dube', 'System Admin', 'IT', 'Active', '143 days ago', ''],
          ['temp_audit', 'Read only', 'External', 'n/a', '210 days ago', 'Created for the 2025 audit'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which of these actions should go back to Daniel? Tick every one you agree with.',
        options: [
          { text: 'p.singh: disable now and look into the login after the termination date', correct: true, why: 'A login three days after leaving means the account was not removed on time and someone may have used it.' },
          { text: 'j.ramos: remove Loan Approver, kept after moving to Branch Ops', correct: true, why: 'Teller supervision plus loan approval is more than the new job needs, and it lets one person both handle and approve money.' },
          { text: 'temp_audit: disable, it was only for last year\'s audit', correct: true, why: 'Temporary accounts should expire. This one has been idle for 210 days.' },
          { text: 'm.dube: ask the manager to confirm the account is still needed', correct: true, why: 'Five months without a login suggests the access is no longer needed. Confirm before removing in case of extended leave.' },
          { text: 'svc_backup: delete it because nobody owns it', why: 'Deleting a service account that ran today could stop backups. Find and record an owner first, then review what it can access.' },
          { text: 'a.okafor: remove, security staff should not have core banking access', why: 'A security admin role on a system they protect is normal. Nothing in the export suggests a problem.' },
        ],
      },
      {
        type: 'single',
        prompt: 'p.singh logged in three days after being terminated. What should happen next?',
        options: [
          { text: 'Disable the account and close the item', why: 'Disabling stops future use but ignores what happened on 2 September.' },
          { text: 'Disable it, raise a security incident and review what the account did after 30 August', correct: true, why: 'Use after termination is a potential incident. Someone needs to check whether loans were approved or data was taken.' },
          { text: 'Email p.singh to ask why they logged in', why: 'Contacting the person first can tip them off and is the incident team\'s call, not yours.' },
          { text: 'Wait for HR to confirm the termination date', why: 'HR already shows the termination. Waiting leaves the account open.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Who should confirm whether each person still needs their access?',
        options: [
          { text: 'IT Operations, because they run the system', why: 'IT can say who has access but cannot judge what each job needs.' },
          { text: 'Each person\'s manager, with the system or data owner approving the role', correct: true, why: 'Managers know what their staff do. The data owner decides which roles are allowed on the system.' },
          { text: 'You, as the GRC analyst', why: 'You prepare and check the review. Signing off access you do not manage would not be independent or informed.' },
          { text: 'The external auditor', why: 'Auditors test that the review happened. They must not perform it.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What is the j.ramos situation called?',
        options: [
          { text: 'Privilege creep', correct: true, why: 'Access piles up as people move roles and nobody removes the old rights.' },
          { text: 'Separation of duties', why: 'Separation of duties is the control that privilege creep breaks here.' },
          { text: 'Need to know', why: 'Need to know limits access to specific information. It is related, but the pattern here is accumulated access.' },
          { text: 'Aggregation', why: 'Aggregation is about combining data to reveal something more sensitive.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What should Daniel keep as evidence for the auditor?',
        options: [
          { text: 'The dated export used for the review', correct: true, why: 'Shows the population that was reviewed and when.' },
          { text: 'Each manager\'s sign-off, with names and dates', correct: true, why: 'Proves the right people approved the access.' },
          { text: 'Tickets showing each removal was done, with completion dates', correct: true, why: 'Proves the decisions were acted on, which is where packs are usually thin.' },
          { text: 'A copy of the access control policy only', why: 'The policy says what should happen. It does not show this review happened.' },
          { text: 'A note from Daniel saying the review is complete', why: 'An assertion is the weakest kind of evidence. Auditors want records from the process itself.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Access reviews are one of the most common jobs in GRC. You rarely make the access decisions yourself. You prepare the list, spot the obvious problems, chase sign-offs and make sure removals actually happen.',
        'Leavers who can still log in, movers who keep old access and accounts nobody owns turn up in almost every review. Learn to spot them quickly.',
      ],
      examTip: 'Privilege creep happens when users change roles and keep their old access. The fixes the exam expects are reviewing access when someone moves job and recertifying access on a schedule. The data owner decides who may have access; the custodian (IT) implements it.',
    },
  },

  {
    id: 'phishing-results',
    week: 1,
    level: 'Easy',
    title: 'First phishing test results. How bad is this?',
    client: 'Harbourview Family Clinic',
    from: { name: 'Nadia Rahman', role: 'Practice Manager' },
    channel: 'Email',
    received: 'Monday 14:40',
    priority: 'Normal',
    minutes: 15,
    domain: 1,
    skills: ['Security awareness', 'Metrics', 'Writing to managers'],
    message: [
      'Hi,',
      'We sent our first fake phishing email last week ("Your voicemail is waiting"). Results are below.',
      'Dr. Osei wants to email the whole clinic with the names of everyone who clicked so they "learn their lesson". I\'m not sure that\'s right. Can you tell me how bad these numbers are and what we should do next?',
      'Nadia',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'Phishing test, 12 staff',
        columns: ['Team', 'Staff', 'Clicked the link', 'Entered a password', 'Reported it'],
        rows: [
          ['Front desk', '4', '3', '2', '0'],
          ['Nursing', '2', '1', '0', '1'],
          ['Physicians', '4', '2', '1', '0'],
          ['Admin', '2', '0', '0', '2'],
          ['Total', '12', '6', '3', '3'],
        ],
      },
    ],
    steps: [
      { type: 'number', prompt: 'What percentage of staff clicked the link?', answer: 50, tolerance: 0.5, unit: '%', working: '6 clicked ÷ 12 staff = 0.5, so 50%.' },
      { type: 'number', prompt: 'What percentage entered their password on the fake page?', answer: 25, tolerance: 0.5, unit: '%', working: '3 entered a password ÷ 12 staff = 25%. These are the people whose accounts would have been taken over.' },
      {
        type: 'single',
        prompt: 'Which number should the clinic watch most closely in future tests?',
        options: [
          { text: 'The click rate', why: 'Click rates swing with how convincing the email is, so they are noisy. They matter, but they are not the best signal.' },
          { text: 'How many people report the email, and how quickly', correct: true, why: 'Reporting is the behaviour that protects everyone: one early report lets you warn the rest of the clinic and block the sender.' },
          { text: 'Which team clicked most', why: 'Useful for targeting training, but with teams of two to four people one click changes the picture.' },
          { text: 'Nothing, one test is enough', why: 'Awareness fades, so tests are repeated a few times a year.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What should the clinic do next?',
        options: [
          { text: 'Give the people who clicked a short training page straight away', correct: true, why: 'Training at the moment of the mistake sticks best.' },
          { text: 'Turn on MFA for email', correct: true, why: 'Three people gave away passwords. MFA stops a stolen password from being enough on its own.' },
          { text: 'Add a "report phishing" button to email', correct: true, why: 'Make the right behaviour one click. Only admin reported this time.' },
          { text: 'Run another test in four to six weeks', correct: true, why: 'Shows whether the training worked. Keep the difficulty similar so the results compare.' },
          { text: 'Email everyone the names of those who clicked', why: 'Shaming makes people hide mistakes and stop reporting, which is the opposite of what you want.' },
          { text: 'Give the people who clicked a written warning', why: 'Discipline for a first simulated test damages trust. It is for repeated, reckless behaviour, under HR policy.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Write a short reply Nadia can forward to Dr. Osei explaining why you recommend not naming people, and what to do instead.',
        placeholder: 'Dear Dr. Osei, …',
        model: [
          'Dear Dr. Osei,',
          'Thank you for taking the test seriously. Half the clinic clicked and three people entered a password, so there is real work to do. I would still recommend we keep individual results private.',
          'When people are named, they stop reporting suspicious emails for fear of being blamed, and reporting is what gives us early warning of a real attack. Industry practice is to share team-level results and give the people who clicked a short training module privately.',
          'The most important fix is technical: turning on multi-factor authentication for email would have stopped all three password entries from being used. We will run another test in about six weeks to measure progress.',
        ],
        rubric: [
          'Acknowledges the results are a concern',
          'Explains that naming people discourages reporting',
          'Offers an alternative: private follow-up and team-level results',
          'Recommends MFA as the main fix',
          'Says when you will test again',
        ],
      },
    ],
    debrief: {
      work: [
        'Phishing programmes live or die on trust. Your job is often to translate results for managers and steer them away from punishment towards fixes that work.',
        'Notice that the strongest recommendation here is a technical control (MFA). Training lowers the odds; MFA limits the damage when training fails.',
      ],
      examTip: 'The CISSP treats security awareness as an administrative control and expects it to be ongoing, measured and tailored to the audience. Training changes knowledge; awareness keeps security in mind; education builds deeper expertise.',
    },
  },

  {
    id: 'mfa-exception',
    week: 1,
    level: 'Easy',
    title: 'Can we turn off MFA on the social media accounts?',
    client: 'Northline Outfitters',
    from: { name: 'Aisha Grant', role: 'Marketing Manager' },
    channel: 'Teams message',
    received: 'Tuesday 10:05',
    priority: 'Urgent',
    minutes: 15,
    domain: 1,
    skills: ['Policy exceptions', 'Compensating controls'],
    message: [
      'Hey! Quick one. Our new agency posts to Instagram and TikTok for us, but every login sends an MFA code to MY phone and I\'m in meetings all day.',
      'Can we just switch MFA off for the social accounts? They\'re only social media, not customer data. Need an answer today please 🙏',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Access Control Policy v2.3 (extract)',
        body: [
          '4.2 Multi-factor authentication is required for every account that can publish content on behalf of Northline or access customer data.',
          '4.7 Exceptions to this policy must be requested in writing and approved by the policy owner (Operations Director). Approved exceptions last no more than 90 days, must list compensating controls, and are recorded in the risk register.',
        ],
      },
    ],
    steps: [
      {
        type: 'single',
        prompt: 'Can you approve turning MFA off?',
        options: [
          { text: 'Yes, marketing owns the social accounts', why: 'Owning the accounts does not give authority over the policy.' },
          { text: 'No. Only the policy owner, Ben Kowalski, can approve an exception', correct: true, why: 'Section 4.7 names the Operations Director. Your role is to advise and to make sure any exception follows the process.' },
          { text: 'Yes, if Aisha accepts the risk in writing', why: 'Aisha is not the policy owner, so her acceptance does not satisfy 4.7.' },
          { text: 'No, exceptions are never allowed', why: 'The policy does allow time-limited exceptions with compensating controls.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'Which options would solve Aisha\'s problem without dropping MFA?',
        options: [
          { text: 'Give each agency user their own login through the platforms\' business tools, with their own MFA', correct: true, why: 'Best fix: no shared codes, and you can remove the agency\'s access the day the contract ends.' },
          { text: 'Store the MFA seed in a shared password manager vault the agency can use, with access logging', correct: true, why: 'Keeps MFA, takes Aisha out of the loop and records who used it. Second best, but workable.' },
          { text: 'Review the agency\'s access every month', correct: true, why: 'Third-party access should be reviewed regularly whichever option is chosen.' },
          { text: 'Email the password to the agency', why: 'Email is not a safe place for credentials, and the MFA problem remains.' },
          { text: 'Switch MFA off but use a 20-character password', why: 'A long password does not help when it is phished or reused, which is how most social accounts are taken over.' },
        ],
      },
      {
        type: 'single',
        prompt: 'If Ben did approve an exception, how long should it last?',
        options: [
          { text: 'Permanently', why: 'The policy caps exceptions at 90 days.' },
          { text: 'Until marketing changes agency', why: 'That could be years. Exceptions need a fixed end date.' },
          { text: 'No more than 90 days, then review', correct: true, why: 'Time limits force someone to look at the exception again instead of forgetting about it.' },
          { text: 'One year', why: 'Longer than the policy allows.' },
        ],
      },
      {
        type: 'write',
        prompt: 'Reply to Aisha on Teams. Keep it friendly and short.',
        placeholder: 'Hi Aisha, …',
        model: [
          'Hi Aisha, I get it, the codes coming to your phone are a pain. I can\'t switch MFA off: policy requires it on any account that posts as Northline, and only Ben can approve exceptions.',
          'A hijacked brand account posting scam links would hurt us far more than the login hassle. The quickest fix is to give each agency person their own login through Meta Business Suite and TikTok Business Center, each with their own MFA. Then the codes go to them, not you. I can set up a 15-minute call with the agency today.',
          'If that won\'t work in time, I can help you put a short exception request to Ben.',
        ],
        rubric: [
          'Says clearly that you cannot turn MFA off and who can approve exceptions',
          'Explains the risk in business terms (a hijacked brand account)',
          'Offers a practical alternative that keeps MFA',
          'Explains how to request an exception if still needed',
          'Keeps a helpful tone',
        ],
      },
    ],
    debrief: {
      work: [
        'Exception requests arrive every week, usually marked urgent. The useful answer is almost never a flat no. Explain the risk, offer a way to get the job done safely, and point to the proper process for anything else.',
        'Every exception you help approve should end up in the risk register with an owner and an expiry date.',
      ],
      examTip: 'Compensating controls are alternatives used when the required control cannot be applied. Expect exam questions on who can approve exceptions: the policy owner or senior management, never the requester.',
    },
  },

  {
    id: 'data-classification',
    week: 1,
    level: 'Easy',
    title: 'Examples for our new data classification standard',
    client: 'Town of Riverside',
    from: { name: 'Diane Wong', role: 'Town Clerk (privacy lead)' },
    channel: 'Email',
    received: 'Wednesday 8:30',
    priority: 'Normal',
    minutes: 15,
    domain: 2,
    skills: ['Data classification', 'Data roles'],
    message: [
      'Good morning,',
      'We are finally writing a data classification standard. Staff learn best from examples, so could you classify the datasets below using our four levels? I will put your answers in the appendix.',
      'Kind regards,\nDiane',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Draft classification levels',
        body: [
          'Public: approved for release; no harm if disclosed.',
          'Internal: for staff use; minor inconvenience if disclosed.',
          'Confidential: personal information or sensitive town business; harm to residents or the town if disclosed.',
          'Restricted: severe harm if disclosed, such as banking details, health information, or anything that would help someone attack critical infrastructure.',
        ],
      },
    ],
    steps: [
      {
        type: 'match',
        prompt: 'Classify each dataset.',
        choices: ['Public', 'Internal', 'Confidential', 'Restricted'],
        items: [
          { text: 'Council meeting minutes after they are published', answer: 'Public', why: 'Already approved for release.' },
          { text: 'Staff phone directory', answer: 'Internal', why: 'Meant for staff, with little harm if it leaked.' },
          { text: 'Property tax arrears list with names and addresses', answer: 'Confidential', why: 'Personal information that would embarrass or harm residents.' },
          { text: 'Employee banking details for payroll', answer: 'Restricted', why: 'Banking details enable fraud, so they get the top level.' },
          { text: 'Water plant network diagrams and system passwords', answer: 'Restricted', why: 'Would help an attacker reach critical infrastructure.' },
          { text: 'Draft budget before the council vote', answer: 'Confidential', why: 'Sensitive town business until it is released.' },
          { text: 'Recreation programme brochure', answer: 'Public', why: 'Published for residents.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Who should decide how the payroll data is classified?',
        options: [
          { text: 'The IT manager, who runs the payroll servers', why: 'IT is the custodian: they apply the protections the owner chooses.' },
          { text: 'The Treasurer, as the data owner', correct: true, why: 'The owner is accountable for the data and decides its classification and who may access it.' },
          { text: 'Diane, as privacy lead', why: 'Diane advises and writes the standard. The owner makes the call for their data.' },
          { text: 'Each employee', why: 'Data subjects have rights over their data but do not classify the town\'s records.' },
        ],
      },
      {
        type: 'single',
        prompt: 'A list of water plant staff names is Internal. So are the shift rotas. Put together, they show when the plant is lightly staffed. What is this called?',
        options: [
          { text: 'Aggregation', correct: true, why: 'Combining less sensitive items creates something more sensitive. The combined set needs a higher classification.' },
          { text: 'Inference', why: 'Inference is deducing hidden information from what you can see. It is close, but combining datasets is aggregation.' },
          { text: 'Declassification', why: 'Declassification lowers a level. This raises one.' },
          { text: 'Data remanence', why: 'Remanence is data left behind on media after deletion.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Day to day, who applies the backups, encryption and access settings each level requires?',
        options: [
          { text: 'The data owner', why: 'The owner decides what is needed but rarely configures systems.' },
          { text: 'The data custodian, usually IT', correct: true, why: 'Custodians carry out the owner\'s decisions: backups, permissions, encryption.' },
          { text: 'The data subject', why: 'The data subject is the person the data is about.' },
          { text: 'The auditor', why: 'Auditors check controls. They do not operate them.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Classification work is mostly about examples and conversations with data owners. Staff remember "payroll banking details are Restricted" far better than a definition.',
        'Watch for combined datasets. A spreadsheet that joins two harmless lists can need a higher label than either list on its own.',
      ],
      examTip: 'Know the data roles cold: owner (accountable, decides classification), custodian (implements controls), steward (data quality and use), processor (handles data for a controller), subject (the person the data is about).',
    },
  },

  {
    id: 'vendor-questionnaire',
    week: 1,
    level: 'Medium',
    title: 'ClinicCloud sent back our security questionnaire',
    client: 'Harbourview Family Clinic',
    from: { name: 'Nadia Rahman', role: 'Practice Manager' },
    channel: 'Email',
    received: 'Thursday 11:20',
    priority: 'High',
    minutes: 20,
    domain: 1,
    skills: ['Third-party risk', 'Due diligence', 'Contracts'],
    message: [
      'Hi,',
      'Our EMR contract with ClinicCloud renews next month. They filled in the questionnaire you gave us (attached). Is there anything worrying, and what should we ask for before we sign?',
      'Nadia',
    ],
    attachments: [
      {
        kind: 'table',
        title: 'ClinicCloud security questionnaire responses',
        columns: ['Question', 'ClinicCloud answer'],
        rows: [
          ['Do you hold SOC 2 Type II or ISO 27001?', 'SOC 2 Type I completed in 2023. Type II in progress.'],
          ['Is customer data encrypted?', 'Yes. AES-256 at rest, TLS 1.2 or higher in transit.'],
          ['Is MFA available for customer users?', 'Yes, optional. Off by default.'],
          ['Where is customer data stored?', 'Canada (Toronto and Montreal).'],
          ['How quickly will you tell us about a breach?', 'Within a reasonable time.'],
          ['Backups', 'Daily, kept 30 days, restore tested once a year.'],
          ['Do you use subprocessors?', 'We work with trusted partners.'],
          ['Penetration testing', 'Yearly, by a third party. Summary available under NDA.'],
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which answers are red flags?',
        options: [
          { text: 'Only a SOC 2 Type I, from 2023', correct: true, why: 'Type I tests design on one day. It is old and says nothing about whether the controls work over time.' },
          { text: 'MFA is off by default', correct: true, why: 'Clinic accounts can reach every patient record. The clinic should switch MFA on now.' },
          { text: 'Breach notice "within a reasonable time"', correct: true, why: 'Vague. PHIPA requires the clinic to notify patients at the first reasonable opportunity, so the clinic needs a fixed, short deadline from the vendor.' },
          { text: 'Subprocessors described as "trusted partners"', correct: true, why: 'You need to know who else touches patient data and where.' },
          { text: 'Data stored in Canada', why: 'That is good news for a Canadian health provider.' },
          { text: 'AES-256 and TLS 1.2+', why: 'These are sound choices.' },
        ],
      },
      {
        type: 'single',
        prompt: 'ClinicCloud holds restricted health data, the clinic cannot work without it, and it connects to clinic systems. What vendor tier is it?',
        options: [
          { text: 'Tier 1', correct: true, why: 'Restricted data, high criticality and system access put it at the top. Reassess it every year.' },
          { text: 'Tier 2', why: 'Tier 2 suits vendors with less sensitive data or less dependence.' },
          { text: 'Tier 3', why: 'Tier 3 is for low-risk suppliers such as cleaners.' },
          { text: 'No tier, because it is software', why: 'SaaS vendors are some of the most important third parties to tier.' },
        ],
      },
      {
        type: 'multi',
        prompt: 'What should the clinic ask for in the renewal?',
        options: [
          { text: 'Breach notification within a fixed time, such as 24 to 72 hours', correct: true, why: 'Turns "reasonable time" into a deadline the clinic can plan around.' },
          { text: 'A list of subprocessors, and notice before any change', correct: true, why: 'Lets the clinic check where patient data goes.' },
          { text: 'The SOC 2 Type II report when it is issued, or the right to audit', correct: true, why: 'Gives ongoing evidence that the controls work.' },
          { text: 'Return and deletion of data when the contract ends', correct: true, why: 'Avoids patient records sitting with an old supplier.' },
          { text: 'A move to US data centres for better redundancy', why: 'Canadian storage is a strength here. Moving it would raise privacy questions.' },
        ],
      },
      {
        type: 'single',
        prompt: 'What can the clinic do today, without waiting for the contract?',
        options: [
          { text: 'Switch on MFA for every clinic user in ClinicCloud', correct: true, why: 'It is available now and closes the biggest gap within the clinic\'s control.' },
          { text: 'Ask ClinicCloud to hurry their Type II report', why: 'Worth asking, but it does not reduce risk today.' },
          { text: 'Stop using the EMR until the contract is signed', why: 'The clinic cannot run without it.' },
          { text: 'Nothing until renewal', why: 'The MFA gap can be closed today.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Vendor questionnaires come back with confident but vague answers. Read for what is missing: dates, numbers, names. "Reasonable time" and "trusted partners" are answers that need a follow-up question.',
        'Always look for actions the client can take on its own side. Switching on a vendor feature is often faster than any contract change.',
      ],
      examTip: 'Supply chain risk management sits in Domain 1. Know the difference between SOC 1 (financial reporting), SOC 2 (security controls, detailed, restricted use) and SOC 3 (public summary), and between Type I (design, one point in time) and Type II (operating effectiveness over a period).',
    },
  },

  {
    id: 'audit-evidence',
    week: 1,
    level: 'Medium',
    title: 'ISO auditor evidence request: backups and access rights',
    client: 'Maple Ridge Credit Union',
    from: { name: 'Priya Natarajan', role: 'Compliance & Audit Lead' },
    channel: 'Email',
    received: 'Friday 9:00',
    priority: 'High',
    minutes: 15,
    domain: 6,
    skills: ['Audit evidence', 'Sampling'],
    message: [
      'Morning,',
      'The external ISO auditor has sent their evidence list for next week (extract attached). Marc has offered to send a screenshot of the backup console "showing everything green". I am not convinced that is enough.',
      'Can you sanity-check what we plan to send?',
      'Priya',
    ],
    attachments: [
      {
        kind: 'text',
        title: 'Auditor request list (extract)',
        body: [
          'A.8.13 Information backup: provide evidence that backups were performed and tested during the audit period (1 October 2025 to 30 September 2026).',
          'A.5.18 Access rights: provide the population of privileged access changes in the period. The auditor will select a sample.',
        ],
      },
    ],
    steps: [
      {
        type: 'multi',
        prompt: 'Which items are good evidence for A.8.13?',
        options: [
          { text: 'Backup job logs for dates spread across the audit period', correct: true, why: 'Shows backups ran throughout the year, not only today.' },
          { text: 'A restore test record: date, what was restored, who did it and the result', correct: true, why: 'The request asks for testing. A record of a real restore is the strongest proof.' },
          { text: 'The approved backup standard', correct: true, why: 'Sets the criteria the auditor will test against. Useful alongside the operating evidence.' },
          { text: 'Marc\'s screenshot of the console, taken today', why: 'One screenshot shows one moment. The auditor needs evidence across the whole period.' },
          { text: 'An email from Marc saying backups always work', why: 'Statements from the control owner are the weakest evidence.' },
        ],
      },
      {
        type: 'single',
        prompt: 'For A.5.18, who should pick which access changes get tested?',
        options: [
          { text: 'Priya, so she can choose clean examples', why: 'Choosing your own sample defeats the purpose of the test.' },
          { text: 'The auditor, from the full population you provide', correct: true, why: 'The auditor selects the sample to keep the test independent. Your job is to give them a complete list.' },
          { text: 'Marc, as control owner', why: 'Same problem: the tested party should not pick the sample.' },
          { text: 'Nobody, test every change', why: 'For large populations, auditors sample.' },
        ],
      },
      {
        type: 'single',
        prompt: 'A daily control ran all year. Roughly how many days would an auditor usually sample?',
        options: [
          { text: '1', why: 'One day says little about the rest of the year.' },
          { text: 'About 5', why: 'Typical for quarterly or monthly controls, not daily ones.' },
          { text: 'About 25 to 40', correct: true, why: 'Common guidance for a control that runs every day over a year.' },
          { text: 'All 365', why: 'Possible with automated tools, but not the usual manual approach.' },
        ],
      },
      {
        type: 'single',
        prompt: 'Two of the sampled backup jobs failed, and both were re-run the next day with tickets. How do you present this?',
        options: [
          { text: 'Leave those dates out of the logs', why: 'Hiding evidence from an auditor is a serious integrity problem.' },
          { text: 'Show them, with the tickets proving the failures were spotted and fixed', correct: true, why: 'Failures that were detected and corrected show the control working.' },
          { text: 'Ask the auditor to pick different dates', why: 'Asking to swap the sample looks like hiding something.' },
          { text: 'Say the backup software was wrong', why: 'Without evidence, that claim will not survive.' },
        ],
      },
    ],
    debrief: {
      work: [
        'Audit prep is a big part of GRC work. The most common mistake is sending evidence of how things look today instead of how they ran during the period.',
        'Be open about exceptions. A failure that was caught and fixed is often fine; a failure you tried to hide becomes a finding about integrity.',
      ],
      examTip: 'Domain 6 covers audit strategy. Good evidence is sufficient, reliable, relevant and from the period. Remember who does what: management runs controls, internal audit and external auditors test them independently.',
    },
  },
];
