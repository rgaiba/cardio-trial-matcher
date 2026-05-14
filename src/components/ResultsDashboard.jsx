import { useMemo, useState, useEffect } from 'react';
import MatchBarChart from './MatchBarChart.jsx';
import TrialCard from './TrialCard.jsx';
import { STATUS_META } from '../engine/matchEngine.js';
import { TRIAL_GROUPS } from '../data/trials.js';

export default function ResultsDashboard({
  results,
  topicFilter,
  selectedTrialIds,
  onToggleTrialSelected,
}) {
  const [filter, setFilter] = useState('all');
  const [highlightId, setHighlightId] = useState(null);

  // Reset status filter whenever topic changes — fresh view per topic.
  useEffect(() => {
    setFilter('all');
  }, [topicFilter]);

  // Step 1: scope by topic.
  const topicResults = useMemo(
    () => results.filter((r) => r.trial.topicId === topicFilter),
    [results, topicFilter]
  );

  // Status counts within the selected topic.
  const counts = useMemo(() => {
    const c = { eligible: 0, partial: 0, excluded: 0, insufficient: 0 };
    topicResults.forEach((r) => {
      c[r.evaluation.status] += 1;
    });
    return c;
  }, [topicResults]);

  // Step 2: scope by status filter.
  const filtered = filter === 'all'
    ? topicResults
    : topicResults.filter((r) => r.evaluation.status === filter);

  const sortedForBar = [...filtered].sort(
    (a, b) => (b.evaluation.matchScore ?? -1) - (a.evaluation.matchScore ?? -1)
  );

  // Step 3: group within topic, in canonical order.
  const groupSections = useMemo(() => {
    const sections = [];
    const groups = TRIAL_GROUPS
      .filter((g) => g.topicId === topicFilter)
      .sort((a, b) => a.order - b.order);
    for (const group of groups) {
      const groupResults = filtered
        .filter((r) => r.trial.groupId === group.id)
        .sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);
      if (groupResults.length > 0) {
        sections.push({ group, results: groupResults });
      }
    }
    return sections;
  }, [filtered, topicFilter]);

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

      {groupSections.length === 0 && (
        <p className="muted">No trials match the current filter.</p>
      )}

      {groupSections.map(({ group, results: groupResults }) => (
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
                selected={selectedTrialIds?.has(trial.id)}
                onToggleSelect={onToggleTrialSelected}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
