// Named evaluator functions referenced by trial criteria.
// Each returns one of: 'met' | 'not_met' | 'unknown'.
// `unknown` is used when the patient hasn't supplied the data needed to decide.

const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);
const isBool = (v) => typeof v === 'boolean';

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
  // 'recentEventWithin' returns 'met' (event happened within window) — useful
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
