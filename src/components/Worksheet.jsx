import { useMemo, useState } from 'react';
import { STATUS_META } from '../engine/matchEngine.js';

/**
 * EBM journal-club worksheet.
 *
 * Inputs: the current patient profile and the trials the resident has selected
 * from the dashboard. Output: a print-to-PDF document that can be saved or
 * handed in for milestone documentation.
 *
 * The worksheet maps each section to the ACGME Practice-Based Learning and
 * Improvement (PBLI) sub-competencies. PBLI-4 ("Learning at the point of care
 * — access, appraise, apply evidence") is the core EBM milestone; PBLI-1 and
 * PBLI-3 cover incorporating learning into practice and feedback.
 *
 * State is local to this component — nothing is persisted. Residents are
 * expected to print/save the PDF; reloading clears the form.
 */

// Compact human-readable summary of the patient form. Skips undefined fields
// so the worksheet doesn't show blanks for things the user didn't fill in.
function summarizePatient(p) {
  const parts = [];
  if (p.age != null) parts.push(`${p.age}-year-old`);
  if (p.sex === 'M') parts.push('male');
  else if (p.sex === 'F') parts.push('female');
  return parts.join(' ').trim();
}

function patientVitals(p) {
  const rows = [];
  if (p.nyhaClass != null) rows.push(['NYHA class', `${['', 'I', 'II', 'III', 'IV'][p.nyhaClass] || p.nyhaClass}`]);
  if (p.lvef != null) rows.push(['LVEF', `${p.lvef}%`]);
  if (p.ntProBnp != null) rows.push(['NT-proBNP', `${p.ntProBnp} pg/mL`]);
  if (p.bnp != null) rows.push(['BNP', `${p.bnp} pg/mL`]);
  if (p.sbp != null) rows.push(['SBP', `${p.sbp} mmHg`]);
  if (p.hr != null) rows.push(['Heart rate', `${p.hr} bpm`]);
  if (p.qrs != null) rows.push(['QRS', `${p.qrs} ms`]);
  if (p.rhythm && p.rhythm !== 'unknown') rows.push(['Rhythm', p.rhythm]);
  if (p.afibType && p.afibType !== 'unknown') rows.push(['AF type', p.afibType]);
  return rows;
}

function patientLabs(p) {
  const rows = [];
  if (p.egfr != null) rows.push(['eGFR', `${p.egfr} mL/min/1.73m²`]);
  if (p.creatinine != null) rows.push(['Creatinine', `${p.creatinine} mg/dL`]);
  if (p.potassium != null) rows.push(['K⁺', `${p.potassium} mmol/L`]);
  if (p.sodium != null) rows.push(['Na⁺', `${p.sodium} mmol/L`]);
  if (p.hemoglobin != null) rows.push(['Hemoglobin', `${p.hemoglobin} g/dL`]);
  return rows;
}

function patientComorbidities(p) {
  const labels = {
    diabetes: 'Diabetes',
    afib: 'Atrial fibrillation',
    htn: 'Hypertension',
    priorMI: 'Prior MI',
    copd: 'COPD',
    angioedema: 'Prior angioedema',
    severeValveDisease: 'Severe valvular disease',
    cadAmenableToCabg: 'CAD amenable to CABG',
    leftMainGte50: 'Left main ≥50%',
    ccsAnginaClass3plus: 'CCS angina ≥III',
    priorStrokeOrTIA: 'Prior stroke/TIA',
    vascularDisease: 'Vascular disease',
    mitralStenosis: 'Mod–severe mitral stenosis',
    mechanicalValve: 'Mechanical valve',
  };
  const present = [];
  for (const [key, label] of Object.entries(labels)) {
    const v = p.comorbidities?.[key];
    if (v === true) present.push(label);
    else if (key === 'diabetes' && v && v !== 'unknown' && v !== 'none') {
      present.push(`${label} (${v})`);
    }
  }
  return present;
}

