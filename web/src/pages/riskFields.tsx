import { RISK_APPETITE, quantitative, riskLevel, riskScore } from '../../../shared/scoring.ts';
import { fmtMoney, humanize, type Row } from '../api';
import type { Field } from '../components/EntityForm';
import { opts } from '../components/CrudPage';
import { Score } from '../components/ui';

export const RISK_CATEGORIES = ['Cyber', 'Data privacy', 'Third party', 'Compliance', 'Operational', 'Business continuity', 'People', 'Fraud'];
export const RISK_STATUSES = ['open', 'in_treatment', 'accepted', 'closed'];
export const TREATMENTS = ['mitigate', 'accept', 'transfer', 'avoid'];

export const RISK_FIELDS: Field[] = [
  { name: 's1', label: 'Identification', type: 'section' },
  { name: 'title', label: 'Risk title', type: 'text', required: true, full: true, placeholder: 'e.g. Ransomware encrypts core banking and backups' },
  { name: 'category', label: 'Category', type: 'select', options: opts(RISK_CATEGORIES, (v) => v), required: true },
  { name: 'asset_id', label: 'Affected asset', type: 'asset' },
  { name: 'threat', label: 'Threat', type: 'text', help: 'Who or what could cause harm.' },
  { name: 'vulnerability', label: 'Vulnerability', type: 'text', help: 'The weakness the threat would exploit.' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'owner_id', label: 'Risk owner', type: 'person', help: 'Accountable for the treatment decision.' },
  { name: 'status', label: 'Status', type: 'select', options: opts(RISK_STATUSES), required: true },

  { name: 's2', label: 'Inherent risk', type: 'section', help: 'Before any controls are applied.' },
  { name: 'likelihood', label: 'Likelihood', type: 'likelihood', required: true },
  { name: 'impact', label: 'Impact', type: 'impact', required: true },

  { name: 's3', label: 'Treatment', type: 'section' },
  { name: 'treatment', label: 'Treatment', type: 'select', options: opts(TREATMENTS), required: true, help: 'Mitigate (reduce), accept, transfer (insure / contract) or avoid (stop the activity).' },
  { name: 'due_date', label: 'Target date', type: 'date' },
  { name: 'treatment_plan', label: 'Treatment plan', type: 'textarea' },

  { name: 's4', label: 'Residual risk', type: 'section', help: 'Expected risk once the treatment and linked controls are in place.' },
  { name: 'residual_likelihood', label: 'Residual likelihood', type: 'likelihood' },
  { name: 'residual_impact', label: 'Residual impact', type: 'impact' },

  { name: 's5', label: 'Quantitative analysis (optional)', type: 'section', help: 'SLE = asset value × exposure factor. ALE = SLE × annualised rate of occurrence.' },
  { name: 'asset_value', label: 'Asset value (AV, CAD)', type: 'number', min: 0 },
  { name: 'exposure_factor', label: 'Exposure factor (EF, %)', type: 'number', min: 0, max: 100, help: 'Share of the asset value lost in one event.' },
  { name: 'aro', label: 'Annualised rate of occurrence (ARO)', type: 'number', min: 0, step: 0.01, help: '0.1 = once every 10 years; 2 = twice a year.' },
];

export const RISK_DEFAULTS: Row = { status: 'open', treatment: 'mitigate', likelihood: 3, impact: 3, category: 'Cyber' };

/** Live preview of scores while the risk form is being edited. */
export function RiskPreview({ values }: { values: Row }) {
  const l = Number(values.likelihood) || 0;
  const i = Number(values.impact) || 0;
  const hasResidual = values.residual_likelihood !== '' && values.residual_impact !== '';
  const inherent = riskScore(l, i);
  const residual = hasResidual ? riskScore(Number(values.residual_likelihood), Number(values.residual_impact)) : inherent;
  const quant =
    values.asset_value !== '' && values.exposure_factor !== '' && values.aro !== ''
      ? quantitative(Number(values.asset_value), Number(values.exposure_factor), Number(values.aro))
      : null;
  if (!l || !i) return null;
  return (
    <div className="callout" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <span>
        Inherent <Score value={inherent} /> <span className="small muted">{humanize(riskLevel(inherent))}</span>
      </span>
      <span>
        Residual <Score value={residual} /> <span className="small muted">{hasResidual ? humanize(riskLevel(residual)) : 'not yet assessed'}</span>
      </span>
      <span className="small">{residual > RISK_APPETITE ? <b style={{ color: 'var(--critical)' }}>Above appetite: needs escalation</b> : <b>Within appetite</b>}</span>
      {quant && (
        <span className="small mono">
          SLE {fmtMoney(quant.sle)} · ALE {fmtMoney(quant.ale)}
        </span>
      )}
    </div>
  );
}
