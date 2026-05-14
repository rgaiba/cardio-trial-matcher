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

const PBLI_TAGS = {
  'PBLI-4': 'Learning at the point of care: locate, appraise, and apply evidence to patient care.',
  'PBLI-1': 'Monitor own practice with a goal for improvement.',
  'PBLI-3': 'Learn and improve via feedback and reflection.',
};

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

export default function Worksheet({ patient, selectedTrials, onBack }) {
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
        <div className="ws-toolbar-title">EBM journal-club worksheet</div>
        <button type="button" className="btn-primary" onClick={handlePrint}>
          Print / Save as PDF
        </button>
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

        {/* ───────── Section 1: Patient ───────── */}
        <section className="ws-section">
          <div className="ws-section-head">
            <h2>1. Patient</h2>
            <span className="ws-pbli">PBLI-4 · Frame the clinical question</span>
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
        <section className="ws-section">
          <div className="ws-section-head">
            <h2>2. PICO question &amp; current treatment</h2>
            <span className="ws-pbli">PBLI-4 · Formulate searchable question</span>
          </div>

          <div className="ws-pico-grid">
            <Field id="ws-pico-p" label="P — Patient / Population" multiline rows={2} value={picoP} onChange={setPicoP} />
            <Field id="ws-pico-i" label="I — Intervention" multiline rows={2} value={picoI} onChange={setPicoI} />
            <Field id="ws-pico-c" label="C — Comparator" multiline rows={2} value={picoC} onChange={setPicoC} />
            <Field id="ws-pico-o" label="O — Outcome" multiline rows={2} value={picoO} onChange={setPicoO} />
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
        <section className="ws-section">
          <div className="ws-section-head">
            <h2>3. Evidence appraisal</h2>
            <span className="ws-pbli">PBLI-4 · Appraise validity, results, applicability</span>
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
        <section className="ws-section">
          <div className="ws-section-head">
            <h2>4. Change in treatment &amp; reflection</h2>
            <span className="ws-pbli">PBLI-1, PBLI-3 · Improve practice, learn from feedback</span>
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

        {/* PBLI appendix — visible on screen and on print */}
        <section className="ws-appendix">
          <h3>ACGME Practice-Based Learning &amp; Improvement (PBLI) — milestones referenced</h3>
          <dl>
            {Object.entries(PBLI_TAGS).map(([tag, desc]) => (
              <div key={tag}>
                <dt>{tag}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
          <p className="ws-appendix-cite muted small">
            Sub-competency descriptions adapted from the ACGME Internal Medicine Milestones, available at
            {' '}<span className="ws-url">acgme.org/specialties/internal-medicine/milestones</span>.
            This worksheet is for resident education and self-documentation; it is not part of the official
            Milestones reporting form.
          </p>
        </section>

        <footer className="ws-footer muted small">
          Generated with Cardiology Trial Match — for educational use only, no PHI stored.
        </footer>
      </div>
    </div>
  );
}
