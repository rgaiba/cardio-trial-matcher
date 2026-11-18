import { useEffect, useMemo, useRef, useState } from 'react';
import { forestRows } from '../engine/absoluteEffect.js';
import { appraiseTrial, LEVEL_META } from '../engine/appraisal.js';
import { trackForestViewed, trackSameBaseline } from '../engine/analytics.js';

// Worksheet forest plot: one row per selected trial, ratio on a log scale
// and absolute difference on a linear scale. Plain SVG so it prints with
// the worksheet. No pooled estimate: selected trials usually differ in
// comparator, era, follow-up and end point.

const W = 760;
const LABEL_W = 250;
const PANEL_W = 230;
const GAP = 25;
const ROW_H = 40;
const HEAD_H = 34;
const AXIS_H = 44;

const R_MIN = 0.1;
const R_MAX = 10;
const R_TICKS = [0.1, 0.25, 0.5, 1, 2, 4, 10];

const xRatio = (v) => {
  const c = Math.min(R_MAX, Math.max(R_MIN, v));
  const f = (Math.log(c) - Math.log(R_MIN)) / (Math.log(R_MAX) - Math.log(R_MIN));
  return LABEL_W + f * PANEL_W;
};

const NICE = [2, 5, 10, 20, 40, 80, 100];
const niceMax = (m) => NICE.find((n) => n >= m) ?? Math.ceil(m / 50) * 50;

const fmt = (n) => (Math.abs(n) >= 10 ? n.toFixed(0) : n.toFixed(1));
const signed = (n) => (n > 0 ? `+${fmt(n)}` : n < 0 ? `−${fmt(-n)}` : '0');

function rowColor(trialId) {
  const a = appraiseTrial(trialId);
  if (!a) return { color: LEVEL_META.info.color, text: 'design not yet appraised' };
  if (a.counts.flag > 0) return { color: LEVEL_META.flag.color, text: `${a.counts.flag} bias risk` };
  if (a.counts.caution > 0) return { color: LEVEL_META.caution.color, text: `${a.counts.caution} to weigh` };
  return { color: LEVEL_META.pass.color, text: 'design protects' };
}

