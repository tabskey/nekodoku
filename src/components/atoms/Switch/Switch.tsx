import './Switch.css';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** An on/off switch with its label; the whole row is the touch target. */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className="switch">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch-track" aria-hidden="true" />
    </label>
  );
}
