# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploy to GitHub Pages

This repo is configured for GitHub Pages using GitHub Actions (`.github/workflows/deploy-pages.yml`).

1. Create a new GitHub repository.
2. Push this project to that repository (`main` or `master` branch).
3. In GitHub: `Settings -> Pages -> Source`, choose `GitHub Actions`.
4. Push again (or run the workflow manually from `Actions`) and wait for `Deploy To GitHub Pages` to finish.
5. Your site URL will be shown in the workflow output.

If your repo does not use `main` or `master`, update the workflow branch list.

## Spotify setup (full-song playback)

This app can use Spotify Web Playback SDK to play the full track after clicking `Yes`.

1. Create a `.env` file from `.env.example`.
2. Set `VITE_SPOTIFY_CLIENT_ID` to your Spotify app client ID.
3. Add redirect URI(s) in Spotify app settings:
   - `https://attopp.github.io/valentine/` (production)
   - `http://127.0.0.1:5173/` (local dev)
4. In Spotify app settings, enable:
   - `Web API`
   - `Web Playback SDK`
5. Add allowed users in Spotify dashboard while app is in development mode.
