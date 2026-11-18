import { useEffect, useMemo, useRef, useState } from 'react';
import {
  absoluteEffectModel,
  transportFlags,
  roundNumber,
  describeNumberRange,
  unitPhrase,
  SLIDER_MIN,
  SLIDER_MAX,
} from '../engine/absoluteEffect.js';
import {
  trackAbsoluteOpened,
  trackBaselineAdjusted,
  trackTransportFlag,
} from '../engine/analytics.js';

const COLORS = {
  event: 'var(--gray)',
  prevented: 'var(--green)',
  caused: 'var(--red)',
  none: 'var(--border)',
};

function fmt(n) {
  if (!Number.isFinite(n)) return '–';
  if (Math.abs(n) >= 100) return n.toFixed(0);
  return String(Math.round(n * 10) / 10);
}

const ci2 = (x) => x.toFixed(2);

// 100-person icon array for cumulative-risk outcomes.
function IconArray({ control, treated }) {
  const withEvents = Math.round(Math.min(control, treated));
  const diff = Math.round(Math.abs(control - treated));
  const diffColor = treated < control ? COLORS.prevented : COLORS.caused;
  const cells = [];
  for (let i = 0; i < 100; i += 1) {
    let color = COLORS.none;
    if (i < withEvents) color = COLORS.event;
    else if (i < withEvents + diff) color = diffColor;
    cells.push(<span key={i} className="ae-cell" style={{ background: color }} />);
  }
  return (
    <div className="ae-icons" role="img" aria-label={`Of 100 patients: ${withEvents} have the event either way, ${diff} ${treated < control ? 'avoid it' : 'have it because of'} treatment.`}>
      {cells}
    </div>
  );
}

// Two bars for event-rate outcomes (recurrent events can exceed 100).
function RateBars({ control, treated }) {
  const max = Math.max(control, treated, 1);
  return (
    <div className="ae-bars">
      <div className="ae-bar-row">
        <span className="ae-bar-label">Without</span>
        <span className="ae-bar-track"><span className="ae-bar" style={{ width: `${(control / max) * 100}%`, background: COLORS.event }} /></span>
        <span className="ae-bar-value">{fmt(control)}</span>
      </div>
      <div className="ae-bar-row">
        <span className="ae-bar-label">With</span>
        <span className="ae-bar-track"><span className="ae-bar" style={{ width: `${(treated / max) * 100}%`, background: treated <= control ? COLORS.prevented : COLORS.caused }} /></span>
        <span className="ae-bar-value">{fmt(treated)}</span>
      </div>
      <p className="muted small ae-bar-unit">Events per 100 patient-years</p>
    </div>
  );
}

function headline(model) {
  if (!model.applicable) return 'No absolute translation';
  const e = model.atTrial;
  if (e.direction === 'uncertain' && model.data.primary.ci) return 'No clear effect';
  const label = e.diff < 0 ? 'NNH' : 'NNT';
  return `${label} ${roundNumber(e.number)}${unitPhrase(model.data.primary)}`;
}

