// Word list - all uppercase
const WORDS = ["RALPH", "REYVA", "RUGBY", "SCOUT", "BAGEL", "SPAIN", "SUSHI", "LABOR", "LEGAL", "SPICY"];

// Launch date for day index calculation
const LAUNCH_DATE = "2026-02-08";

// Seed for deterministic shuffle (arbitrary constant)
const SHUFFLE_SEED = 31337;

// Mulberry32 PRNG
function mulberry32(seed) {
  return function() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Seeded Fisher-Yates shuffle
function seededShuffle(array, seed) {
  const rng = mulberry32(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get the shuffled word list (same order for everyone)
const SHUFFLED_WORDS = seededShuffle(WORDS, SHUFFLE_SEED);

// Calculate day index based on 6 AM EST rollover
export function getDayIndex() {
  const now = new Date();
  // Get current date in Eastern time
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  // Subtract 6 hours so the "day" starts at 6 AM
  eastern.setHours(eastern.getHours() - 6);

  const launch = new Date(LAUNCH_DATE);
  const launchEastern = new Date(launch.toLocaleString("en-US", { timeZone: "America/New_York" }));
  launchEastern.setHours(launchEastern.getHours() - 6);

  const diffMs = eastern - launchEastern;
  return Math.floor(diffMs / 86400000);
}

// Get today's word (or null if all words exhausted)
export function getTodaysWord() {
  const dayIndex = getDayIndex();
  if (dayIndex < 0 || dayIndex >= SHUFFLED_WORDS.length) {
    return null;
  }
  return SHUFFLED_WORDS[dayIndex];
}

// Get total word count
export function getTotalWords() {
  return WORDS.length;
}

// Calculate time until next word (6 AM EST)
export function getTimeUntilNextWord() {
  const now = new Date();
  const eastern = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));

  // Next 6 AM
  const next6AM = new Date(eastern);
  next6AM.setHours(6, 0, 0, 0);

  // If it's past 6 AM today, next rollover is tomorrow
  if (eastern.getHours() >= 6) {
    next6AM.setDate(next6AM.getDate() + 1);
  }

  const diffMs = next6AM - eastern;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return { hours, minutes, seconds, totalMs: diffMs };
}
