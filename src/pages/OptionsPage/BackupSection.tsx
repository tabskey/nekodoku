import { useRef, useState } from 'react';
import { Button } from '../../components/atoms/Button/Button';
import { useText } from '../../i18n/useText';
import {
  decodeBackup,
  encodeBackup,
  useProfile,
  type BackupResult,
} from '../../state/profileContext';

type Mode = 'idle' | 'export' | 'import';

interface BackupSectionProps {
  /** False inside a level: replacing the profile then would change it under a game in progress. */
  canImport?: boolean;
}

/**
 * Export the profile as a code to copy, or import one: check it, show what
 * it contains, and replace the profile only after an in-page confirmation.
 */
export function BackupSection({ canImport = true }: BackupSectionProps) {
  const text = useText();
  const { profile, dispatch } = useProfile();
  const [mode, setMode] = useState<Mode>('idle');
  const [code, setCode] = useState('');
  const [pasted, setPasted] = useState('');
  const [checked, setChecked] = useState<BackupResult>();
  const [status, setStatus] = useState('');
  const codeBox = useRef<HTMLTextAreaElement>(null);

  function open(next: Mode) {
    setMode(next);
    setStatus('');
    setChecked(undefined);
    setPasted('');
    // The code is a snapshot of this moment.
    if (next === 'export') setCode(encodeBackup(profile));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus(text.copied);
    } catch {
      // Clipboard can be blocked; leave the text selected for a manual copy.
      codeBox.current?.select();
      setStatus(text.copyFailed);
    }
  }

  function confirmImport() {
    if (!checked?.ok) return;
    dispatch({ type: 'importSave', save: checked.save });
    setMode('idle');
    setStatus(text.imported);
  }

  return (
    <section className="backup-section">
      <h2>{text.backupTitle}</h2>
      <p className="backup-section-hint">{text.backupHint}</p>
      <div className="backup-section-actions">
        <Button variant="card" onClick={() => open('export')}>
          {text.createCode}
        </Button>
        {canImport && (
          <Button variant="card" onClick={() => open('import')}>
            {text.useCode}
          </Button>
        )}
      </div>

      {mode === 'export' && (
        <>
          <textarea
            ref={codeBox}
            className="backup-section-code"
            aria-label={text.codeLabel}
            value={code}
            readOnly
            rows={4}
            onFocus={(event) => event.target.select()}
          />
          <Button onClick={copy}>{text.copyCode}</Button>
        </>
      )}

      {mode === 'import' && (
        <>
          <textarea
            className="backup-section-code"
            aria-label={text.pasteLabel}
            placeholder={text.pasteLabel}
            value={pasted}
            rows={4}
            onChange={(event) => {
              setPasted(event.target.value);
              setChecked(undefined);
            }}
          />
          {!checked?.ok && (
            <Button
              disabled={pasted.trim() === ''}
              onClick={() => setChecked(decodeBackup(pasted))}
            >
              {text.checkCode}
            </Button>
          )}
          {checked && !checked.ok && (
            <p className="backup-section-error" role="alert">
              {checked.error === 'checksum'
                ? text.codeChecksum
                : text.codeInvalid}
            </p>
          )}
          {checked?.ok && (
            <div
              className="backup-section-confirm"
              role="alertdialog"
              aria-label={text.backupTitle}
            >
              <p>
                {text.backupSummary(
                  checked.save.levelsCleared,
                  checked.save.coins,
                  checked.save.fish,
                  checked.save.ownedCats.length,
                )}
              </p>
              <p className="backup-section-error">{text.backupWarning}</p>
              <div className="backup-section-actions">
                <Button onClick={confirmImport}>{text.confirmImport}</Button>
                <Button variant="card" onClick={() => open('idle')}>
                  {text.cancel}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <p className="backup-section-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
