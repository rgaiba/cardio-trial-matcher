import { useMemo, useState } from 'react';
import MatchBarChart from './MatchBarChart.jsx';
import TrialCard from './TrialCard.jsx';
import { STATUS_META } from '../engine/matchEngine.js';

export default function ResultsDashboard({ results }) {
  const [filter, setFilter] = useState('all');
  const [highlightId, setHighlightId] = useState(null);

  const counts = useMemo(() => {
    const c = { eligible: 0, partial: 0, excluded: 0, insufficient: 0 };
    results.forEach((r) => {
      c[r.evaluation.status] += 1;
    });
    return c;
  }, [results]);

  const filtered = filter === 'all'
    ? [...results]
    : results.filter((r) => r.evaluation.status === filter);
  filtered.sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

  const handlePick = (id) => {
    setHighlightId(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`trial-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <section className="results">
      <div className="status-summary">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            className={`status-chip ${filter === key ? 'active' : ''}`}
            style={{ borderColor: meta.color }}
            onClick={() => setFilter((f) => (f === key ? 'all' : key))}
          >
            <span className="dot" style={{ background: meta.color }} />
            <strong>{counts[key]}</strong> {meta.label}
          </button>
        ))}
        {filter !== 'all' && (
          <button type="button" className="status-chip" onClick={() => setFilter('all')}>
            Clear filter
          </button>
        )}
      </div>

      <MatchBarChart results={filtered} onPick={handlePick} />

      <div className="cards-list">
        {filtered.map(({ trial, evaluation }) => (
          <TrialCard
            key={trial.id}
            trial={trial}
            evaluation={evaluation}
            anchorId={`trial-${trial.id}`}
            defaultOpen={trial.id === highlightId}
          />
        ))}
        {filtered.length === 0 && (
          <p className="muted">No trials match the current filter.</p>
        )}
      </div>
    </section>
  );
}
