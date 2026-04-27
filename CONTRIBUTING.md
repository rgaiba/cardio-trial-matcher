# Contributing a trial to Cardiology Trial Match

This is a step-by-step recipe for clinicians who want to add a landmark trial to the app. Save this file or its URL — it's the canonical instruction set.

There are three levels of additions, ordered by effort:

1. **Add a trial to an existing group** (10–20 minutes per trial)
2. **Add a new group within an existing topic** (5 minutes + the trials)
3. **Add a whole new topic** (15 minutes of taxonomy work + the trials)

The matching engine and the dashboard discover everything automatically — you only edit data files. No engine code changes needed unless your trial uses a clinical variable not yet in the patient form.

---

## Before you start

You need:

- The original published trial paper (or its supplement) for inclusion/exclusion criteria, primary endpoint, NNT/ARR, and baseline race composition
- The DOI (always cite the DOI form: `https://doi.org/<doi>`)
- A short editorial "key takeaway" sentence in your own words
- ~15 minutes per trial

Files you'll touch:

- `src/data/trials.js` — the trial entry itself (and the topic/group taxonomy if extending)
- `src/data/demographics.js` — race/ethnicity composition
- `src/components/PatientForm.jsx` — only if your trial needs a new clinical input
- `src/engine/evaluators.js` — only if a criterion needs a new evaluation function

---

## Recipe 1: Add a trial to an existing group

### Step 1.1 — Verify the DOI

Look up the trial on PubMed. The DOI appears in the citation block, e.g. `10.1056/NEJMoaXXXXXXX`. The full URL form is `https://doi.org/<doi>`. Always use this form so the link survives if the journal changes its URL structure.

### Step 1.2 — Identify the right group

Open `src/data/trials.js` and look at the `TRIAL_GROUPS` array near the top. Pick the group whose `id` best fits your trial. Note both the `topicId` and `groupId` you'll use.

### Step 1.3 — Encode the trial

Append a new object to the `TRIALS` array. Use this template (copy-paste, then fill in):

```js
{
  id: 'trial-id-kebab-case',           // unique id, lowercase with hyphens
  topicId: 'heart-failure',             // must match a TOPICS id
  groupId: 'hfref-foundational',        // must match a TRIAL_GROUPS id
  name: 'TRIAL-NAME',                   // canonical name as published (preserve internal hyphens, e.g. DAPA-HF, EMPEROR-Reduced)
  fullName: 'Full Name as Published',
  year: 2024,
  category: 'HFrEF medication',         // short label shown if no group context
  intervention: 'Drug X 10 mg vs placebo',
  population: 'HFrEF, NYHA II–IV, EF ≤40%',
  nEnrolled: 5000,
  primaryEndpoint: 'CV death or HF hospitalization',
  primaryResult: 'HR 0.78 (95% CI 0.69–0.88)',
  pValue: '<0.001',
  arr: '4.5% over 24 months',
  nnt: '22 over 24 months',             // or 'Not applicable' for negative trials
  citation: 'AuthorAB et al. N Engl J Med 2024;XXX:YYY',
  doi: '10.1056/NEJMoaXXXXXXX',
  url: 'https://doi.org/10.1056/NEJMoaXXXXXXX',
  keyTakeaway: 'One-sentence editorial summary in your own words.',
  inclusion: [
    { id: 'age', label: 'Age ≥18 years',
      evaluator: 'ageGte', params: { min: 18 } },
    { id: 'nyha', label: 'NYHA class II–IV',
      evaluator: 'nyhaIn', params: { classes: [2, 3, 4] } },
    { id: 'lvef', label: 'LVEF ≤40%',
      evaluator: 'lvefLte', params: { max: 40 } },
    // ... add one entry per published inclusion criterion
  ],
  exclusion: [
    { id: 'egfr', label: 'eGFR <30 mL/min/1.73m²',
      evaluator: 'egfrLt', params: { threshold: 30 } },
    // ... add one entry per published exclusion criterion
  ],
},
```

### Step 1.4 — Add the race composition

Open `src/data/demographics.js` and append an entry keyed by your trial's `id`:

