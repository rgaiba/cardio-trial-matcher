import { useMemo, useState } from 'react';
import MatchBarChart from './MatchBarChart.jsx';
import TrialCard from './TrialCard.jsx';
import { STATUS_META } from '../engine/matchEngine.js';
import { TRIAL_GROUPS, TOPICS } from '../data/trials.js';

export default function ResultsDashboard({ results }) {
  const [topicFilter, setTopicFilter] = useState(TOPICS[0]?.id || 'heart-failure');
  const [filter, setFilter] = useState('all');
  const [highlightId, setHighlightId] = useState(null);

  // Step 1: scope by topic. Everything downstream uses this.
  const topicResults = useMemo(
    () => results.filter((r) => r.trial.topicId === topicFilter),
    [results, topicFilter]
  );

  // Status counts per topic (drives the chip strong numbers)
  const counts = useMemo(() => {
    const c = { eligible: 0, partial: 0, excluded: 0, insufficient: 0 };
    topicResults.forEach((r) => {
      c[r.evaluation.status] += 1;
    });
    return c;
  }, [topicResults]);

  // Trial counts per topic (drives the tab label numbers)
  const topicCounts = useMemo(() => {
    const c = {};
    for (const t of TOPICS) {
      c[t.id] = results.filter((r) => r.trial.topicId === t.id).length;
    }
    return c;
  }, [results]);

  // Step 2: scope by status filter within the selected topic.
  const filtered = filter === 'all'
    ? topicResults
    : topicResults.filter((r) => r.evaluation.status === filter);

  // Sorted list for the overview bar chart (within selected topic, by score)
  const sortedForBar = [...filtered].sort(
    (a, b) => b.evaluation.matchScore - a.evaluation.matchScore
  );

  // Step 3: group within selected topic.
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
      {/* Topic selector */}
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
              setFilter('all'); // reset status filter when switching topic
            }}
          >
            {t.label}
            <span className="topic-tab-count">{topicCounts[t.id] || 0}</span>
          </button>
        ))}
      </nav>

      {/* Status filter */}
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
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
