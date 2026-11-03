import { quantitative } from '../../../shared/scoring.ts';
import { fmtMoney } from '../api';

/** "0.2" → "about once every 5 years", "3" → "about 3 times a year". */
export function aroInWords(aro: number): string {
  if (!(aro > 0)) return 'never expected to happen';
  if (aro === 1) return 'about once a year';
  if (aro > 1) return `about ${+aro.toFixed(1)} times a year`;
  const years = 1 / aro;
  return `about once every ${Number.isInteger(+years.toFixed(1)) ? Math.round(years) : years.toFixed(1)} years`;
}

export function efInWords(ef: number): string {
  if (ef >= 100) return 'one incident destroys all of it';
  if (ef <= 0) return 'one incident costs nothing';
  return `one incident destroys ${ef}% of it`;
}

const TERMS: { abbr: string; name: string; plain: string; ask: string; example: string }[] = [
  {
    abbr: 'AV',
    name: 'Asset value',
    plain: 'What is at stake: the value of the asset, or the total cost if it were completely lost.',
    ask: 'If this asset were gone for good, what would it cost us?',
    example: 'The clinic values its records and systems at $400,000.',
  },
  {
    abbr: 'EF',
    name: 'Exposure factor',
    plain: 'How much of that value one incident would destroy, as a percentage. 100% means a total loss.',
    ask: 'When this happens once, what share of the asset do we lose?',
    example: 'Ransomware would wipe out about half of it, so EF = 50%.',
  },
  {
    abbr: 'SLE',
    name: 'Single loss expectancy',
    plain: 'The cost of one incident. You calculate it: SLE = AV × EF.',
    ask: 'How much does one bad day cost us?',
    example: '$400,000 × 50% = $200,000 per incident.',
  },
  {
    abbr: 'ARO',
    name: 'Annualised rate of occurrence',
    plain: 'How many times a year you expect the incident. Below 1 means less than once a year.',
    ask: 'How often does this happen? Once every 5 years = 1 ÷ 5 = 0.2.',
    example: 'Expected once every 5 years, so ARO = 0.2.',
  },
  {
    abbr: 'ALE',
    name: 'Annualised loss expectancy',
    plain: 'The average cost per year, spread over time. You calculate it: ALE = SLE × ARO.',
    ask: 'On average, what does this risk cost us each year?',
    example: '$200,000 × 0.2 = $40,000 a year. Spending more than this every year on a control would cost more than the risk itself.',
  },
];

/** Collapsible explanation of the five quantitative terms. */
export function QuantGuide({ open = false }: { open?: boolean }) {
  return (
    <details className="quant-guide" open={open}>
      <summary>What do AV, EF, SLE, ARO and ALE mean?</summary>
      <p className="small muted" style={{ margin: '8px 0 10px' }}>
        You enter three numbers (AV, EF and ARO). The app calculates the other two (SLE and ALE). Read them in order: each step uses the one before.
      </p>
      <ol className="quant-steps">
        {TERMS.map((t) => (
          <li key={t.abbr}>
            <div>
              <b className="mono">{t.abbr}</b> · <b>{t.name}</b>
              {(t.abbr === 'SLE' || t.abbr === 'ALE') && <span className="badge accent" style={{ marginLeft: 8 }}>calculated</span>}
            </div>
            <div className="small">{t.plain}</div>
            <div className="small muted">Ask: “{t.ask}”</div>
            <div className="small muted">Example: {t.example}</div>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** The calculation written out in words, with the user's own numbers. */
export function QuantWorking({ av, ef, aro, title = 'How this is calculated' }: { av: number; ef: number; aro: number; title?: string }) {
  const { sle, ale } = quantitative(av, ef, aro);
  const rows: [abbr: string, name: string, value: string, meaning: string][] = [
    ['AV', 'Asset value', fmtMoney(av), 'what is at stake'],
    ['EF', 'Exposure factor', `${ef}%`, efInWords(ef)],
    ['SLE', 'Single loss expectancy', `${fmtMoney(av)} × ${ef}% = ${fmtMoney(sle)}`, 'the cost of one incident'],
    ['ARO', 'Annualised rate of occurrence', String(aro), aroInWords(aro)],
    ['ALE', 'Annualised loss expectancy', `${fmtMoney(sle)} × ${aro} = ${fmtMoney(ale)} a year`, 'the average yearly cost of this risk'],
  ];
  return (
    <div className="quant-working">
      <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <table>
        <tbody>
          {rows.map(([abbr, name, value, meaning]) => (
            <tr key={abbr} className={abbr === 'SLE' || abbr === 'ALE' ? 'calc' : ''}>
              <td className="mono" title={name}><b>{abbr}</b></td>
              <td>
                <div className="num"><b>{value}</b></div>
                <div className="small muted">{name}: {meaning}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted" style={{ marginTop: 8 }}>
        In words: one incident costs about {fmtMoney(sle)}, and it is expected {aroInWords(aro)}, so on average it costs {fmtMoney(ale)} a year. A control that costs less than that each year, and stops most of it, is usually worth buying.
      </p>
    </div>
  );
}
