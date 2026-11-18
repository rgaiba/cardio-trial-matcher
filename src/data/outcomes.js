// Numeric outcomes and baseline summaries per trial, keyed by trial id.
//
// Feeds the absolute-effect panel (engine/absoluteEffect.js). Follows the
// demographics.js pattern: trials.js stays untouched.
//
// primary / safety fields:
//   label         outcome name as the trial defined it
//   kind          'risk'  = cumulative proportion over `horizon` (percent)
//                 'rate'  = events per 100 patient-years
//                 'single-arm' = reported in the treated arm only (safety)
//                 'none'  = no baseline-risk translation (see note)
//   horizon       follow-up the risk refers to (kind 'risk')
//   control       control-arm value (percent or per 100 patient-years)
//   treated       treated-arm value as published (used to check the engine)
//   measure       'HR' | 'OR' | 'RR'
//   estimate, ci  relative effect and 95% CI; ci null if not reported
//   lowerIsBetter true when the outcome is an event to avoid
//   note          caveat shown under the numbers
//
// baseline: summaries for transport flags, in the trial's units
//   { type: 'mean-sd', mean, sd } or { type: 'median-iqr', median, q1, q3, min?, max? }
//   Fields: age (years), lvef (%), ero (mm²), stsScore (%).
//
// predatesTherapies: patient-form med keys that few or no trial patients
//   received because enrollment came first.
//
// Every entry is a Claude-assisted draft until a clinician sets verifiedBy.

