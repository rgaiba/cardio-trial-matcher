import { useMemo, useState } from 'react';
import PatientForm, { EMPTY_PATIENT } from './components/PatientForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { TRIALS } from './data/trials.js';
import { evaluateAllTrials } from './engine/matchEngine.js';

export default function App() {
  const [patient, setPatient] = useState(EMPTY_PATIENT);

  const results = useMemo(() => evaluateAllTrials(TRIALS, patient), [patient]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">♥</span>
          <div>
            <h1>Cardio Trial Matcher</h1>
            <p className="brand-sub muted">
              Landmark heart failure trials · Educational EBM tool
            </p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="badge">v0.1 · Heart Failure</span>
          <span className="muted small">{TRIALS.length} trials encoded</span>
        </div>
      </header>

      <div className="disclaimer">
        For education only · No PHI is stored or transmitted · Not a substitute for clinical judgment.
      </div>

      <main className="layout">
        <aside className="left-pane">
          <PatientForm patient={patient} onChange={setPatient} />
        </aside>
        <section className="right-pane">
          <ResultsDashboard results={results} />
        </section>
      </main>

      <footer className="footer">
        <p className="muted small">
          Trial criteria are simplified summaries of published protocols. Always consult the original publication
          before applying to clinical decisions. Open source on GitHub — contribute additional trials by editing
          <code> src/data/trials.js</code>.
        </p>
      </footer>
    </div>
  );
}
