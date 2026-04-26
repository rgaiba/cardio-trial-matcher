// Smoke test: run the engine with a sample patient and print results.
// Run with: node scripts/smoke.mjs
import { TRIALS } from '../src/data/trials.js';
import { evaluateAllTrials, STATUS_META } from '../src/engine/matchEngine.js';

const SAMPLE = {
  age: 64,
  sex: 'M',
  nyhaClass: 3,
  lvef: 28,
  ntProBnp: 1850,
  egfr: 52,
  potassium: 4.4,
  sodium: 138,
  hemoglobin: 12.8,
  creatinine: 1.3,
  sbp: 118,
  hr: 78,
  qrs: 138,
  rhythm: 'sinus',
  comorbidities: {
    diabetes: 'type2',
    afib: false,
    htn: true,
    priorMI: true,
    copd: false,
    angioedema: false,
    severeValveDisease: false,
    cadAmenableToCabg: true,
    leftMainGte50: false,
    ccsAnginaClass3plus: false,
  },
  recent: {
    miWithinMonths: 18,
    hfHospWithinMonths: 4,
    cabgPciWithinMonths: 18,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: true,
    arni: false,
    betaBlocker: true,
    mra: false,
    sglt2i: false,
    loopDiuretic: true,
    ivabradine: false,
    digoxin: false,
  },
};

const results = evaluateAllTrials(TRIALS, SAMPLE);
results.sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

console.log('Sample patient: 64M, NYHA III, EF 28%, NT-proBNP 1850, eGFR 52, prior MI, on ACEi+BB+loop\n');
console.log('Trial'.padEnd(20), 'Score'.padEnd(8), 'Status'.padEnd(15), 'Inc met / total / unknown');
console.log('-'.repeat(80));
for (const { trial, evaluation } of results) {
  const t = evaluation.tally;
  console.log(
    trial.name.padEnd(20),
    `${evaluation.matchScore}%`.padEnd(8),
    STATUS_META[evaluation.status].label.padEnd(15),
    `${t.incMet}/${trial.inclusion.length} (${t.incUnknown} unknown)`
  );
  // detail any exclusion that triggered
  const triggeredExc = evaluation.exclusion.filter((c) => c.result === 'met');
  if (triggeredExc.length) {
    triggeredExc.forEach((c) => console.log('   ✗ exclusion: ' + c.label));
  }
}
