// Smoke test for the absolute-effect engine and outcomes data.
// Run: node scripts/smoke-absolute.mjs   (also runs in `npm test` and prebuild)

import { OUTCOMES } from '../src/data/outcomes.js';
import { TRIALS } from '../src/data/trials.js';
import {
  projectTreated,
  computeEffect,
  absoluteEffectModel,
  transportFlags,
  compareToSummary,
  numberNeeded,
  forestRows,
  summarizeFlagsForWorksheet,
} from '../src/engine/absoluteEffect.js';

let failures = 0;
const fail = (msg) => { failures += 1; console.error('FAIL', msg); };
const near = (a, b, tol, msg) => { if (!(Math.abs(a - b) <= tol)) fail(`${msg}: got ${a}, expected ${b} ± ${tol}`); };

// 1. Hand-checked formula cases ------------------------------------------
// Baseline 20%, HR 0.80: R1 = 1 - 0.8^0.8 = 16.35%, ARR 3.65, NNT 27.4
near(projectTreated(20, 'HR', 0.8), 16.35, 0.01, 'HR 0.80 at 20%');
near(numberNeeded(20 - projectTreated(20, 'HR', 0.8)), 27.4, 0.1, 'NNT at 20%, HR 0.80');

// HR above 1 gives harm.
{
  const e = computeEffect({ kind: 'risk', measure: 'HR', estimate: 1.5, ci: [1.2, 1.9] }, 10);
  if (e.direction !== 'harm') fail(`HR 1.5 should be harm, got ${e.direction}`);
  if (e.numberRange?.kind !== 'harm') fail('HR 1.5 CI should give an NNH range');
}

// CI crossing 1 is uncertain and gives the split NNT/NNH range.
{
  const e = computeEffect({ kind: 'risk', measure: 'HR', estimate: 0.9, ci: [0.7, 1.15] }, 20);
  if (e.direction !== 'uncertain') fail(`CI crossing 1 should be uncertain, got ${e.direction}`);
  if (e.numberRange?.kind !== 'crosses') fail('CI crossing 1 should give a crossing range');
}

// Baseline of 0 means no difference and an infinite NNT.
{
  const e = computeEffect({ kind: 'risk', measure: 'HR', estimate: 0.8, ci: [0.7, 0.9] }, 0);
  if (e.diff !== 0) fail(`baseline 0 should give diff 0, got ${e.diff}`);
  if (e.number !== Infinity) fail('baseline 0 should give NNT infinity');
}

// OR transform: 50% with OR 1 stays 50%; OR 2 at 50% gives 66.7%.
near(projectTreated(50, 'OR', 1), 50, 1e-9, 'OR 1');
near(projectTreated(50, 'OR', 2), 66.67, 0.01, 'OR 2 at 50%');

// RR capped at 100%.
near(projectTreated(80, 'RR', 2), 100, 1e-9, 'RR cap');

// Rate kind scales linearly.
near(projectTreated(67.9, 'HR', 0.53, 'rate'), 35.99, 0.01, 'rate scaling');

// 2. Data checks ---------------------------------------------------------
const trialIds = new Set(TRIALS.map((t) => t.id));
const KINDS = ['risk', 'rate', 'none'];
const MEASURES = ['HR', 'OR', 'RR'];

for (const [id, d] of Object.entries(OUTCOMES)) {
  if (!trialIds.has(id)) fail(`${id}: not a trial id in trials.js`);
  if (!d.sources?.length || d.sources.some((s) => !s.url)) fail(`${id}: missing sources`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.lastVerified || '')) fail(`${id}: bad lastVerified`);

  const p = d.primary;
  if (!KINDS.includes(p.kind)) fail(`${id}: bad primary.kind ${p.kind}`);
  if (p.kind === 'none') {
    if (!p.note) fail(`${id}: kind none needs a note explaining why`);
    continue;
  }
  if (!MEASURES.includes(p.measure)) fail(`${id}: bad measure ${p.measure}`);
  if (!(p.estimate > 0)) fail(`${id}: estimate must be > 0`);
  if (p.ci && !(p.ci[0] < p.estimate && p.estimate < p.ci[1])) fail(`${id}: estimate outside its CI`);
  if (p.kind === 'risk' && !p.horizon) fail(`${id}: risk outcome needs a horizon`);

  // The engine must reproduce the published treated value from the
  // published control value and relative effect, since
  // published figures are Kaplan–Meier or crude and the transform is an
  // approximation. Tolerance: 1 point or 10% of the control value.
  // Tolerance grows with the control value: crude proportions over long
  // follow-up diverge more from the hazard-ratio transform.
  near(projectTreated(p.control, p.measure, p.estimate, p.kind), p.treated, Math.max(1, 0.1 * p.control), `${id}: reproduce treated value`);

  if (d.safety && d.safety.kind !== 'single-arm') {
    const s = d.safety;
    near(projectTreated(s.control, s.measure, s.estimate, s.kind), s.treated, 1, `${id}: reproduce safety value`);
  }

  // Model at 0.25x and 3x stays within bounds.
  for (const m of [0.25, 1, 3]) {
    const model = absoluteEffectModel(id, m);
    if (!model?.applicable) fail(`${id}: model not applicable at ${m}x`);
    else if (p.kind === 'risk' && (model.primary.treated < 0 || model.primary.treated > 100)) fail(`${id}: treated out of range at ${m}x`);
  }
}

