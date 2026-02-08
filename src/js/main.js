import { getDayIndex, getTodaysWord, getTotalWords, getTimeUntilNextWord } from './words.js';
import { loadState, saveState, recordWin, recordLoss, resetForRetry } from './storage.js';
import { evaluateGuess, isValidGuess, isCorrectGuess, getKeyboardStates, MAX_GUESSES, WORD_LENGTH } from './game.js';
import { generateShareText, copyToClipboard } from './share.js';
import {
  createGrid,
  createKeyboard,
  updateTile,
  revealGuess,
  updateKeyboard,
  shakeRow,
  updateStats,
  updateCountdown,
  showPopup,
  hidePopup,
  setPopupContent,
  clearGrid,
  resetKeyboard,
  showGameOver,
  clearGameOver,
  showWinAnimation
} from './render.js';
import {
  initAudio,
  setSoundEnabled,
  isSoundEnabled,
  playKeyPress,
  playBackspace,
  playSubmit,
  playWin,
  playGameOver,
  playError
} from './sound.js';

// Game state
let state = null;
let currentInput = '';
let targetWord = null;
let isRevealing = false;
let lastDayIndex = null;
let audioInitialized = false;

// Initialize audio on first user interaction
function ensureAudio() {
  if (!audioInitialized) {
    initAudio();
    audioInitialized = true;
  }
}

// Initialize the game
function init() {
  const dayIndex = getDayIndex();
  lastDayIndex = dayIndex;
  targetWord = getTodaysWord();

  // Check if game is complete (all words exhausted)
  if (targetWord === null) {
    state = loadState(dayIndex);
    showCompletionScreen();
    return;
  }

  // Load state
  state = loadState(dayIndex);

  // Apply sound preference
  setSoundEnabled(state.preferences.soundEnabled);
  updateSoundButton();

  // Create UI
  createGrid();
  createKeyboard(handleKeyPress);

  // Restore previous guesses
  restoreGuesses();

  // Update stats display
  updateStats(state.stats, dayIndex, getTotalWords());

  // Start countdown timer
  updateCountdownTimer();
  setInterval(updateCountdownTimer, 1000);

  // Check for day rollover every minute
  setInterval(checkDayRollover, 60000);

  // Setup keyboard listeners
  document.addEventListener('keydown', handlePhysicalKeyboard);

  // Setup popup buttons
  setupPopupButtons();

  // Setup sound toggle
  setupSoundToggle();

  // If already won or lost, show appropriate state
  if (state.currentState === 'won') {
    showWonState();
  } else if (state.currentState === 'lost') {
    showLostState();
  }
}

// Restore guesses from saved state
function restoreGuesses() {
  for (let row = 0; row < state.currentGuesses.length; row++) {
    const guess = state.currentGuesses[row];
    const result = evaluateGuess(guess, targetWord);

    for (let col = 0; col < WORD_LENGTH; col++) {
      const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
      tile.textContent = guess[col];
      tile.classList.add('filled', result[col]);
    }
  }

  // Update keyboard
  const keyStates = getKeyboardStates(state.currentGuesses, targetWord);
  updateKeyboard(keyStates);
}

// Handle key press (from physical or on-screen keyboard)
function handleKeyPress(key) {
  ensureAudio();

  if (isRevealing) return;
  if (state.currentState !== 'playing') return;

  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACK') {
    deleteLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }
}

// Handle physical keyboard
function handlePhysicalKeyboard(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    handleKeyPress('ENTER');
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    handleKeyPress('BACK');
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    e.preventDefault();
    handleKeyPress(e.key.toUpperCase());
  }
}

// Add a letter to current input
function addLetter(letter) {
  if (currentInput.length >= WORD_LENGTH) return;

  playKeyPress();
  currentInput += letter;
  const row = state.currentGuesses.length;
  const col = currentInput.length - 1;
  updateTile(row, col, letter);
}

// Delete last letter
function deleteLetter() {
  if (currentInput.length === 0) return;

  playBackspace();
  const row = state.currentGuesses.length;
  const col = currentInput.length - 1;
  updateTile(row, col, '');
  currentInput = currentInput.slice(0, -1);
}

