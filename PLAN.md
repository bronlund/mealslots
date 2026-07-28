# Nom Nom Gacha — Project Plan

A mobile-first single-page web app that helps a child with ARFID (Avoidant/Restrictive Food Intake Disorder) decide what to eat, by turning the decision into a joyful anime-style slot machine. Instead of cherries and bars, the reels show the child's own safe foods — pasta, rice, porridge, soup, tortilla and more — rendered as cute custom illustrations in a Genshin Impact–inspired visual style.

**Working title:** Nom Nom Gacha
**Repository:** `bronlund/mealslots`
**Primary user:** a child aged 11–15 with ARFID
**Secondary user:** their parent, who curates the food list and settings

---

## 1. Vision & guiding principles

For many kids with ARFID, the hardest part of a meal happens before the food exists: the decision. Open-ended questions ("what do you want to eat?") can be overwhelming, while being told what to eat removes agency. Nom Nom Gacha sits in the sweet spot: **the machine decides, but the child holds the button** — and every result is a food they already accept.

Design principles, in priority order:

1. **Every spin is a win.** There is no losing state, no currency, no wagering, no scarcity, no timers. The slot machine aesthetic is borrowed purely for its celebratory energy — this is a decision aid, not a gambling loop.
2. **The child is always in control.** Unlimited re-spins. A "challenge" food can appear only if the parent enables it, and it can always be re-spun away.
3. **Safe by default.** Only parent-approved foods appear. All data stays on the device. Sound and motion can be turned off — sensory sensitivity is common with ARFID.
4. **It must feel premium.** An 11–15-year-old who knows Genshin Impact will spot cheap imitation instantly. Animation timing, typography, and art consistency get real budget in this plan.

---

## 2. Decision log (from project interview, 2026-07-28)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Slot concept | **Configurable**: single-dish mode *or* 3-category component-combo mode, chosen in parent settings |
| 2 | Food curation | **Parent-managed list**; app ships with a starter set (~15 foods) |
| 3 | Re-spins | **Unlimited**, every result celebrated |
| 4 | Languages | **Norwegian (bokmål) + English**, i18n from day one |
| 5 | Art direction | **Genshin Impact style**: warm cream/gold, soft gradients, sparkles, star motifs |
| 6 | Food imagery | **Custom SVG illustrations**, consistent anime-cute style, bundled icon library |
| 7 | Audience age | **11–15** (confident reader, gacha-literate) |
| 8 | Sound & haptics | **Full juice, mutable**: reel clicks, landing thunk, jingle, vibration; prominent mute |
| 9 | Tech stack | **React 18 + Vite + TypeScript**, Tailwind CSS, Framer Motion |
| 10 | Data | **Local-only, no backend** (localStorage/IndexedDB) with file export/import |
| 11 | PWA | **Yes** — installable, fully offline |
| 12 | Hosting | **GitHub Pages** via GitHub Actions |
| 13 | Challenge foods | **Rare "star" food drops**: parent-enabled (off by default), configurable low probability, golden 5-star-style animation |
| 14 | Meal types | **Breakfast / lunch / dinner / snack** pools; foods tagged per meal type |
| 15 | Gamification | **Meal history log + food collection book**; no streaks/achievements |
| 16 | Parent access | **4-digit PIN** gate on settings |
| 17 | Spin trigger | **One big glowing SPIN button** |
| 18 | Randomness | **Weighted + anti-repeat**: per-food weights, recently eaten foods get temporarily lower odds |
| 19 | App name | **Nom Nom Gacha** |
| 20 | Delivery | **One complete build** (no phased MVP releases) |
| 21 | Reel visual (single-dish) | **3 reels that always land matching** — every spin is a jackpot |
| 22 | Starter foods | **~15 common kid foods** (list in §5.4) |
| 23 | Theming | **Day + night themes** (warm cream/gold day, starry navy/gold night), system-following with manual toggle |
| 24 | Testing | **Full pyramid**: Vitest unit tests + Playwright mobile E2E + CI on every push |