```js
'trial-id-kebab-case': {
  white: 70,
  asian: 15,
  black: 8,
  other: 7,
  notes: '',  // optional caveat
},
```

If the trial didn't formally report race (common for pre-2000 European trials), use:

```js
'trial-id-kebab-case': {
  notReported: true,
  notes: 'European multi-center trial; race not formally reported. Population was predominantly White.',
},
```

### Step 1.5 — Test

Run the smoke test:

```bash
node scripts/smoke.mjs       # sample HFrEF patient
node scripts/smoke-afib.mjs  # sample AF patient
```

Confirm your new trial appears, has a sensible match score, and doesn't crash. Open `npm run dev` and visit the app to verify it renders correctly.

### Step 1.6 — Commit

Commit message format: `Add <TRIAL-NAME> to <group-name>`. Push.

---

## Recipe 2: Add a new group within an existing topic

If your new trial doesn't fit any existing group (e.g., a mechanical circulatory support trial in heart failure), add a group first.

### Step 2.1 — Append to TRIAL_GROUPS

In `src/data/trials.js`:

```js
{
  id: 'hf-mechanical-support',
  topicId: 'heart-failure',
  label: 'Mechanical circulatory support',
  description: 'Trials of LVAD, percutaneous support devices, and transplantation in advanced heart failure.',
  order: 8,    // must be unique within the topic; controls section ordering
}
```

### Step 2.2 — Tag your trials

Use the new `groupId` when you add trial entries (Recipe 1, Step 1.3).

### Step 2.3 — Commit

`Add <group-name> group with <N> trials`. Push.

---

## Recipe 3: Add a new topic (e.g., coronary artery disease)

Three steps to scaffold a new clinical domain.

### Step 3.1 — Append to TOPICS

In `src/data/trials.js`:

```js
{
  id: 'cad',
  label: 'Coronary artery disease',
  badge: 'CAD',
}
```

### Step 3.2 — Append the relevant groups to TRIAL_GROUPS

```js
{ id: 'cad-stable-revasc', topicId: 'cad', label: 'Stable CAD revascularization',
  description: 'Trials comparing PCI, CABG, and medical therapy in stable CAD.',
  order: 8 },
{ id: 'cad-acs-antiplatelet', topicId: 'cad', label: 'ACS antiplatelet trials',
  description: 'Trials of aspirin, P2Y12 inhibitors, and anticoagulants in acute coronary syndromes.',
  order: 9 },
// add as many groups as your topic needs
```

### Step 3.3 — If your topic needs new clinical inputs

Most topics need at least some new patient fields. For example, CAD trials might need:

- Anginal class (CCS I–IV)
- TIMI risk score components
- Troponin status
- ECG findings (ST changes)
- Prior PCI history

Add the fields to `EMPTY_PATIENT` in `src/components/PatientForm.jsx`, then add a new tab to the form and matching evaluators in `src/engine/evaluators.js`. See the AF tab as a worked example.

### Step 3.4 — Add the trials

Each trial uses the new `topicId`. See Recipe 1 for the trial-entry template.

### Step 3.5 — Test, commit, tag a release

After verifying everything works, tag a new GitHub release (e.g., `v0.4.0`). This auto-mints a new Zenodo DOI for the version that includes your new topic.

---

## Choosing evaluators

Most criteria use one of these built-in evaluators. Look at `src/engine/evaluators.js` for the full list with parameter shapes.

**Demographics:** `ageGte`, `ageGt`, `ageBetween`

**Functional:** `nyhaIn` (NYHA classes as array)

**LVEF:** `lvefLte`, `lvefLt`, `lvefGte`

**BP / HR:** `sbpLt`, `sbpGte`, `hrLt`, `hrGte`, `hrGt`

**Labs:** `egfrLt`, `potassiumGt`, `creatinineGt`

**Conduction:** `qrsGte`, `rhythmIs`

**Medications:** `onMed`, `onAllMeds`

**Comorbidities:** `comorbidityPresent`, `diabetesTypeIs`

**Recent events:** `recentEventWithin` (for "MI within 3 months" type rules), `recentEventNotWithin` (for "prior MI ≥1 month ago")

