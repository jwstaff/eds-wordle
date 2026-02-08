# Ed's Wordle

A Tetris-themed daily word game built for Ed.

## Features

- Daily 5-letter word puzzle (10 words total)
- 90s PC Tetris visual theme with neon colors and beveled blocks
- Procedural chiptune sounds via Web Audio API
- Streak tracking and stats
- Share results to clipboard
- Zero external dependencies
- Privacy-first: no tracking, no cookies, no third-party scripts

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`

## Deploy

Push to GitHub and connect to Vercel. Auto-deploys on push to main.

## Privacy

No data leaves the user's device. All state is stored in localStorage.
