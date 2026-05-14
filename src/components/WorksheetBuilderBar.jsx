/**
 * Worksheet builder bar — slim two-pill row below the Patient card.
 *
 * No container, no heading, no message text. The selection count is encoded
 * in the Build Worksheet button label ("Build Worksheet (3)") when ≥1 trial
 * is selected; otherwise both pills are disabled. This keeps the left rail
 * visually minimal while still surfacing the action.
 */
export default function WorksheetBuilderBar({ selectedCount, onClearSelection, onOpenWorksheet }) {
  const disabled = selectedCount === 0;
  return (
    <div className="ws-builder-row">
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
        {disabled ? 'Build Worksheet' : `Build Worksheet (${selectedCount})`}
      </button>
    </div>
  );
}