function patientMeds(p) {
  const labels = {
    aceArb: 'ACEi/ARB',
    arni: 'ARNI',
    betaBlocker: 'Beta-blocker',
    mra: 'MRA',
    sglt2i: 'SGLT2 inhibitor',
    loopDiuretic: 'Loop diuretic',
    ivabradine: 'Ivabradine',
    digoxin: 'Digoxin',
  };
  return Object.entries(labels)
    .filter(([k]) => p.meds?.[k] === true)
    .map(([, label]) => label);
}

// Auto-extract a starting PICO. Residents will almost always need to edit this,
// but a default seeded from the patient + selected trials saves typing.
function defaultPICO(patient, trials) {
  const populationBits = [summarizePatient(patient)];
  const ef = patient.lvef != null ? `LVEF ${patient.lvef}%` : '';
  const nyha = patient.nyhaClass != null ? `NYHA ${['', 'I', 'II', 'III', 'IV'][patient.nyhaClass]}` : '';
  if (ef) populationBits.push(`with ${ef}`);
  if (nyha) populationBits.push(`(${nyha})`);
  const population = populationBits.filter(Boolean).join(' ') || 'this patient';

  const interventions = [...new Set(trials.map((t) => t.intervention).filter(Boolean))];
  const intervention =
    interventions.length === 0
      ? ''
      : interventions.length === 1
        ? interventions[0]
        : `the regimen described in ${trials.map((t) => t.name).join(', ')}`;

  const endpoints = [...new Set(trials.map((t) => t.primaryEndpoint).filter(Boolean))];
  const outcome = endpoints[0] || 'mortality, hospitalization, or other patient-important outcome';

  return {
    p: population,
    i: intervention,
    c: 'current standard therapy',
    o: outcome,
  };
}

