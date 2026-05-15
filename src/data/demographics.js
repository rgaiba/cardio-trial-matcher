// Race/ethnicity composition of each trial's enrolled population.
// Percentages sum to ~100. Where the original publication did not formally
// report race (predominantly European multi-center trials of the 1980s–2000s),
// we mark `notReported: true` and provide best-available context.
//
// Sources: trial baseline-characteristic publications and supplements,
// JACC/Circulation diversity reviews, Wiki Journal Club summaries.
// Last verified: April 2026.

export const DEMOGRAPHICS = {
  // ── HFrEF foundational quartet ──
  'paradigm-hf': {
    white: 66, asian: 18, black: 5, other: 11,
    notes: '"Other" includes Hispanic and unspecified.',
  },
  'dapa-hf': {
    white: 70, asian: 24, black: 5, other: 1,
  },
  'emperor-reduced': {
    white: 70, asian: 18, black: 7, other: 5,
  },
  'emphasis-hf': {
    white: 83, asian: 4, black: 6, other: 7,
    notes: 'Predominantly European sites; race incompletely reported in supplement.',
  },

  // ── Older landmark medical-therapy trials ──
  'consensus': {
    notReported: true,
    notes: 'Conducted in Scandinavia (1985–1986); race was not formally reported. Population was predominantly White/European.',
  },
  'solvd-treatment': {
    white: 80, black: 17, other: 3,
    notes: 'US/Canada multi-center. Black representation was unusually high for this era.',
  },
  'merit-hf': {
    white: 89, black: 4, other: 7,
    notes: 'US/European trial; race incompletely reported.',
  },
  'cibis-ii': {
    notReported: true,
    notes: 'European multi-center trial; race not formally reported. Population was predominantly White.',
  },
  'rales': {
    white: 87, asian: 2, black: 7, other: 4,
  },

  // ── Device / advanced HF trials ──
  'madit-ii': {
    white: 85, black: 10, other: 5,
    notes: 'Predominantly US sites.',
  },
  'companion': {
    white: 80, black: 17, other: 3,
    notes: 'US trial with strong Black representation.',
  },
  'care-hf': {
    notReported: true,
    notes: 'European multi-center trial; race not formally reported. Population was predominantly White.',
  },
  'stich': {
    white: 70, asian: 10, black: 7, other: 13,
    notes: 'International (22 countries); broader ethnic mix than typical HF surgical trials.',
  },

  // ── HFpEF trials ──
  'topcat': {
    white: 89, black: 9, other: 2,
    notes: '48% enrolled in Russia/Georgia, 52% Americas; this geographic distribution drove the later regional-heterogeneity finding.',
  },
  'paragon-hf': {
    white: 81, asian: 13, black: 2, other: 4,
  },
  'emperor-preserved': {
    white: 76, asian: 14, black: 4, other: 6,
  },
  'deliver': {
    white: 71, asian: 20, black: 3, other: 6,
  },

  // ── Atrial fibrillation: Anticoagulation ──
  'aristotle': {
    white: 83, asian: 14, black: 1, other: 2,
    notes: 'Geographic spread: 25% N. America, 19% Latin America, 40% Europe, 16% Asia/Pacific.',
  },
  're-ly': {
    white: 70, asian: 16, black: 1, other: 13,
    notes: 'Multi-regional trial (44 countries); race underreported in primary publication.',
  },
  'rocket-af': {
    white: 83, asian: 13, black: 1, other: 3,
    notes: 'Higher CHADS₂ population than ARISTOTLE/RE-LY.',
  },
  'spaf': {
    notReported: true,
    notes: 'US multi-center trial (1991); race not formally reported. Population was predominantly White.',
  },
  'spaf-ii': {
    notReported: true,
    notes: 'US multi-center trial (1994); race not formally reported.',
  },
  'spaf-iii': {
    notReported: true,
    notes: 'US/Canadian trial (1996); race not formally reported.',
  },

  // ── Atrial fibrillation: Rate and rhythm control ──
  'affirm': {
    white: 89, black: 9, other: 2,
    notes: 'US/Canadian trial; ~11% ethnic minorities reported in baseline characteristics.',
  },
  'race-ii': {
    notReported: true,
    notes: 'Dutch multi-center trial; race not formally reported. Population was predominantly White.',
  },
  'athena': {
    white: 89, asian: 4, black: 2, other: 5,
    notes: 'International trial in 37 countries.',
  },
  'pallas': {
    white: 92, asian: 4, black: 1, other: 3,
    notes: 'International; trial stopped early for harm.',
  },

  // ── Atrial fibrillation: Catheter ablation ──
  'apaf': {
    notReported: true,
    notes: 'Single-center Italian trial; race not formally reported. Population was predominantly White European.',
  },
  'thermocool-af': {
    white: 91, black: 3, other: 6,
    notes: 'US multi-center trial.',
  },
  'mantra-paf': {
    notReported: true,
    notes: 'Scandinavian multi-center trial (Denmark, Sweden, Finland); race not formally reported.',
  },

  // ── Valvular disease: Aortic stenosis (TAVR) ──
  'partner-1b': {
    white: 93, black: 4, asian: 1, other: 2,
    notes: 'US/Canada/Germany multi-center; predominantly elderly White cohort.',
  },
  'partner-1a': {
    white: 94, black: 3, asian: 1, other: 2,
    notes: 'US multi-center high-risk cohort; predominantly White, elderly.',
  },
  'corevalve-high-risk': {
    white: 94, black: 4, asian: 1, other: 1,
    notes: 'US multi-center; predominantly White cohort similar to PARTNER 1A.',
  },
  'partner-2a': {
    white: 93, black: 4, asian: 1, other: 2,
    notes: 'US/Canada multi-center; intermediate-risk cohort.',
  },
  'partner-3': {
    white: 87, black: 4, asian: 2, other: 7,
    notes: 'US/Canada/Europe/Australia/New Zealand low-risk cohort.',
  },
  'evolut-low-risk': {
    white: 88, black: 4, asian: 2, other: 6,
    notes: 'International multi-center self-expanding TAVR low-risk cohort.',
  },

  // ── Valvular disease: Mitral regurgitation (TEER) ──
  'everest-ii': {
    white: 91, black: 4, other: 5,
    notes: 'US multi-center; predominantly degenerative-MR cohort.',
  },
  'coapt': {
    white: 88, black: 7, asian: 1, other: 4,
    notes: 'US/Canada multi-center HF + secondary-MR cohort.',
  },
  'mitra-fr': {
    notReported: true,
    notes: 'French multi-center trial (37 sites); race not formally reported. Population was predominantly White European.',
  },
};

// Display order and brand colors. Slate/amber/indigo palette to match the
// rest of the app's minimalist aesthetic.
export const RACE_GROUPS = [
  { key: 'white', label: 'White', color: '#94a3b8' },
  { key: 'asian', label: 'Asian', color: '#fbbf24' },
  { key: 'black', label: 'Black', color: '#6366f1' },
  { key: 'hispanic', label: 'Hispanic', color: '#ec4899' },
  { key: 'other', label: 'Other / unspecified', color: '#cbd5e1' },
];
