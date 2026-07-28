# Nom Nom Gacha 🎰🍜

A friendly food slot machine for kids with ARFID (Avoidant/Restrictive Food Intake Disorder) — and anyone else who finds "what do you want to eat?" the hardest question of the day.

Instead of cherries and bars, the reels show the child's own safe foods as cute anime-style illustrations, in a warm Genshin-Impact-inspired look. The machine decides, the child holds the button, and **every spin is a win**.

> 📋 The full product & build plan lives in [PLAN.md](PLAN.md).

## What it does

- **Three golden reels** always land on a matching food — every spin is a jackpot. An optional *combo mode* instead builds a meal from base + protein + extra reels.
- **Meal-type pools** (breakfast / lunch / dinner / snack), pre-selected by the clock.
- **Unlimited, judgment-free re-spins.** "Let's eat!" logs the meal; "Spin again" just spins again.
- **Smart randomness**: per-food weights, and recently eaten foods appear a little less often (never zero).
- **Rare ⭐ star drops** (off by default): a parent can mark *challenge foods* that occasionally land with a golden 5-star-style celebration — gentle food exposure framed as a rare gacha pull, always re-spinnable.
- **Collection book**: every food eaten unlocks its card, with stars at 1 / 5 / 15 eats. Repetition is celebrated, never punished.
- **PIN-gated parent settings**: food list CRUD with a 34-icon library, machine configuration, meal history log, JSON export/import — a full backup for this device, plus a shareable **setup** (foods + machine settings, no history or PIN) for another device or family: as a file, or **device-to-device via QR code** (show on one phone, scan with the other — no file juggling, works offline).
- **Norwegian + English**, day + night themes, synthesized sounds and haptics — all individually toggleable, with a calm reduced-motion mode.
- **Installable offline PWA**: everything runs on the device. No accounts, no server, no tracking, no external requests.

## A note on the slot machine aesthetic

The gacha look is borrowed purely for its celebratory energy. There is deliberately **no currency, no losing state, no odds display, no scarcity and no timers** — this is a decision aid, not a gambling loop, and it must stay that way.

## Development

```bash
npm install
npm run dev        # dev server
npm test           # unit tests (Vitest)
npm run e2e        # Playwright E2E on mobile viewports (builds first)
npm run lint       # oxlint
npm run typecheck  # tsc
npm run build      # production build with PWA precache
npm run icons      # regenerate PWA PNG icons from the logo SVG
```

Built with React 19, Vite 8, TypeScript, Tailwind CSS 4, Motion, Zustand, i18next and vite-plugin-pwa. Deployed to GitHub Pages by `.github/workflows/ci.yml` on pushes to `main`.

### Testing notes

- The spin engine is pure and takes an injectable RNG; unit tests assert weight distributions, anti-repeat decay and star-drop probability statistically over seeded draws.
- Appending `?testSeed=42` to the URL makes every spin deterministic — the E2E suite uses this; it is harmless in normal use.

### Data & privacy

All data (foods, settings, meal history) lives in `localStorage` on the device. The export file deliberately excludes the parent PIN. There are no analytics and no runtime network requests; the service worker precaches the entire app for offline use.
