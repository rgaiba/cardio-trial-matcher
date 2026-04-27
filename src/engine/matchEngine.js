import { evaluateCriterion } from './evaluators.js';

// Evaluate a single trial against patient state.
// Returns: {
//   trialId, status: 'eligible'|'partial'|'excluded'|'insufficient',
//   matchScore: 0-100 or null  (null when all inclusion criteria are unknown)
//   dataComplete: 0-100         (% of inclusion criteria with known data)
//   inclusion: [{...criterion, result}], exclusion: [{...criterion, result}],
//   tally: { incMet, incNotMet, incUnknown, exMet, exNotMet, exUnknown }
// }
export function evaluateTrial(trial, patient) {
  const inclusion = trial.inclusion.map((c) => ({ ...c, result: evaluateCriterion(c, patient) }));
  const exclusion = trial.exclusion.map((c) => ({ ...c, result: evaluateCriterion(c, patient) }));

  const tally = {
    incMet: inclusion.filter((c) => c.result === 'met').length,
    incNotMet: inclusion.filter((c) => c.result === 'not_met').length,
    incUnknown: inclusion.filter((c) => c.result === 'unknown').length,
    exMet: exclusion.filter((c) => c.result === 'met').length,
    exNotMet: exclusion.filter((c) => c.result === 'not_met').length,
    exUnknown: exclusion.filter((c) => c.result === 'unknown').length,
  };

  const totalInc = inclusion.length || 1;

  // Match score is computed from KNOWN criteria only. Unknowns are excluded
  // from both numerator and denominator so the score is not inflated by
  // missing data. Data completeness is reported separately.
  //
  //   score          = met / (met + not_met)         when any criterion is known
  //   score          = null                          when all inclusion criteria are unknown
  //   dataComplete   = (total - unknown) / total     0–100, % of inclusion criteria with data
  const knownInc = tally.incMet + tally.incNotMet;
  let matchScore;
  if (knownInc === 0) {
    matchScore = null; // nothing to score against
  } else {
    matchScore = Math.round((tally.incMet / knownInc) * 100);
  }
  const dataComplete = Math.round(((totalInc - tally.incUnknown) / totalInc) * 100);

  // Any met exclusion drops score to zero (regardless of inclusion match)
  if (tally.exMet > 0) matchScore = 0;

  let status;
  if (tally.exMet > 0) status = 'excluded';
  // Patient explicitly fails ALL inclusion criteria → would not have enrolled.
  else if (tally.incMet === 0 && tally.incNotMet > 0 && tally.incUnknown === 0) status = 'excluded';
  else if (tally.incNotMet === 0 && tally.incUnknown === 0) status = 'eligible';
  else if (tally.incMet === 0 && tally.incUnknown >= totalInc / 2) status = 'insufficient';
  else status = 'partial'; // mix of met / not_met / unknown

  return { trialId: trial.id, status, matchScore, dataComplete, inclusion, exclusion, tally };
}

export function evaluateAllTrials(trials, patient) {
  return trials.map((t) => ({ trial: t, evaluation: evaluateTrial(t, patient) }));
}

export const STATUS_META = {
  eligible: { label: 'Eligible', color: '#16a34a', description: 'Patient meets all encoded inclusion criteria with no exclusions met.' },
  partial: { label: 'Partial match', color: '#f59e0b', description: 'Some criteria met or unknown; no exclusions triggered.' },
  excluded: { label: 'Excluded', color: '#dc2626', description: 'At least one exclusion criterion is met.' },
  insufficient: { label: 'Insufficient data', color: '#6b7280', description: 'Too many criteria are unknown to determine eligibility.' },
};
