# Vercel Deployment

This project builds a static Vite single-page application. It does not need a database, API service, or environment variables.

## Local verification

```bash
npm install
npm run typecheck
npm run build
npm run preview
```

The `dist/` directory is the production build output.

## Deployment steps

1. Upload the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Select the **Vite** preset.
4. Confirm `npm run build` as the build command and `dist` as the output directory.
5. Deploy and open the resulting URL.
6. Test the login page, each account role, direct navigation to `/app/dashboard`, and ESP/EN plus light/dark controls.

`vercel.json` rewrites direct requests to `index.html` for React Router.

## Data persistence

Demo changes are saved to the visitor's `sessionStorage`. They persist across refreshes in the same tab and usually disappear when that tab session ends. Other visitors see separate fictional data. Browsers can restore tab sessions after a crash or reopening.

## Security scope

The app is a fictional frontend demonstration. All passwords and data live in the browser. Client-side permissions cannot safeguard real academic information; production use requires a backend with server-side authorization, database policies, and appropriate privacy controls.
