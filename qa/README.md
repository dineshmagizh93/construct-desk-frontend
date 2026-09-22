# Design verification

Implemented a shared architectural 3D design across all 10 active public routes, plus matching authentication visuals and shared workspace headers/cards. The existing disabled Industries route remains disabled.

The scene uses CSS building geometry, perspective, and pointer tilt, with no extra rendering dependency or downloaded assets. Reduced-motion preferences disable movement.

## Checks completed

- `npm run build`: passed. Vite reports its large import-dialog bundle warning.
- `npm run lint`: passed with existing fast-refresh warnings in `button.tsx` and `badge.tsx`.
- All 13 public/authentication routes checked at 1440, 768, 390, and 320 pixels: 52 combinations, no document horizontal overflow.
- Pricing toggle, all module groups, FAQ expansion, mobile navigation, and demo-form validation passed.
- Demo success flow verified using an intercepted API response; no real request was submitted.
- Reduced-motion animation suppression verified.
- Workspace dashboard checked at desktop and mobile sizes using an isolated fixture session. No live account or backend data was changed.
- No browser JavaScript runtime errors in these checks.

## Screenshots

- `home-desktop.png` and `home-mobile-top.png`
- `pricing-desktop-top.png` and `pricing-desktop.png`
- `features-mobile-top.png`
- `login-desktop.png`
- `workspace-desktop.png` and `workspace-mobile.png`
- `cta.png`

## Re-running browser checks

Start the frontend on `http://127.0.0.1:5173`. The scripts require Playwright and installed Google Chrome. Set `PLAYWRIGHT_MODULE` to a Playwright package path if it is not resolvable locally. Run scripts from the repository root:

```text
node frontend/qa/verify-pages.cjs
node frontend/qa/workspace-check.cjs
```

The browser checks use disposable headless sessions. They do not test live backend availability or real authentication.
