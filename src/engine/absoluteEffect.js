// Absolute-effect engine.
//
// Takes a trial's relative effect (HR, OR or RR with its 95% CI) and a
// baseline risk, and returns the treated risk, the absolute difference and
// the NNT or NNH. Pure functions only; the UI lives in
// components/AbsoluteEffectPanel.jsx and the curated numbers in
// data/outcomes.js.
//
// Assumptions, stated on screen as well:
// - HR on a cumulative risk: proportional hazards over the trial's
//   follow-up, so R1 = 1 - (1 - R0)^HR.
// - HR on an event rate (per 100 patient-years): rate1 = rate0 * HR.
// - OR on a risk: R1 = OR * odds0 / (1 + OR * odds0).
// - RR on a risk: R1 = min(1, RR * R0).
// The relative effect is held constant as baseline risk changes. That is
// the usual working assumption; it is an assumption, not a finding.

import { OUTCOMES } from '../data/outcomes.js';

export const SLIDER_MIN = 0.25;
export const SLIDER_MAX = 3;
const MAX_RISK_PCT = 99;

/**
 * Treated value (percent, or events per 100 patient-years) given a control
 * value in the same units and a relative effect.
 */
export function projectTreated(control, measure, ratio, kind = 'risk') {
  if (!(control >= 0) || !(ratio > 0)) return NaN;
  if (kind === 'rate') {
    // Rates are not bounded at 100 (recurrent events), so scale directly.
    return control * ratio;
  }
  const r0 = Math.min(control, 100) / 100;
  let r1;
  switch (measure) {
    case 'HR':
      r1 = 1 - Math.pow(1 - r0, ratio);
      break;
    case 'OR': {
      if (r0 >= 1) return 100;
      const odds = (r0 / (1 - r0)) * ratio;
      r1 = odds / (1 + odds);
      break;
    }
    case 'RR':
      r1 = Math.min(1, r0 * ratio);
      break;
    default:
      return NaN;
  }
  return r1 * 100;
}

/**
 * Number needed per one event difference. diff is in percentage points (or
 * events per 100 patient-years). Returns Infinity when diff is 0.
 */
export function numberNeeded(diff) {
  if (!Number.isFinite(diff)) return NaN;
  if (diff === 0) return Infinity;
  return 100 / Math.abs(diff);
}

/**
 * Core computation for one outcome at one baseline.
 *
 * outcome: { kind, measure, estimate, ci, lowerIsBetter }
 * baseline: control-arm value to apply (percent or per 100 patient-years)
 *
 * Returns:
 *   control, treated, diff (control - treated, signed so positive = fewer
 *   bad events with treatment when lowerIsBetter), diffRange [lo, hi],
 *   direction: 'benefit' | 'harm' | 'uncertain',
 *   nnt or nnh (point), range text parts.
 */
export function computeEffect(outcome, baseline) {
  const { kind, measure, estimate, ci, lowerIsBetter = true } = outcome;
  const sign = lowerIsBetter ? 1 : -1;
  const treated = projectTreated(baseline, measure, estimate, kind);
  const diff = sign * (baseline - treated);

  let diffRange = null;
  if (Array.isArray(ci) && ci.length === 2) {
    const a = sign * (baseline - projectTreated(baseline, measure, ci[0], kind));
    const b = sign * (baseline - projectTreated(baseline, measure, ci[1], kind));
    diffRange = [Math.min(a, b), Math.max(a, b)];
  }

  let direction;
  if (diffRange) {
    if (diffRange[0] > 0) direction = 'benefit';
    else if (diffRange[1] < 0) direction = 'harm';
    else direction = 'uncertain';
  } else {
    direction = diff > 0 ? 'benefit' : diff < 0 ? 'harm' : 'uncertain';
  }

  return {
    control: baseline,
    treated,
    diff,
    diffRange,
    direction,
    number: numberNeeded(diff),
    numberRange: diffRange ? numberRangeFrom(diffRange) : null,
  };
}

// Turns a CI on the absolute difference into NNT/NNH bounds. When the CI
// crosses zero the NNT is not a single interval: it runs from NNT to
// benefit X, through infinity, to NNT to harm Y (Altman 1998).
function numberRangeFrom([lo, hi]) {
  if (lo > 0) return { kind: 'benefit', from: 100 / hi, to: 100 / lo };
  if (hi < 0) return { kind: 'harm', from: 100 / -lo, to: 100 / -hi };
  return {
    kind: 'crosses',
    benefitFrom: hi > 0 ? 100 / hi : Infinity,
    harmFrom: lo < 0 ? 100 / -lo : Infinity,
  };
}

/** Ceil an NNT for display; whole patients only. */
export function roundNumber(n) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 10) return String(Math.round(n * 10) / 10);
  return String(Math.round(n));
}

/** One-line text for an NNT range, for screen and worksheet. */
export function describeNumberRange(range, unitPhrase) {
  if (!range) return null;
  if (range.kind === 'benefit') {
    return `95% CI: NNT ${roundNumber(range.from)} to ${roundNumber(range.to)}${unitPhrase}`;
  }
  if (range.kind === 'harm') {
    return `95% CI: NNH ${roundNumber(range.from)} to ${roundNumber(range.to)}${unitPhrase}`;
  }
  return `95% CI runs from NNT ${roundNumber(range.benefitFrom)} to benefit to NNH ${roundNumber(range.harmFrom)} to harm${unitPhrase}`;
}

// ---------------------------------------------------------------------------
// Transport flags
// ---------------------------------------------------------------------------

export const TRANSPORT_LEVELS = { caution: 'caution', flag: 'flag' };

