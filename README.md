# Cardiology Trial Match

An educational tool that matches a hypothetical patient profile against the inclusion/exclusion criteria of landmark cardiology trials. Starts with **heart failure** trials and is designed to expand to other cardiology domains.

**This tool does not store any data, does not accept PHI, and is for educational purposes only.** Outputs are not clinical recommendations.

## What's included (v1)

### HFrEF foundational quartet
- **PARADIGM-HF** (2014): Sacubitril/Valsartan vs Enalapril
- **DAPA-HF** (2019): Dapagliflozin
- **EMPEROR-Reduced** (2020): Empagliflozin
- **EMPHASIS-HF** (2011): Eplerenone

### Older landmark medical-therapy trials
- **CONSENSUS** (1987): Enalapril in NYHA IV
- **SOLVD-Treatment** (1991): Enalapril
- **MERIT-HF** (1999): Metoprolol succinate
- **CIBIS-II** (1999): Bisoprolol
- **RALES** (1999): Spironolactone

### Device / advanced HF trials
- **MADIT-II** (2002): Prophylactic ICD
- **COMPANION** (2004): CRT-P / CRT-D
- **CARE-HF** (2005): CRT
- **STICH** (2011): CABG + medical therapy in ischemic CM

## How it works

1. User enters non-identifying clinical variables (NYHA class, LVEF, NT-proBNP, eGFR, comorbidities, current GDMT, etc.).
2. Each trial's inclusion and exclusion criteria are encoded as structured rules.
3. A match engine evaluates each criterion as **met / not met / unknown** and computes:
   - An overall **eligibility status** (Eligible / Partial / Excluded / Insufficient data)
   - A **match score** (% of inclusion criteria met, with exclusions zeroing out the score)
4. Results render as:
   - A **match-strength bar chart** sortable by best fit.
   - A **radar chart per trial** with one axis per criterion, showing which the patient meets.

## Local development

```bash
npm install
npm run dev
```

## Deployment to GitHub Pages

This repo ships with a GitHub Actions workflow that deploys to GitHub Pages on every push to `main`.

1. Push the repo to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source**: select **GitHub Actions**.
3. The workflow at `.github/workflows/deploy.yml` will build and publish.
4. If your repo is named something other than `cardio-trial-matcher`, update the `base` field in `vite.config.js` to match (e.g. `/your-repo-name/`).

## Adding a new trial

Drop a new entry into `src/data/trials.js` following the existing schema. Each criterion references a named evaluator from `src/engine/evaluators.js`. To add a new evaluator (e.g. for a new lab or device variable), add it there and reference it from the trial's criteria array.

## Citation

If you use this software in academic work, please cite it. Citation metadata is available in [`CITATION.cff`](CITATION.cff) (GitHub renders it as a "Cite this repository" button on the project sidebar).

Suggested citation (APA):

> Gaiba, R. (2026). *Cardiology Trial Match: an interactive tool for matching patient profiles against landmark cardiology trial criteria* (Version 0.2.0) [Computer software]. https://github.com/rgaiba/cardio-trial-matcher

For a permanent, version-pinned DOI, link this repository to [Zenodo](https://zenodo.org) and tag a release. Each tagged release will mint its own DOI.

## Author

**Rahul Gaiba, MD** ([ORCID: 0000-0002-3256-1860](https://orcid.org/0000-0002-3256-1860))
Bayhealth Medical Center, Kent Campus, Dover, Delaware, USA

## License

Released under the [MIT License](LICENSE). You are free to use, modify, and distribute with attribution.

## Disclaimer

This is an educational EBM tool intended for clinicians and trainees exploring how their patients map onto landmark trial populations. It does not replace clinical judgment, individual chart review, or current society guidelines. Inclusion/exclusion encoding represents a faithful but simplified summary of published protocols.
