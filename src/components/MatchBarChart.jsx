import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { STATUS_META } from '../engine/matchEngine.js';

// Bars use the same STATUS_META colors as pills/chips for visual cohesion,
// but rendered at slight fillOpacity so bars read a touch softer than the
// solid pills. Pills remain the loudest element; bars present and matching.
const BAR_FILL_OPACITY = 0.92;

export default function MatchBarChart({ results, onPick }) {
  // For bar rendering, treat null (no known data) as 0 so it shows as an empty bar.
  const data = results
    .map(({ trial, evaluation }) => ({
      name: trial.name,
      score: evaluation.matchScore == null ? 0 : evaluation.matchScore,
      hasScore: evaluation.matchScore != null,
      status: evaluation.status,
      year: trial.year,
      id: trial.id,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="chart-card">
      <h3>Match overview</h3>
      <p className="muted small">
        Inclusion criteria met (%). Meeting exclusion criteria makes the score zero.
      </p>
      <div style={{ width: '100%', height: Math.max(300, data.length * 36) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 13 }} />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const meta = STATUS_META[d.status];
                return (
                  <div className="tooltip">
                    <div className="tooltip-title">
                      {d.name} <span className="muted">({d.year})</span>
                    </div>
                    <div>
                      <span className="dot" style={{ background: meta.color }} /> {meta.label}
                    </div>
                    <div className="muted small">
                      Match score: {d.hasScore ? `${d.score}%` : '—'}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="score"
              onClick={(d) => onPick?.(d.id)}
              radius={[0, 999, 999, 0]}
              barSize={18}
              fillOpacity={BAR_FILL_OPACITY}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={STATUS_META[d.status].color} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-methods">
        <strong>Methods.</strong> Match scores reflect agreement with each trial's published
        inclusion and exclusion criteria, simplified for encoding. Score is computed only
        from criteria with known patient data; meeting any exclusion criterion zeros the
        score. A high score indicates protocol-level eligibility, not predicted clinical
        benefit. Real-world applicability depends on factors beyond the encoded criteria,
        including unmeasured comorbidities, frailty, and individual context, and requires
        independent clinical judgment. For complete criteria, consult the original
        publication linked on each trial card.
      </p>
    </div>
  );
}
