// Smoke test: AF patient evaluated against all 30 trials
import { TRIALS, TRIAL_GROUPS } from '../src/data/trials.js';
import { evaluateAllTrials, STATUS_META } from '../src/engine/matchEngine.js';

// 78F, paroxysmal symptomatic AF, prior stroke, HTN, on warfarin, EF 60%, eGFR 55
const AFIB_PATIENT = {
  age: 78,
  sex: 'F',
  nyhaClass: 1,
  lvef: 60,
  egfr: 55,
  potassium: 4.0,
  sbp: 138,
  hr: 88,
  qrs: 90,
  rhythm: 'afib',
  afibType: 'paroxysmal',
  afibSymptomatic: true,
  priorAblation: false,
  priorAADFailure: false,
  comorbidities: {
    diabetes: 'none',
    afib: true,
    htn: true,
    priorMI: false,
    severeValveDisease: false,
    priorStrokeOrTIA: true,
    vascularDisease: false,
    mitralStenosis: false,
    mechanicalValve: false,
  },
  recent: {
    miWithinMonths: undefined,
    hfHospWithinMonths: undefined,
    cabgPciWithinMonths: undefined,
    strokeWithinMonths: 36,
  },
  meds: {
    aceArb: false,
    arni: false,
    betaBlocker: true,
    mra: false,
    sglt2i: false,
    loopDiuretic: false,
  },
};

console.log('Sample AF patient: 78F, paroxysmal symptomatic AF, prior stroke (3 yrs ago),');
console.log('HTN, EF 60%, eGFR 55, on warfarin/beta-blocker\n');

const results = evaluateAllTrials(TRIALS, AFIB_PATIENT);
const afResults = results.filter(r => r.trial.topicId === 'atrial-fibrillation');
afResults.sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

console.log('Atrial fibrillation trials:');
console.log('Trial'.padEnd(20), 'Score'.padEnd(8), 'Status'.padEnd(20));
console.log('-'.repeat(60));
for (const { trial, evaluation } of afResults) {
  console.log(
    trial.name.padEnd(20),
    `${evaluation.matchScore}%`.padEnd(8),
    STATUS_META[evaluation.status].label.padEnd(20)
  );
  const triggeredExc = evaluation.exclusion.filter((c) => c.result === 'met');
  triggeredExc.forEach((c) => console.log('   ✗ ' + c.label));
}

console.log('\nGroups overview:');
for (const g of TRIAL_GROUPS.filter(g => g.topicId === 'atrial-fibrillation')) {
  const groupResults = afResults.filter(r => r.trial.groupId === g.id);
  console.log(`  ${g.label}: ${groupResults.length} trials, top match: ${groupResults[0]?.trial.name} (${groupResults[0]?.evaluation.matchScore}%)`);
}
