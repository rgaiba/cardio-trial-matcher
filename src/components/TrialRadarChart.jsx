import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// The radar visualizes ONLY inclusion criteria. Exclusion criteria are shown
// in the explicit list below the radar (with green/red pills) because they are
// clinically binary: any single met exclusion would have disqualified the
// patient from enrollment, and a radar is the wrong shape for binary data.
//
// Position rule for inclusion criteria:
//   met      → outer ring (1.0)
//   unknown  → middle (0.5)
//   not_met  → center (0)
//
// A fully filled polygon means the patient meets every inclusion criterion;
// dents in the polygon visually flag where they fall short.

const RESULT_VALUE = { met: 1, unknown: 0.5, not_met: 0 };
const RESULT_LABEL = { met: 'Met', unknown: 'Unknown', not_met: 'Not met' };

// Wrap a label into multiple lines at word boundaries.
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
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, maxChars - 1) + '…';
  }
  return lines;
}

function PolarTick({ x, y, cx, cy, payload }) {
  const dx = x - cx;
  const dy = y - cy;
  let textAnchor;
  if (Math.abs(dx) < 8) textAnchor = 'middle';
  else if (dx > 0) textAnchor = 'start';
  else textAnchor = 'end';

  const maxChars = Math.abs(dx) > Math.abs(dy) ? 22 : 16;
  const lines = wrapLabel(payload.value, maxChars);

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
  // Inclusion criteria only. Exclusions live in the criteria list below.
  const data = evaluation.inclusion.map((c) => ({
    axis: c.label,
    raw: c.result,
    value: RESULT_VALUE[c.result],
  }));

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
                  <div className="muted small">Inclusion criterion</div>
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
        <span><span className="dot" style={{ background: '#0d9488' }} /> outer = met</span>
        <span><span className="dot" style={{ background: '#94a3b8' }} /> middle = unknown</span>
        <span><span className="dot" style={{ background: '#e11d48' }} /> center = not met</span>
      </div>
    </div>
  );
}
