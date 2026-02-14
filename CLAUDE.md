# Valentine Page

## What this is
A Valentine's Day page to ask my girlfriend "Will you be my valentine?"
Single-page React app (Vite) deployed for free.

## Core concept
Two scenes:
1. **Ask scene** — "Will you be my Valentine?" with YES/NO buttons. The NO button runs away on hover, gets smaller, changes text. YES button grows each dodge.
2. **Yes scene** — Cinematic nihilist-penguin-inspired sequence: two penguin silhouettes kiss, then walk together (hand-in-hand, seen from behind) toward snowy mountains at sunset, shrinking into the distance. Romantic twist on the viral "nihilist penguin" meme.

## Design principles
- **Silhouettes over detailed SVG** — The walk-away scene should use clean dark silhouettes against a sunset backdrop. Do NOT try to draw detailed penguin faces/bodies with SVG shapes — it looks like clipart. The nihilist penguin aesthetic is about simplicity and mood.
- **Cute but minimal** — The ask scene penguin can use emoji (🐧) or a very simple illustration. Less is more.
- **Cinematic feel** — The sunset/mountain backdrop, falling snow, and slow walk-away create atmosphere. The animation timing matters more than SVG detail.
- **Mobile-friendly** — Must work on phones (touch events for NO button).

## Tech stack
- Vite + React
- Framer Motion for animations
- No external assets — everything inline (SVG, CSS, emoji)
- Deploy: GitHub Pages or Netlify Drop (free)

## File structure
- `src/App.jsx` — Main app, Ask scene, scene switching
- `src/App.css` — All styles
- `src/WalkScene.jsx` — The yes/cinematic scene (kiss + walk away)
- `src/FloatingHearts.jsx` — Background floating hearts
- `src/Snow.jsx` — Falling snow particles
- `src/index.css` — Global styles, font import

## Key learnings
- Complex SVG penguin art with gradients/paths looks terrible when hand-coded — use silhouettes instead
- Lottie would be ideal for character animation but requires browsing LottieFiles (login-gated) to find assets
- The nihilist penguin meme is from Werner Herzog's 2007 documentary "Encounters at the End of the World"
- Framer Motion handles the timeline well with staged `useState` + `setTimeout`