---

## 3. User experience specification

### 3.1 Child experience (the main app)

**Home / machine screen** — the heart of the app; everything else is secondary.

- Ornate slot machine cabinet fills the viewport (portrait, mobile-first), framed in Genshin-style gold filigree on a cream (day) or starry navy (night) backdrop.
- Meal-type selector above the cabinet: four pill buttons (🌅 breakfast, ☀️ lunch, 🌙 dinner, ✨ snack). Defaults to the type suggested by the clock (before 10:30 → breakfast, 10:30–14:00 → lunch, 14:00–20:00 → dinner, else snack), but the child can override with one tap.
- Three reels in a glass-effect window. Idle state: reels sway gently; food icons visible to invite curiosity.
- One big glowing **SPIN** button beneath the reels. Press → button depresses with haptic tick → reels spin up.
- Persistent, easy-to-reach **mute** toggle and a subtle settings (parent) entry point in a corner.

**Spin sequence** (target ~2.5–3.5 s total, skippable by tapping):

1. Spin-up: reels accelerate, icons streak with motion blur, rising ticking sound.
2. Cruise: brief anticipation period; on ~1 in 8 spins, an extra "near-stop stutter" beat for drama.
3. Staggered landing: left reel thunks into place, then center, then right — in single-dish mode all three land on the same food (jackpot!).
4. Celebration: screen flash, sparkle burst, jingle, the food's name in large display type ("PASTA!"), and two buttons: **"Let's eat!"** and **"Spin again"**.
   - *Let's eat!* logs the meal to history, credits the collection book, and shows a short happy confirmation.
   - *Spin again* returns to the machine instantly, no friction, no judgment.

**Star food drop** (only when enabled by parent): instead of the normal landing, reels glow gold, a Genshin-wish-style light beam sweeps the screen, and the challenge food is revealed on a radiant card: "⭐ RARE FOOD! Feeling brave?" with the same two buttons ("Spin again" remains equally prominent — no pressure).

**Combo mode** (when parent selects it): the three reels become independent categories — **Base** (pasta, rice, tortilla…), **Protein** (chicken, fish fingers, meatballs…), **Extra** (vegetable, sauce, fruit…) — and land on different foods that together form the meal. Result card shows all three as a combined "meal card".

**Collection book** — Genshin-archive-style gallery, reachable from the home screen:

- One card per food, gold-framed. Foods never eaten via the app appear as elegant silhouettes ("???" optional — silhouettes only, never pressure).
- Each "Let's eat!" fills the card: full-color art, an eat-counter, and 1–3 decorative stars at eat-count milestones (1 / 5 / 15). Repetition is celebrated, not penalized — eating pasta 40 times makes a maxed-out, shiny pasta card.
- Star foods get a distinct golden card back.

### 3.2 Parent experience (PIN-gated settings)

Entered from the corner gear icon → 4-digit PIN pad (PIN set on first run; stored hashed; recovery = "reset all settings" escape hatch which preserves the food list and history).

- **Foods**: list of all foods with search. Add / edit / disable / delete. Per food: name (free text), icon (picked from the bundled SVG library), meal types (multi-select), weight (Less / Normal / More), star-food flag, combo category (only relevant in combo mode).
- **Machine**: single-dish ↔ combo mode toggle; star drops on/off + probability slider (1–15 %, default 5 %); anti-repeat window (off / 24 h / 36 h / 48 h, default 36 h).
- **App**: language (nb/en), theme (system/day/night), sound on/off, haptics on/off, reduced-motion override.
- **History**: chronological log of confirmed meals (date, meal type, food(s), star flag) — useful for spotting patterns and for conversations with healthcare providers. Clearable.
- **Data**: export everything as a JSON file (share/download), import from file with a confirmation preview. This is also the device-migration and backup story.

### 3.3 First-run experience

