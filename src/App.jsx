import { useMemo, useState } from 'react';
import PatientForm, { EMPTY_PATIENT } from './components/PatientForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { TRIALS } from './data/trials.js';
import { evaluateAllTrials } from './engine/matchEngine.js';
import { readPatientFromUrl } from './engine/serialize.js';

export default function App() {
  // Lazy initial state: if URL has ?p=<encoded>, hydrate the patient from it.
  const [patient, setPatient] = useState(() => readPatientFromUrl(EMPTY_PATIENT));

  const results = useMemo(() => evaluateAllTrials(TRIALS, patient), [patient]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <defs>
              <linearGradient id="brand-pulse" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="60%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="7" fill="#0f172a" />
            <path
              d="M 4 16 H 10 L 12 11 L 16 22 L 20 5 L 22 16 H 28"
              stroke="url(#brand-pulse)"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h1>Cardiology Trial Match</h1>
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
