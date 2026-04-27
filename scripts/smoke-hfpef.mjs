// Smoke test: HFpEF patient + URL roundtrip test
import { TRIALS } from '../src/data/trials.js';
import { evaluateAllTrials, STATUS_META } from '../src/engine/matchEngine.js';

// 72F, NYHA II, EF 55%, AFib, NT-proBNP 1200, on diuretic, eGFR 48, HTN diabetic
const HFPEF_PATIENT = {
  age: 72,
  sex: 'F',
  nyhaClass: 2,
  lvef: 55,
  ntProBnp: 1200,
  egfr: 48,
  potassium: 4.2,
  sbp: 142,
  hr: 76,
  qrs: 92,
  rhythm: 'afib',
  comorbidities: {
    diabetes: 'type2',
    afib: true,
    htn: true,
    priorMI: false,
    severeValveDisease: false,
    angioedema: false,
  },
  recent: {
    miWithinMonths: undefined,
    hfHospWithinMonths: 8,
    cabgPciWithinMonths: undefined,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: true,
    arni: false,
    betaBlocker: true,
    mra: false,
    sglt2i: false,
    loopDiuretic: true,
  },
};

console.log('HFpEF case: 72F, NYHA II, EF 55%, AFib, NT-proBNP 1200, eGFR 48, HF hosp 8 mo ago\n');
const results = evaluateAllTrials(TRIALS, HFPEF_PATIENT);
results.sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

console.log('Trial'.padEnd(20), 'Score'.padEnd(8), 'Status'.padEnd(15), 'Inc met / unknown');
console.log('-'.repeat(80));
for (const { trial, evaluation } of results) {
  const t = evaluation.tally;
  console.log(
    trial.name.padEnd(20),
    `${evaluation.matchScore}%`.padEnd(8),
    STATUS_META[evaluation.status].label.padEnd(15),
    `${t.incMet}/${trial.inclusion.length} (${t.incUnknown}u)`
  );
}

// Privacy note: patient state is no longer URL-encoded for sharing. The
// Share button copies the bare site URL only; patient inputs never leave
// the user's browser.