1. Language picker (nb/en, pre-selected from browser locale).
2. One friendly explainer screen for the parent: what the app is, that data never leaves the device.
3. PIN setup.
4. Starter foods are seeded (localized to chosen language); parent is dropped into the food list to prune/adjust, with a "Done — go spin!" button.

---

## 4. Design system — "Teyvat Kitchen"

Inspired by Genshin Impact's UI language, **without copying any Hoyoverse asset, logo, font, or artwork** (see §9 Risks).

### 4.1 Color tokens

| Token | Day | Night | Use |
|---|---|---|---|
| `bg` | warm cream `#F5EFDF` | deep navy `#141A2E` | app background (subtle paper/star texture) |
| `surface` | soft ivory `#FBF7EC` | dark slate `#1E2740` | cards, cabinet panels |
| `gold` | `#C8A05A` | `#D9B96C` | filigree frames, borders, accents |
| `ink` | warm brown `#3E3527` | parchment `#EDE5CF` | primary text |
| `accent` | amber glow `#E8A33D` | `#F0B653` | SPIN button, highlights |
| `star` | radiant gold `#F5C542` + white core | same | star-food effects |
| `success` | leaf `#7FA65A` | `#8FB86A` | "Let's eat!" confirmations |

Both themes must pass WCAG AA contrast for all text. Theme follows `prefers-color-scheme` with a manual override persisted in settings.

### 4.2 Typography (self-hosted for offline PWA; open licenses)

- **Display** (headlines, food reveal, "JACKPOT"): an elegant fantasy-leaning serif — *Cinzel* or *Marcellus*.
- **Body/UI**: a rounded, friendly sans with full Norwegian glyph support (æøå) — *Nunito* or *M PLUS Rounded 1c*.
- Numerals and PIN pad use tabular figures.

### 4.3 Motifs & components

- Gold filigree corner ornaments on panels (reusable SVG component).
- Star/sparkle particles (canvas or SVG, pooled for performance).
- Glass-morphism reel window with soft inner shadow.
- Buttons: rounded-rectangle with gold border, gentle emboss, pressed state sinks 2 px with haptic tick.
- Rarity language: normal results = warm amber glow; star foods = full golden beam + particle fountain (Genshin 5-star homage).

### 4.4 Motion language

- Easing: anticipation + overshoot (`easeOutBack` family) for landings; never linear.
- Idle: slow 3–4 s breathing loops (reel sway, button glow pulse).
- `prefers-reduced-motion` (or the in-app override): spins become a ~400 ms crossfade shuffle with the same result logic; particles disabled; celebrations become static cards. Full feature parity, calm presentation.

### 4.5 Sound design (all synthesized or CC0, bundled locally)

- Reel tick (rapid, pitch rising slightly), landing thunk ×3 (staggered), jackpot jingle (~1.5 s, warm and bright), star-food chime (harp gliss), UI taps.
- Implemented via Web Audio API with a preloaded sample buffer; global mute respected everywhere; iOS silent-switch behavior respected (no audio session hacks).
- Haptics via `navigator.vibrate` where available (Android; iOS Safari currently ignores it — degrade silently).

### 4.6 Food icon library

15 starter foods + every icon needed for parent-added foods, drawn as **custom SVGs in one consistent style**: thick soft outlines, cel-shaded two-tone fills, a tiny sparkle highlight, subtle "chibi face" optional variant kept OFF by default (an 11–15-year-old may find faces babyish — decided at art review, see step 4).

The library ships larger than the starter set (~30–40 icons: common carbs, proteins, fruits, vegetables, dishes) so parents adding foods can almost always find a matching icon; a generic "plate" icon is the fallback.

---

## 5. Architecture

