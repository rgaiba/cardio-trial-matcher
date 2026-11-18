// Smoke test for the evidence card data and checks.
// Run: node scripts/smoke-evidence.mjs   (exits 1 on any failure)
//
// 1. Every EVIDENCE key is a real trial id.
// 2. Every field holds an allowed value and every entry has sources.
// 3. The eight checks produce the expected grades for the pilot trials.
import { TRIALS } from '../src/data/trials.js';
import { EVIDENCE } from '../src/data/evidence.js';
import { appraiseTrial, summarizeForWorksheet, LEVELS } from '../src/engine/appraisal.js';

const ALLOWED = {
  masking: ['double-blind', 'single-blind', 'open-label', 'open-label-blinded-adjudication'],
  primaryEndpointType: ['mortality', 'hard-event', 'composite-hard', 'composite-with-hospitalization', 'hospitalization', 'surrogate', 'patient-reported'],
  design: ['superiority', 'noninferiority', 'noninferiority-then-superiority'],
  sponsor: ['industry', 'academic', 'government', 'mixed'],
  analysisPopulation: ['intention-to-treat', 'as-treated', 'per-protocol', 'modified-intention-to-treat'],
};

let failures = 0;
const fail = (msg) => { failures += 1; console.error(`  FAIL ${msg}`); };
const ok = (msg) => console.log(`  ok   ${msg}`);

const trialIds = new Set(TRIALS.map((t) => t.id));

console.log('Data integrity');
for (const [id, e] of Object.entries(EVIDENCE)) {
  if (!trialIds.has(id)) fail(`${id}: not a trial id in trials.js`);
  for (const [field, allowed] of Object.entries(ALLOWED)) {
    if (!allowed.includes(e[field])) fail(`${id}.${field} = ${JSON.stringify(e[field])} not in ${allowed.join('|')}`);
  }
  if (typeof e.sham !== 'boolean') fail(`${id}.sham must be boolean`);
  if (typeof e.procedural !== 'boolean') fail(`${id}.procedural must be boolean`);
  if (!e.enrollment || !Number.isInteger(e.enrollment.start) || !Number.isInteger(e.enrollment.end) || e.enrollment.end < e.enrollment.start) {
    fail(`${id}.enrollment must be { start, end } integers with end >= start`);
  }
  if (e.niMargin && !['hr', 'absolute-pct'].includes(e.niMargin.type)) fail(`${id}.niMargin.type invalid`);
  if (e.design !== 'superiority' && !e.niMargin) fail(`${id}: noninferiority design needs niMargin`);
  if (e.selection && !['info', 'caution'].includes(e.selection.level)) fail(`${id}.selection.level invalid`);
  if (!Array.isArray(e.sources) || e.sources.length === 0) fail(`${id}: needs at least one source`);
  for (const s of e.sources || []) if (!/^https?:\/\//.test(s.url)) fail(`${id}: source url invalid (${s.url})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.lastVerified || '')) fail(`${id}.lastVerified must be YYYY-MM-DD`);
}
if (failures === 0) ok(`${Object.keys(EVIDENCE).length} entries valid`);

console.log('Check logic (pilot expectations, evaluated as of 2026)');
const YEAR = { currentYear: 2026 };
const expect = (trialId, checkId, level) => {
  const a = appraiseTrial(trialId, YEAR);
  const c = a?.checks.find((x) => x.id === checkId);
  if (!c) return fail(`${trialId}/${checkId}: missing`);
  if (c.level !== level) return fail(`${trialId}/${checkId}: expected ${level}, got ${c.level} ("${c.summary}")`);
  ok(`${trialId}/${checkId} = ${level}`);
};

expect('aristotle', 'blinding', 'pass');
expect('aristotle', 'noninferiority', 'pass'); // wide margin, but superiority shown
expect('apaf', 'blinding', 'flag');            // open-label + surrogate
expect('apaf', 'endpoint', 'flag');
expect('mantra-paf', 'population', 'caution');
expect('pallas', 'blinding', 'pass');
expect('pallas', 'endpoint', 'pass');           // design passes; result was harm
expect('madit-ii', 'blinding', 'pass');         // open-label but mortality end point
expect('madit-ii', 'era', 'flag');              // comparator superseded
expect('coapt', 'blinding', 'caution');         // hospitalization end point
expect('partner-3', 'construction', 'caution'); // as-treated analysis
expect('partner-3', 'noninferiority', 'pass');

for (const id of Object.keys(EVIDENCE)) {
  const a = appraiseTrial(id, YEAR);
  if (a.checks.length !== 8) fail(`${id}: expected 8 checks`);
  for (const c of a.checks) {
    if (!LEVELS.includes(c.level)) fail(`${id}/${c.id}: bad level`);
    if (!c.summary || !c.why) fail(`${id}/${c.id}: missing summary or why`);
  }
}

console.log('Uncurated trials degrade gracefully');
const uncurated = TRIALS.find((t) => !EVIDENCE[t.id]);
if (uncurated) {
  if (appraiseTrial(uncurated.id) !== null) fail('appraiseTrial should return null for uncurated trials');
  else ok(`${uncurated.id} returns null`);
  if (!summarizeForWorksheet(uncurated, YEAR).includes('not yet curated')) fail('worksheet summary for uncurated trial');
}
const apaf = TRIALS.find((t) => t.id === 'apaf');
console.log(`\nSample worksheet line:\n  ${summarizeForWorksheet(apaf, YEAR)}\n`);

console.log(`Coverage: ${Object.keys(EVIDENCE).length} of ${TRIALS.length} trials curated`);
if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nAll evidence checks passed.');
