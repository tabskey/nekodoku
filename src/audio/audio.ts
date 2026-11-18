// Plays the effects in sounds.ts with the Web Audio API. One AudioContext,
// started on the player's first tap, because browsers block audio before any
// interaction. play() never throws.
import { EFFECTS, type Effect } from './sounds';

let context: AudioContext | undefined;
let enabled = true;

/** Follows the sound option; off silences everything at once. */
export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** Creates or resumes the context; call it from a user gesture. */
export function unlockAudio() {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
  } catch {
    // No Web Audio: the game stays silent.
  }
}

export function play(effect: Effect) {
  if (!enabled || !context || context.state !== 'running') return;
  if (typeof document !== 'undefined' && document.hidden) return;
  try {
    let start = context.currentTime;
    for (const { freq, to, duration, wave, volume } of EFFECTS[effect]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(freq, start);
      if (to)
        oscillator.frequency.linearRampToValueAtTime(to, start + duration);
      // A quick fade out, so notes end without a click.
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
      start += duration;
    }
  } catch {
    // A failed sound must never break the game.
  }
}