export const OUTCOMES = {
  aristotle: {
    primary: {
      label: 'Stroke or systemic embolism',
      kind: 'rate',
      control: 1.6,
      treated: 1.27,
      measure: 'HR',
      estimate: 0.79,
      ci: [0.66, 0.95],
      lowerIsBetter: true,
      note: 'Rates per 100 patient-years over a median 1.8 years of follow-up.',
    },
    safety: {
      label: 'Major bleeding',
      kind: 'rate',
      control: 3.09,
      treated: 2.13,
      measure: 'HR',
      estimate: 0.69,
      ci: [0.6, 0.8],
      lowerIsBetter: true,
    },
    baseline: {
      age: { type: 'median-iqr', median: 70, q1: 63, q3: 76 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Granger CB et al. N Engl J Med 2011;365:981-92', url: 'https://doi.org/10.1056/NEJMoa1107039' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  apaf: {
    primary: {
      label: 'Recurrent atrial tachyarrhythmia',
      kind: 'risk',
      horizon: '12 months',
      control: 78,
      treated: 14,
      measure: 'RR',
      estimate: 0.18,
      ci: null,
      lowerIsBetter: true,
      note:
        'Recurrence is 100% minus the published Kaplan–Meier freedom (22% drug therapy, 86% ablation). The ratio is derived from those two proportions; the paper reports no CI for it. Surrogate end point.',
    },
    safety: null,
    baseline: {
      age: { type: 'mean-sd', mean: 56, sd: 10 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Pappone C et al. J Am Coll Cardiol 2006;48:2340-7', url: 'https://doi.org/10.1016/j.jacc.2006.08.037' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  'mantra-paf': {
    primary: {
      label: 'Cumulative AF burden over 24 months',
      kind: 'none',
      note:
        'The primary end point is a percentile of AF burden, a continuous measure, not an event. It has no baseline risk to adjust, so no absolute risk or NNT can be computed from it.',
    },
    safety: null,
    baseline: {
      // Mean 56 years reported; SD not curated. Inclusion capped age at 70.
    },
    predatesTherapies: [],
    sources: [
      { label: 'Cosedis Nielsen J et al. N Engl J Med 2012;367:1587-95', url: 'https://doi.org/10.1056/NEJMoa1113566' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  pallas: {
    primary: {
      label: 'Stroke, MI, systemic embolism or CV death',
      kind: 'risk',
      horizon: 'a median 3.5 months',
      control: 1.2,
      treated: 2.7,
      measure: 'HR',
      estimate: 2.29,
      ci: [1.34, 3.94],
      lowerIsBetter: true,
      note: '19 of 1,617 placebo patients versus 43 of 1,619 dronedarone patients. The trial stopped early for harm.',
    },
    safety: null,
    baseline: {
      age: { type: 'mean-sd', mean: 75, sd: 6 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Connolly SJ et al. N Engl J Med 2011;365:2268-76', url: 'https://doi.org/10.1056/NEJMoa1109867' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: ['baseline.age'],
  },

  'madit-ii': {
    primary: {
      label: 'All-cause mortality',
      kind: 'risk',
      horizon: 'an average 20 months',
      control: 19.8,
      treated: 14.2,
      measure: 'HR',
      estimate: 0.69,
      ci: [0.51, 0.93],
      lowerIsBetter: true,
    },
    safety: null,
    baseline: {
      age: { type: 'mean-sd', mean: 64, sd: 10 },
      lvef: { type: 'mean-sd', mean: 23, sd: 5 },
    },
    predatesTherapies: ['sglt2i', 'arni'],
    sources: [
      { label: 'Moss AJ et al. N Engl J Med 2002;346:877-83', url: 'https://doi.org/10.1056/NEJMoa013474' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  coapt: {
    primary: {
      label: 'Heart failure hospitalizations (all, not first only)',
      kind: 'rate',
      control: 67.9,
      treated: 35.8,
      measure: 'HR',
      estimate: 0.53,
      ci: [0.4, 0.7],
      lowerIsBetter: true,
      note:
        'Annualized rate of all HF hospitalizations within 24 months, so one patient can count more than once. All-cause death at 24 months: 29.1% versus 46.1% (HR 0.62, 95% CI 0.46–0.82).',
    },
    safety: {
      label: 'Device-related complications',
      kind: 'single-arm',
      horizon: '12 months',
      treated: 3.4,
      note: 'Device arm only (freedom 96.6%), judged against a performance goal. No control comparison.',
    },
    baseline: {
      age: { type: 'mean-sd', mean: 72, sd: 11 },
      lvef: { type: 'mean-sd', mean: 31, sd: 9 },
      ero: { type: 'mean-sd', mean: 41, sd: 15 },
    },
    predatesTherapies: ['sglt2i'],
    sources: [
      { label: 'Stone GW et al. N Engl J Med 2018;379:2307-18', url: 'https://doi.org/10.1056/NEJMoa1806640' },
      { label: 'Pibarot P et al. Eur Heart J Cardiovasc Imaging 2019 (MITRA-FR vs COAPT baseline table)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6529908/' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  'mitra-fr': {
    primary: {
      label: 'Death or unplanned HF hospitalization',
      kind: 'risk',
      horizon: '12 months',
      control: 51.3,
      treated: 54.6,
      measure: 'OR',
      estimate: 1.16,
      ci: [0.73, 1.84],
      lowerIsBetter: true,
    },
    safety: {
      label: 'Periprocedural complications',
      kind: 'single-arm',
      horizon: 'the procedure',
      treated: 14.6,
      note: 'Device arm only. No control comparison.',
    },
    baseline: {
      age: { type: 'mean-sd', mean: 70, sd: 10 },
      lvef: { type: 'mean-sd', mean: 33, sd: 7 },
      ero: { type: 'mean-sd', mean: 31, sd: 10 },
    },
    predatesTherapies: ['sglt2i'],
    sources: [
      { label: 'Obadia JF et al. N Engl J Med 2018;379:2297-306', url: 'https://doi.org/10.1056/NEJMoa1805374' },
      { label: 'Pibarot P et al. Eur Heart J Cardiovasc Imaging 2019 (MITRA-FR vs COAPT baseline table)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6529908/' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: ['safety.treated'],
  },

  'partner-3': {
    primary: {
      label: 'Death, stroke or rehospitalization',
      kind: 'risk',
      horizon: '1 year',
      control: 15.1,
      treated: 8.5,
      measure: 'HR',
      estimate: 0.54,
      ci: [0.37, 0.79],
      lowerIsBetter: true,
      note: 'As-treated population (948 of 1,000 randomized).',
    },
    safety: null,
    baseline: {
      age: { type: 'mean-sd', mean: 73, sd: 6 },
      stsScore: { type: 'mean-sd', mean: 1.9, sd: 0.7 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Mack MJ et al. N Engl J Med 2019;380:1695-705', url: 'https://doi.org/10.1056/NEJMoa1814052' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: ['baseline.age.sd', 'baseline.stsScore.sd'],
  },
};
