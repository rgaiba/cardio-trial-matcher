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
              <clipPath id="brand-lens-clip">
                <circle cx="20" cy="15" r="6.5" />
              </clipPath>
            </defs>
            <rect width="32" height="32" rx="7" fill="#0f172a" />
            {/* Background trace, full width, slightly muted */}
            <path
              d="M 2 16 H 7 L 9 12 L 11 21 L 14 16 H 18 L 20 11 L 22 22 L 25 16 H 30"
              stroke="url(#brand-pulse)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
            {/* Glass tint behind the magnified content */}
            <circle cx="20" cy="15" r="6.5" fill="#0b1428" opacity="0.55" />
            {/* Magnified pulse, clipped to lens circle */}
            <g clipPath="url(#brand-lens-clip)">
              <path
                d="M 8 15 L 14 15 L 18 5 L 22 27 L 26 15 L 32 15"
                stroke="url(#brand-pulse)"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            {/* Lens ring */}
            <circle cx="20" cy="15" r="6.5" fill="none" stroke="#cbd5e1" strokeWidth="1.4" />
            {/* Lens handle */}
            <line x1="24.6" y1="19.6" x2="28.5" y2="23.5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <h1>Cardiology Trial Match</h1>
            <p className="brand-sub muted">
              Landmark Cardiology Trials
            </p>
          </div>
        </div>
        <div className="topbar-meta">
          <span className="badge">Heart failure</span>
          <span className="muted small">{TRIALS.length} trials encoded</span>
        </div>
      </header>

      <div className="disclaimer">
        For educational use only. No PHI is stored or transmitted. Not a substitute for clinical judgment.
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
          before applying to clinical decisions. Open source on GitHub; contribute additional trials by editing
          <code> src/data/trials.js</code>.
        </p>
      </footer>
    </div>
  );
}
