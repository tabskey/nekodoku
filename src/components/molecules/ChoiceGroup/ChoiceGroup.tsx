import './ChoiceGroup.css';

interface ChoiceGroupProps<T extends string> {
  /** Shared name of the radio buttons; must be unique on the page. */
  name: string;
  legend: string;
  value: T;
  choices: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** One choice out of a few, as a row of segmented buttons (radio buttons underneath). */
export function ChoiceGroup<T extends string>({
  name,
  legend,
  value,
  choices,
  onChange,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-group">
      <legend>{legend}</legend>
      <div className="choice-group-options">
        {choices.map((choice) => (
          <label key={choice.value} className="choice-group-option">
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
