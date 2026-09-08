# Gautam — Data Analyst Portfolio

A React + Vite portfolio site, with an optional Express API on Render that
serves the project list live (falls back to bundled data if the API is
offline).

## Structure
- `index.html` — Vite entry point, loads `src/main.jsx`
- `src/App.jsx` — page content and logic
- `src/styles.css`, `src/enhancements.css` — styling
- `src/three/BackgroundField.jsx` — fixed full-page 3D particle-network
  background (Three.js, lazy-loaded)
- `src/three/HeroOrbit.jsx` — interactive 3D hero centerpiece with
  mouse-reactive orbiting skill nodes (Three.js, lazy-loaded)
- `public/resume/` — put `Gautam_Data_Analyst_Resume.pdf` here (see the note
  in that folder)
- `backend/` — Express API (`/api/projects`, `/api/contact`) deployed
  separately on Render; the frontend's `API_URL` in `App.jsx` points to it

## Before publishing
1. Replace the GitHub, LinkedIn and email links in `src/App.jsx`.
2. Add `Gautam_Data_Analyst_Resume.pdf` to `public/resume/`.
3. Replace project links as you complete real projects (in both
   `src/App.jsx`'s `fallbackProjects` and `backend/src/routes/projects.js` —
   keep their shapes in sync: `skills`, `type`, `dashboard`, `github`,
   `metrics`).
4. Push to GitHub — `.github/workflows/deploy.yml` builds and deploys to
   GitHub Pages automatically on push to `main`.

## Local development
```
npm install
npm run dev        # frontend, http://localhost:5173

cd backend
npm install
npm run dev         # API, http://localhost:5000
```

## Hosting
- Frontend: GitHub Pages (`vite.config.js` `base` is set to the repo name,
  keep it in sync if you rename the repo).
- Backend: Render free tier — note it spins down when idle, so the first
  request after inactivity can take a few seconds; the site falls back to
  bundled project data until it responds.
