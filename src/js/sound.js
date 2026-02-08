// Web Audio API sound engine - procedurally generated chiptune sounds

const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

// Initialize audio context on first user interaction
export function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Set sound enabled state
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

// Get sound enabled state
export function isSoundEnabled() {
  return soundEnabled;
}

// Play a single tone
function playTone(freq, duration, type = 'square', volume = 0.3) {
  if (!audioCtx || !soundEnabled) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// Play a sequence of tones
function playSequence(notes, interval) {
  notes.forEach((note, i) => {
    setTimeout(() => {
      playTone(note.freq, note.duration, note.type || 'square', note.volume || 0.3);
    }, i * interval);
  });
}

// Sound effects

// Key press - short high blip
export function playKeyPress() {
  playTone(660, 0.05, 'square', 0.2);
}

// Backspace - short low blip
export function playBackspace() {
  playTone(330, 0.05, 'square', 0.2);
}

// Guess submitted - rapid ascending
export function playSubmit() {
  playSequence([
    { freq: 440, duration: 0.08 },
    { freq: 550, duration: 0.08 },
    { freq: 660, duration: 0.08 }
  ], 80);
}

// Tile reveal - Tetris lock thud
export function playTileReveal() {
  playTone(220, 0.1, 'triangle', 0.25);
}

// Correct tile (green) - bright ding
export function playCorrectTile() {
  playTone(880, 0.15, 'square', 0.25);
}

// Win / line clear - ascending arpeggio C5→E5→G5→C6
export function playWin() {
  playSequence([
    { freq: 523, duration: 0.15 },  // C5
    { freq: 659, duration: 0.15 },  // E5
    { freq: 784, duration: 0.15 },  // G5
    { freq: 1047, duration: 0.25 } // C6
  ], 100);
}

// Game over - descending E4→D4→C4→B3
export function playGameOver() {
  playSequence([
    { freq: 330, duration: 0.2, type: 'sawtooth' },  // E4
    { freq: 294, duration: 0.2, type: 'sawtooth' },  // D4
    { freq: 262, duration: 0.2, type: 'sawtooth' },  // C4
    { freq: 247, duration: 0.3, type: 'sawtooth' }   // B3
  ], 200);
}

// Invalid input - error buzz
export function playError() {
  playTone(150, 0.15, 'sawtooth', 0.2);
}
