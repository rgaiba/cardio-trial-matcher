// Named evaluator functions referenced by trial criteria.
// Each returns one of: 'met' | 'not_met' | 'unknown'.
// `unknown` is used when the patient hasn't supplied the data needed to decide.

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const isBool = (v) => typeof v === 'boolean';

// Generic "is this risk factor present?" used by hasAnyRiskFactor for AF trials.
// Returns 'met' | 'not_met' | 'unknown'.
function checkRiskFactor(p, factor) {
  switch (factor) {
    case 'ageGte65':
      return !isNum(p.age) ? 'unknown' : p.age >= 65 ? 'met' : 'not_met';
    case 'ageGte70':
      return !isNum(p.age) ? 'unknown' : p.age >= 70 ? 'met' : 'not_met';
    case 'ageGte75':
      return !isNum(p.age) ? 'unknown' : p.age >= 75 ? 'met' : 'not_met';
    case 'priorStrokeOrTIA':
      return !isBool(p.comorbidities?.priorStrokeOrTIA)
        ? 'unknown'
        : p.comorbidities.priorStrokeOrTIA ? 'met' : 'not_met';
    case 'htn':
      return !isBool(p.comorbidities?.htn)
        ? 'unknown'
        : p.comorbidities.htn ? 'met' : 'not_met';
    case 'diabetes':
      if (!p.comorbidities?.diabetes || p.comorbidities.diabetes === 'unknown') return 'unknown';
      return p.comorbidities.diabetes === 'none' ? 'not_met' : 'met';
    case 'priorMI':
      return !isBool(p.comorbidities?.priorMI)
        ? 'unknown'
        : p.comorbidities.priorMI ? 'met' : 'not_met';
    case 'vascularDisease':
      return !isBool(p.comorbidities?.vascularDisease)
        ? 'unknown'
        : p.comorbidities.vascularDisease ? 'met' : 'not_met';
    case 'lvefLt40':
      return !isNum(p.lvef) ? 'unknown' : p.lvef < 40 ? 'met' : 'not_met';
    case 'lvefLt50':
      return !isNum(p.lvef) ? 'unknown' : p.lvef < 50 ? 'met' : 'not_met';
    case 'hfHistory': {
      // proxy: NYHA II+ OR LVEF ≤40 OR recent HF hosp
      const nyhaKnown = isNum(p.nyhaClass);
      const lvefKnown = isNum(p.lvef);
      const hospKnown = isNum(p.recent?.hfHospWithinMonths);
      if (nyhaKnown && p.nyhaClass >= 2) return 'met';
      if (lvefKnown && p.lvef <= 40) return 'met';
      if (hospKnown && p.recent.hfHospWithinMonths <= 6) return 'met';
      if (nyhaKnown || lvefKnown || hospKnown) return 'not_met';
      return 'unknown';
    }
    default:
      return 'unknown';
  }
}

