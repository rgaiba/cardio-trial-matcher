// Smoke test: valvular patient evaluated against all trials
import { TRIALS, TRIAL_GROUPS } from '../src/data/trials.js';
import { evaluateAllTrials, STATUS_META } from '../src/engine/matchEngine.js';

// 82F, severe symptomatic AS, AVA 0.7, mean gradient 48 mmHg, peak 4.4 m/s,
// STS 6.5% (intermediate risk), tricuspid valve, EF 55, on basic GDMT
const AS_PATIENT = {
  age: 82,
  sex: 'F',
  nyhaClass: 3,
  lvef: 55,
  egfr: 58,
  potassium: 4.2,
  sbp: 135,
  hr: 76,
  qrs: 100,
  rhythm: 'sinus',
  comorbidities: {
    diabetes: 'none',
    afib: false,
    htn: true,
    priorMI: false,
    bicuspidValve: false,
    activeEndocarditis: false,
    severeValveDisease: true,
  },
  recent: {
    miWithinMonths: undefined,
    hfHospWithinMonths: 2,
    cabgPciWithinMonths: undefined,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: true,
    betaBlocker: true,
    loopDiuretic: true,
  },
  aorticStenosis: {
    severity: 'severe',
    meanGradient: 48,
    valveArea: 0.7,
    peakVelocity: 4.4,
    symptomatic: true,
  },
  mitralRegurgitation: {
    grade: 1,
    etiology: 'unknown',
    anatomySuitable: undefined,
    ero: undefined,
  },
  stsScore: 6.5,
  surgicalRisk: 'intermediate',
};

// 68M, HFrEF EF 30%, secondary 3+ MR, NYHA III on max GDMT, anatomy OK
const MR_PATIENT = {
  age: 68,
  sex: 'M',
  nyhaClass: 3,
  lvef: 30,
  ntProBnp: 2400,
  egfr: 48,
  potassium: 4.5,
  sbp: 112,
  hr: 72,
  qrs: 110,
  rhythm: 'sinus',
  comorbidities: {
    diabetes: 'type2',
    afib: false,
    htn: true,
    priorMI: true,
    activeEndocarditis: false,
    severeValveDisease: false,
  },
  recent: {
    miWithinMonths: 18,
    hfHospWithinMonths: 5,
    cabgPciWithinMonths: 18,
    strokeWithinMonths: undefined,
  },
  meds: {
    aceArb: true,
    arni: false,
    betaBlocker: true,
    mra: true,
    sglt2i: true,
    loopDiuretic: true,
  },
  aorticStenosis: {
    severity: 'none',
    meanGradient: undefined,
    valveArea: undefined,
    peakVelocity: undefined,
    symptomatic: false,
  },
  mitralRegurgitation: {
    grade: 3,
    etiology: 'secondary',
    anatomySuitable: true,
    ero: 0.32,
  },
  stsScore: undefined,
  surgicalRisk: 'unknown',
};

function runOne(label, patient) {
  console.log('\n' + '='.repeat(80));
  console.log(label);
  console.log('='.repeat(80));
  const results = evaluateAllTrials(TRIALS, patient);
  const valvResults = results.filter((r) => r.trial.topicId === 'valvular-disease');
  valvResults.sort((a, b) => (b.evaluation.matchScore ?? -1) - (a.evaluation.matchScore ?? -1));

  console.log('Trial'.padEnd(28), 'Score'.padEnd(8), 'Status'.padEnd(20), 'Inc met/total');
  console.log('-'.repeat(80));
  for (const { trial, evaluation } of valvResults) {
    const t = evaluation.tally;
    console.log(
      trial.name.padEnd(28),
      `${evaluation.matchScore ?? 'n/a'}%`.padEnd(8),
      STATUS_META[evaluation.status].label.padEnd(20),
      `${t.incMet}/${trial.inclusion.length} (${t.incUnknown} unknown)`
    );
    const triggeredExc = evaluation.exclusion.filter((c) => c.result === 'met');
    triggeredExc.forEach((c) => console.log('   ✗ exclusion: ' + c.label));
  }

  console.log('\nGroups:');
  for (const g of TRIAL_GROUPS.filter((g) => g.topicId === 'valvular-disease')) {
    const groupResults = valvResults.filter((r) => r.trial.groupId === g.id);
    console.log(
      `  ${g.label}: ${groupResults.length} trials, top match: ${groupResults[0]?.trial.name} (${groupResults[0]?.evaluation.matchScore}%)`
    );
  }
}

runOne(
  'AS patient: 82F, severe symptomatic AS (AVA 0.7, MG 48, peak 4.4), STS 6.5, tricuspid, EF 55',
  AS_PATIENT
);
runOne(
  'MR patient: 68M, HFrEF EF 30, secondary 3+ MR (ERO 0.32), NYHA III on max GDMT',
  MR_PATIENT
);