export default function ForestPlot({ trials }) {
  const [same, setSame] = useState(false);
  const [baseline, setBaseline] = useState(10);
  const tracked = useRef(false);

  useEffect(() => {
    if (trials.length) trackForestViewed(trials.length);
  }, [trials.length]);

  const rows = useMemo(
    () => forestRows(trials, { sameBaseline: same ? baseline : null }),
    [trials, same, baseline],
  );

  if (!trials.length) return null;

  const ok = rows.filter((r) => r.status === 'ok');
  const absMax = niceMax(
    Math.max(1, ...ok.map((r) => Math.max(Math.abs(r.ard), ...(r.ardRange ? r.ardRange.map(Math.abs) : [0])))),
  );
  const absX0 = LABEL_W + PANEL_W + GAP;
  const xAbs = (v) => absX0 + ((Math.max(-absMax, Math.min(absMax, v)) + absMax) / (2 * absMax)) * PANEL_W;
  const absTicks = [-absMax, -absMax / 2, 0, absMax / 2, absMax];

  const H = HEAD_H + rows.length * ROW_H + AXIS_H;
  const mixedUnits = !same && new Set(ok.map((r) => r.unit)).size > 1;
  const anyRate = ok.some((r) => r.rateBased);

  return (
    <div className="forest">
      <div className="forest-controls no-print">
        <label className="small">
          <input
            type="checkbox"
            checked={same}
            onChange={(e) => {
              setSame(e.target.checked);
              if (e.target.checked && !tracked.current) {
                tracked.current = true;
                trackSameBaseline();
              }
            }}
          />{' '}
          Apply every trial&apos;s effect to the same baseline risk
        </label>
        {same && (
          <label className="small forest-baseline">
            Baseline risk <strong>{baseline}%</strong>
            <input type="range" min={1} max={50} step={1} value={baseline} onChange={(e) => setBaseline(Number(e.target.value))} />
          </label>
        )}
      </div>
      <p className="small muted forest-mode">
        {same
          ? `Each trial's ratio applied to a ${baseline}% baseline risk over that trial's own follow-up.`
          : "Each trial at its own control-arm rate and follow-up."}
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="forest-svg" role="img" aria-label="Forest plot of selected trials">
        {/* Headers */}
        <text x={0} y={20} className="forest-head">Trial</text>
        <text x={LABEL_W + PANEL_W / 2} y={14} className="forest-head" textAnchor="middle">Relative effect (log scale)</text>
        <text x={LABEL_W + PANEL_W / 2} y={28} className="forest-sub" textAnchor="middle">HR, OR or RR with 95% CI</text>
        <text x={absX0 + PANEL_W / 2} y={14} className="forest-head" textAnchor="middle">Absolute difference</text>
        <text x={absX0 + PANEL_W / 2} y={28} className="forest-sub" textAnchor="middle">treated minus control</text>

        {/* Reference lines */}
        <line x1={xRatio(1)} x2={xRatio(1)} y1={HEAD_H} y2={H - AXIS_H} className="forest-ref" />
        <line x1={xAbs(0)} x2={xAbs(0)} y1={HEAD_H} y2={H - AXIS_H} className="forest-ref" />

        {rows.map((r, i) => {
          const y = HEAD_H + i * ROW_H + ROW_H / 2;
          const rc = rowColor(r.id);
          return (
            <g key={r.id}>
              {i % 2 === 0 && <rect x={0} y={y - ROW_H / 2} width={W} height={ROW_H} className="forest-band" />}
              <circle cx={6} cy={y - 6} r={4.5} fill={rc.color}><title>{rc.text}</title></circle>
              <text x={16} y={y - 2} className="forest-name">{r.name} ({r.year})</text>
              {r.status === 'ok' ? (
                <>
                  <text x={16} y={y + 12} className="forest-detail">
                    {r.measure} {r.estimate.toFixed(2)}{r.ci ? ` (${r.ci[0].toFixed(2)}–${r.ci[1].toFixed(2)})` : ' (no CI)'} · {signed(r.ard)} {r.unit}
                  </text>
                  {/* Ratio */}
                  {r.ci && (
                    <line x1={xRatio(r.ci[0])} x2={xRatio(r.ci[1])} y1={y} y2={y} className="forest-ci" />
                  )}
                  <rect x={xRatio(r.estimate) - 4} y={y - 4} width={8} height={8} fill={rc.color} className="forest-point" />
                  {/* Absolute */}
                  {r.ardRange && (
                    <line x1={xAbs(r.ardRange[0])} x2={xAbs(r.ardRange[1])} y1={y} y2={y} className="forest-ci" />
                  )}
                  <rect x={xAbs(r.ard) - 4} y={y - 4} width={8} height={8} fill={rc.color} className="forest-point" />
                </>
              ) : (
                <text x={LABEL_W + 4} y={y + 4} className="forest-detail">
                  {r.status === 'none'
                    ? `${r.label}: no event outcome, so nothing to plot.`
                    : 'Numbers not yet curated for this trial.'}
                </text>
              )}
            </g>
          );
        })}

        {/* Axes */}
        {(() => {
          const y0 = H - AXIS_H + 4;
          return (
            <g>
              <line x1={LABEL_W} x2={LABEL_W + PANEL_W} y1={y0} y2={y0} className="forest-axis" />
              {R_TICKS.map((t) => (
                <g key={`r${t}`}>
                  <line x1={xRatio(t)} x2={xRatio(t)} y1={y0} y2={y0 + 4} className="forest-axis" />
                  <text x={xRatio(t)} y={y0 + 15} textAnchor="middle" className="forest-tick">{t}</text>
                </g>
              ))}
              <text x={LABEL_W} y={y0 + 32} className="forest-sub">← fewer events with treatment</text>
              <text x={LABEL_W + PANEL_W} y={y0 + 32} textAnchor="end" className="forest-sub">more →</text>

              <line x1={absX0} x2={absX0 + PANEL_W} y1={y0} y2={y0} className="forest-axis" />
              {absTicks.map((t) => (
                <g key={`a${t}`}>
                  <line x1={xAbs(t)} x2={xAbs(t)} y1={y0} y2={y0 + 4} className="forest-axis" />
                  <text x={xAbs(t)} y={y0 + 15} textAnchor="middle" className="forest-tick">{signed(t)}</text>
                </g>
              ))}
              <text x={absX0} y={y0 + 32} className="forest-sub">← fewer per 100</text>
              <text x={absX0 + PANEL_W} y={y0 + 32} textAnchor="end" className="forest-sub">more per 100 →</text>
            </g>
          );
        })()}
      </svg>

      <ul className="forest-notes small muted">
        <li>
          Row color comes from each trial&apos;s design checks: <span style={{ color: LEVEL_META.flag.color }}>bias risk</span>,{' '}
          <span style={{ color: LEVEL_META.caution.color }}>to weigh</span>, or{' '}
          <span style={{ color: LEVEL_META.pass.color }}>design protects</span>. A large effect from a weakly built trial deserves less weight.
        </li>
        <li>
          No pooled estimate is shown. These trials differ in comparator, era, follow-up and end point, so averaging them would describe no real treatment or patient.
        </li>
        {mixedUnits && (
          <li>The absolute column mixes units (percentage points over different follow-ups, and events per 100 patient-years). Read each row against its own unit, or switch on the same-baseline view.</li>
        )}
        {same && anyRate && (
          <li>Trials reported as event rates are shown here as if their ratio acted on a cumulative risk. For recurrent-event outcomes such as COAPT&apos;s, that is a rougher approximation.</li>
        )}
        <li>Ratios on different scales (HR, OR, RR) are plotted on one axis for orientation only; they are not interchangeable.</li>
      </ul>
    </div>
  );
}