// 3. Expected directions on the pilot set --------------------------------
const expectDir = {
  aristotle: 'benefit',
  'madit-ii': 'benefit',
  'partner-3': 'benefit',
  coapt: 'benefit',
  pallas: 'harm',
  'mitra-fr': 'uncertain',
  'scd-heft': 'benefit',
  'castle-af': 'benefit',
  danish: 'uncertain',
  ocean: 'uncertain',
  'champion-af': 'uncertain',
  'closure-af': 'harm',
};
for (const [id, dir] of Object.entries(expectDir)) {
  const got = absoluteEffectModel(id, 1)?.primary?.direction;
  if (got !== dir) fail(`${id}: expected ${dir}, got ${got}`);
}
for (const id of ['mantra-paf', 'pvi-sham-af']) {
  if (absoluteEffectModel(id)?.applicable !== false) fail(`${id} should be not applicable`);
}
if (absoluteEffectModel('not-a-trial') !== null) fail('uncurated trial should return null');

// 4. Transport flags -----------------------------------------------------
if (compareToSummary(64, { type: 'mean-sd', mean: 64, sd: 10 }) !== null) fail('mean value should not flag');
if (compareToSummary(80, { type: 'mean-sd', mean: 64, sd: 10 })?.level !== 'caution') fail('1.6 SD should be caution');
if (compareToSummary(90, { type: 'mean-sd', mean: 64, sd: 10 })?.level !== 'flag') fail('2.6 SD should be flag');
if (compareToSummary(80, { type: 'median-iqr', median: 70, q1: 63, q3: 76 })?.level !== 'caution') fail('outside IQR should be caution');

{
  const flags = transportFlags('madit-ii', { age: 64, lvef: 35, meds: { sglt2i: true } });
  const fields = flags.map((f) => f.field).sort().join(',');
  if (fields !== 'lvef,sglt2i') fail(`madit-ii flags: got ${fields}`);
  if (flags.find((f) => f.field === 'lvef')?.level !== 'flag') fail('LVEF 35 in MADIT-II should flag (2.4 SD)');
}
{
  // EROA 0.25 cm² = 25 mm²: COAPT (41 ± 15) caution, MITRA-FR (31 ± 10) none.
  const p = { mitralRegurgitation: { ero: 0.25 } };
  if (transportFlags('coapt', p).find((f) => f.field === 'ero')?.level !== 'caution') fail('COAPT EROA 25 should be caution');
  if (transportFlags('mitra-fr', p).some((f) => f.field === 'ero')) fail('MITRA-FR EROA 25 should not flag');
}
if (transportFlags('aristotle', {}).length !== 0) fail('empty patient should give no flags');

// 5. Forest rows ----------------------------------------------------------
{
  const byId = Object.fromEntries(TRIALS.map((t) => [t.id, t]));
  const uncurated = TRIALS.find((t) => !OUTCOMES[t.id]);
  const rows = forestRows([byId['madit-ii'], byId['mantra-paf'], byId.pallas, uncurated]);
  const st = rows.map((r) => r.status).join(',');
  if (st !== 'ok,none,ok,uncurated') fail(`forest statuses: ${st}`);
  near(rows[0].ard, -5.6, 0.3, 'MADIT-II absolute difference at own rate');
  if (!(rows[2].ard > 0)) fail('PALLAS absolute difference should be positive (harm)');
  if (!(rows[0].ardRange[0] < rows[0].ard && rows[0].ard < rows[0].ardRange[1])) fail('MADIT-II ard outside its range');

  // Same baseline 10%: 1 - 0.9^0.69 = 7.02%, so -2.98 points.
  const same = forestRows([byId['madit-ii'], byId.coapt], { sameBaseline: 10 });
  near(same[0].ard, -2.98, 0.02, 'MADIT-II at 10% baseline');
  if (same[1].control !== 10) fail('same-baseline should override COAPT control');

  const txt = summarizeFlagsForWorksheet(byId['madit-ii'], { age: 64, lvef: 35 });
  if (!txt.includes('few like this')) fail('worksheet flag summary should mark LVEF 35 as few like this');
}

const covered = Object.keys(OUTCOMES).length;
if (failures) {
  console.error(`${failures} absolute-effect check(s) failed.`);
  process.exit(1);
}
console.log(`All absolute-effect checks passed. Coverage: ${covered} of ${TRIALS.length} trials.`);
