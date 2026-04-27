import { useMemo, useState } from 'react';
import PatientForm, { EMPTY_PATIENT } from './components/PatientForm.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import { TRIALS, TOPICS } from './data/trials.js';
import { evaluateAllTrials } from './engine/matchEngine.js';
import { trackTopicSwitched } from './engine/analytics.js';

export default function App() {
  // Patient state always starts empty. We do not hydrate from URL parameters
  // because clinical variables in a shareable URL is inappropriate even when
  // no PHI is transmitted. Share button copies bare site URL only.
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [topicFilter, setTopicFilter] = useState(TOPICS[0]?.id || 'heart-failure');

  const results = useMemo(() => evaluateAllTrials(TRIALS, patient), [patient]);

  // Per-topic trial counts for the topbar tabs
  const topicCounts = useMemo(() => {
    const c = {};
    for (const t of TOPICS) {
      c[t.id] = TRIALS.filter((tr) => tr.topicId === t.id).length;
    }
    return c;
  }, []);

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
              Landmark Cardiology Trials | EBM Education Tool
            </p>
          </div>
        </div>
        <div className="topbar-meta">
          <nav className="topic-tabs" role="tablist" aria-label="Select clinical topic">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={topicFilter === t.id}
                className={`topic-tab ${topicFilter === t.id ? 'active' : ''}`}
                onClick={() => {
                  setTopicFilter(t.id);
                  trackTopicSwitched(t.id);
                }}
              >
                {t.label}
                <span className="topic-tab-count">{topicCounts[t.id] || 0}</span>
              </button>
            ))}
          </nav>
          <span className="muted small">{TRIALS.length} trials encoded</span>
          <a
            className="github-link"
            href="https://github.com/rgaiba/cardio-trial-matcher"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            title="View source on GitHub"
          >
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>
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
          <ResultsDashboard results={results} topicFilter={topicFilter} />
        </section>
      </main>

      <footer className="footer">
        <p className="muted small">
          Trial criteria are simplified summaries of published protocols. Always consult the original publication
          before applying to clinical decisions.
        </p>
        <p className="footer-errata small">
          <strong>Errata and suggestions welcome.</strong>{' '}
          Encoded criteria reflect one clinician's reading of the published protocols and may contain errors or
          omissions. Email{' '}
          <a href="mailto:rahulgaiba@gmail.com">rahulgaiba@gmail.com</a> or open an{' '}
          <a
            href="https://github.com/rgaiba/cardio-trial-matcher/issues/new/choose"
            target="_blank"
            rel="noreferrer"
          >
            issue on GitHub
          </a>.
        </p>
        <p className="footer-cta small">
          Open source.{' '}
          <a
            href="https://github.com/rgaiba/cardio-trial-matcher"
            target="_blank"
            rel="noreferrer"
          >
            Fork on GitHub
          </a>{' '}
          and add trials by editing <code>src/data/trials.js</code>.
        </p>
        <p className="footer-credit small muted">
          Created by{' '}
          <a
            href="https://orcid.org/0000-0002-3256-1860"
            target="_blank"
            rel="noreferrer"
          >
            Rahul Gaiba, MD
          </a>
          , Bayhealth Medical Center, Dover, Delaware. Released under the MIT License.
          {' '}
          <a
            href="https://doi.org/10.5281/zenodo.19803460"
            target="_blank"
            rel="noreferrer"
            title="Zenodo record with one-click BibTeX, RIS, EndNote, and APA exports"
          >
            Cite this work (DOI)
          </a>.
        </p>
      </footer>
    </div>
  );
}
