import { DEMOGRAPHICS, RACE_GROUPS } from '../data/demographics.js';

// Minimalist horizontal stacked bar showing race composition of a trial's
// enrolled population. Hovering a segment shows the exact percentage and label.
export default function RaceBar({ trialId }) {
  const demo = DEMOGRAPHICS[trialId];
  if (!demo) return null;

  if (demo.notReported) {
    return (
      <div className="race-bar-wrap">
        <div className="race-bar-label">
          <span>Race composition</span>
          <span className="race-bar-pct muted small">Not reported</span>
        </div>
        <div className="race-bar race-bar-empty" aria-label="Race not reported" />
        {demo.notes && <p className="race-bar-note muted small">{demo.notes}</p>}
      </div>
    );
  }

  const segments = RACE_GROUPS
    .map((g) => ({ ...g, percent: demo[g.key] || 0 }))
    .filter((s) => s.percent > 0);
  const total = segments.reduce((sum, s) => sum + s.percent, 0);

  return (
    <div className="race-bar-wrap">
      <div className="race-bar-label">
        <span>Race composition</span>
      </div>
      <div
        className="race-bar"
        role="img"
        aria-label={segments.map((s) => `${s.label} ${s.percent}%`).join(', ')}
      >
        {segments.map((s) => (
          <div
            key={s.key}
            className="race-bar-seg"
            style={{ width: `${(s.percent / total) * 100}%`, background: s.color }}
            title={`${s.label}: ${s.percent}%`}
          />
        ))}
      </div>
      <div className="race-bar-legend">
        {segments.map((s) => (
          <span key={s.key} className="race-bar-legend-item">
            <span className="race-bar-swatch" style={{ background: s.color }} />
            {s.label} <strong>{s.percent}%</strong>
          </span>
        ))}
      </div>
      {demo.notes && <p className="race-bar-note muted small">{demo.notes}</p>}
    </div>
  );
}
