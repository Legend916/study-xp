# Study XP

Study XP is a school-first web app that turns real classes, assignments, and focus time into a dopamine-friendly system with XP, levels, streaks, Pomodoro bonuses, skill trees, and recovery paths.

## What it does

- Tracks one real student profile for school
- Turns classes and assignments into daily quests and higher-stakes study sessions
- Rewards progress with XP, levels, streaks, combo bonuses, and skill unlocks
- Includes Pomodoro mode, catch-up paths, and low-energy task recovery
- Saves locally by default and supports Firebase-based cloud sync when configured

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

Cloud sign-in and sync are optional. To enable them, copy `.env.example` into a local env file and fill in your Firebase values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

If these values are missing, the app still works in local-only mode.

## GitHub Pages deployment

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

After pushing the repo to GitHub:

1. Open the repository settings.
2. In `Pages`, set the source to `GitHub Actions`.
3. Push to `main` or run the workflow manually.

If you want cloud sync in production, add the same `VITE_FIREBASE_*` values as GitHub Actions repository secrets.
