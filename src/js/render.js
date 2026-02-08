import { MAX_GUESSES, WORD_LENGTH, evaluateGuess } from './game.js';

// Create the guess grid
export function createGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  for (let row = 0; row < MAX_GUESSES; row++) {
    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';
    rowEl.dataset.row = row;

    for (let col = 0; col < WORD_LENGTH; col++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = row;
      tile.dataset.col = col;
      rowEl.appendChild(tile);
    }

    grid.appendChild(rowEl);
  }
}

// Create the on-screen keyboard
export function createKeyboard(onKeyPress) {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
  ];

  for (const row of rows) {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';

    for (const key of row) {
      const keyEl = document.createElement('button');
      keyEl.className = 'key';
      keyEl.dataset.key = key;

      if (key === 'ENTER') {
        keyEl.textContent = '\u23CE';
        keyEl.classList.add('key-wide');
      } else if (key === 'BACK') {
        keyEl.textContent = '\u232B';
        keyEl.classList.add('key-wide');
      } else {
        keyEl.textContent = key;
      }

      keyEl.addEventListener('click', () => onKeyPress(key));
      rowEl.appendChild(keyEl);
    }

    keyboard.appendChild(rowEl);
  }
}

// Update a single tile with a letter
export function updateTile(row, col, letter) {
  const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
  if (tile) {
    tile.textContent = letter;
    if (letter) {
      tile.classList.add('filled');
    } else {
      tile.classList.remove('filled');
    }
  }
}

// Reveal guess results with animation
export function revealGuess(row, guess, target, onComplete) {
  const result = evaluateGuess(guess, target);
  const tiles = document.querySelectorAll(`.tile[data-row="${row}"]`);

  tiles.forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('revealing');

      setTimeout(() => {
        tile.classList.remove('revealing');
        tile.classList.add(result[i]);
      }, 150);

      if (i === 4 && onComplete) {
        setTimeout(onComplete, 300);
      }
    }, i * 150);
  });

  return result;
}

// Update keyboard key colors
export function updateKeyboard(keyStates) {
  for (const [letter, state] of Object.entries(keyStates)) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if (key) {
      key.classList.remove('correct', 'present', 'absent');
      key.classList.add(state);
    }
  }
}

// Shake the current row (invalid input)
export function shakeRow(row) {
  const rowEl = document.querySelector(`.grid-row[data-row="${row}"]`);
  if (rowEl) {
    rowEl.classList.add('shake');
    setTimeout(() => rowEl.classList.remove('shake'), 500);
  }
}

// Update stats display
export function updateStats(stats, dayIndex, totalWords) {
  document.getElementById('stat-day').textContent = `${dayIndex + 1} / ${totalWords}`;
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-best').textContent = stats.bestStreak;
}

// Update countdown timer
export function updateCountdown(time) {
  const h = String(time.hours).padStart(2, '0');
  const m = String(time.minutes).padStart(2, '0');
  const s = String(time.seconds).padStart(2, '0');
  document.getElementById('countdown').textContent = `${h}:${m}:${s}`;
}

// Show popup
export function showPopup(id) {
  document.getElementById(id).classList.add('visible');
}

// Hide popup
export function hidePopup(id) {
  document.getElementById(id).classList.remove('visible');
}

// Set popup message content
export function setPopupContent(id, content) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = content;
}

// Clear grid for retry
export function clearGrid() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
    tile.textContent = '';
    tile.classList.remove('filled', 'correct', 'present', 'absent', 'revealing');
  });
}

// Reset keyboard colors
export function resetKeyboard() {
  const keys = document.querySelectorAll('.key');
  keys.forEach(key => {
    key.classList.remove('correct', 'present', 'absent');
  });
}

// Show game over animation (fill from bottom)
export function showGameOver(onComplete) {
  const rows = document.querySelectorAll('.grid-row');
  const totalRows = rows.length;

  for (let i = totalRows - 1; i >= 0; i--) {
    const delay = (totalRows - 1 - i) * 100;
    setTimeout(() => {
      rows[i].classList.add('game-over');
      if (i === 0 && onComplete) {
        setTimeout(onComplete, 300);
      }
    }, delay);
  }
}

// Clear game over state
export function clearGameOver() {
  const rows = document.querySelectorAll('.grid-row');
  rows.forEach(row => row.classList.remove('game-over'));
}

// Show win animation (line clear effect)
export function showWinAnimation(row, onComplete) {
  const rowEl = document.querySelector(`.grid-row[data-row="${row}"]`);
  if (rowEl) {
    rowEl.classList.add('win-row');

    // Flash 3 times then sweep
    setTimeout(() => {
      rowEl.classList.add('win-sweep');
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }, 600);
  }
}
