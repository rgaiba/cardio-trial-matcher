import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const RESULT_VALUE = { met: 1, unknown: 0.5, not_met: 0 };
const RESULT_LABEL = { met: 'Met', unknown: 'Unknown', not_met: 'Not met' };

// Compact label for the polar axis (radar chart axes get crowded fast)
function shorten(label) {
  if (label.length <= 32) return label;
  return label.slice(0, 30) + '…';
}

export default function TrialRadarChart({ trial, evaluation }) {
  // Combine inclusion + exclusion. For exclusion, "not met" is the GOOD case
  // (patient does not satisfy the exclusion), so we invert the value mapping.
  const inc = evaluation.inclusion.map((c) => ({
    axis: shorten(c.label),
    fullLabel: c.label,
    type: 'Inclusion',
    raw: c.result,
    value: RESULT_VALUE[c.result],
  }));
  const exc = evaluation.exclusion.map((c) => ({
    axis: shorten(c.label),
    fullLabel: c.label,
    type: 'Exclusion (not met = good)',
    raw: c.result,
    // Invert: a met exclusion is bad → 0; not_met is good → 1
    value: c.result === 'met' ? 0 : c.result === 'not_met' ? 1 : 0.5,
  }));
  const data = [...inc, ...exc];

  return (
    <div className="radar-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="#d1d5db" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#374151' }} />
          <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="tooltip">
                  <div className="tooltip-title">{d.fullLabel}</div>
                  <div className="muted small">{d.type}</div>
                  <div>
                    <span className={`pill pill-${d.raw}`}>{RESULT_LABEL[d.raw]}</span>
                  </div>
                </div>
              );
            }}
          />
          <Radar
            name={trial.name}
            dataKey="value"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="radar-legend">
        <span><span className="dot" style={{ background: '#16a34a' }} /> outer = met / no exclusion</span>
        <span><span className="dot" style={{ background: '#9ca3af' }} /> middle = unknown</span>
        <span><span className="dot" style={{ background: '#dc2626' }} /> center = not met / excluded</span>
      </div>
    </div>
  );
}
