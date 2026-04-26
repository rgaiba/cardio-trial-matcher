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

export default function MatchBarChart({ results, onPick }) {
  // sort best fit first
  const data = results
    .map(({ trial, evaluation }) => ({
      name: trial.name,
      score: evaluation.matchScore,
      status: evaluation.status,
      year: trial.year,
      id: trial.id,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="chart-card">
      <h3>Match strength across trials</h3>
      <p className="muted small">
        % of inclusion criteria met (unknowns count as half-credit). Bars drop to zero if any
        exclusion criterion is met. Click a bar to jump to that trial's details.
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
                    <div className="muted small">Match score: {d.score}%</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="score" onClick={(d) => onPick?.(d.id)} radius={[0, 4, 4, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill={STATUS_META[d.status].color} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
