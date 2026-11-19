import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { useText } from '../../i18n/useText';
import { encodeBackup, useProfile } from '../../state/profileContext';

/**
 * A red button that erases the progress, behind an in-page confirmation, since
 * it cannot be undone. The confirmation offers to copy the backup code first.
 * The options stay as they are.
 */
export function ResetSection() {
  const text = useText();
  const { profile, dispatch } = useProfile();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  // What the last copy said, and the code itself when the copy was blocked.
  const [note, setNote] = useState('');
  const [code, setCode] = useState<string>();
  const codeBox = useRef<HTMLTextAreaElement>(null);

  // A blocked copy leaves the code selected for copying by hand.
  useEffect(() => {
    if (code) codeBox.current?.select();
  }, [code]);

  function close() {
    setConfirming(false);
    setNote('');
    setCode(undefined);
  }

  async function copyBackup() {
    const backup = encodeBackup(profile);
    try {
      await navigator.clipboard.writeText(backup);
      setCode(undefined);
      setNote(text.copied);
    } catch {
      setCode(backup);
      setNote(text.copyFailed);
    }
  }

  function erase() {
    dispatch({ type: 'resetProgress' });
    close();
    setDone(true);
  }

  return (
    <section className="reset-section">
      <h2>{text.resetTitle}</h2>
      <p className="reset-section-hint">{text.resetHint}</p>
      {!confirming && (
        <Button
          variant="danger"
          onClick={() => {
            setConfirming(true);
            setDone(false);
          }}
        >
          {text.resetButton}
        </Button>
      )}
      {confirming && (
        <div
          className="reset-section-confirm"
          role="alertdialog"
          aria-label={text.resetTitle}
        >
          <p>{text.resetWarning}</p>
          <Button variant="card" onClick={copyBackup}>
            {text.resetBackup}
          </Button>
          {code && (
            <textarea
              ref={codeBox}
              className="backup-section-code"
              aria-label={text.codeLabel}
              value={code}
              readOnly
              rows={4}
              onFocus={(event) => event.target.select()}
            />
          )}
          <p className="reset-section-note" role="status">
            {note}
          </p>
          <div className="reset-section-actions">
            <Button variant="danger" onClick={erase}>
              {text.resetConfirm}
            </Button>
            {/* The safe choice has the focus, so a stray Enter cancels. */}
            <Button variant="card" onClick={close} autoFocus>
              {text.cancel}
            </Button>
          </div>
        </div>
      )}
      <p className="reset-section-hint" aria-live="polite">
        {done ? text.resetDone : ''}
      </p>
    </section>
  );
}
