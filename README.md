# Cardiology Trial Match

[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.19803460-1f6feb)](https://doi.org/10.5281/zenodo.19803460)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/live-cardiologytrialmatch.org-16a34a)](https://cardiologytrialmatch.org)

An open-source, browser-based educational tool for evidence-based medicine. Users enter non-identifying clinical variables (NYHA class, LVEF, NT-proBNP, eGFR, comorbidities, current GDMT, etc.) and the app evaluates how well the patient matches the inclusion and exclusion criteria of landmark cardiology trials.

**Live site:** https://cardiologytrialmatch.org

**Status:** v0.3.0. Two topics populated: **heart failure** (17 trials across 4 groups) and **atrial fibrillation** (13 trials across 3 groups). Coronary artery disease topic scaffolded for future expansion. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the trial-addition recipe.

## Disclaimer

This is an educational EBM tool intended for clinicians and trainees exploring how patients map onto landmark trial populations. It does not replace clinical judgment, individual chart review, or current society guidelines. The app does not store or transmit patient data; all evaluation runs in the browser. Inclusion and exclusion criteria are simplified summaries of published protocols; always consult the original publication before applying to clinical decisions.

## Trial library (v0.3.0)

Trials are organized into a two-level taxonomy: **topic** (a clinical domain) → **group** (a clinically meaningful subdivision) → individual trial. The current release contains two topics: **heart failure** (4 groups, 17 trials) and **atrial fibrillation** (3 groups, 13 trials).

## Heart failure

### HFrEF foundational quartet

The four pillars of guideline-directed medical therapy for HFrEF: ARNI, SGLT2 inhibition, beta-blockade, and MRA.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| PARADIGM-HF | 2014 | Sacubitril/valsartan vs enalapril | [10.1056/NEJMoa1409077](https://doi.org/10.1056/NEJMoa1409077) |
| DAPA-HF | 2019 | Dapagliflozin vs placebo | [10.1056/NEJMoa1911303](https://doi.org/10.1056/NEJMoa1911303) |
| EMPEROR-Reduced | 2020 | Empagliflozin vs placebo | [10.1056/NEJMoa2022190](https://doi.org/10.1056/NEJMoa2022190) |
| EMPHASIS-HF | 2011 | Eplerenone vs placebo | [10.1056/NEJMoa1009492](https://doi.org/10.1056/NEJMoa1009492) |

### Older landmark medical therapies

Foundational mortality trials that established ACE inhibitors, beta-blockers, and MRAs in HFrEF.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| CONSENSUS | 1987 | Enalapril in NYHA IV | [10.1056/NEJM198706043162301](https://doi.org/10.1056/NEJM198706043162301) |
| SOLVD-Treatment | 1991 | Enalapril | [10.1056/NEJM199108013250501](https://doi.org/10.1056/NEJM199108013250501) |
| MERIT-HF | 1999 | Metoprolol succinate | [10.1016/S0140-6736(99)04440-2](https://doi.org/10.1016/S0140-6736(99)04440-2) |
| CIBIS-II | 1999 | Bisoprolol | [10.1016/S0140-6736(98)11181-9](https://doi.org/10.1016/S0140-6736(98)11181-9) |
| RALES | 1999 | Spironolactone | [10.1056/NEJM199909023411001](https://doi.org/10.1056/NEJM199909023411001) |

### Device, CRT, and surgical trials

Trials of implantable defibrillators, cardiac resynchronization therapy, and surgical revascularization in HFrEF.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| MADIT-II | 2002 | Prophylactic ICD | [10.1056/NEJMoa013474](https://doi.org/10.1056/NEJMoa013474) |
| COMPANION | 2004 | CRT-P / CRT-D | [10.1056/NEJMoa032423](https://doi.org/10.1056/NEJMoa032423) |
| CARE-HF | 2005 | CRT | [10.1056/NEJMoa050496](https://doi.org/10.1056/NEJMoa050496) |
| STICH | 2011 | CABG + medical therapy | [10.1056/NEJMoa1100356](https://doi.org/10.1056/NEJMoa1100356) |

### HFpEF trials

Trials in heart failure with preserved or mildly reduced ejection fraction.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| TOPCAT | 2014 | Spironolactone vs placebo | [10.1056/NEJMoa1313731](https://doi.org/10.1056/NEJMoa1313731) |
| PARAGON-HF | 2019 | Sacubitril/valsartan vs valsartan | [10.1056/NEJMoa1908655](https://doi.org/10.1056/NEJMoa1908655) |
| EMPEROR-Preserved | 2021 | Empagliflozin vs placebo | [10.1056/NEJMoa2107038](https://doi.org/10.1056/NEJMoa2107038) |
| DELIVER | 2022 | Dapagliflozin vs placebo | [10.1056/NEJMoa2206286](https://doi.org/10.1056/NEJMoa2206286) |

## Atrial fibrillation

### Anticoagulation trials

Trials of warfarin, aspirin, and direct oral anticoagulants for stroke prevention in AF.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| ARISTOTLE | 2011 | Apixaban vs warfarin | [10.1056/NEJMoa1107039](https://doi.org/10.1056/NEJMoa1107039) |
| RE-LY | 2009 | Dabigatran vs warfarin | [10.1056/NEJMoa0905561](https://doi.org/10.1056/NEJMoa0905561) |
| ROCKET-AF | 2011 | Rivaroxaban vs warfarin | [10.1056/NEJMoa1009638](https://doi.org/10.1056/NEJMoa1009638) |
| SPAF | 1991 | Warfarin or aspirin vs placebo | [10.1161/01.CIR.84.2.527](https://doi.org/10.1161/01.CIR.84.2.527) |
| SPAF-II | 1994 | Warfarin vs aspirin (by age) | [10.1016/S0140-6736(94)91577-6](https://doi.org/10.1016/S0140-6736(94)91577-6) |
| SPAF-III | 1996 | Adjusted-dose vs low-dose warfarin + aspirin | [10.1016/S0140-6736(96)03487-3](https://doi.org/10.1016/S0140-6736(96)03487-3) |

### Rate and rhythm control trials

Trials comparing rate vs rhythm control strategies, lenient vs strict rate control, and antiarrhythmic drug therapy.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| AFFIRM | 2002 | Rhythm vs rate control | [10.1056/NEJMoa021328](https://doi.org/10.1056/NEJMoa021328) |
| RACE-II | 2010 | Lenient vs strict rate control | [10.1056/NEJMoa1001337](https://doi.org/10.1056/NEJMoa1001337) |
| ATHENA | 2009 | Dronedarone vs placebo | [10.1056/NEJMoa0803778](https://doi.org/10.1056/NEJMoa0803778) |
| PALLAS | 2011 | Dronedarone in permanent AF (harm) | [10.1056/NEJMoa1109867](https://doi.org/10.1056/NEJMoa1109867) |

### Catheter ablation trials

Trials of pulmonary vein isolation and radiofrequency ablation for paroxysmal AF.

| Trial | Year | Intervention | Citation |
|---|---|---|---|
| APAF | 2006 | Circumferential PVA vs antiarrhythmic drugs | [10.1016/j.jacc.2006.08.037](https://doi.org/10.1016/j.jacc.2006.08.037) |
| ThermoCool-AF | 2010 | RF catheter ablation vs antiarrhythmic drugs | [10.1001/jama.2009.2029](https://doi.org/10.1001/jama.2009.2029) |
| MANTRA-PAF | 2012 | RF ablation vs first-line antiarrhythmic drugs | [10.1056/NEJMoa1113566](https://doi.org/10.1056/NEJMoa1113566) |

## How matching works

### Patient input model

The patient state is a plain object containing only clinical variables. No identifiers, no PHI. Any field the user leaves blank is treated as `unknown`, not as failing.

```js
{
  age: 64, sex: 'M', nyhaClass: 3, lvef: 28,
  ntProBnp: 1850, egfr: 52, sbp: 118, hr: 78, qrs: 138,
  potassium: 4.4, sodium: 138, hemoglobin: 12.8, creatinine: 1.3,
  rhythm: 'sinus',
  comorbidities: { diabetes: 'type2', afib: false, htn: true, priorMI: true, ... },
  recent: { miWithinMonths: 18, hfHospWithinMonths: 4, ... },
  meds: { aceArb: true, betaBlocker: true, mra: false, sglt2i: false, loopDiuretic: true, ... }
}
```

### Criterion evaluators

Each trial criterion is a structured object that references a named evaluator function. Evaluators live in `src/engine/evaluators.js` and return one of three values:

- `'met'` — patient satisfies the criterion as written
- `'not_met'` — patient does not satisfy
- `'unknown'` — required input is missing

Example: PARADIGM-HF's NT-proBNP rule is encoded as

```js
{
  id: 'natriuretic',
  label: 'NT-proBNP ≥600 pg/mL (or ≥400 if HF hospitalization within 12 mo); or BNP ≥150 (≥100 if recent hospitalization)',
  evaluator: 'natriureticParadigm',
  params: {},
}
```

The `natriureticParadigm` evaluator inspects `patient.ntProBnp`, `patient.bnp`, and `patient.recent.hfHospWithinMonths` and applies the threshold logic from the published protocol.

Reusable evaluators handle simple checks (`ageGte`, `lvefLte`, `egfrLt`, `sbpLt`, `nyhaIn`, `onMed`, `onAllMeds`, `comorbidityPresent`, etc.); trial-specific evaluators handle composite biomarker rules.

### Match score and status

`evaluateTrial(trial, patient)` produces:

- `matchScore` (0–100): percent of inclusion criteria met. Unknowns count as half-credit. Any met exclusion drops the score to 0.
- `status` — one of:
  - **Eligible** — every inclusion is met, no exclusion is met, no unknowns.
  - **Partial match** — some inclusion criteria met or unknown, no exclusion triggered.
  - **Excluded** — at least one exclusion criterion is met, OR every inclusion is explicitly not met.
  - **Insufficient data** — too many criteria are unknown to determine eligibility.

Status carries a color in the dashboard: green (eligible), amber (partial), red (excluded), gray (insufficient).

### NNT caveat

When a trial is anything other than 100% eligible, the trial card surfaces a small note under NNT: *"NNT increases when trial results are applied to lower-risk populations."* This is a standard EBM caution: the published NNT applies to the trial population; patients who differ from that population (especially toward lower baseline risk) typically have higher NNTs in practice.

## Visualizations

- **Match-strength bar chart** at the top: overview of all trials, sorted by best fit, color-coded by status. Click a bar to jump to that trial's card.
- **Per-trial radar chart**: each axis is one inclusion or exclusion criterion. The plot fills the outer ring when criteria are met (or when exclusions are correctly absent), drops to the center when not met or actively excluded, and sits at the middle for unknowns. Long axis labels wrap onto multiple lines automatically.
- **Race composition bar**: minimalist horizontal stacked bar for each trial's enrolled population. Trials where the original publication did not formally report race show a striped placeholder with explanatory text.
- **Status filter chips**: the four counts at the top of the results panel act as toggles to filter the cards by eligibility status.
- **Share button**: encodes the current patient profile into a URL parameter. Anyone opening the link gets the form pre-filled with the same case. No data leaves the browser; encoding is base64-of-JSON, client-side only.

## Architecture

### Taxonomy

Defined at the top of `src/data/trials.js`:

```js
TOPICS         — top-level clinical domains (e.g., heart-failure)
TRIAL_GROUPS   — clinically meaningful subdivisions within a topic
TRIALS         — individual trial entries, each tagged with topicId + groupId
```

Adding a topic, group, or trial is purely additive; the dashboard discovers the new entry automatically and renders it under the right section header.

### File structure

```
cardio-trial-matcher/
├── src/
│   ├── App.jsx                      Top-level layout, topbar, footer
│   ├── main.jsx                     React entry
│   ├── styles.css                   All styles, including mobile media queries
│   ├── data/
│   │   ├── trials.js                TOPICS, TRIAL_GROUPS, all trial objects
│   │   └── demographics.js          Race composition data per trial
│   ├── engine/
│   │   ├── evaluators.js            Named evaluator functions (met/not_met/unknown)
│   │   ├── matchEngine.js           Trial evaluation + status logic
│   │   └── serialize.js             URL-encode/decode patient state for sharing
│   └── components/
│       ├── PatientForm.jsx          Tabbed input form
│       ├── ResultsDashboard.jsx     Status filter + bar chart + grouped sections
│       ├── MatchBarChart.jsx        Overview bar chart (Recharts)
│       ├── TrialCard.jsx            Per-trial card with stats + race bar + criteria
│       ├── TrialRadarChart.jsx      Per-trial radar with custom multi-line ticks
│       └── RaceBar.jsx              Race composition stacked bar
├── scripts/
│   ├── smoke.mjs                    End-to-end test with sample HFrEF patient
│   └── smoke-hfpef.mjs              End-to-end test with HFpEF patient + URL roundtrip
├── .github/workflows/deploy.yml     Auto-deploy to GitHub Pages on push to main
├── CITATION.cff                     GitHub-renderable citation metadata
├── LICENSE                          MIT
├── README.md                        This file
├── package.json
├── vite.config.js
└── index.html
```

## How to extend

### Add a new trial to an existing group

Append a trial object to the `TRIALS` array in `src/data/trials.js`:

```js
{
  id: 'my-new-trial',
  topicId: 'heart-failure',
  groupId: 'hfref-foundational',  // must match an id in TRIAL_GROUPS
  name: 'TRIAL-NAME',
  fullName: 'Full trial name as published',
  year: 2025,
  category: 'HFrEF medication',
  intervention: 'Drug X vs placebo',
  population: 'HFrEF, NYHA II–IV, EF ≤40%',
  nEnrolled: 5000,
  primaryEndpoint: 'CV death or HF hospitalization',
  primaryResult: 'HR 0.78 (95% CI 0.69–0.88)',
  pValue: '<0.001',
  arr: '4.5%',
  nnt: '22 over 24 months',
  citation: 'AuthorAB et al. N Engl J Med 2025;XXX:YYY',
  doi: '10.1056/NEJMoaXXXXXXX',
  url: 'https://doi.org/10.1056/NEJMoaXXXXXXX',
  keyTakeaway: 'One-sentence editorial summary.',
  inclusion: [
    { id: 'age', label: 'Age ≥18', evaluator: 'ageGte', params: { min: 18 } },
    // ...
  ],
  exclusion: [
    { id: 'egfr', label: 'eGFR <30', evaluator: 'egfrLt', params: { threshold: 30 } },
    // ...
  ],
}
```

Then add the trial's race composition to `src/data/demographics.js`:

```js
'my-new-trial': { white: 70, asian: 15, black: 8, other: 7 },
```

That's it. The dashboard, bar chart, radar, and race bar all update automatically.

### Add a new evaluator

If a trial uses a clinical variable not yet in the engine (e.g., a new biomarker, a new device parameter), add an evaluator to `src/engine/evaluators.js`:

```js
myNewEvaluator: (patient, { threshold }) => {
  if (typeof patient.myField !== 'number') return 'unknown';
  return patient.myField >= threshold ? 'met' : 'not_met';
},
```

If the input variable is also new, add it to:
- `src/components/PatientForm.jsx` `EMPTY_PATIENT` and the appropriate tab
- `src/engine/serialize.js` (it'll be picked up automatically because the serializer walks the patient object)

### Add a new group within heart failure

Append to the `TRIAL_GROUPS` array in `src/data/trials.js`:

```js
{
  id: 'hf-mechanical-support',
  topicId: 'heart-failure',
  label: 'Mechanical circulatory support',
  description: 'Trials of LVAD, percutaneous support devices, and transplantation.',
  order: 5,  // sort order within the topic
}
```

Then tag the relevant trials with `groupId: 'hf-mechanical-support'`.

### Add a new topic (e.g., atrial fibrillation, CAD)

The taxonomy is designed for this. Three steps:

1. Add a topic entry to `TOPICS`:

   ```js
   { id: 'atrial-fibrillation', label: 'Atrial fibrillation', badge: 'AFib' }
   ```

2. Add the relevant groups to `TRIAL_GROUPS`:

   ```js
   { id: 'afib-anticoagulation', topicId: 'atrial-fibrillation', label: 'Anticoagulation trials',
     description: '...', order: 1 },
   { id: 'afib-rhythm-control', topicId: 'atrial-fibrillation', label: 'Rhythm control trials',
     description: '...', order: 2 },
   // etc.
   ```

3. Add the trial entries with the new `topicId` and `groupId` values.

The current dashboard renders all topics together in one view. A future enhancement could add a topic-selector in the topbar.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → ./dist
```

Smoke tests run with plain Node (no build step):

```bash
node scripts/smoke.mjs        # HFrEF sample patient
node scripts/smoke-hfpef.mjs  # HFpEF sample patient + share-URL roundtrip
```

## Deployment

The repo ships with a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and publishes to GitHub Pages on every push to `main`.

To deploy your fork:

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment → Source**: select **GitHub Actions**.
3. Tag a release on GitHub when you want a citable snapshot (this also triggers the Zenodo DOI mint if you've connected the repo to Zenodo).

If your fork has a different repository name, no `vite.config.js` change is needed because `base` is set to `'./'` (relative paths).

## Citation

If you use this software in academic work, please cite it. Citation metadata is in [`CITATION.cff`](CITATION.cff); GitHub renders it as a "Cite this repository" button on the project sidebar.

**DOI:** [10.5281/zenodo.19803460](https://doi.org/10.5281/zenodo.19803460)

Suggested citation (APA):

> Gaiba, R. (2026). *Cardiology Trial Match: an interactive tool for matching patient profiles against landmark cardiology trial criteria* (Version 0.3.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.19803460

BibTeX:

```bibtex
@software{gaiba_cardiology_trial_match_2026,
  author       = {Gaiba, Rahul},
  title        = {Cardiology Trial Match: an interactive tool for matching
                  patient profiles against landmark cardiology trial criteria},
  version      = {0.3.0},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.19803460},
  url          = {https://doi.org/10.5281/zenodo.19803460}
}
```

The DOI above is the **concept DOI** — it always resolves to the latest released version. Each new GitHub release auto-mints its own version-specific DOI; both can be cited.

## Author

**Rahul Gaiba, MD** ([ORCID: 0000-0002-3256-1860](https://orcid.org/0000-0002-3256-1860))
Bayhealth Medical Center, Kent Campus, Dover, Delaware, USA

## Contributing

Contributions are welcome, especially:

- New trials within the existing groups (heart failure)
- New groups within heart failure (e.g., mechanical circulatory support, advanced HF)
- New topics (atrial fibrillation, coronary artery disease, lipid trials, hypertension trials)
- Verified race/demographic data for trials currently marked "not reported"
- Translations of trial criteria to other clinical settings

Open a pull request with the trial data + a citation to the published baseline characteristics paper. The matching engine and visualizations require no changes — they discover new entries automatically.

## License

Released under the [MIT License](LICENSE). You are free to use, modify, and distribute with attribution.
