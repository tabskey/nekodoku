import { Button } from '../../components/atoms/Button/Button';
import { useText } from '../../i18n/useText';
import { applyUpdate, useUpdateReady } from '../../pwa/update';

/** Offers the new version of the game, when one is waiting. The progress is kept. */
export function UpdateSection() {
  const text = useText();
  if (!useUpdateReady()) return null;
  return (
    <section className="update-section">
      <h2>{text.updateTitle}</h2>
      <p className="update-section-hint">{text.updateHint}</p>
      <Button onClick={applyUpdate}>{text.updateButton}</Button>
    </section>
  );
}
