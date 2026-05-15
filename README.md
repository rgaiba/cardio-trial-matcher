# Cardiology Trial Match

[![DOI](https://img.shields.io/badge/DOI-10.5281%2Fzenodo.19803459-1f6feb)](https://doi.org/10.5281/zenodo.19803459)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/live-cardiologytrialmatch.org-16a34a)](https://cardiologytrialmatch.org)

An open-source, browser-based educational tool for evidence-based medicine. Users enter non-identifying clinical variables (NYHA class, LVEF, NT-proBNP, eGFR, comorbidities, current GDMT, etc.) and the app evaluates how well the patient matches the inclusion and exclusion criteria of landmark cardiology trials.

**Live site:** https://cardiologytrialmatch.org

**Status:** v1.0.0 (first production-ready release). Three topics populated: **heart failure** (17 trials across 4 groups), **atrial fibrillation** (13 trials across 3 groups), and **valvular disease** (9 trials across 2 groups). Coronary artery disease topic scaffolded for future expansion. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the trial-addition recipe.

## Disclaimer

This is an educational EBM tool intended for clinicians and trainees exploring how patients map onto landmark trial populations. It does not replace clinical judgment, individual chart review, or current society guidelines. The app does not store or transmit patient data; all evaluation runs in the browser. Inclusion and exclusion criteria are simplified summaries of published protocols; always consult the original publication before applying to clinical decisions.

## Trial library

Trials are organized into a two-level taxonomy: **topic** (a clinical domain) → **group** (a clinically meaningful subdivision) → individual trial. The current release covers three topics, **heart failure** (4 groups, 17 trials), **atrial fibrillation** (3 groups, 13 trials), and **valvular disease** (2 groups, 9 trials), for a total of **39 trials**.

The complete list with DOIs lives in [**TRIALS.md**](TRIALS.md) and is updated as new trials are added.

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

## Governance and contributions

The repository is open source under the MIT license; anyone may fork, modify, or redistribute. The canonical project at [github.com/rgaiba/cardio-trial-matcher](https://github.com/rgaiba/cardio-trial-matcher) follows a maintainer-reviewed contribution model:

- The `main` branch is protected. Direct pushes are not permitted, including by the maintainer.
- All changes go through a pull request, are reviewed by the maintainer (Rahul Gaiba), and require the deploy build to pass before merging.
- Issues and trial proposals use structured templates to ensure published criteria, DOI, and race composition are documented up front. See [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE).
- The [`CONTRIBUTING.md`](CONTRIBUTING.md) recipe walks through adding a trial, group, or topic without engine changes.

This model balances openness (anyone can propose a change) with clinical safety (no unreviewed trial data reaches the live site).

## Citation

If you use this software in academic work, please cite it. Citation metadata is in [`CITATION.cff`](CITATION.cff); GitHub renders it as a "Cite this repository" button on the project sidebar.

**DOI:** [10.5281/zenodo.19803459](https://doi.org/10.5281/zenodo.19803459) (concept DOI, always resolves to the latest version)

Suggested citation (APA):

> Gaiba, R. (2026). *Cardiology Trial Match: an interactive tool for matching patient profiles against landmark cardiology trial criteria* (Version 1.0.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.19803459

BibTeX:

```bibtex
@software{gaiba_cardiology_trial_match_2026,
  author       = {Gaiba, Rahul},
  title        = {Cardiology Trial Match: an interactive tool for matching
                  patient profiles against landmark cardiology trial criteria},
  version      = {1.0.0},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.19803459},
  url          = {https://doi.org/10.5281/zenodo.19803459}
}
```

The DOI above is the **concept DOI** — it always resolves to the latest released version. Each new GitHub release auto-mints a version-specific DOI; the v1.0.0 record carries DOI `10.5281/zenodo.19812465` and can be cited where exact-version reproducibility is required.

The full structured abstract (Background, Objectives, Methods, Results, Conclusions) is available as [`ABSTRACT.md`](ABSTRACT.md) for clinicians who prefer a journal-style summary, or directly on the [Zenodo record](https://doi.org/10.5281/zenodo.19803459).

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

## Privacy and HIPAA scope

This tool is designed to operate **outside the scope of HIPAA** by never accepting, storing, or transmitting protected health information.

Specific design choices that maintain this posture:

- **No PHI fields.** The patient input form accepts only de-identified clinical variables (NYHA class, LVEF, NT-proBNP, eGFR, current medications, comorbidities, etc.). There are no fields for name, MRN, date of birth, address, contact information, or any of the other 18 HIPAA identifiers.
- **No backend.** The site is a pure static page hosted on GitHub Pages. There is no server that receives, processes, or logs patient inputs. All evaluation runs entirely in the user's browser via JavaScript.
- **No data persistence.** Patient inputs live only in browser memory for the duration of the session. Closing the tab discards everything. Nothing is written to disk, browser storage, cookies, or any external service.
- **No tracking of clinical inputs.** The analytics service ([GoatCounter](https://goatcounter.com)) records anonymous aggregate events (which trial cards are opened, which topic is selected) but never receives any patient data. GoatCounter does not store IP addresses or use cookies.
- **Share button copies only the bare site URL.** A previous version encoded patient state into a URL parameter for case-sharing; this was removed because clinical variables in a shareable link is inappropriate even when no PHI is included. The Share button now copies `https://cardiologytrialmatch.org` only; patient inputs never leave the user's browser.
- **No accounts, no authentication, no logins.** Nothing identifies the user or links sessions across visits.
- **Open source.** The complete source code is available at [github.com/rgaiba/cardio-trial-matcher](https://github.com/rgaiba/cardio-trial-matcher) under the MIT license. Anyone can audit how patient data is handled.

**For institutional use:** if your hospital, residency program, or health system is considering linking to or embedding this tool in a clinical-education workflow, the above design means there is no PHI handling that requires a Business Associate Agreement. However, your institution's privacy or compliance office may still want to review the tool independently. The complete source code, deployment configuration, and analytics provider (GoatCounter) are all transparent and inspectable.

**Important reminder:** This tool is intended for **education**, not for clinical decision support in named patients. Even though no PHI is transmitted, users should not enter inputs that derive from a real, identified patient encounter outside of a documented educational use (case-based teaching, journal club, residency curriculum). When in doubt, use hypothetical or de-identified examples.

## License

Released under the [MIT License](LICENSE). You are free to use, modify, and distribute with attribution.