**AF-specific:** `afibTypeIn`, `afibSymptomatic`, `priorAblation`, `noPriorAblation`, `priorAADFailure`, `noPriorAAD`, `hasAnyRiskFactor`, `rocketAfRisk`

**Composite biomarker rules** (each trial has its own): `natriureticParadigm`, `natriureticDapa`, `natriureticEmperor`, `natriureticEmperorPreserved`, `natriureticDeliver`, `natriureticTopcat`, `natriureticParagon`, `hospOrNatriureticEmphasis`, `lvefEmphasis`

---

## When you need a new evaluator

If your trial's inclusion criterion needs logic that doesn't exist yet, add a new function to `src/engine/evaluators.js`. The contract is simple:

```js
myNewEvaluator: (patient, params) => {
  // Inspect patient.<field> and return one of:
  // 'met'      — patient satisfies the criterion
  // 'not_met'  — patient does not satisfy
  // 'unknown'  — required input is missing
  if (typeof patient.myField !== 'number') return 'unknown';
  return patient.myField >= params.threshold ? 'met' : 'not_met';
},
```

Then reference it from your trial's criterion array:

```js
{ id: 'myCriterion', label: 'My criterion as published',
  evaluator: 'myNewEvaluator', params: { threshold: 100 } }
```

If your evaluator inspects a patient field that doesn't exist yet, also:

1. Add the field to `EMPTY_PATIENT` in `src/components/PatientForm.jsx`
2. Add a form input for it in the appropriate tab (Core / Comorbidities / Medications / Labs / AF, or a new tab)

---

## Style and accuracy

- **Trial names:** preserve the canonical capitalization and hyphens as published (PARADIGM-HF, DAPA-HF, EMPEROR-Reduced, MERIT-HF, ROCKET-AF). Never "PARADIGMHF" or "rocket-af".
- **Population strings:** use clinical shorthand, en-dashes for ranges (NYHA II–IV, EF 40–55%).
- **No em-dashes.** Use semicolons, periods, or parentheticals (journal convention).
- **Result strings:** "HR 0.78 (95% CI 0.69–0.88)" format. Include CI and p-value.
- **NNT format:** "22 over 24 months" or "Not applicable" for negative trials.
- **Race percentages should sum to 100.** Use `notReported: true` for trials where original publication didn't formally report race; don't fabricate numbers.
- **Key takeaway:** one sentence, your own editorial summary. Avoid plagiarizing the abstract.

---

## What if the trial uses a clinical variable I don't think we have?

Check `src/components/PatientForm.jsx` `EMPTY_PATIENT` first — there's a lot already. Common variables:

- Age, sex, NYHA class, LVEF
- NT-proBNP, BNP
- eGFR, potassium, sodium, creatinine, hemoglobin
- SBP, HR, QRS, rhythm
- Diabetes type, atrial fibrillation, hypertension, prior MI, COPD, angioedema, severe valve disease, CAD amenable to CABG, left main ≥50%, CCS angina ≥III
- AF type, symptomatic AF, prior ablation, prior AAD failure, prior stroke/TIA, vascular disease, mitral stenosis, mechanical valve
- Recent events: MI, HF hosp, CABG/PCI, stroke (months since)
- Medications: ACEi/ARB, ARNI, beta-blocker, MRA, SGLT2i, loop diuretic, ivabradine, digoxin

If you genuinely need something new (e.g., LDL-C for a lipid trial, BMI for an obesity trial), add it as described in "When you need a new evaluator" above.

---

## Citation and credit

Trial data added by contributors will be visible to anyone using the tool. By submitting a contribution, you agree it can be released under the project's MIT license. Substantial contributions (e.g., adding an entire topic or 5+ trials in one PR) will be credited in the README acknowledgments.

---

## Quick reference card

For the impatient:

1. Find DOI, criteria, race composition from the trial paper
2. Pick `topicId` and `groupId` (or create new ones)
3. Append trial object to `TRIALS` in `src/data/trials.js`
4. Append demographics object to `DEMOGRAPHICS` in `src/data/demographics.js`
5. Run `node scripts/smoke.mjs` and `node scripts/smoke-afib.mjs`
6. `npm run dev` to verify visually
7. Commit, push, the deploy workflow handles the rest
