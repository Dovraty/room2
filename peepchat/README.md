# PeepChat — native prototype

A social texting app where conversations become the content. This folder is the **initial visual concept**: an Expo + React Native + TypeScript prototype for iOS and Android, with mock data and simulated live behaviour. Read **[DESIGN.md](DESIGN.md)** for the concept and decisions.

## Run it

```bash
cd peepchat
npm install
npx expo start
```

Then press `i` (iOS Simulator), `a` (Android emulator), or scan the QR code with **Expo Go** (SDK 58) on a phone.
Everything used is in the Expo Go runtime (Reanimated, Gesture Handler, SVG, Blur, Linear Gradient, Haptics). For a dev build: `npx expo run:ios` / `npx expo run:android`.

## Clickable flow

Onboarding → **Start peeping** → Discover → tap the live hero card (aperture opens) → drag up / tap **The Gallery** → **Poll** tab → vote → drag the sheet down → tap a chatter in the cast strip → profile (Follow / Notify).

Other entry points: the **Studio** tab (chatter's own view with the "Show audience reactions" toggle), **Following** (notifications), and **System** (the design system, motion and haptic demos, plus links to every screen and state, including ended, empty, and loading).

## Project map

```
src/app/            routes (Expo Router)
  index.tsx         onboarding
  (tabs)/           discover · following · studio · system (design system)
  live/[id].tsx     live text chat (viewer)       e.g. /live/reveal, /live/roundtable, ?ended=1
  audio/[id].tsx    live audio room               /audio/afterhours
  replay/[id].tsx   replay with timeline          /replay/lakehouse
  chatter/[id].tsx  profile                       /chatter/marisol
  studio-live.tsx   chatter's own view            ?audience=off
src/theme/          tokens.json (source of truth) + typed theme + ThemeProvider
src/components/     component library
src/data/           mock JSON (fictional people and chats)
src/hooks/          useLiveScript (simulated live feed)
scripts/            icon renderer, contrast audit, web screenshot harness
docs/               screenshots: iPhone 393×852 + Android 412×915, dark + light
```

## Scripts

| | |
|---|---|
| `npm run typecheck` | TypeScript |
| `npx expo lint` | ESLint (expo config) |
| `npm run contrast` | WCAG audit of every token pairing |
| `npm run icons` | Re-render app icon / adaptive icon / splash / favicon from SVG |
| `npm run build:web && node scripts/serve.mjs & npm run shots` | Re-capture all screenshots (`?device=ios\|android` simulates safe areas on web) |

All people, shows, handles and conversations are fictional.
