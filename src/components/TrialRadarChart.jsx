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

// Wrap a label into multiple lines at word boundaries.
// Approximate character budget per line based on radar tick angle: labels at
// the top/bottom (vertical) have less horizontal space than left/right.
function wrapLabel(text, maxChars) {
  if (!text) return [''];
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? current + ' ' + w : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  // Cap at 3 lines; truncate the last if needed
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, maxChars - 1) + '…';
  }
  return lines;
}

// Custom tick that places multi-line labels with correct anchor based on the
// quadrant of the polar axis the label sits at.
function PolarTick({ x, y, cx, cy, payload }) {
  const dx = x - cx;
  const dy = y - cy;
  // text-anchor: end if to the left, start if to the right, middle if near vertical
  let textAnchor;
  if (Math.abs(dx) < 8) textAnchor = 'middle';
  else if (dx > 0) textAnchor = 'start';
  else textAnchor = 'end';

  // Allow more characters per line for left/right axes than top/bottom
  const maxChars = Math.abs(dx) > Math.abs(dy) ? 22 : 16;
  const lines = wrapLabel(payload.value, maxChars);

  // Vertical centering: shift up by half the line stack height when above
  const lineHeight = 12;
  const totalHeight = (lines.length - 1) * lineHeight;
  const startDy = dy < 0 ? -totalHeight : 0;

  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#374151" fontSize="11">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? startDy : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function TrialRadarChart({ trial, evaluation }) {
  // Combine inclusion + exclusion. For exclusion, "not met" is the GOOD case
  // (patient does not satisfy the exclusion), so we invert the value mapping.
  const inc = evaluation.inclusion.map((c) => ({
    axis: c.label,
    type: 'Inclusion',
    raw: c.result,
    value: RESULT_VALUE[c.result],
  }));
  const exc = evaluation.exclusion.map((c) => ({
    axis: c.label,
    type: 'Exclusion (not met = good)',
    raw: c.result,
    value: c.result === 'met' ? 0 : c.result === 'not_met' ? 1 : 0.5,
  }));
  const data = [...inc, ...exc];

  return (
    <div className="radar-wrap">
      <ResponsiveContainer width="100%" height={360}>
        <RadarChart
          data={data}
          outerRadius="62%"
          margin={{ top: 28, right: 60, bottom: 28, left: 60 }}
        >
          <PolarGrid stroke="#d1d5db" />
          <PolarAngleAxis dataKey="axis" tick={<PolarTick />} />
          <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="tooltip">
                  <div className="tooltip-title">{d.axis}</div>
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
        <span><span className="dot" style={{ background: '#16a34a' }} /> outer = met or no exclusion</span>
        <span><span className="dot" style={{ background: '#9ca3af' }} /> middle = unknown</span>
        <span><span className="dot" style={{ background: '#dc2626' }} /> center = not met or excluded</span>
      </div>
    </div>
  );
}
