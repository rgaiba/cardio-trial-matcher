# Cardiology Trial Match: an interactive tool for matching patient profiles against landmark cardiology trial criteria
#Abstract

> **Citable as:** Gaiba, R. (2026). *Cardiology Trial Match: an interactive tool for matching patient profiles against landmark cardiology trial criteria* (Version 1.0.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.19803459
>
> **Live site:** [cardiologytrialmatch.org](https://cardiologytrialmatch.org)
> **Concept DOI** (always latest): [10.5281/zenodo.19803459](https://doi.org/10.5281/zenodo.19803459)
> **Version 1.0.0 DOI:** [10.5281/zenodo.19812465](https://doi.org/10.5281/zenodo.19812465)
> **Author:** Rahul Gaiba, MD ([ORCID 0000-0002-3256-1860](https://orcid.org/0000-0002-3256-1860)), Bayhealth Medical Center, Kent Campus, Dover, Delaware, USA
> **License:** MIT

---

## Background

Application of evidence from landmark cardiology trials to individual patients requires comparing each patient against each trial's published inclusion and exclusion criteria, an exercise that is time-consuming and often impractical in routine clinical practice and education. Existing risk calculators report composite scores but do not surface trial-level eligibility, the trial population enrolled, or the distance between an individual patient and the populations from which the evidence was derived.

## Objectives

To provide a free, openly licensed educational tool that maps clinician-entered, non-identifying patient variables onto the published criteria of landmark heart failure and atrial fibrillation trials, with explicit display of trial population, racial and ethnic composition, key efficacy estimates, outlining the limitations of trial-to-patient extrapolation.

## Methods

Inclusion and exclusion criteria of 30 landmark trials were encoded across two clinical topics:

- **Heart failure (n = 17)**, comprising the HFrEF foundational quartet (PARADIGM-HF, DAPA-HF, EMPEROR-Reduced, EMPHASIS-HF), older landmark medical-therapy trials (CONSENSUS, SOLVD-T, MERIT-HF, CIBIS-II, RALES), device and surgical trials (MADIT-II, COMPANION, CARE-HF, STICH), and HFpEF trials (TOPCAT, PARAGON-HF, EMPEROR-Preserved, DELIVER).
- **Atrial fibrillation (n = 13)**, comprising anticoagulation (ARISTOTLE, RE-LY, ROCKET-AF, SPAF, SPAF-II, SPAF-III), rate and rhythm control (AFFIRM, RACE-II, ATHENA, PALLAS), and catheter ablation (APAF, ThermoCool-AF, MANTRA-PAF) trials.

Each criterion is evaluated as **met**, **not met**, or **unknown**. The per-trial match score is computed from criteria with known patient data only; any met exclusion criterion reduces the score to zero. All evaluation runs in the user's browser. The application accepts no protected health information, transmits no clinical inputs, and persists no data.

## Results

The tool presents an overview bar chart of match scores across trials, per-trial radar plots of inclusion-criterion coverage, a structured display of inclusion and exclusion criteria with result-coded indicators, the racial and ethnic composition of each trial population, and primary endpoint results including hazard ratio, absolute risk reduction, and number needed to treat where applicable. Each trial is linked to the original publication by DOI. A standardized methods caption clarifies that match scores reflect protocol-level eligibility only and do not predict clinical benefit, which depends on factors beyond the encoded criteria, including unmeasured comorbidities, frailty, and individual context.

## Conclusions

Cardiology Trial Match operationalizes the published eligibility criteria of 30 landmark heart failure and atrial fibrillation trials at the point of teaching or case discussion, with explicit acknowledgment of the gap between protocol-level match and real-world benefit. The tool is free, MIT-licensed, and designed to operate outside the scope of HIPAA. Its open two-level taxonomy permits additive extensions to additional cardiology domains without modifying the matching engine. Live at [cardiologytrialmatch.org](https://cardiologytrialmatch.org).

---

## For clinicians: what to do next

- **Try the tool:** [cardiologytrialmatch.org](https://cardiologytrialmatch.org). Enter a hypothetical patient and watch the match scores update in real time across all 30 encoded trials.
- **Cite it:** Use the concept DOI [`10.5281/zenodo.19803459`](https://doi.org/10.5281/zenodo.19803459) — it always resolves to the latest version. Use the version-specific DOI [`10.5281/zenodo.19812465`](https://doi.org/10.5281/zenodo.19812465) when exact-version reproducibility matters (e.g., methods sections).
- **Flag errors or suggest improvements:** Email [rahulgaiba@gmail.com](mailto:rahulgaiba@gmail.com) or open an [issue on GitHub](https://github.com/rgaiba/cardio-trial-matcher/issues/new/choose).
- **Propose a trial to add:** Use the [trial-proposal issue template](https://github.com/rgaiba/cardio-trial-matcher/issues/new?template=new_trial.md). The contribution recipe is documented in [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Read the source criteria:** [`TRIALS.md`](TRIALS.md) lists every encoded trial with its DOI link.

## For institutional readers

Privacy and HIPAA scope is documented in the [README](README.md#privacy-and-hipaa-scope). The tool is designed to operate outside the scope of HIPAA: no PHI is accepted, no backend exists, no patient data is persisted or transmitted. Source code is fully auditable at [github.com/rgaiba/cardio-trial-matcher](https://github.com/rgaiba/cardio-trial-matcher).
