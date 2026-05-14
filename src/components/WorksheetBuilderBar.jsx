/**
 * Worksheet builder bar — lives below the patient profile in the left pane.
 *
 * Displays the current selection state ("0 trials selected" / "N trials
 * selected") and offers Clear + "Build EBM worksheet" actions. Decoupled from
 * ResultsDashboard so the dashboard stays focused on results rendering and so
 * the bar can live anywhere in the layout.
 */
export default function WorksheetBuilderBar({ selectedCount, onClearSelection, onOpenWorksheet }) {
  return (
    <div className="ws-builder-bar">
      <div className="ws-builder-msg">
        {selectedCount === 0 ? (
          <>
            <strong>Build an EBM worksheet:</strong>{' '}
            <span className="muted">Select articles to get started.</span>
          </>
        ) : (
          <>
            <strong>{selectedCount}</strong>{' '}
            {selectedCount === 1 ? 'trial' : 'trials'} selected for worksheet.
          </>
        )}
      </div>
      <div className="ws-builder-actions">
        <button
          type="button"
          className="ws-pill ws-pill-secondary"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        >
          Clear
        </button>
        <button
          type="button"
          className="ws-pill ws-pill-primary"
          disabled={selectedCount === 0}
          onClick={onOpenWorksheet}
        >
          Build Worksheet
        </button>
      </div>
    </div>
  );
}
