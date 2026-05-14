/**
 * Worksheet builder card — sits below the Patient card in the left rail.
 *
 * Heading + subheading are static so the card always reads as a discrete
 * "Build a worksheet" tool, not a status display. The dynamic state lives
 * in the primary button label, which appends the count once any trials
 * are selected.
 */
export default function WorksheetBuilderBar({ selectedCount, onClearSelection, onOpenWorksheet }) {
  const disabled = selectedCount === 0;
  return (
    <div className="ws-builder-card">
      <div className="ws-builder-head">
        <h2 className="ws-builder-title">Build a worksheet</h2>
        <p className="ws-builder-sub muted">Pick a study to build.</p>
      </div>
      <div className="ws-builder-actions">
        <button
          type="button"
          className="ws-pill ws-pill-secondary"
          onClick={onClearSelection}
          disabled={disabled}
        >
          Clear
        </button>
        <button
          type="button"
          className="ws-pill ws-pill-primary"
          disabled={disabled}
          onClick={onOpenWorksheet}
        >
          {disabled ? 'Build' : `Build (${selectedCount})`}
        </button>
      </div>
    </div>
  );
}
