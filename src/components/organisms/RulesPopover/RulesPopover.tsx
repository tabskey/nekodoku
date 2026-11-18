import { useEffect, useRef } from 'react';
import './RulesPopover.css';

interface RulesPopoverProps {
  open: boolean;
  title: string;
  rules: readonly string[];
  closeHint: string;
  onClose: () => void;
}

/**
 * The puzzle rules over the screen. A native modal dialog: it takes focus,
 * closes on Escape, and closes on the next tap anywhere.
 */
export function RulesPopover({
  open,
  title,
  rules,
  closeHint,
  onClose,
}: RulesPopoverProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);

  return (
    // Any tap closes it, so the dialog itself is the close target; Escape
    // is handled by the browser through onClose.
    <dialog
      ref={dialog}
      className="rules-popover"
      aria-label={title}
      onClose={onClose}
      onClick={onClose}
    >
      <h2>{title}</h2>
      <ol>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <p className="rules-popover-hint">{closeHint}</p>
    </dialog>
  );
}
