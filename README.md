# Study XP

Study XP is a school-first web app that turns real classes, assignments, and focus time into a dopamine-friendly system with XP, levels, streaks, Pomodoro bonuses, skill trees, and recovery paths.

## What it does

- Tracks one real student profile for school
- Turns classes and assignments into daily quests and higher-stakes study sessions
- Rewards progress with XP, levels, streaks, combo bonuses, and skill unlocks
- Includes Pomodoro mode, catch-up paths, and low-energy task recovery
- Saves locally by default and supports Google sign-in plus Firebase-based cloud sync when configured

## Local development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal for live development.

## Production build

```bash
npm run build
```

The production bundle is written to `dist/`. This project uses a single-file Vite build so the app can also be opened directly from `dist/index.html`.

## Firebase setup

Google sign-in and cloud sync are optional. To enable them, copy `.env.example` into a local env file and fill in your Firebase values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If these values are missing, the app still works in local-only mode and Google sign-in will stay unavailable on that deployment.

## Cloudflare Pages deployment

This project also supports Cloudflare Pages with Wrangler.

```bash
npm install
npm run build
npm run deploy:cloudflare
```

The deploy command publishes `dist/` to a Cloudflare Pages project named `study-xp`.

Current public site:

- `https://study-xp.pages.dev`
