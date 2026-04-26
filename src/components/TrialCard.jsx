import { useState } from 'react';
import TrialRadarChart from './TrialRadarChart.jsx';
import { STATUS_META } from '../engine/matchEngine.js';

const RESULT_LABEL = { met: 'Met', unknown: 'Unknown', not_met: 'Not met' };

function CriteriaList({ items, kind }) {
  return (
    <ul className="criteria-list">
      {items.map((c) => (
        <li key={c.id} className={`criteria-item criteria-${c.result}`}>
          <span className={`pill pill-${c.result}`}>
            {kind === 'exclusion' && c.result === 'met'
              ? 'Triggers exclusion'
              : kind === 'exclusion' && c.result === 'not_met'
                ? 'Not present (good)'
                : RESULT_LABEL[c.result]}
          </span>
          <span className="criteria-label">{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TrialCard({ trial, evaluation, defaultOpen, anchorId }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const meta = STATUS_META[evaluation.status];

  return (
    <article id={anchorId} className="trial-card">
      <header className="trial-header" onClick={() => setOpen((v) => !v)}>
        <div className="trial-header-left">
          <h3 className="trial-name">
            {trial.name}{' '}
            <span className="trial-year muted">({trial.year})</span>
          </h3>
          <p className="trial-sub muted">
            {trial.intervention} · {trial.category}
          </p>
        </div>
        <div className="trial-header-right">
          <span className="status-pill" style={{ background: meta.color }}>
            {meta.label}
          </span>
          <span className="match-score">{evaluation.matchScore}%</span>
          <span className={`chevron ${open ? 'open' : ''}`}>▾</span>
        </div>
      </header>

      {open && (
        <div className="trial-body">
          <div className="trial-grid">
            <div className="trial-radar">
              <TrialRadarChart trial={trial} evaluation={evaluation} />
            </div>
            <div className="trial-detail">
              <p className="key-takeaway">{trial.keyTakeaway}</p>
              <dl className="trial-stats">
                <div><dt>Population</dt><dd>{trial.population}</dd></div>
                <div><dt>Enrolled</dt><dd>{trial.nEnrolled.toLocaleString()}</dd></div>
                <div><dt>Primary endpoint</dt><dd>{trial.primaryEndpoint}</dd></div>
                <div><dt>Result</dt><dd>{trial.primaryResult} (p {trial.pValue})</dd></div>
                {trial.arr && <div><dt>ARR</dt><dd>{trial.arr}</dd></div>}
                {trial.nnt && <div><dt>NNT</dt><dd>{trial.nnt}</dd></div>}
              </dl>
              <p className="citation muted small">
                {trial.citation}{' '}
                {trial.url && (
                  <a href={trial.url} target="_blank" rel="noreferrer">
                    [Read]
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="criteria-grid">
            <section>
              <h4>Inclusion criteria</h4>
              <CriteriaList items={evaluation.inclusion} kind="inclusion" />
            </section>
            <section>
              <h4>Exclusion criteria</h4>
              <CriteriaList items={evaluation.exclusion} kind="exclusion" />
            </section>
          </div>
        </div>
      )}
    </article>
  );
}
