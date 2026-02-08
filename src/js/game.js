// Evaluate a guess against the target word
// Returns array of 5 results: 'correct', 'present', or 'absent'
export function evaluateGuess(guess, target) {
  const result = new Array(5).fill('absent');
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  const used = new Array(5).fill(false);

  // First pass: mark correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }

  // Second pass: mark present but wrong position (yellow)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;

    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessLetters[i] === targetLetters[j]) {
        result[i] = 'present';
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

// Check if guess is valid (5 letters A-Z)
export function isValidGuess(guess) {
  return /^[A-Z]{5}$/.test(guess);
}

// Check if guess is correct
export function isCorrectGuess(guess, target) {
  return guess === target;
}

// Get keyboard letter states from all guesses
export function getKeyboardStates(guesses, target) {
  const states = {};

  for (const guess of guesses) {
    const result = evaluateGuess(guess, target);
    for (let i = 0; i < 5; i++) {
      const letter = guess[i];
      const newState = result[i];
      const currentState = states[letter];

      // Priority: correct > present > absent
      if (newState === 'correct') {
        states[letter] = 'correct';
      } else if (newState === 'present' && currentState !== 'correct') {
        states[letter] = 'present';
      } else if (!currentState) {
        states[letter] = 'absent';
      }
    }
  }

  return states;
}

// Game constants
export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;
