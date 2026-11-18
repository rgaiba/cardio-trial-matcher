import { useState } from 'react';
import { appraiseTrial, LEVEL_META } from '../engine/appraisal.js';
import { trackEvidenceOpened, trackWhyOpened } from '../engine/analytics.js';

// Evidence card: eight design checks for one trial. Collapsed by default so
// the trial card stays short. Renders nothing for trials not yet curated.
export default function EvidencePanel({ trial }) {
  const appraisal = appraiseTrial(trial.id);
  const [open, setOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(() => new Set());

  if (!appraisal) return null;

  const { checks, counts } = appraisal;
  const toggleWhy = (checkId) => {
    setWhyOpen((prev) => {
      const next = new Set(prev);
      if (next.has(checkId)) next.delete(checkId);
      else {
        next.add(checkId);
        trackWhyOpened(trial.id, checkId);
      }
      return next;
    });
  };

  return (
    <section className="evidence-panel">
      <button
        type="button"
        className="evidence-toggle"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => {
            if (!v) trackEvidenceOpened(trial.id, trial.name);
            return !v;
          });
        }}
      >
        <span className="evidence-title">How was this trial built?</span>
        <span className="evidence-counts">
          {counts.flag > 0 && <span className="evidence-count" style={{ color: LEVEL_META.flag.color }}>{counts.flag} bias risk</span>}
          {counts.caution > 0 && <span className="evidence-count" style={{ color: LEVEL_META.caution.color }}>{counts.caution} to weigh</span>}
          {counts.pass > 0 && <span className="evidence-count" style={{ color: LEVEL_META.pass.color }}>{counts.pass} protect</span>}
        </span>
        <span className={`chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="evidence-body">
          <ul className="evidence-list">
            {checks.map((c) => (
              <li key={c.id} className={`evidence-row evidence-${c.level}`}>
                <span
                  className="evidence-dot"
                  style={{ background: LEVEL_META[c.level].color }}
                  title={LEVEL_META[c.level].label}
                  aria-label={LEVEL_META[c.level].label}
                />
                <div className="evidence-text">
                  <div>
                    <strong>{c.label}.</strong> {c.summary}{' '}
                    <button type="button" className="evidence-why" onClick={() => toggleWhy(c.id)}>
                      {whyOpen.has(c.id) ? 'Hide why' : 'Why this matters'}
                    </button>
                  </div>
                  {whyOpen.has(c.id) && <p className="evidence-why-text muted small">{c.why}</p>}
                </div>
              </li>
            ))}
          </ul>

          {appraisal.teachingNote && <p className="evidence-teaching">{appraisal.teachingNote}</p>}

          <p className="evidence-legend muted small">
            {Object.entries(LEVEL_META).map(([k, m]) => (
              <span key={k} className="evidence-legend-item">
                <span className="evidence-dot" style={{ background: m.color }} /> {m.label}
              </span>
            ))}
          </p>
          <p className="evidence-note muted small">
            These checks describe how the trial was designed, not whether its result is true.
          </p>

          <div className="evidence-provenance muted small">
            <div>
              Sources:{' '}
              {appraisal.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && '; '}
                  <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                </span>
              ))}
            </div>
            <div>
              Curated by {appraisal.curatedBy}, {appraisal.lastVerified}.{' '}
              {appraisal.verifiedBy
                ? `Verified by ${appraisal.verifiedBy}.`
                : <span className="evidence-unverified">Not yet independently verified.</span>}
              {appraisal.fieldsToVerify.length > 0 && (
                <> Pending check: {appraisal.fieldsToVerify.join(', ')}.</>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
