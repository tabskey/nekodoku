// Plays the effects in sounds.ts and the songs in songs.ts with the Web
// Audio API. One AudioContext, started on the player's first tap, because
// browsers block audio before any interaction. Nothing here ever throws.
import { loopIndex, noteFrequency, SONGS, type SongId } from './songs';
import { EFFECTS, type Effect, type Note } from './sounds';

let context: AudioContext | undefined;
let enabled = true;

/** Follows the sound option; off silences every effect at once. */
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

// The context, when it can play right now.
function ready(): AudioContext | undefined {
  if (!context || context.state !== 'running') return undefined;
  if (typeof document !== 'undefined' && document.hidden) return undefined;
  return context;
}

function scheduleNote(
  audio: AudioContext,
  { freq, to, duration, wave, volume }: Note,
  start: number,
) {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(freq, start);
  if (to) oscillator.frequency.linearRampToValueAtTime(to, start + duration);
  // A quick fade out, so notes end without a click.
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function play(effect: Effect) {
  const audio = enabled ? ready() : undefined;
  if (!audio) return;
  try {
    let start = audio.currentTime;
    for (const note of EFFECTS[effect]) {
      scheduleNote(audio, note, start);
      start += note.duration;
    }
  } catch {
    // A failed sound must never break the game.
  }
}

// Music: notes are booked a little ahead on the audio clock, so the rhythm
// stays steady even when the page is busy.
const LOOKAHEAD_S = 0.4;
const TICK_MS = 150;
let musicTimer: number | undefined;

/**
 * Loops a song until stopMusic(). Silent while the page is hidden. A song
 * with an introduction plays it once, unless `skipIntro` starts at the loop.
 */
export function startMusic(id: SongId, skipIntro = false) {
  stopMusic();
  const song = SONGS[id];
  const beat = 60 / song.bpm;
  // Where each voice goes back to when it reaches its end.
  const loopAt = song.voices.map((voice) =>
    song.loopFromBeat ? loopIndex(voice, song.loopFromBeat) : 0,
  );
  const cursors = song.voices.map(() => ({ index: 0, time: 0, done: false }));
  let playing = false;
  const tick = () => {
    const audio = ready();
    if (!audio) {
      playing = false;
      return;
    }
    try {
      // Starting, or back from a pause: every voice restarts together.
      if (!playing) {
        cursors.forEach((cursor, v) => {
          cursor.index = skipIntro ? loopAt[v] : 0;
          cursor.time = audio.currentTime + 0.05;
          cursor.done = false;
        });
        playing = true;
      }
      song.voices.forEach((voice, v) => {
        const cursor = cursors[v];
        while (!cursor.done && cursor.time < audio.currentTime + LOOKAHEAD_S) {
          const [name, beats, glide] = voice.notes[cursor.index];
          const duration = beats * beat;
          if (name !== '-') {
            scheduleNote(
              audio,
              {
                freq: noteFrequency(name),
                to: glide ? noteFrequency(glide) : undefined,
                duration,
                wave: voice.wave,
                volume: voice.volume,
              },
              cursor.time,
            );
          }
          cursor.time += duration;
          const next = cursor.index + 1;
          if (next < voice.notes.length) cursor.index = next;
          else if (song.once) cursor.done = true;
          else cursor.index = loopAt[v];
        }
      });
      // Everything is booked: nothing more to schedule (the notes still
      // sound out on the audio clock).
      if (cursors.every((cursor) => cursor.done)) stopMusic();
    } catch {
      // A failed note must never break the game.
    }
  };
  tick();
  musicTimer = window.setInterval(tick, TICK_MS);
}

export function stopMusic() {
  if (typeof window !== 'undefined') window.clearInterval(musicTimer);
  musicTimer = undefined;
}