function Field({ id, label, hint, multiline, rows, value, onChange, pbli }) {
  return (
    <div className="ws-field">
      <label htmlFor={id} className="ws-field-label">
        <span>{label}</span>
        {pbli && <span className="ws-pbli">{pbli}</span>}
      </label>
      {hint && <p className="ws-field-hint">{hint}</p>}
      {multiline ? (
        <textarea
          id={id}
          className="ws-textarea"
          rows={rows || 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="ws-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// Wizard step metadata. Keep the order aligned with the section numbering
// in the JSX below. The `n` field is used both for the indicator and for
// per-section visibility — switching to step n shows only the section with
// matching `data-step={n}`.
const STEPS = [
  { n: 1, title: 'Patient' },
  { n: 2, title: 'PICO & treatment' },
  { n: 3, title: 'Evidence appraisal' },
  { n: 4, title: 'Decision & reflection' },
];

// EBM-focused subset of ACGME Practice-Based Learning & Improvement
// milestones (Cardiovascular Disease Milestones 2.0, 2021). These are the
// two PBLI sub-competencies most directly demonstrated by a journal-club /
// EBM exercise. Descriptors are paraphrased to capture the spirit of each
// level without verbatim text; programs using this for formal documentation
// should still consult the official rubric. Level 3 corresponds to the
// readiness-for-graduation threshold; Level 5 is aspirational.
const MILESTONES = [
  {
    id: 'pbli1',
    code: 'PBLI1',
    title: 'Evidence-Based and Informed Practice',
    competency: 'Practice-Based Learning & Improvement',
    levels: [
      'Articulates how clinical evidence is generated and how to access it.',
      'Formulates an answerable clinical question; locates and appraises evidence for routine questions.',
      'Integrates appraised evidence with patient values and clinical context to guide decisions.',
      'Critically appraises and applies evidence in ambiguous or conflicting situations.',
      'Coaches others to critically appraise evidence; contributes to evidence synthesis.',
    ],
  },
  {
    id: 'pbli2',
    code: 'PBLI2',
    title: 'Reflective Practice & Commitment to Growth',
    competency: 'Practice-Based Learning & Improvement',
    levels: [
      'Accepts responsibility for personal and professional development.',
      'Identifies opportunities to learn from feedback; designs a learning plan with prompting.',
      'Designs and implements a learning plan that integrates performance data with self-assessment.',
      'Uses performance data to drive ongoing improvement; proactively seeks feedback.',
      'Coaches others on reflective practice; promotes a culture of self-improvement.',
    ],
  },
];

// Static (non-interactive) milestone row. Rendered into the printed PDF as a
// blank tear-off rubric — the attending circles a level number and writes
// comments by hand. We deliberately do not wire React state to these inputs
// per the product decision: online, the evaluator section is invisible; the
// only online control is the "Include evaluator page" toggle on the toolbar.
function MilestonePrintRow({ milestone }) {
  return (
    <div className="ws-milestone">
      <div className="ws-milestone-head">
        <span className="ws-milestone-code">{milestone.code}</span>
        <div>
          <div className="ws-milestone-title">{milestone.title}</div>
          <div className="ws-milestone-comp muted small">{milestone.competency}</div>
        </div>
      </div>
      <div className="ws-milestone-levels">
        {milestone.levels.map((descriptor, idx) => {
          const level = idx + 1;
          return (
            <div key={level} className="ws-milestone-level">
              <span className="ws-milestone-level-head">
                <span className="ws-milestone-level-bubble" aria-hidden="true" />
                <span className="ws-milestone-level-num">L{level}</span>
              </span>
              <span className="ws-milestone-level-desc">{descriptor}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Worksheet({ patient, selectedTrials, onBack }) {
  // Wizard navigation — which step the user is currently editing.
  // All sections remain mounted (so their form state survives navigation)
  // but only the active step is shown on screen via CSS. The print
  // stylesheet overrides this and renders every section, so the saved PDF
  // is always the full worksheet regardless of which step was visible.
  const [currentStep, setCurrentStep] = useState(1);
  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));
  const goNext = () => setCurrentStep((s) => Math.min(STEPS.length, s + 1));

  // Header metadata
  const [residentName, setResidentName] = useState('');
  const [attendingName, setAttendingName] = useState('');
  const today = useMemo(() => new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }), []);
  const [sessionDate, setSessionDate] = useState(today);
  const [topicLine, setTopicLine] = useState(
    selectedTrials.length
      ? selectedTrials.map((t) => t.name).join(', ')
      : ''
  );

  // Section 1: patient context
  const [clinicalScenario, setClinicalScenario] = useState('');
  // Auto-summary lines (read-only display, but editable as free text)
  const vitals = patientVitals(patient);
  const labs = patientLabs(patient);
  const comorbs = patientComorbidities(patient);
  const meds = patientMeds(patient);

  // Section 2: PICO + current treatment
  const seedPico = useMemo(() => defaultPICO(patient, selectedTrials), [patient, selectedTrials]);
  const [picoP, setPicoP] = useState(seedPico.p);
  const [picoI, setPicoI] = useState(seedPico.i);
  const [picoC, setPicoC] = useState(seedPico.c);
  const [picoO, setPicoO] = useState(seedPico.o);
  const [currentTx, setCurrentTx] = useState('');

  // Section 3: collective evidence appraisal
  const [validity, setValidity] = useState('');
  const [results, setResults] = useState('');
  const [applicability, setApplicability] = useState('');

  // Section 4: change in treatment + reflection
  const [decision, setDecision] = useState('no_change'); // no_change | adjust | start | stop
  const [rationale, setRationale] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [learned, setLearned] = useState('');

  // Opt-in for the printed evaluator page. When true, the static evaluator
  // form (PBLI1 + PBLI2 milestones with blank rating bubbles + comments) is
  // appended as the final page of the printed PDF. No online form fields —
  // the attending fills it in by hand on the printed copy.
  const [includeEvaluator, setIncludeEvaluator] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="worksheet">
      {/* Sticky toolbar — hidden in print */}
      <div className="ws-toolbar no-print">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Back to results
        </button>
        <div className="ws-toolbar-right">
          <label className="ws-toolbar-check" title="Adds a tear-off ACGME PBLI evaluation page (PBLI1, PBLI2) to the printed PDF for the attending to fill in by hand.">
            <input
              type="checkbox"
              checked={includeEvaluator}
              onChange={(e) => setIncludeEvaluator(e.target.checked)}
            />
            Include evaluator page in PDF
          </label>
          <button type="button" className="btn-primary" onClick={handlePrint}>
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="ws-sheet">
        {/* Header block */}
        <header className="ws-header">
          <div className="ws-header-title">
            <h1>EBM Journal-Club Worksheet</h1>
            <p className="ws-header-sub">
              Practice-Based Learning &amp; Improvement (ACGME) — apply evidence to a real patient.
            </p>
          </div>
          <div className="ws-header-meta">
            <label className="ws-meta-row">
              <span>Resident</span>
              <input value={residentName} onChange={(e) => setResidentName(e.target.value)} />
            </label>
            <label className="ws-meta-row">
              <span>Attending / preceptor</span>
              <input value={attendingName} onChange={(e) => setAttendingName(e.target.value)} />
            </label>
            <label className="ws-meta-row">
              <span>Date</span>
              <input value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            </label>
            <label className="ws-meta-row">
              <span>Topic / trial(s)</span>
              <input value={topicLine} onChange={(e) => setTopicLine(e.target.value)} />
            </label>
          </div>
        </header>

        {/* Step indicator — also acts as direct nav (clickable) */}
        <nav className="ws-steps no-print" aria-label="Worksheet sections">
          {STEPS.map((step) => {
            const state =
              step.n === currentStep ? 'current'
              : step.n < currentStep ? 'done'
              : 'upcoming';
            return (
              <button
                key={step.n}
                type="button"
                className={`ws-step ws-step-${state}`}
                onClick={() => setCurrentStep(step.n)}
                aria-current={step.n === currentStep ? 'step' : undefined}
              >
                <span className="ws-step-num">{step.n}</span>
                <span className="ws-step-title">{step.title}</span>
              </button>
            );
          })}
        </nav>

        {/* ───────── Section 1: Patient ───────── */}
        <section
          className={`ws-section ws-step-section ${currentStep === 1 ? 'ws-section-active' : 'ws-section-hidden'}`}
          data-step="1"
        >
          <div className="ws-section-head">
            <h2>1. Patient</h2>
          </div>

          <div className="ws-autofill">
            <div className="ws-autofill-line">
              <strong>Profile:</strong>{' '}
              {summarizePatient(patient) || <em className="muted">No demographics entered</em>}
            </div>
            <div className="ws-autofill-grid">
              <div>
                <strong>Vitals / cardiac:</strong>
                {vitals.length === 0 ? (
                  <span className="muted"> none entered</span>
                ) : (
                  <ul className="ws-kv-list">
                    {vitals.map(([k, v]) => (
                      <li key={k}><span className="muted">{k}:</span> {v}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <strong>Labs:</strong>
                {labs.length === 0 ? (
                  <span className="muted"> none entered</span>
                ) : (
                  <ul className="ws-kv-list">
                    {labs.map(([k, v]) => (
                      <li key={k}><span className="muted">{k}:</span> {v}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <strong>Comorbidities:</strong>{' '}
                {comorbs.length === 0 ? <span className="muted">none entered</span> : comorbs.join(', ')}
              </div>
              <div>
                <strong>Current cardiac meds:</strong>{' '}
                {meds.length === 0 ? <span className="muted">none entered</span> : meds.join(', ')}
              </div>
            </div>
          </div>

          <Field
            id="ws-scenario"
            label="Clinical scenario / chief concern"
            hint="One short paragraph: why this patient and what question prompted you to look at the literature."
            multiline
            rows={4}
            value={clinicalScenario}
            onChange={setClinicalScenario}
          />
        </section>

        {/* ───────── Section 2: PICO + current treatment ───────── */}
        <section
          className={`ws-section ws-step-section ${currentStep === 2 ? 'ws-section-active' : 'ws-section-hidden'}`}
          data-step="2"
        >
          <div className="ws-section-head">
            <h2>2. PICO question &amp; current treatment</h2>
          </div>

          <div className="ws-pico-grid">
            <Field id="ws-pico-p" label={<><span className="ws-pico-letter">P</span>atients</>} multiline rows={2} value={picoP} onChange={setPicoP} />
            <Field id="ws-pico-i" label={<><span className="ws-pico-letter">I</span>ntervention</>} multiline rows={2} value={picoI} onChange={setPicoI} />
            <Field id="ws-pico-c" label={<><span className="ws-pico-letter">C</span>omparison</>} multiline rows={2} value={picoC} onChange={setPicoC} />
            <Field id="ws-pico-o" label={<><span className="ws-pico-letter">O</span>utcome</>} multiline rows={2} value={picoO} onChange={setPicoO} />
          </div>

          <Field
            id="ws-current-tx"
            label="Current treatment plan (before today)"
            hint="What is the patient on right now? What is the planned next step before applying this evidence?"
            multiline
            rows={4}
            value={currentTx}
            onChange={setCurrentTx}
          />
        </section>

        {/* ───────── Section 3: Evidence appraisal (collective) ───────── */}
        <section
          className={`ws-section ws-step-section ${currentStep === 3 ? 'ws-section-active' : 'ws-section-hidden'}`}
          data-step="3"
        >
          <div className="ws-section-head">
            <h2>3. Evidence appraisal</h2>
          </div>

          {selectedTrials.length === 0 ? (
            <p className="muted">
              No trials selected. Go back to the dashboard and select one or more trials to anchor your appraisal.
            </p>
          ) : (
            <div className="ws-trials">
              <p className="ws-section-hint">
                {selectedTrials.length === 1 ? 'Trial under review:' : 'Trials under review (collective appraisal):'}
              </p>
              <ol className="ws-trial-refs">
                {selectedTrials.map((t) => (
                  <li key={t.id}>
                    <div className="ws-trial-ref-head">
                      <strong>{t.name}</strong> <span className="muted">({t.year})</span>
                      <span className="ws-trial-ref-int"> — {t.intervention}</span>
                    </div>
                    <div className="ws-trial-ref-body small">
                      <div><span className="muted">Population:</span> {t.population}</div>
                      <div><span className="muted">N:</span> {t.nEnrolled?.toLocaleString()} · <span className="muted">Endpoint:</span> {t.primaryEndpoint}</div>
                      <div><span className="muted">Result:</span> {t.primaryResult} (p {t.pValue}){t.arr ? ` · ARR ${t.arr}` : ''}{t.nnt ? ` · NNT ${t.nnt}` : ''}</div>
                      <div className="muted ws-trial-ref-cite">{t.citation}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Field
            id="ws-validity"
            label="Validity (are the results trustworthy?)"
            hint="Randomization, allocation concealment, blinding, follow-up, intention-to-treat, sponsorship. Comment across all selected trials."
            multiline
            rows={5}
            value={validity}
            onChange={setValidity}
          />

          <Field
            id="ws-results"
            label="Results (what did the evidence show?)"
            hint="Magnitude of effect, confidence intervals, absolute vs relative risk, NNT/NNH, consistency across trials and subgroups."
            multiline
            rows={5}
            value={results}
            onChange={setResults}
          />

          <Field
            id="ws-applicability"
            label="Applicability to your patient (external validity)"
            hint="Is your patient like the enrolled population? Were the treatments feasible in your setting? Do benefits outweigh harms and burdens for this individual?"
            multiline
            rows={5}
            value={applicability}
            onChange={setApplicability}
          />
        </section>

        {/* ───────── Section 4: Change in treatment + reflection ───────── */}
        <section
          className={`ws-section ws-step-section ${currentStep === 4 ? 'ws-section-active' : 'ws-section-hidden'}`}
          data-step="4"
        >
          <div className="ws-section-head">
            <h2>4. Change in treatment &amp; reflection</h2>
          </div>

          <div className="ws-decision">
            <span className="ws-field-label">Decision</span>
            <div className="ws-decision-options">
              {[
                ['no_change', 'No change'],
                ['start', 'Start a new therapy'],
                ['adjust', 'Adjust / titrate existing therapy'],
                ['stop', 'Stop / de-prescribe'],
              ].map(([value, label]) => (
                <label key={value} className={`ws-radio ${decision === value ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="ws-decision"
                    value={value}
                    checked={decision === value}
                    onChange={() => setDecision(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <Field
            id="ws-rationale"
            label="Rationale for the decision"
            hint="Tie the choice explicitly to the appraisal above and to patient values / shared decision-making."
            multiline
            rows={4}
            value={rationale}
            onChange={setRationale}
          />

          <Field
            id="ws-followup"
            label="Follow-up plan &amp; outcome to track"
            hint="What measurable outcome will you check, and when? (e.g., NT-proBNP in 3 months, symptom score, lab safety check.)"
            multiline
            rows={3}
            value={followUp}
            onChange={setFollowUp}
          />

          <Field
            id="ws-learned"
            label="What I learned / will do differently"
            hint="Self-reflection: what changed about your mental model? What feedback did you receive? What will you read or look for next time?"
            multiline
            rows={4}
            value={learned}
            onChange={setLearned}
          />
        </section>

        {/* Evaluator page — print-only tear-off. Rendered when the toolbar
            checkbox is on; the print stylesheet then forces it onto its own
            final page. Hidden from screen entirely so the resident's
            workflow isn't cluttered with a form they don't fill in. */}
        {includeEvaluator && (
          <section className="ws-eval-section ws-eval-printable">
            <div className="ws-section-head">
              <h2>Evaluator assessment <span className="ws-eval-tag">attending fills in by hand</span></h2>
            </div>
            <p className="ws-section-hint">
              Based on this worksheet and the journal-club discussion, circle the level that best
              describes the fellow on each PBLI milestone. Level 3 is the threshold for graduation
              from fellowship; Level 5 is aspirational.
            </p>

            <div className="ws-eval-meta">
              <div className="ws-eval-meta-row">
                <span>Fellow</span>
                <span className="ws-eval-blank" />
              </div>
              <div className="ws-eval-meta-row">
                <span>Evaluator</span>
                <span className="ws-eval-blank" />
              </div>
              <div className="ws-eval-meta-row">
                <span>Date</span>
                <span className="ws-eval-blank" />
              </div>
            </div>

            <div className="ws-milestone-list">
              {MILESTONES.map((m) => (
                <MilestonePrintRow key={m.id} milestone={m} />
              ))}
            </div>

            <div className="ws-eval-comment-block">
              <div className="ws-eval-comment-label">Evaluator comments / feedback</div>
              <div className="ws-eval-comment-lines">
                <span /><span /><span /><span /><span />
              </div>
            </div>

            <p className="ws-eval-cite muted small">
              Milestone descriptors adapted from the ACGME Cardiovascular Disease Milestones 2.0 (2021).
              For formal Milestones reporting, consult the official rubric at
              {' '}<span className="ws-url">acgme.org/specialties/cardiovascular-disease/milestones</span>.
            </p>
          </section>
        )}

        {/* Prev / Next wizard nav. On the last step, "Next" becomes the
            print action so the resident can move from the final field
            straight to saving the PDF without scrolling back up. */}
        <div className="ws-nav no-print">
          <button
            type="button"
            className="ws-pill ws-pill-secondary"
            onClick={goPrev}
            disabled={currentStep === 1}
          >
            ← Previous
          </button>
          <span className="ws-nav-progress muted small">
            Step {currentStep} of {STEPS.length}
          </span>
          {currentStep < STEPS.length ? (
            <button
              type="button"
              className="ws-pill ws-pill-primary"
              onClick={goNext}
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="ws-pill ws-pill-primary"
              onClick={handlePrint}
            >
              Print / Save as PDF
            </button>
          )}
        </div>

        <footer className="ws-footer muted small">
          Generated with Cardiology Trial Match — for educational use only, no PHI stored.
        </footer>
      </div>
    </div>
  );
}
