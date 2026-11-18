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

  // ── EP trials added November 2026 ──
  'scd-heft': {
    primary: {
      label: 'All-cause mortality (ICD vs placebo)',
      kind: 'risk',
      horizon: 'a median 45.5 months',
      control: 28.8,
      treated: 22.0,
      measure: 'HR',
      estimate: 0.77,
      ci: [0.62, 0.96],
      lowerIsBetter: true,
      note: '244 of 847 placebo vs 182 of 829 ICD patients died. The published interval is a 97.5% CI because alpha was split across two comparisons; it is shown here as the interval.',
    },
    safety: null,
    baseline: {
      age: { type: 'median-iqr', median: 60, q1: 52, q3: 68 },
    },
    predatesTherapies: ['sglt2i', 'arni'],
    sources: [
      { label: 'Bardy GH et al. N Engl J Med 2005;352:225-37', url: 'https://doi.org/10.1056/NEJMoa043399' },
      { label: 'Age IQR from a comparison table (ICD arm), Neth Heart J 2017', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5612865/table/Tab2' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: ['baseline.age'],
  },

  danish: {
    primary: {
      label: 'All-cause mortality',
      kind: 'risk',
      horizon: 'a median 67.6 months',
      control: 23.4,
      treated: 21.6,
      measure: 'HR',
      estimate: 0.87,
      ci: [0.68, 1.12],
      lowerIsBetter: true,
      note: 'Sudden cardiac death, a secondary outcome, was about halved; all-cause mortality was not significantly lower.',
    },
    safety: null,
    baseline: {
      // Median age 63–64 reported; IQR not curated.
    },
    predatesTherapies: ['sglt2i', 'arni'],
    sources: [
      { label: 'Køber L et al. N Engl J Med 2016;375:1221-30', url: 'https://doi.org/10.1056/NEJMoa1608029' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  ocean: {
    primary: {
      label: 'Stroke, systemic embolism or covert embolic stroke (rivaroxaban vs aspirin)',
      kind: 'risk',
      horizon: '3 years',
      control: 1.4,
      treated: 0.8,
      measure: 'RR',
      estimate: 0.56,
      ci: [0.19, 1.65],
      lowerIsBetter: true,
      note: '9 events on aspirin and 5 on rivaroxaban. "Control" here is aspirin, the less-treatment arm.',
    },
    safety: {
      label: 'Fatal or major bleeding',
      kind: 'risk',
      horizon: '3 years',
      control: 0.6,
      treated: 1.6,
      measure: 'RR',
      estimate: 2.51,
      ci: [0.79, 7.95],
      lowerIsBetter: true,
    },
    baseline: {
      age: { type: 'mean-sd', mean: 66, sd: 7.5 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Verma A et al. N Engl J Med 2025', url: 'https://doi.org/10.1056/NEJMoa2509688' },
      { label: 'ACC trial summary (age by arm)', url: 'https://www.acc.org/latest-in-cardiology/clinical-trials/2026/03/03/18/35/ocean' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  'castle-af': {
    primary: {
      label: 'Death or hospitalization for worsening heart failure',
      kind: 'risk',
      horizon: 'a median 37.8 months',
      control: 44.6,
      treated: 28.5,
      measure: 'HR',
      estimate: 0.62,
      ci: [0.43, 0.87],
      lowerIsBetter: true,
      note: '82 of 184 medical-therapy vs 51 of 179 ablation patients. Crude proportions over a long follow-up, so the HR transform reproduces them only roughly.',
    },
    safety: null,
    baseline: {
      // Median age 64 reported; IQR not curated.
    },
    predatesTherapies: ['sglt2i', 'arni'],
    sources: [
      { label: 'Marrouche NF et al. N Engl J Med 2018;378:417-27', url: 'https://doi.org/10.1056/NEJMoa1707855' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  'pvi-sham-af': {
    primary: {
      label: 'Change in AFEQT quality-of-life score at 6 months',
      kind: 'none',
      note:
        'The primary end point is a change in a 0–100 quality-of-life score, a continuous measure, so there is no baseline risk or NNT. Between-group difference 2.6 points (95% CI −2.7 to 8.0). AF on 7-day Holter at 6 months: 21% with ablation vs 41% with sham.',
    },
    safety: null,
    baseline: {},
    predatesTherapies: [],
    sources: [
      { label: 'Wachter R et al. Lancet 2026 (PVI-SHAM-AF)', url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)01558-8/fulltext' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },

  'champion-af': {
    primary: {
      label: 'CV death, stroke or systemic embolism (closure vs NOAC)',
      kind: 'risk',
      horizon: '3 years',
      control: 4.8,
      treated: 5.7,
      measure: 'HR',
      estimate: 1.2,
      ci: [0.87, 1.66],
      lowerIsBetter: true,
      note: 'Noninferiority margin 4.8 percentage points. Ischemic stroke 3.2% with closure vs 2.0% with NOAC.',
    },
    safety: {
      label: 'Non-procedural bleeding (ISTH major or clinically relevant nonmajor)',
      kind: 'risk',
      horizon: '3 years',
      control: 19.0,
      treated: 10.9,
      measure: 'HR',
      estimate: 0.55,
      ci: [0.45, 0.67],
      lowerIsBetter: true,
    },
    baseline: {
      age: { type: 'mean-sd', mean: 71.7, sd: 7.5 },
    },
    predatesTherapies: [],
    sources: [
      { label: 'Doshi SK et al. N Engl J Med 2026', url: 'https://doi.org/10.1056/NEJMoa2517213' },
      { label: 'Sponsor clinical summary (HR 1.20, 95% CI 0.87–1.66)', url: 'https://www.bostonscientific.com/content/dam/bostonscientific/trials/trial-result//SH-2434711-AB_WM-CHAMPION-AF-Clinical%20Summary-Digital_PSST.pdf' },
      { label: 'ConsultantLive (age 71.7 ± 7.5)', url: 'https://www.consultantlive.com/view/champion-af-left-atrial-appendage-closure-noninferior-to-noacs' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: ['primary.note (ischemic stroke rates)'],
  },

  'closure-af': {
    primary: {
      label: 'Stroke, embolism, major bleeding, or CV or unexplained death (closure vs medical care)',
      kind: 'rate',
      control: 13.27,
      treated: 16.83,
      measure: 'HR',
      estimate: 1.28,
      ci: [1.01, 1.62],
      lowerIsBetter: true,
      note: 'Events per 100 patient-years over a median 3 years. Noninferiority margin HR 1.3; not met.',
    },
    safety: {
      label: 'Periprocedural complications',
      kind: 'single-arm',
      horizon: 'within 7 days',
      treated: 5.7,
      note: 'Device arm only. Major bleeding is already inside the primary end point.',
    },
    baseline: {
      // Mean age about 78; SD not curated.
    },
    predatesTherapies: [],
    sources: [
      { label: 'Landmesser U et al. N Engl J Med 2026;394:1270-80', url: 'https://doi.org/10.1056/NEJMoa2513310' },
      { label: 'ACC trial summary', url: 'https://www.acc.org/Latest-in-Cardiology/Clinical-Trials/2026/03/03/18/35/CLOSURE-AF' },
    ],
    curatedBy: 'Claude-assisted draft',
    verifiedBy: null,
    lastVerified: '2026-11-18',
    fieldsToVerify: [],
  },
};
