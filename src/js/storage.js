const STORAGE_KEY = "eds-wordle";
const CURRENT_VERSION = 1;

// Default state
function getDefaultState(dayIndex) {
  return {
    version: CURRENT_VERSION,
    currentDay: dayIndex,
    currentGuesses: [],
    currentState: "playing",
    isRetry: false,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0],
      completedDays: []
    },
    preferences: {
      soundEnabled: true
    }
  };
}

// Load state from localStorage
export function loadState(currentDayIndex) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState(currentDayIndex);
    }

    const state = JSON.parse(raw);

    // Version migration (if needed in future)
    if (state.version !== CURRENT_VERSION) {
      // For now, just update version
      state.version = CURRENT_VERSION;
    }

    // Check if it's a new day
    if (state.currentDay !== currentDayIndex) {
      // New day - reset current game but keep stats
      state.currentDay = currentDayIndex;
      state.currentGuesses = [];
      state.currentState = "playing";
      state.isRetry = false;
    }

    return state;
  } catch (e) {
    return getDefaultState(currentDayIndex);
  }
}

// Save state to localStorage
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Silent fail - game continues without persistence
  }
}

// Update stats on win
export function recordWin(state, guessCount) {
  state.stats.gamesPlayed++;
  state.stats.gamesWon++;
  state.stats.guessDistribution[guessCount - 1]++;

  // Only update streak on first-attempt wins
  if (!state.isRetry) {
    state.stats.currentStreak++;
    if (state.stats.currentStreak > state.stats.bestStreak) {
      state.stats.bestStreak = state.stats.currentStreak;
    }
  }

  // Track completed day
  if (!state.stats.completedDays.includes(state.currentDay)) {
    state.stats.completedDays.push(state.currentDay);
  }

  state.currentState = "won";
  return state;
}

// Update stats on loss
export function recordLoss(state) {
  state.stats.gamesPlayed++;
  state.stats.currentStreak = 0;
  state.currentState = "lost";
  return state;
}

// Reset for retry
export function resetForRetry(state) {
  state.currentGuesses = [];
  state.currentState = "playing";
  state.isRetry = true;
  return state;
}
