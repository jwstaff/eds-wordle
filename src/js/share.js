import { evaluateGuess } from './game.js';
import { getDayIndex, getTotalWords } from './words.js';

// Generate share text for clipboard
export function generateShareText(guesses, target, stats, isRetry) {
  const dayIndex = getDayIndex();
  const dayNumber = dayIndex + 1;
  const totalWords = getTotalWords();

  // Header
  let text = `Ed's Wordle - Day ${dayNumber}/${totalWords} \u{1F9E9}\n`;
  text += `Guessed in ${guesses.length}/6`;

  if (stats.currentStreak > 0 && !isRetry) {
    text += ` \u{1F525} Streak: ${stats.currentStreak}`;
  }

  if (isRetry) {
    text += ` (retry)`;
  }

  text += '\n\n';

  // Emoji grid
  for (const guess of guesses) {
    const result = evaluateGuess(guess, target);
    const row = result.map(r => {
      if (r === 'correct') return '\u{1F7E9}'; // green square
      if (r === 'present') return '\u{1F7E8}'; // yellow square
      return '\u2B1B'; // black square
    }).join('');
    text += row + '\n';
  }

  text += '\neds-wordle.vercel.app';

  return text;
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}
