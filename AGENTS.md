# AGENTS.md

## Project summary
This repo is a small Vite + React single-page Valentine app with two states:
- Ask scene: asks "Will you be my Valentine?" with a dodging `No` button and a growing `Yes` button.
- Yes scene: animated penguin sequence with kiss, silhouette walk loop, snowfall, and romantic text.

Primary goal for edits: preserve the playful interaction and cinematic mood while keeping the app fast and mobile-friendly.

## Stack and tools
- Runtime: React 19, React DOM 19
- Build/dev: Vite 6 (`npm run dev`, `npm run build`, `npm run preview`)
- Animation: Framer Motion
- Lint: ESLint 9 (`npm run lint`)
- Language: JavaScript/JSX (no TypeScript)

## Key files
- `src/App.jsx`: top-level state (`said`, `burst`), ask scene, scene transition
- `src/WalkScene.jsx`: yes-scene timeline, backdrop SVG, silhouette walk loop, footprints
- `src/FloatingHearts.jsx`: ask-scene ambient heart particles
- `src/Snow.jsx`: reusable snowfall particles
- `src/Icons.jsx`: shared inline SVG icons (`HeartIcon`, `PenguinIcon`)
- `src/App.css`: scene/component styling, layering, keyframes
- `src/index.css`: global reset, font import, root/body layout

## Behavior contracts (do not break)
- `No` button must remain evasive on both mouse and touch.
- `Yes` button should scale up as dodges increase.
- Ask -> Yes transition should keep burst + fade flow.
- Walk scene timeline should stay staged (entrance, kiss, silhouette walk).
- Scene must work on mobile viewport sizes without horizontal scrolling.

## Implementation guidelines
- Keep components functional and hook-based.
- Use `useMemo` for randomized particle lists so values stay stable during a render cycle.
- Prefer existing visual language (colors, rounded controls, soft glow, snow/heart ambience).
- Preserve layering expectations in CSS (`ask-bg` < particles < scene content).
- Prefer inline SVG/component reuse over adding image assets unless there is a clear need.
- Avoid introducing large dependencies for simple UI effects.

## Styling guidelines
- Keep responsiveness with `clamp(...)` and percentage positioning.
- Preserve `overflow: hidden` behavior on `body` and full-screen scene containers.
- When adding animations, keep durations/easing consistent with current pacing (romantic, not abrupt).

## Validation checklist
Run before finishing changes:
1. `npm run lint`
2. `npm run build`
3. Manual sanity checks in browser:
   - Ask screen loads with floating hearts/snow.
   - `No` button dodges correctly on hover and touch.
   - Clicking `Yes` triggers burst and transitions to walk scene.
   - Walk scene animates continuously (snow, silhouettes, footprints, text).

## Non-goals
- Do not rewrite the app architecture for this small project.
- Do not edit generated build output in `dist/` by hand.