### 5.1 Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** with design tokens as CSS custom properties (theme switching = swapping a `data-theme` attribute)
- **Framer Motion** for reels, celebrations, and screen transitions
- **Zustand** for app state (small, ergonomic, easy to persist)
- **react-i18next** for nb/en
- **vite-plugin-pwa** (Workbox) for the service worker + manifest
- **Vitest + React Testing Library** (unit/component), **Playwright** (E2E)
- Routing: no router library needed — a simple screen-state machine (`machine | collection | history | settings | firstRun`) keeps the SPA tiny; deep links are not a requirement for an installed PWA.

### 5.2 Repository layout

```
mealslots/
├── PLAN.md
├── README.md
├── index.html
├── vite.config.ts
├── .github/workflows/ci.yml        # lint, typecheck, unit, e2e, build, deploy
├── public/                          # manifest icons, favicons
├── src/
│   ├── app/                         # App shell, screen state machine, theming
│   ├── components/                  # Ornament, Panel, Button, PinPad, ...
│   ├── features/
│   │   ├── machine/                 # SlotMachine, Reel, SpinButton, CelebrationOverlay
│   │   ├── collection/              # CollectionBook, FoodCard
│   │   ├── history/                 # HistoryList
│   │   ├── settings/                # FoodEditor, MachineSettings, DataExport
│   │   └── firstRun/                # Onboarding wizard
│   ├── engine/                      # PURE logic, no React: spin engine, RNG, weighting
│   ├── data/                        # types, storage adapter, migrations, seed foods
│   ├── icons/foods/                 # the SVG food library + registry
│   ├── audio/                       # sound manager + samples
│   ├── i18n/                        # nb.json, en.json
│   └── styles/                      # tokens, themes, global css
└── e2e/                             # Playwright specs + fixtures
```

### 5.3 Data model

```ts
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type SlotMode = 'single' | 'combo';
type ComboCategory = 'base' | 'protein' | 'extra';
type Weight = 'less' | 'normal' | 'more';        // multipliers 0.5 / 1 / 2

interface Food {
  id: string;                  // uuid
  name: string;                // free text (seed foods localized at seed time)
  iconId: string;              // key into the SVG icon registry
  enabled: boolean;
  weight: Weight;
  isStar: boolean;             // challenge food
  mealTypes: MealType[];
  comboCategory?: ComboCategory;
  createdAt: string;           // ISO
}

interface MealLogEntry {
  id: string;
  at: string;                  // ISO timestamp of "Let's eat!"
  mealType: MealType;
  foodIds: string[];           // 1 (single mode) or 3 (combo mode)
  wasStar: boolean;
}

interface Settings {
  slotMode: SlotMode;
  starDropsEnabled: boolean;   // default false
  starChance: number;          // 0.01–0.15, default 0.05
  antiRepeatHours: 0 | 24 | 36 | 48;  // default 36
  language: 'nb' | 'en';
  theme: 'system' | 'day' | 'night';
  soundOn: boolean;
  hapticsOn: boolean;
  reducedMotion: 'system' | 'on' | 'off';
  pinHash: string;             // SHA-256(pin + per-install salt)
}

interface PersistedState {
  schemaVersion: number;       // migrations run on load
  foods: Food[];
  log: MealLogEntry[];
  settings: Settings;
}
```

Storage: a thin adapter over `localStorage` (payload is small — well under limits) with `schemaVersion` + forward-only migrations, debounced writes, and corruption recovery (invalid JSON → keep a `.backup` copy, re-seed, surface a gentle notice). Export/import serializes `PersistedState` (minus `pinHash`) to a JSON file.

### 5.4 Starter foods (seeded on first run, parent-editable)

| en | nb | default meal types |
|---|---|---|
| Pasta | Pasta | lunch, dinner |
| Rice | Ris | dinner |
| Porridge | Grøt | breakfast, dinner |
| Oatmeal | Havregrøt | breakfast |
| Soup | Suppe | lunch, dinner |
| Tortilla / wrap | Tortilla / wrap | lunch, dinner |
| Pizza | Pizza | dinner |
| Pancakes | Pannekaker | dinner, snack |
| Fish fingers | Fiskepinner | dinner |
| Meatballs | Kjøttboller | dinner |
| Sausages | Pølser | lunch, dinner |
| Burger | Burger | dinner |
| Bread slice | Brødskive | breakfast, lunch, snack |
| Yogurt | Yoghurt | breakfast, snack |
| Toast | Toast | breakfast, snack |