// Absolute effect for one trial: what the relative effect means at a given
// baseline risk, plus flags when the patient sits outside the trial
// population. Renders nothing for trials not yet curated.
export default function AbsoluteEffectPanel({ trial, patient }) {
  const [open, setOpen] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const moved = useRef(false);
  const flagged = useRef(new Set());

  const model = useMemo(() => absoluteEffectModel(trial.id, multiplier), [trial.id, multiplier]);
  const flags = useMemo(() => transportFlags(trial.id, patient), [trial.id, patient]);

  useEffect(() => {
    if (!open) return;
    for (const f of flags) {
      if (!flagged.current.has(f.field)) {
        flagged.current.add(f.field);
        trackTransportFlag(trial.id, f.field);
      }
    }
  }, [open, flags, trial.id]);

  if (!model) return null;

  const p = model.data.primary;
  const units = p.kind === 'rate' ? ' per 100 patient-years' : '%';
  const e = model.primary;

  const onSlide = (v) => {
    setMultiplier(v);
    if (!moved.current) {
      moved.current = true;
      trackBaselineAdjusted(trial.id);
    }
  };

  return (
    <section className="evidence-panel ae-panel">
      <button
        type="button"
        className="evidence-toggle"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => {
            if (!v) {
              trackAbsoluteOpened(trial.id, trial.name);
              moved.current = false;
              flagged.current = new Set();
            }
            return !v;
          });
        }}
      >
        <span className="evidence-title">What does this mean in absolute terms?</span>
        <span className="evidence-counts">
          {flags.length > 0 && (
            <span className="evidence-count" style={{ color: 'var(--amber)' }}>
              {flags.length} population {flags.length === 1 ? 'flag' : 'flags'}
            </span>
          )}
          <span className="evidence-count ae-headline">{headline(model)}</span>
        </span>
        <span className={`chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="evidence-body">
          <p className="ae-outcome">
            <strong>{p.label}</strong>
            {p.kind === 'risk' && p.horizon ? <span className="muted"> over {p.horizon}</span> : null}
          </p>

          {!model.applicable ? (
            <p className="small">{model.reason}</p>
          ) : (
            <>
              <div className="ae-slider">
                <label htmlFor={`ae-slider-${trial.id}`} className="small">
                  Baseline risk without treatment: <strong>{fmt(model.baseline)}{units}</strong>
                  {multiplier === 1 ? (
                    <span className="muted"> (the trial&apos;s control arm)</span>
                  ) : (
                    <>
                      <span className="muted"> ({multiplier.toFixed(2)}× the trial&apos;s control arm) </span>
                      <button type="button" className="ae-reset" onClick={() => setMultiplier(1)}>Reset to trial</button>
                    </>
                  )}
                </label>
                <input
                  id={`ae-slider-${trial.id}`}
                  type="range"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={0.05}
                  value={multiplier}
                  onChange={(ev) => onSlide(Number(ev.target.value))}
                />
                <div className="ae-slider-ends muted small">
                  <span>Lower-risk patients</span>
                  <span>Higher-risk patients</span>
                </div>
              </div>

              <div className="ae-result">
                {p.kind === 'risk' ? (
                  <IconArray control={e.control} treated={e.treated} />
                ) : (
                  <RateBars control={e.control} treated={e.treated} />
                )}
                <div className="ae-numbers small">
                  <p>
                    For patients like those in the trial with this baseline risk:{' '}
                    <strong>{fmt(e.control)}{units}</strong> without treatment and{' '}
                    <strong>{fmt(e.treated)}{units}</strong> with it.
                  </p>
                  <p>
                    {(() => {
                      const what = e.diff < 0 ? 'number needed to harm' : 'number needed to treat';
                      return e.direction === 'uncertain' ? `Point estimate, ${what}` : what[0].toUpperCase() + what.slice(1);
                    })()}:{' '}
                    <strong>{roundNumber(e.number)}</strong>
                    {unitPhrase(p)}.
                  </p>
                  {e.numberRange && <p className="muted">{describeNumberRange(e.numberRange, '')}.</p>}
                  {!p.ci && <p className="muted">No confidence interval was reported for this ratio, so none is shown.</p>}
                  {p.kind === 'risk' && (
                    <p className="ae-key muted">
                      <span className="ae-swatch" style={{ background: COLORS.event }} /> event either way{' '}
                      <span className="ae-swatch" style={{ background: e.treated <= e.control ? COLORS.prevented : COLORS.caused }} />{' '}
                      {e.treated <= e.control ? 'avoided with treatment' : 'caused by treatment'}
                    </p>
                  )}
                </div>
              </div>

              <p className="muted small ae-source">
                Trial result: {p.measure} {p.estimate}
                {p.ci ? ` (95% CI ${ci2(p.ci[0])}–${ci2(p.ci[1])})` : ''}; control {fmt(p.control)}{units}, treated {fmt(p.treated)}{units}.
                {p.note ? ` ${p.note}` : ''}
              </p>
            </>
          )}

          {model.safety && (
            <div className="ae-safety small">
              <strong>Harm side: {model.safety.label}.</strong>{' '}
              {model.safety.singleArm ? (
                <>
                  {fmt(model.safety.treated)}% in the treated arm{model.safety.horizon ? ` (${model.safety.horizon})` : ''}.{' '}
                  <span className="muted">{model.safety.note}</span>
                </>
              ) : (
                <>
                  {fmt(model.safety.control)} versus {fmt(model.safety.treated)}
                  {model.safety.kind === 'rate' ? ' per 100 patient-years' : '%'} ({model.safety.measure} {model.safety.estimate}
                  {model.safety.ci ? `, 95% CI ${ci2(model.safety.ci[0])}–${ci2(model.safety.ci[1])}` : ''}), at the trial&apos;s own rate.
                </>
              )}
            </div>
          )}

          {flags.length > 0 && (
            <div className="ae-flags">
              <p className="small"><strong>How this patient compares with trial patients</strong></p>
              <ul>
                {flags.map((f) => (
                  <li key={f.field} className="small">
                    <span className="evidence-dot" style={{ background: f.level === 'flag' ? 'var(--red)' : 'var(--amber)' }} />
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {model.applicable && (
            <p className="evidence-note muted small">
              These numbers hold the trial&apos;s relative effect constant as baseline risk changes
              {p.measure === 'HR' && p.kind === 'risk' ? ' (proportional hazards over the trial follow-up)' : ''}.
              That is a working assumption, not a finding. They describe patients like those in the trial, not a prediction for one person.
            </p>
          )}

          <div className="evidence-provenance muted small">
            <span>
              Sources:{' '}
              {model.data.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && '; '}
                  <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                </span>
              ))}
            </span>
            <span>Curated by {model.data.curatedBy}, {model.data.lastVerified}.</span>
            {!model.data.verifiedBy && (
              <span className="evidence-unverified">
                Not yet independently verified.
                {model.data.fieldsToVerify?.length ? ` Pending: ${model.data.fieldsToVerify.join(', ')}.` : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
