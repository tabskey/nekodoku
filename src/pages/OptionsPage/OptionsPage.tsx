import { Button } from '../../components/atoms/Button/Button';
import { Switch } from '../../components/atoms/Switch/Switch';
import { ChoiceGroup } from '../../components/molecules/ChoiceGroup/ChoiceGroup';
import { useText } from '../../i18n/useText';
import { useOptions } from '../../state/profileContext';
import { BackupSection } from './BackupSection';
import './OptionsPage.css';

interface OptionsPageProps {
  onBack: () => void;
}

/** Language, mode, sound, auto-mark and the backup code. Changes apply at once. */
export function OptionsPage({ onBack }: OptionsPageProps) {
  const text = useText();
  const { options, setOption } = useOptions();

  return (
    <main className="options-page">
      <h1>{text.optionsTitle}</h1>
      <ChoiceGroup
        name="language"
        legend={text.languageLegend}
        value={options.language}
        choices={[
          { value: 'system', label: text.followDevice },
          { value: 'pt', label: text.portuguese },
          { value: 'en', label: text.english },
        ]}
        onChange={(language) => setOption('language', language)}
      />
      <ChoiceGroup
        name="theme"
        legend={text.themeLegend}
        value={options.theme}
        choices={[
          { value: 'system', label: text.followDevice },
          { value: 'dark', label: text.night },
          { value: 'light', label: text.day },
        ]}
        onChange={(theme) => setOption('theme', theme)}
      />
      <Switch
        label={text.sound}
        checked={options.sound}
        onChange={(sound) => setOption('sound', sound)}
      />
      <Switch
        label={text.music}
        checked={options.music}
        onChange={(music) => setOption('music', music)}
      />
      <Switch
        label={text.autoMark}
        checked={options.autoMark}
        onChange={(autoMark) => setOption('autoMark', autoMark)}
      />
      <BackupSection />
      <Button onClick={onBack}>{text.back}</Button>
    </main>
  );
}