All seeded with weight *normal*, star *off*, enabled. (This table is a starting point — expected to be pruned to the child's actual safe foods on first run.)

### 5.5 Spin engine (pure, deterministic, injectable RNG)

The engine lives in `src/engine/`, has **zero React or DOM dependencies**, and takes its random source as a constructor argument — production uses `crypto.getRandomValues`, tests inject a seeded PRNG for fully deterministic assertions.

Selection algorithm per spin:

1. **Pool**: enabled, non-star foods whose `mealTypes` include the active meal type. (Combo mode: one pool per category; a category with an empty pool is skipped and the UI shows 2 reels — parent settings warn about thin pools.)
2. **Star check**: if star drops are enabled *and* at least one enabled star food matches the meal type, roll once: with probability `starChance` the result is a star food (uniform among eligible star foods) and steps 3–4 are skipped.
3. **Weights**: each food's base multiplier from `weight` (0.5 / 1 / 2).
4. **Anti-repeat**: any food appearing in a `MealLogEntry` within the last `antiRepeatHours` gets its multiplier × 0.25 (never 0 — a child who *wants* yesterday's pasta can still get it).
5. Weighted random draw. Edge cases: empty pool → friendly "no foods for this meal yet" state pointing the parent at settings; single-food pool → it just always wins (which is fine).

The engine also exposes `buildReelStrip(result, pool)` — the decorative sequence of icons each reel scrolls through before landing, so the animation layer never re-implements selection logic.

---

## 6. Step-by-step build plan

One complete build, sequenced so that risk retires early (art style and reel feel are the make-or-break items). Each step has acceptance criteria (AC).

### Step 0 — Scaffold & toolchain (½ day)
- `npm create vite@latest` (react-ts), Tailwind, Framer Motion, Zustand, react-i18next, vite-plugin-pwa, Vitest, RTL, Playwright, ESLint + Prettier.
- Vite `base` configured for GitHub Pages (`/mealslots/`).
- **AC:** `npm run dev/build/test/lint/typecheck` all green on a hello-world page.

### Step 1 — CI pipeline (½ day)
- `.github/workflows/ci.yml`: install → lint → typecheck → unit tests → build → Playwright E2E (Chromium mobile) on every push/PR; deploy job to GitHub Pages runs only on the default branch and is kept disabled until release (step 15).
- **AC:** pipeline green on the feature branch.

### Step 2 — Design tokens & theme system (1 day)
- Implement §4.1 palettes as CSS custom properties; `data-theme` switching (system/day/night); self-host fonts; base components: `Panel` (with gold corner ornaments), `Button`, `Pill`, `GlassWindow`.
- **AC:** a token showcase page renders both themes, passes AA contrast checks, and theme follows OS setting live.

### Step 3 — Data layer (1 day)
- Types from §5.3, storage adapter, `schemaVersion` migrations, seed logic, Zustand stores wired to persistence, export/import functions.
- **AC:** unit tests for migrations (v0→v1), corruption recovery, seed idempotency, export→wipe→import round-trip.

### Step 4 — Food icon library, batch 1 + art review gate (2–3 days) ⚠️ *risk-retirement step*
- Draw 5 icons first (pasta, rice, porridge, soup, tortilla) in the §4.6 style; build the icon registry + `FoodIcon` component; render them in a reel mock in both themes.
- **Art review with the family** — including the actual end user, whose taste veto is final (chibi faces on/off decided here). Iterate until approved, *then* produce the remaining ~30 icons.
- **AC:** all starter foods + ≥15 extra icons approved and registered; icons crisp at reel size (~96 px) and card size (~160 px).

### Step 5 — Spin engine (1 day)
- Implement §5.5 with injectable RNG.
- **AC:** unit tests cover weighting distribution (statistical tolerance over 10 000 seeded draws), anti-repeat decay, star probability, meal-type filtering, combo pools, empty/single pools.

### Step 6 — i18n (½ day)
- `nb.json` + `en.json` for all UI strings; language switch; localized seed foods; `lang` attribute + date formatting via `Intl`.
- **AC:** no hardcoded strings (lint rule / grep check); both languages render without layout breakage on a 360 px viewport.

### Step 7 — Slot machine UI (3 days) ⚠️ *the heart — budget generously*
- `Reel` (virtualized icon strip, motion-blur while cruising), `SlotMachine` cabinet, meal-type pills with clock-based default, SPIN button with pressed/glow states.
- Full spin choreography from §3.1 including staggered landings, jackpot-match behavior in single mode, independent landings in combo mode, tap-to-skip.
- **AC:** 60 fps on a mid-range Android phone (tested via CPU-throttled profiling); spin feels *good* — family sign-off required, timing values kept in one tunable config object.

### Step 8 — Celebration & star drop (1–2 days)
- Result overlay ("PASTA!"), sparkle particle burst, "Let's eat!" / "Spin again" flow, history + collection crediting; golden beam sequence for star foods.
- **AC:** celebration runs ≤ target duration, skippable, logs exactly one entry per confirmation; reduced-motion variant verified.

### Step 9 — Sound & haptics (1 day)
- Web Audio manager, §4.5 sample set, mute toggle (persisted, always visible), vibration on spin/land where supported.
- **AC:** no audio before first user gesture (autoplay policy); mute is instant and total; app fully usable silent.

### Step 10 — Collection book & history (1–1½ days)
- Gallery per §3.1 (silhouette → unlocked → milestone stars), star-food card backs; parent-facing history list in settings with clear function.
- **AC:** counts derive purely from the log (no separate counters to drift); unlock animation on first-time foods.

### Step 11 — Parent settings & PIN (2 days)
- PIN pad (set/verify/change, hashed + salted), settings screens per §3.2: food CRUD with icon picker, machine config, app config, data export/import with preview.
- **AC:** E2E-tested CRUD; PIN survives reload; import of a corrupt/foreign file fails safely with a readable error; disabling every food for a meal type produces the friendly empty state, not a crash.

### Step 12 — First-run onboarding (1 day)
- §3.3 wizard; skippable nothing (PIN required), everything else has sane defaults.
- **AC:** fresh-profile E2E: language → explainer → PIN → prune foods → first spin in under 2 minutes.

### Step 13 — PWA (1 day)
- Manifest (name, maskable icons, portrait orientation, theme colors per theme), Workbox precache of the full app (fonts, icons, audio), offline-first strategy, custom install hint, update flow ("new version — refresh" toast).
- **AC:** Lighthouse PWA installable pass; airplane-mode cold start works end-to-end; update toast verified against a changed deploy.

### Step 14 — Accessibility & polish pass (1–1½ days)
- Reduced-motion audit (§4.4), screen-reader announcements (result announced via live region), focus order, 44 px minimum touch targets, contrast re-check both themes, landscape fallback (letterboxed portrait layout is acceptable), performance budget check (< 300 KB JS gzipped before audio/fonts).
- **AC:** axe-core clean in E2E; VoiceOver (iOS) and TalkBack (Android) spot-checks of the spin flow.

### Step 15 — E2E suite completion (1–1½ days)
- Playwright mobile viewports (Pixel 7, iPhone 14) covering: first-run, spin → eat → collection credit, spin-again loop, meal-type switching, star drop (deterministic via injected seed hook), full settings CRUD, PIN gate, export/import round-trip, offline reload, both languages, both themes, reduced motion.
- **AC:** suite green in CI in < 10 min.

### Step 16 — Release (½ day)
- Enable the Pages deploy job; deploy; install on the family's actual phones; live QA session with the end user; README with screenshots, a plain-language explanation of the app and its privacy stance (all data on-device), and parent instructions.
- **AC:** app installed and spinning on the child's phone. 🎰

**Total estimate: ~18–21 working days** of focused effort, dominated by art (step 4) and machine feel (steps 7–8) — which is the correct place for this project to spend its budget.

---

## 7. Testing strategy (full pyramid)

- **Unit (Vitest)** — the engine is the crown jewel: weighting statistics, anti-repeat, star odds, pool filtering, combo edge cases; storage migrations and corruption recovery; export/import; PIN hashing.
- **Component (RTL)** — PIN pad, food editor form validation, meal-type pills, celebration button flow.
- **E2E (Playwright, mobile emulation)** — the step 15 scenario list; runs headless in CI on every push. Star-drop determinism via a test-only hook that injects a seeded RNG (excluded from production builds via env flag).
- **Manual** — real-device sessions (the child's phone) at steps 4, 7, and 16; sound/haptics can only truly be judged on hardware.

## 8. Deployment

- GitHub Actions → GitHub Pages (static). Vite `base: '/mealslots/'` (dropped to `/` if a custom domain is added later).
- Service worker update flow tested as part of step 13 so users never get stuck on stale versions.
- No analytics, no external requests at runtime — the CSP can be locked to `self`, which is both a privacy statement and a guarantee the PWA works offline.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Art quality/consistency** across 30+ SVGs is the biggest effort and the most visible quality factor | Step 4 gate: style locked on 5 icons with family approval before batch production; one shared SVG template (stroke widths, palette, highlight) |
| **Hoyoverse IP** — "inspired by" must never become "copied from" | No Hoyoverse assets, fonts, logos, character art, or trade dress; original palette/ornaments; open-licensed fonts; name contains no Hoyoverse marks |
| **Slot machine imagery for a minor** could read as gambling normalization | §1 principles enforced in code: no currency, loss states, odds display, or scarcity mechanics; README states this stance explicitly |
| **Sensory overload** (common with ARFID) | Mute + haptics-off + reduced-motion all independently toggleable and prominent; celebrations skippable |
| **The child simply doesn't vibe with it** | End-user veto at steps 4 and 7 while change is cheap; unlimited re-spins keep the tool pressure-free |
| **iOS PWA quirks** (audio unlock, no vibration, storage eviction) | Audio after first gesture; haptics degrade silently; export/import as backup against Safari storage eviction; test on real iPhone at step 16 |
| **localStorage limits/corruption** | Tiny payload, versioned schema, backup copy + safe re-seed path, export encouraged in UI |

## 10. Explicitly out of scope (per interview)

- Streaks/achievement badges (considered, declined — pressure risk)
- Cloud sync, accounts, multi-device sharing (local + export/import instead)
- Multiple child profiles (single-child app; revisit only if needed)
- Phased/MVP releases (single complete build)

## 11. Future ideas (not planned, parked)

- Optional photo attached to a food card ("this is *our* pasta")
- Shareable food-list QR codes between two parents' devices
- A "what's for dinner" widget/shortcut on the home screen
- Additional languages

---

*Plan agreed via structured interview on 2026-07-28. Next step: Step 0 — scaffold the project.*

---

## Revision 2026-07-28 — spin mechanic rework (post-review)

After playing the first build, the design changed from "every spin is a jackpot" to a real slot mechanic:

- The three reels land **independently** — matching is possible, never guaranteed.
- The result shows as **three tappable text lines** between the reel window and the SPIN button (no celebration modal). Tapping a line logs that food to history and the collection book.
- **Jackpots are parent-defined** in settings: "three of a kind" (on by default) plus custom food-trio combinations, matched in any reel order.
- A jackpot plays an in-place **fireworks animation and fanfare** over the playing area; star drops fill all reels with the challenge food and celebrate in gold.
