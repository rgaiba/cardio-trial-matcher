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
            <span className="muted">tick one or more trials, then open the worksheet to draft a journal-club / PBLI write-up.</span>
          </>
        ) : (
          <>
            <strong>{selectedCount}</strong>{' '}
            {selectedCount === 1 ? 'trial' : 'trials'} selected for worksheet.
          </>
        )}
      </div>
      <div className="ws-builder-actions">
        {selectedCount > 0 && (
          <button type="button" className="btn-secondary" onClick={onClearSelection}>
            Clear
          </button>
        )}
        <button
          type="button"
          className="btn-primary"
          disabled={selectedCount === 0}
          onClick={onOpenWorksheet}
        >
          Build EBM worksheet →
        </button>
      </div>
    </div>
  );
}
