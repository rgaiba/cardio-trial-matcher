/**
 * Worksheet builder card — sits below the Patient card in the left rail.
 *
 * Mirrors the visual chrome of .form-card (white surface, border, shadow)
 * so the two left-rail cards feel like a single stack. The empty-state
 * message tells the user where to act; once trials are selected the
 * message switches to a count.
 */
export default function WorksheetBuilderBar({ selectedCount, onClearSelection, onOpenWorksheet }) {
  const disabled = selectedCount === 0;
  const message = disabled
    ? 'Select studies to build a worksheet.'
    : `${selectedCount} ${selectedCount === 1 ? 'study' : 'studies'} selected.`;
  return (
    <div className="ws-builder-card">
      <p className="ws-builder-text">{message}</p>
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
          Build
        </button>
      </div>
    </div>
  );
}
