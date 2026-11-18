// Turns a trial's design metadata (src/data/evidence.js) into eight graded
// checks for the evidence card. Pure functions, no React, so the smoke test
// can run them in Node.
//
// Levels:
//   'pass'    design feature that protects against this bias
//   'caution' worth weighing when applying the result
//   'flag'    a known source of bias for this kind of end point
//   'info'    context, never a grade (sponsor, de-escalation, missing data)
//
// The checks describe how a trial was built, not whether its result is true.
// A trial can pass every check and still show harm (PALLAS), or carry flags
// and still be right.

import { EVIDENCE } from '../data/evidence.js';

export const LEVELS = ['pass', 'caution', 'flag', 'info'];

export const LEVEL_META = {
  pass: { label: 'Protects', color: 'var(--green)' },
  caution: { label: 'Weigh', color: 'var(--amber)' },
  flag: { label: 'Bias risk', color: 'var(--red)' },
  info: { label: 'Context', color: 'var(--gray)' },
};

// Era threshold: enrollment that ended this many years ago or more gets a
// caution, because background therapy has usually changed since.
export const ERA_YEARS = 15;

const ENDPOINT_LABEL = {
  mortality: 'all-cause mortality',
  'hard-event': 'a hard clinical event',
  'composite-hard': 'a composite of hard clinical events',
  'composite-with-hospitalization': 'a composite that includes hospitalization',
  hospitalization: 'hospitalization',
  surrogate: 'a surrogate measure',
  'patient-reported': 'a patient-reported outcome',
};

// Short explanations shown under "Why this matters". Plain language, two
// sentences each, drawn from the causal framework behind the feature.
export const WHY = {
  blinding:
    'When patients and clinicians know the assignment, expectation can change symptoms, testing and decisions to admit. Only blinding or a sham procedure separates the treatment from the belief in it.',
  endpoint:
    'A trial shows an effect on the end point it measured. Rhythm on a monitor or a lab value can improve while patients live no longer and feel no better.',
  era:
    'A trial measures benefit against the care of its time. As background therapy improves, baseline risk falls and the same treatment prevents fewer events.',
  population:
    'Randomization makes a result valid for the patients enrolled. Older, sicker or differently treated patients may respond differently, and they are often most of the patients treated in practice.',
  construction:
    'Which events count, and how patients are analyzed, can shape the result before the first patient enrolls. Read each part of a composite and check the intention-to-treat result.',
  noninferiority:
    'A noninferiority trial accepts a treatment as "not worse" if any loss stays inside a chosen margin. A wide margin can let a worse treatment pass.',
  deescalation:
    'Many trials compare two active treatments and never test doing less. The missing arm (stopping a drug, skipping a procedure) is often the one patients most need answered.',
  sponsor:
    'Sponsors choose which questions get asked. Funding does not make a randomized result wrong, but it tells you which comparisons were likely to be run and which were skipped.',
};

function check(id, label, level, summary) {
  return { id, label, level, summary, why: WHY[id] };
}

function blindingCheck(e) {
  const ep = ENDPOINT_LABEL[e.primaryEndpointType];
  if (e.sham) return check('blinding', 'Blinding', 'pass', 'Sham-controlled: patients could not tell which procedure they had.');
  if (e.masking === 'double-blind') return check('blinding', 'Blinding', 'pass', 'Double-blind.');
  if (e.masking === 'single-blind') {
    return check('blinding', 'Blinding', 'caution', `Single-blind, with ${ep} as the primary end point.`);
  }
  // Open label (with or without blinded adjudication)
  const adjudicated = e.masking === 'open-label-blinded-adjudication';
  const base = adjudicated ? 'Open-label with blinded event adjudication' : 'Open-label';
  switch (e.primaryEndpointType) {
    case 'mortality':
      return check('blinding', 'Blinding', 'pass', `${base}, but the primary end point is death, which knowing the assignment cannot change.`);
    case 'hard-event':
    case 'composite-hard':
      return check('blinding', 'Blinding', adjudicated ? 'pass' : 'caution', `${base}; primary end point is ${ep}.`);
    case 'hospitalization':
    case 'composite-with-hospitalization':
      return check('blinding', 'Blinding', 'caution', `${base}; the primary end point includes hospitalization, and decisions to admit can be influenced by knowing the assignment.`);
    case 'surrogate':
    case 'patient-reported':
    default:
      return check('blinding', 'Blinding', 'flag', `${base} with ${ep} as the primary end point. Expectation and ascertainment can both bias it.`);
  }
}

function endpointCheck(e) {
  const note = e.primaryEndpointNote ? ` (${e.primaryEndpointNote.charAt(0).toLowerCase()}${e.primaryEndpointNote.slice(1)})` : '';
  switch (e.primaryEndpointType) {
    case 'mortality':
    case 'hard-event':
    case 'composite-hard':
      return check('endpoint', 'End point', 'pass', `Primary end point is ${ENDPOINT_LABEL[e.primaryEndpointType]}${note}.`);
    case 'composite-with-hospitalization':
    case 'hospitalization':
      return check('endpoint', 'End point', 'caution', `Primary end point is ${ENDPOINT_LABEL[e.primaryEndpointType]}${note}. Look at each component separately.`);
    case 'patient-reported':
      return check('endpoint', 'End point', 'pass', `Primary end point is ${ENDPOINT_LABEL[e.primaryEndpointType]}${note}; it matters to patients if blinding was adequate.`);
    case 'surrogate':
    default:
      return check('endpoint', 'End point', 'flag', `Primary end point is ${ENDPOINT_LABEL.surrogate}${note}, not a clinical outcome.`);
  }
}