export const evaluators = {
  // ── Demographics ──
  ageGte: (p, { min }) =>
    !isNum(p.age) ? 'unknown' : p.age >= min ? 'met' : 'not_met',
  ageGt: (p, { threshold }) =>
    !isNum(p.age) ? 'unknown' : p.age > threshold ? 'met' : 'not_met',
  ageBetween: (p, { min, max }) =>
    !isNum(p.age) ? 'unknown' : p.age >= min && p.age <= max ? 'met' : 'not_met',

  // ── Functional class ──
  nyhaIn: (p, { classes }) =>
    !isNum(p.nyhaClass) ? 'unknown' : classes.includes(p.nyhaClass) ? 'met' : 'not_met',

  // ── LVEF ──
  lvefLte: (p, { max }) =>
    !isNum(p.lvef) ? 'unknown' : p.lvef <= max ? 'met' : 'not_met',
  lvefLt: (p, { threshold }) =>
    !isNum(p.lvef) ? 'unknown' : p.lvef < threshold ? 'met' : 'not_met',
  lvefGte: (p, { min }) =>
    !isNum(p.lvef) ? 'unknown' : p.lvef >= min ? 'met' : 'not_met',
  lvefEmphasis: (p) => {
    // EF ≤30%, OR EF ≤35% with QRS >130 ms
    if (!isNum(p.lvef)) return 'unknown';
    if (p.lvef <= 30) return 'met';
    if (p.lvef <= 35) {
      if (!isNum(p.qrs)) return 'unknown';
      return p.qrs > 130 ? 'met' : 'not_met';
    }
    return 'not_met';
  },

  // ── BP / HR ──
  sbpLt: (p, { threshold }) =>
    !isNum(p.sbp) ? 'unknown' : p.sbp < threshold ? 'met' : 'not_met',
  sbpGte: (p, { threshold }) =>
    !isNum(p.sbp) ? 'unknown' : p.sbp >= threshold ? 'met' : 'not_met',
  hrLt: (p, { threshold }) =>
    !isNum(p.hr) ? 'unknown' : p.hr < threshold ? 'met' : 'not_met',

  // ── Labs ──
  egfrLt: (p, { threshold }) =>
    !isNum(p.egfr) ? 'unknown' : p.egfr < threshold ? 'met' : 'not_met',
  potassiumGt: (p, { threshold }) =>
    !isNum(p.potassium) ? 'unknown' : p.potassium > threshold ? 'met' : 'not_met',
  creatinineGt: (p, { threshold }) =>
    !isNum(p.creatinine) ? 'unknown' : p.creatinine > threshold ? 'met' : 'not_met',

  // ── Conduction / rhythm ──
  qrsGte: (p, { threshold }) =>
    !isNum(p.qrs) ? 'unknown' : p.qrs >= threshold ? 'met' : 'not_met',
  rhythmIs: (p, { rhythm }) =>
    !p.rhythm || p.rhythm === 'unknown' ? 'unknown' : p.rhythm === rhythm ? 'met' : 'not_met',
  hrGte: (p, { threshold }) =>
    !isNum(p.hr) ? 'unknown' : p.hr >= threshold ? 'met' : 'not_met',
  hrGt: (p, { threshold }) =>
    !isNum(p.hr) ? 'unknown' : p.hr > threshold ? 'met' : 'not_met',

  // ── Atrial fibrillation specifics ──
  afibTypeIn: (p, { types }) =>
    !p.afibType || p.afibType === 'unknown' ? 'unknown' : types.includes(p.afibType) ? 'met' : 'not_met',
  afibSymptomatic: (p) =>
    !isBool(p.afibSymptomatic) ? 'unknown' : p.afibSymptomatic ? 'met' : 'not_met',
  priorAblation: (p) =>
    !isBool(p.priorAblation) ? 'unknown' : p.priorAblation ? 'met' : 'not_met',
  noPriorAblation: (p) =>
    !isBool(p.priorAblation) ? 'unknown' : !p.priorAblation ? 'met' : 'not_met',
  priorAADFailure: (p) =>
    !isBool(p.priorAADFailure) ? 'unknown' : p.priorAADFailure ? 'met' : 'not_met',
  noPriorAAD: (p) =>
    !isBool(p.priorAADFailure) ? 'unknown' : !p.priorAADFailure ? 'met' : 'not_met',

  // ── CHADS2 / CHA2DS2-VASc style composites ──
  // Generic "≥1 stroke risk factor" — used by ARISTOTLE, RE-LY, etc.
  // Each trial has slightly different qualifying factors; pass `factors` array.
  hasAnyRiskFactor: (p, { factors }) => {
    let anyKnown = false;
    for (const f of factors) {
      const result = checkRiskFactor(p, f);
      if (result === 'met') return 'met';
      if (result === 'not_met') anyKnown = true;
    }
    return anyKnown ? 'not_met' : 'unknown';
  },
  // ROCKET-AF style: stroke/TIA OR ≥2 of {HF/EF≤35, HTN, age≥75, DM}
  rocketAfRisk: (p) => {
    // Tier 1: prior stroke/TIA → automatic met
    if (p.comorbidities?.priorStrokeOrTIA === true) return 'met';
    // Tier 2: count modifiable factors
    let count = 0;
    let unknowns = 0;
    const checks = [
      isBool(p.comorbidities?.priorMI) ? null : null, // not used
      // HF or EF ≤35
      (() => {
        if (isNum(p.lvef)) return p.lvef <= 35;
        return null;
      })(),
      // HTN
      isBool(p.comorbidities?.htn) ? p.comorbidities.htn : null,
      // age ≥75
      isNum(p.age) ? p.age >= 75 : null,
      // DM
      p.comorbidities?.diabetes
        ? p.comorbidities.diabetes === 'type1' || p.comorbidities.diabetes === 'type2'
        : null,
    ].filter((v) => v !== undefined);
    for (const c of checks) {
      if (c === true) count += 1;
      else if (c === null) unknowns += 1;
    }
    if (count >= 2) return 'met';
    if (count + unknowns >= 2) return 'unknown';
    return 'not_met';
  },

  // ── Medications ──
  onMed: (p, { med }) =>
    !p.meds || !isBool(p.meds[med]) ? 'unknown' : p.meds[med] ? 'met' : 'not_met',
  onAllMeds: (p, { meds }) => {
    if (!p.meds) return 'unknown';
    let anyUnknown = false;
    for (const m of meds) {
      if (!isBool(p.meds[m])) anyUnknown = true;
      else if (!p.meds[m]) return 'not_met';
    }
    return anyUnknown ? 'unknown' : 'met';
  },

  // ── Comorbidities ──
  comorbidityPresent: (p, { key }) =>
    !p.comorbidities || !isBool(p.comorbidities[key])
      ? 'unknown'
      : p.comorbidities[key]
        ? 'met'
        : 'not_met',
  diabetesTypeIs: (p, { type }) => {
    const dm = p.comorbidities?.diabetes;
    if (!dm || dm === 'unknown') return 'unknown';
    return dm === type ? 'met' : 'not_met';
  },

  // ── Recent events (months since) ──
  // 'recentEventWithin' returns 'met' (event happened within window); useful
  // for exclusions ("MI within 3 mo") AND inclusions ("HF hosp within 12 mo").
  recentEventWithin: (p, { keys, months }) => {
    if (!p.recent) return 'unknown';
    let anyKnown = false;
    for (const k of keys) {
      const v = p.recent[k];
      if (isNum(v)) {
        anyKnown = true;
        if (v <= months) return 'met';
      }
    }
    return anyKnown ? 'not_met' : 'unknown';
  },
  // For criteria like "Prior MI ≥1 month ago": ensures event DID happen but
  // outside a recency window. requirePast=true means we need a recorded event.
  recentEventNotWithin: (p, { key, months, requirePast }) => {
    const v = p.recent?.[key];
    if (!isNum(v)) return 'unknown';
    if (requirePast && v < 0) return 'not_met';
    return v >= months ? 'met' : 'not_met';
  },

  // ── Composite natriuretic-peptide rules ──
  natriureticParadigm: (p) => {
    // NT-proBNP ≥600 (≥400 if HF hosp ≤12 mo) OR BNP ≥150 (≥100 if hosp)
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 12;
    if (isNum(p.ntProBnp)) {
      const cutoff = recentHosp ? 400 : 600;
      return p.ntProBnp >= cutoff ? 'met' : 'not_met';
    }
    if (isNum(p.bnp)) {
      const cutoff = recentHosp ? 100 : 150;
      return p.bnp >= cutoff ? 'met' : 'not_met';
    }
    return 'unknown';
  },
  natriureticDapa: (p) => {
    // NT-proBNP ≥600 (≥400 if hosp ≤12 mo; ≥900 if AFib)
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 12;
    const afib = p.rhythm === 'afib' || p.comorbidities?.afib === true;
    if (isNum(p.ntProBnp)) {
      const cutoff = afib ? 900 : recentHosp ? 400 : 600;
      return p.ntProBnp >= cutoff ? 'met' : 'not_met';
    }
    return 'unknown';
  },
  natriureticEmperor: (p) => {
    // EF ≤30 → ≥600; EF 31–35 → ≥1000; EF 36–40 → ≥2500. Doubled if AFib.
    if (!isNum(p.lvef)) return 'unknown';
    if (!isNum(p.ntProBnp)) return 'unknown';
    let cutoff;
    if (p.lvef <= 30) cutoff = 600;
    else if (p.lvef <= 35) cutoff = 1000;
    else if (p.lvef <= 40) cutoff = 2500;
    else return 'not_met';
    const afib = p.rhythm === 'afib' || p.comorbidities?.afib === true;
    if (afib) cutoff *= 2;
    return p.ntProBnp >= cutoff ? 'met' : 'not_met';
  },
  // ── HFpEF natriuretic rules ──
  natriureticEmperorPreserved: (p) => {
    // NT-proBNP >300 pg/mL (>900 if AFib/flutter)
    if (!isNum(p.ntProBnp)) return 'unknown';
    const afib = p.rhythm === 'afib' || p.comorbidities?.afib === true;
    return p.ntProBnp > (afib ? 900 : 300) ? 'met' : 'not_met';
  },
  natriureticDeliver: (p) => {
    // NT-proBNP ≥300 (≥600 if AFib); doubled if HF hosp ≤12 mo
    if (!isNum(p.ntProBnp)) return 'unknown';
    const afib = p.rhythm === 'afib' || p.comorbidities?.afib === true;
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 12;
    let cutoff = afib ? 600 : 300;
    if (recentHosp) cutoff *= 2;
    return p.ntProBnp >= cutoff ? 'met' : 'not_met';
  },
  natriureticTopcat: (p) => {
    // BNP ≥100 OR NT-proBNP ≥360 within 60 days, OR HF hosp within 12 months
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 12;
    if (recentHosp) return 'met';
    if (isNum(p.ntProBnp)) return p.ntProBnp >= 360 ? 'met' : 'not_met';
    if (isNum(p.bnp)) return p.bnp >= 100 ? 'met' : 'not_met';
    return 'unknown';
  },
  natriureticParagon: (p) => {
    // NT-proBNP >300 (or >900 if AFib) in patients without recent HF hosp
    // NT-proBNP >900 (or >1800 if AFib) in patients with HF hosp in last 9 months
    if (!isNum(p.ntProBnp)) return 'unknown';
    const afib = p.rhythm === 'afib' || p.comorbidities?.afib === true;
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 9;
    let cutoff;
    if (recentHosp) cutoff = afib ? 1800 : 900;
    else cutoff = afib ? 900 : 300;
    return p.ntProBnp > cutoff ? 'met' : 'not_met';
  },

  // ── Valvular disease ──
  // Aortic stenosis severity: 'none' | 'mild' | 'moderate' | 'severe' |
  // 'criticalLowFlowLowGradient'. Pass `severities` array of acceptable values.
  asSeverityIn: (p, { severities }) => {
    const v = p.aorticStenosis?.severity;
    if (!v || v === 'unknown') return 'unknown';
    return severities.includes(v) ? 'met' : 'not_met';
  },
  // AS mean transaortic gradient (mmHg)
  asMeanGradientGte: (p, { threshold }) => {
    const v = p.aorticStenosis?.meanGradient;
    return !isNum(v) ? 'unknown' : v >= threshold ? 'met' : 'not_met';
  },
  asMeanGradientLt: (p, { threshold }) => {
    const v = p.aorticStenosis?.meanGradient;
    return !isNum(v) ? 'unknown' : v < threshold ? 'met' : 'not_met';
  },
  // AS aortic valve area (cm²)
  asValveAreaLte: (p, { max }) => {
    const v = p.aorticStenosis?.valveArea;
    return !isNum(v) ? 'unknown' : v <= max ? 'met' : 'not_met';
  },
  // AS peak transaortic jet velocity (m/s)
  asPeakVelocityGte: (p, { threshold }) => {
    const v = p.aorticStenosis?.peakVelocity;
    return !isNum(v) ? 'unknown' : v >= threshold ? 'met' : 'not_met';
  },
  // AS clinically symptomatic (dyspnea, syncope, angina attributable to AS)
  asSymptomatic: (p) => {
    const v = p.aorticStenosis?.symptomatic;
    return !isBool(v) ? 'unknown' : v ? 'met' : 'not_met';
  },
  // Composite severe-AS check: AVA ≤1.0 OR mean gradient ≥40 OR peak velocity
  // ≥4.0 — the standard "any one of three" criterion used by PARTNER and Evolut
  // pivotal trials.
  asSevereAny: (p) => {
    const ava = p.aorticStenosis?.valveArea;
    const mg = p.aorticStenosis?.meanGradient;
    const pv = p.aorticStenosis?.peakVelocity;
    const sev = p.aorticStenosis?.severity;
    if (sev === 'severe' || sev === 'criticalLowFlowLowGradient') return 'met';
    if (isNum(ava) && ava <= 1.0) return 'met';
    if (isNum(mg) && mg >= 40) return 'met';
    if (isNum(pv) && pv >= 4.0) return 'met';
    if (isNum(ava) || isNum(mg) || isNum(pv) || sev) return 'not_met';
    return 'unknown';
  },

  // Mitral regurgitation grade (0–4)
  mrGradeGte: (p, { min }) => {
    const v = p.mitralRegurgitation?.grade;
    return !isNum(v) ? 'unknown' : v >= min ? 'met' : 'not_met';
  },
  mrGradeIn: (p, { grades }) => {
    const v = p.mitralRegurgitation?.grade;
    return !isNum(v) ? 'unknown' : grades.includes(v) ? 'met' : 'not_met';
  },
  // MR etiology: 'primary' (degenerative) | 'secondary' (functional) | 'mixed'
  mrEtiologyIs: (p, { etiology }) => {
    const v = p.mitralRegurgitation?.etiology;
    if (!v || v === 'unknown') return 'unknown';
    return v === etiology ? 'met' : 'not_met';
  },
  // Mitral anatomy suitable for transcatheter edge-to-edge repair on echo.
  mitralAnatomySuitable: (p) => {
    const v = p.mitralRegurgitation?.anatomySuitable;
    return !isBool(v) ? 'unknown' : v ? 'met' : 'not_met';
  },
  // Effective regurgitant orifice area (ERO, cm²)
  mrEroGte: (p, { threshold }) => {
    const v = p.mitralRegurgitation?.ero;
    return !isNum(v) ? 'unknown' : v >= threshold ? 'met' : 'not_met';
  },

  // Surgical risk — STS Predicted Risk of Mortality (PROM), %
  stsScoreGte: (p, { threshold }) =>
    !isNum(p.stsScore) ? 'unknown' : p.stsScore >= threshold ? 'met' : 'not_met',
  stsScoreLt: (p, { threshold }) =>
    !isNum(p.stsScore) ? 'unknown' : p.stsScore < threshold ? 'met' : 'not_met',
  stsScoreBetween: (p, { min, max }) =>
    !isNum(p.stsScore) ? 'unknown' : p.stsScore >= min && p.stsScore < max ? 'met' : 'not_met',
  // Categorical heart-team surgical risk (low | intermediate | high | inoperable)
  surgicalRiskIn: (p, { categories }) => {
    const v = p.surgicalRisk;
    if (!v || v === 'unknown') return 'unknown';
    return categories.includes(v) ? 'met' : 'not_met';
  },

  // PARTNER-3 / Evolut-LR composite low-risk gate: STS <4% AND no surgical-risk
  // flag bumping the patient to intermediate/high. Used as a single criterion
  // so the trial card mirrors how the heart team applied it.
  partnerLowRiskGate: (p) => {
    const sts = p.stsScore;
    const risk = p.surgicalRisk;
    if (isNum(sts) && sts < 4 && (risk === 'low' || !risk || risk === 'unknown')) return 'met';
    if (isNum(sts) && sts >= 4) return 'not_met';
    if (risk === 'intermediate' || risk === 'high' || risk === 'inoperable') return 'not_met';
    if (!isNum(sts) && (!risk || risk === 'unknown')) return 'unknown';
    return 'met';
  },

  hospOrNatriureticEmphasis: (p) => {
    const recentHosp = isNum(p.recent?.hfHospWithinMonths) && p.recent.hfHospWithinMonths <= 6;
    if (recentHosp) return 'met';
    if (isNum(p.ntProBnp)) {
      const cutoff = p.sex === 'F' ? 750 : 500;
      if (p.ntProBnp >= cutoff) return 'met';
    }
    if (isNum(p.bnp) && p.bnp >= 250) return 'met';
    if (isNum(p.recent?.hfHospWithinMonths) || isNum(p.ntProBnp) || isNum(p.bnp)) return 'not_met';
    return 'unknown';
  },
};

export function evaluateCriterion(criterion, patient) {
  const fn = evaluators[criterion.evaluator];
  if (!fn) {
    console.warn('Missing evaluator:', criterion.evaluator);
    return 'unknown';
  }
  return fn(patient, criterion.params || {});
}
