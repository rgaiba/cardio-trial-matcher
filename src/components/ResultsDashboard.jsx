import { useMemo, useState } from 'react';
import MatchBarChart from './MatchBarChart.jsx';
import TrialCard from './TrialCard.jsx';
import { STATUS_META } from '../engine/matchEngine.js';
import { TRIAL_GROUPS } from '../data/trials.js';

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
    ? results
    : results.filter((r) => r.evaluation.status === filter);

  // Build a sorted list for the overview bar chart (flat, all trials).
  const sortedForBar = [...filtered].sort(
    (a, b) => b.evaluation.matchScore - a.evaluation.matchScore
  );

  // Group results by trial.groupId, preserving the canonical group order.
  const groupedResults = useMemo(() => {
    const byGroup = new Map();
    for (const r of filtered) {
      const gid = r.trial.groupId || 'ungrouped';
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid).push(r);
    }
    // Sort within each group by match score descending
    for (const arr of byGroup.values()) {
      arr.sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);
    }
    // Order groups per TRIAL_GROUPS canonical order, then any unknown groups last
    const ordered = [];
    for (const g of [...TRIAL_GROUPS].sort((a, b) => a.order - b.order)) {
      if (byGroup.has(g.id)) {
        ordered.push({ group: g, results: byGroup.get(g.id) });
        byGroup.delete(g.id);
      }
    }
    for (const [gid, arr] of byGroup.entries()) {
      ordered.push({ group: { id: gid, label: 'Other', description: '' }, results: arr });
    }
    return ordered;
  }, [filtered]);

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

      <MatchBarChart results={sortedForBar} onPick={handlePick} />

      {groupedResults.length === 0 && (
        <p className="muted">No trials match the current filter.</p>
      )}

      {groupedResults.map(({ group, results: groupResults }) => (
        <section key={group.id} className="trial-group">
          <header className="trial-group-header">
            <h3 className="trial-group-title">
              {group.label}
              <span className="trial-group-count muted">
                {groupResults.length} {groupResults.length === 1 ? 'trial' : 'trials'}
              </span>
            </h3>
            {group.description && (
              <p className="trial-group-desc muted small">{group.description}</p>
            )}
          </header>
          <div className="cards-list">
            {groupResults.map(({ trial, evaluation }) => (
              <TrialCard
                key={trial.id}
                trial={trial}
                evaluation={evaluation}
                anchorId={`trial-${trial.id}`}
                defaultOpen={trial.id === highlightId}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