function eraCheck(e, currentYear) {
  const { start, end } = e.enrollment || {};
  const span = start === end ? `${start}` : `${start}–${end}`;
  if (e.comparatorSuperseded) {
    return check('era', 'Comparator era', 'flag', `Enrolled ${span}. ${e.comparatorNote || 'The comparator has since been superseded.'}`);
  }
  if (end != null && currentYear - end >= ERA_YEARS) {
    const extra = e.comparatorNote ? ` ${e.comparatorNote}` : '';
    return check('era', 'Comparator era', 'caution', `Enrolled ${span}, ${currentYear - end} years ago; background therapy has likely changed.${extra}`);
  }
  return check('era', 'Comparator era', 'pass', `Enrolled ${span}; comparator: ${e.comparator}.`);
}

function populationCheck(e) {
  if (e.screened && e.randomized) {
    const ratio = e.randomized / e.screened;
    const oneIn = Math.round(e.screened / e.randomized);
    const level = ratio < 0.2 ? 'caution' : 'pass';
    const extra = e.selection?.note ? ` ${e.selection.note}` : '';
    return check('population', 'Patients like practice', level, `About 1 in ${oneIn} screened patients was randomized (${e.randomized.toLocaleString()} of ${e.screened.toLocaleString()}).${extra}`);
  }
  if (e.selection) {
    return check('population', 'Patients like practice', e.selection.level, `${e.selection.note} (Curator judgment; screening counts not curated.)`);
  }
  return check('population', 'Patients like practice', 'info', 'Screening and selection details not yet curated. Compare the trial population with your patient.');
}

function constructionCheck(e) {
  const notes = [];
  let level = 'pass';
  if (e.safetyExcludesProcedural) {
    level = 'caution';
    notes.push('The safety end point leaves out procedure-related harm.');
  }
  if (e.analysisPopulation && e.analysisPopulation !== 'intention-to-treat') {
    level = 'caution';
    notes.push(`Primary analysis was ${e.analysisPopulation}, not intention-to-treat; check the intention-to-treat result in the paper.`);
  }
  if (e.safetyEndpointNote) notes.push(e.safetyEndpointNote);
  if (notes.length === 0) notes.push('Intention-to-treat analysis; no end point construction concerns curated.');
  return check('construction', 'End point construction', level, notes.join(' '));
}

function noninferiorityCheck(e) {
  if (e.design === 'superiority' || !e.niMargin) {
    return check('noninferiority', 'Noninferiority margin', 'pass', 'Superiority design; no noninferiority margin.');
  }
  const m = e.niMargin;
  const wide = (m.type === 'hr' && m.value >= 1.3) || (m.type === 'absolute-pct' && m.value >= 5);
  const marginText = m.type === 'hr'
    ? `a hazard ratio upper limit of ${m.value} (up to ${Math.round((m.value - 1) * 100)}% relatively worse)`
    : `an absolute difference of ${m.value} percentage points`;
  if (wide && e.superiorityShown) {
    return check('noninferiority', 'Noninferiority margin', 'pass', `Margin was ${marginText}, which is wide, but superiority was also shown, so the margin did not decide the result.`);
  }
  return check('noninferiority', 'Noninferiority margin', wide ? 'caution' : 'pass', `Margin was ${marginText}.`);
}

function deescalationCheck(e) {
  return check('deescalation', 'Less-treatment arm', 'info', e.deescalationNote || (e.deescalationTested ? 'A less-treatment arm was tested.' : 'No less-treatment arm was tested.'));
}

function sponsorCheck(e) {
  const kind = { industry: 'Industry', academic: 'Academic', government: 'Government', mixed: 'Mixed' }[e.sponsor] || 'Not curated';
  return check('sponsor', 'Sponsor', 'info', `${kind}. ${e.sponsorNote || ''}`.trim());
}

// Main entry point. Returns null when the trial has no curated evidence entry.
export function appraiseTrial(trialId, { currentYear = new Date().getFullYear() } = {}) {
  const e = EVIDENCE[trialId];
  if (!e) return null;
  const checks = [
    blindingCheck(e),
    endpointCheck(e),
    eraCheck(e, currentYear),
    populationCheck(e),
    constructionCheck(e),
    noninferiorityCheck(e),
    deescalationCheck(e),
    sponsorCheck(e),
  ];
  const counts = { pass: 0, caution: 0, flag: 0, info: 0 };
  for (const c of checks) counts[c.level] += 1;
  return {
    trialId,
    checks,
    counts,
    teachingNote: e.teachingNote,
    sources: e.sources,
    curatedBy: e.curatedBy,
    verifiedBy: e.verifiedBy,
    lastVerified: e.lastVerified,
    fieldsToVerify: e.fieldsToVerify || [],
  };
}

// One-line plain-text summary for the worksheet's validity box.
export function summarizeForWorksheet(trial, opts) {
  const a = appraiseTrial(trial.id, opts);
  if (!a) return `${trial.name} (${trial.year}): evidence checks not yet curated.`;
  const flagged = a.checks.filter((c) => c.level === 'flag' || c.level === 'caution');
  if (flagged.length === 0) return `${trial.name} (${trial.year}): no design flags on the curated checks.`;
  const parts = flagged.map((c) => `${c.label} [${c.level === 'flag' ? 'bias risk' : 'weigh'}]: ${c.summary}`);
  return `${trial.name} (${trial.year})\n- ${parts.join('\n- ')}`;
}