// Submit current guess
function submitGuess() {
  if (currentInput.length !== WORD_LENGTH) {
    playError();
    shakeRow(state.currentGuesses.length);
    return;
  }

  if (!isValidGuess(currentInput)) {
    playError();
    shakeRow(state.currentGuesses.length);
    return;
  }

  playSubmit();

  const guess = currentInput;
  const row = state.currentGuesses.length;

  isRevealing = true;

  revealGuess(row, guess, targetWord, () => {
    isRevealing = false;

    // Add guess to state
    state.currentGuesses.push(guess);

    // Update keyboard
    const keyStates = getKeyboardStates(state.currentGuesses, targetWord);
    updateKeyboard(keyStates);

    // Check win/lose
    if (isCorrectGuess(guess, targetWord)) {
      state = recordWin(state, state.currentGuesses.length);
      saveState(state);
      playWin();
      showWinAnimation(row, () => {
        setTimeout(() => showWonState(), 300);
      });
    } else if (state.currentGuesses.length >= MAX_GUESSES) {
      state = recordLoss(state);
      saveState(state);
      playGameOver();
      setTimeout(() => showLostState(), 500);
    } else {
      saveState(state);
    }
  });

  currentInput = '';
}

// Show won state
function showWonState() {
  setPopupContent('win-message', `GUESSED IN ${state.currentGuesses.length}/6`);
  showPopup('win-popup');
}

// Show lost state
function showLostState() {
  setPopupContent('lose-word', targetWord);
  showGameOver(() => {
    showPopup('lose-popup');
  });
}

// Show completion screen
function showCompletionScreen() {
  const wordsWon = state.stats.completedDays.length;
  const totalWords = getTotalWords();
  setPopupContent('complete-stats', `WORDS SOLVED: ${wordsWon}/${totalWords}<br>BEST STREAK: ${state.stats.bestStreak}`);
  showPopup('complete-popup');
}

// Update countdown timer display
function updateCountdownTimer() {
  const time = getTimeUntilNextWord();
  updateCountdown(time);
}

// Check for day rollover
function checkDayRollover() {
  const currentDayIndex = getDayIndex();
  if (currentDayIndex !== lastDayIndex) {
    showPopup('newword-popup');
  }
}

// Update sound button icon
function updateSoundButton() {
  const btn = document.getElementById('sound-btn');
  btn.textContent = isSoundEnabled() ? '\u{1F50A}' : '\u{1F507}';
}

// Setup sound toggle
function setupSoundToggle() {
  document.getElementById('sound-btn').addEventListener('click', () => {
    ensureAudio();
    const newState = !isSoundEnabled();
    setSoundEnabled(newState);
    state.preferences.soundEnabled = newState;
    saveState(state);
    updateSoundButton();
  });
}

// Setup popup button handlers
function setupPopupButtons() {
  // Win popup - share button
  document.getElementById('share-btn').addEventListener('click', async () => {
    const text = generateShareText(state.currentGuesses, targetWord, state.stats, state.isRetry);
    const success = await copyToClipboard(text);
    if (success) {
      const btn = document.getElementById('share-btn');
      btn.textContent = 'COPIED!';
      setTimeout(() => {
        btn.textContent = 'SHARE RESULTS';
      }, 2000);
    }
  });

  // Win popup - close button
  document.getElementById('win-close').addEventListener('click', () => {
    hidePopup('win-popup');
  });

  // Lose popup - retry button
  document.getElementById('retry-btn').addEventListener('click', () => {
    hidePopup('lose-popup');
    clearGameOver();
    clearGrid();
    resetKeyboard();
    state = resetForRetry(state);
    saveState(state);
    currentInput = '';
  });

  // New word popup - refresh button
  document.getElementById('refresh-btn').addEventListener('click', () => {
    location.reload();
  });

  // Help button
  document.getElementById('help-btn').addEventListener('click', () => {
    showPopup('help-popup');
  });

  // Help close button
  document.getElementById('help-close').addEventListener('click', () => {
    hidePopup('help-popup');
  });
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', init);