const FIELD_LABELS = {
  age: 'Age',
  lvef: 'LVEF',
  ero: 'EROA',
  stsScore: 'STS risk score',
};

const FIELD_UNITS = { age: ' years', lvef: '%', ero: ' mm²', stsScore: '%' };

const THERAPY_LABELS = {
  sglt2i: 'an SGLT2 inhibitor',
  arni: 'sacubitril-valsartan',
};

// Read a patient value in the units the trial summary uses.
function patientValue(patient, field) {
  if (!patient) return undefined;
  switch (field) {
    case 'ero':
      // Form stores EROA in cm²; trials report mm².
      return patient.mitralRegurgitation?.ero != null
        ? patient.mitralRegurgitation.ero * 100
        : undefined;
    default:
      return patient[field];
  }
}

function fmt(n) {
  return String(Math.round(n * 10) / 10);
}

/** Compare one value with one baseline summary. Returns a flag or null. */
export function compareToSummary(value, summary) {
  if (!Number.isFinite(value) || !summary) return null;
  if (summary.type === 'mean-sd') {
    const z = Math.abs(value - summary.mean) / summary.sd;
    if (z > 2) return { level: 'flag', text: 'few or no trial patients like this' };
    if (z > 1) return { level: 'caution', text: 'less typical of trial patients' };
    return null;
  }
  if (summary.type === 'median-iqr') {
    if (summary.min != null && value < summary.min) return { level: 'flag', text: 'below the enrolled range' };
    if (summary.max != null && value > summary.max) return { level: 'flag', text: 'above the enrolled range' };
    if (value < summary.q1 || value > summary.q3) return { level: 'caution', text: 'outside the middle half of trial patients' };
    return null;
  }
  return null;
}

function summaryText(summary, unit) {
  if (summary.type === 'mean-sd') return `trial mean ${fmt(summary.mean)} ± ${fmt(summary.sd)}${unit}`;
  return `trial median ${fmt(summary.median)}${unit} (IQR ${fmt(summary.q1)}–${fmt(summary.q3)})`;
}

/**
 * Transport flags for one trial and one patient. Returns [] when the
 * patient form is empty or matches the trial population.
 */
export function transportFlags(trialId, patient) {
  const data = OUTCOMES[trialId];
  if (!data || !patient) return [];
  const out = [];
  for (const [field, summary] of Object.entries(data.baseline || {})) {
    const value = patientValue(patient, field);
    const hit = compareToSummary(value, summary);
    if (hit) {
      out.push({
        field,
        level: hit.level,
        text: `${FIELD_LABELS[field] || field} ${fmt(value)}${FIELD_UNITS[field] || ''}: ${hit.text} (${summaryText(summary, FIELD_UNITS[field] || '')}).`,
      });
    }
  }
  for (const therapy of data.predatesTherapies || []) {
    if (patient.meds?.[therapy] === true) {
      out.push({
        field: therapy,
        level: 'caution',
        text: `Patient takes ${THERAPY_LABELS[therapy] || therapy}, which few or no trial patients received; background therapy differs from the trial era.`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Panel model
// ---------------------------------------------------------------------------

export function unitPhrase(outcome) {
  if (outcome.kind === 'rate') return ' (patient-years of treatment per event)';
  return outcome.horizon ? ` (over ${outcome.horizon})` : '';
}

/**
 * Everything the panel needs for one trial at one slider position.
 * multiplier scales the trial's control-arm value (1 = the trial itself).
 */
export function absoluteEffectModel(trialId, multiplier = 1) {
  const data = OUTCOMES[trialId];
  if (!data) return null;
  const p = data.primary;
  if (p.kind === 'none') {
    return { trialId, applicable: false, reason: p.note, data };
  }
  const cap = p.kind === 'rate' ? Infinity : MAX_RISK_PCT;
  const baseline = Math.min(cap, p.control * multiplier);
  const primary = computeEffect(p, baseline);
  const atTrial = computeEffect(p, p.control);

  let safety = null;
  if (data.safety) {
    const s = data.safety;
    if (s.kind === 'single-arm') {
      safety = { ...s, singleArm: true };
    } else {
      safety = { ...s, effect: computeEffect(s, s.control) };
    }
  }

  return {
    trialId,
    applicable: true,
    data,
    multiplier,
    baseline,
    primary,
    atTrial,
    safety,
  };
}

/** Plain-text summary for the worksheet results box. */
export function summarizeEffectForWorksheet(trial, multiplier = 1) {
  const m = absoluteEffectModel(trial.id, multiplier);
  if (!m) return `${trial.name} (${trial.year})\n- Absolute effect: numbers not yet curated.`;
  if (!m.applicable) return `${trial.name} (${trial.year})\n- Absolute effect: ${m.reason}`;
  const p = m.data.primary;
  const u = p.kind === 'rate' ? ' per 100 patient-years' : '%';
  const e = m.primary;
  const label = e.diff < 0 ? 'NNH' : 'NNT';
  const lines = [
    `${trial.name} (${trial.year})`,
    `- ${p.label}: control ${fmt(e.control)}${u}, treated ${fmt(e.treated)}${u} (${p.measure} ${p.estimate.toFixed(2)}${p.ci ? `, 95% CI ${p.ci[0].toFixed(2)}–${p.ci[1].toFixed(2)}` : ''}).`,
    `- ${label} ${roundNumber(e.number)}${unitPhrase(p)} at the trial's own control rate.`,
  ];
  const r = describeNumberRange(e.numberRange, '');
  if (r) lines.push(`- ${r}.`);
  return lines.join('\n');
}
