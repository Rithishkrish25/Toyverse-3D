import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { t } from '../../i18n';

/**
 * Undo and Reset control bar. The Undo button is disabled when paintHistory
 * is empty. Reset opens a confirmation dialog before clearing (Requirement 9).
 *
 * @returns The undo/reset bar UI with optional confirmation dialog.
 */
export default function UndoResetBar(): React.ReactElement {
  const paintHistory = useGameStore((s) => s.paintHistory);
  const undoPaint = useGameStore((s) => s.undoPaint);
  const resetPainting = useGameStore((s) => s.resetPainting);
  const locale = useGameStore((s) => s.locale);
  const [showConfirm, setShowConfirm] = useState(false);

  const canUndo = paintHistory.length > 0;

  return (
    <>
      <div className="undo-reset-bar">
        <button
          className="btn btn-undo"
          disabled={!canUndo}
          onClick={() => undoPaint()}
          style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed' }}
        >
          ↩ {t('undo.label', locale)}
        </button>
        <button
          className="btn btn-reset"
          onClick={() => setShowConfirm(true)}
        >
          ↺ {t('reset.label', locale)}
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <p>{t('reset.confirm', locale)}</p>
            <div className="confirm-buttons">
              <button
                className="btn btn-confirm"
                onClick={() => {
                  resetPainting();
                  setShowConfirm(false);
                }}
              >
                {t('reset.confirmYes', locale)}
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                {t('reset.confirmNo', locale)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
