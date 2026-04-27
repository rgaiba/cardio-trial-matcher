<!--
Thanks for contributing to Cardiology Trial Match. Please complete the
checklist below so the maintainer can review efficiently. Trial data PRs
are reviewed against the standards in CONTRIBUTING.md.
-->

## What does this PR do?

<!-- One or two sentences describing the change. -->

## Type of change

- [ ] New trial added to an existing group
- [ ] New group within an existing topic
- [ ] New topic (e.g., CAD, lipids, hypertension)
- [ ] New evaluator or patient-input field
- [ ] Bug fix
- [ ] UI / typography refinement
- [ ] Documentation update
- [ ] Other (describe):

## Checklist

- [ ] I have read [`CONTRIBUTING.md`](../blob/main/CONTRIBUTING.md).
- [ ] No PHI is introduced anywhere (no name, MRN, DOB, address, contact, or any of the 18 HIPAA identifiers).
- [ ] Trial-name capitalization preserved exactly as published (e.g., `DAPA-HF`, not `dapa-hf` or `DAPAHF`).
- [ ] No em-dashes (`—`) in user-facing strings; semicolons, commas, or periods used instead.
- [ ] Smoke tests pass (`node scripts/smoke.mjs` and `node scripts/smoke-afib.mjs`).
- [ ] Local dev server (`npm run dev`) renders correctly.
- [ ] Race composition included for any new trial (or `notReported: true` with explanation).
- [ ] DOI links use the `https://doi.org/<doi>` form.
- [ ] Version bumped in `package.json` and `CITATION.cff` if behavior changed.

## Sources / references

<!--
For trial additions: include the original publication's full citation and the
DOI you used for the I/E criteria, ARR, NNT, and race composition.
For UI / engine changes: link to any prior issue or discussion.
-->

## Screenshots (UI changes only)

<!-- Drag-and-drop screenshots if your PR changes anything visible. -->
