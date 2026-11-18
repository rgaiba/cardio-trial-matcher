// Smoke test for the EP trials added in v1.1: new evaluators and the
// eligibility encodings that use them.
// Run: node scripts/smoke-ep.mjs   (also runs in `npm test`)

import { TRIALS } from '../src/data/trials.js';
import { evaluateCriterion } from '../src/engine/evaluators.js';

let failures = 0;
const fail = (m) => { failures += 1; console.error('FAIL', m); };
const trial = (id) => TRIALS.find((t) => t.id === id);
const crit = (id, kind, cid) => trial(id)[kind].find((c) => c.id === cid);
const expect = (id, kind, cid, patient, want) => {
  const got = evaluateCriterion(crit(id, kind, cid), patient);
  if (got !== want) fail(`${id}/${kind}/${cid}: expected ${want}, got ${got}`);
};

const NEG = { htn: false, diabetes: 'none', priorStrokeOrTIA: false, vascularDisease: false };

// OCEAN: months free of AF after ablation
expect('ocean', 'inclusion', 'afFree', { afFreeMonthsAfterAblation: 18 }, 'met');
expect('ocean', 'inclusion', 'afFree', { afFreeMonthsAfterAblation: 6 }, 'not_met');
expect('ocean', 'inclusion', 'afFree', {}, 'unknown');

// OCEAN: CHA2DS2-VASc ≥1 men, ≥2 women
expect('ocean', 'inclusion', 'risk', { age: 66, sex: 'M', comorbidities: {} }, 'met');
expect('ocean', 'inclusion', 'risk', { age: 50, sex: 'F', lvef: 60, nyhaClass: 1, comorbidities: NEG }, 'not_met');
expect('ocean', 'inclusion', 'risk', { age: 50, sex: 'F', lvef: 60, nyhaClass: 1, comorbidities: { ...NEG, htn: true } }, 'met');

// CHAMPION-AF: ≥2 men, ≥3 women
expect('champion-af', 'inclusion', 'risk', { age: 70, sex: 'F', lvef: 60, nyhaClass: 1, comorbidities: NEG }, 'not_met');
expect('champion-af', 'inclusion', 'risk', { age: 70, sex: 'F', lvef: 60, nyhaClass: 1, comorbidities: { ...NEG, diabetes: 'type2' } }, 'met');
expect('champion-af', 'inclusion', 'risk', { age: 78, sex: 'M', comorbidities: {} }, 'met');
expect('champion-af', 'inclusion', 'risk', { comorbidities: {} }, 'unknown');

// CLOSURE-AF: only eGFR 15–29 can establish high bleeding risk from the form
expect('closure-af', 'inclusion', 'bleed', { egfr: 22 }, 'met');
expect('closure-af', 'inclusion', 'bleed', { egfr: 60 }, 'unknown');

// DANISH: NT-proBNP > 200 and prior MI as the ischemic proxy
expect('danish', 'inclusion', 'ntprobnp', { ntProBnp: 450 }, 'met');
expect('danish', 'inclusion', 'ntprobnp', { ntProBnp: 150 }, 'not_met');
expect('danish', 'exclusion', 'ischemic', { comorbidities: { priorMI: true } }, 'met');

// Every EP trial is present with a group that exists.
for (const id of ['scd-heft', 'danish', 'ocean', 'castle-af', 'pvi-sham-af', 'champion-af', 'closure-af']) {
  if (!trial(id)) fail(`${id} missing from trials.js`);
}

if (failures) {
  console.error(`${failures} EP check(s) failed.`);
  process.exit(1);
}
console.log('All EP trial checks passed.');
