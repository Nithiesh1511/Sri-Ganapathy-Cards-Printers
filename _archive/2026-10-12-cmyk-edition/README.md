# Sri Ganapathy Cards and Printers — website

A 3D showcase site for **Sri Ganapathy Cards and Printers**, built from the shop's printed business card.
React + TypeScript + Vite + Tailwind, with [three.js](https://threejs.org) for the 3D.

## Run it

```bash
npm install
npm run dev        # http://127.0.0.1:5180
npm run build      # type-checks, then builds to ./dist (relative URLs — host it anywhere)
npm run preview    # serve the built site locally
```

> The project folder name contains `&`, which breaks the `.bin` shims that npm normally uses on Windows
> (`cmd.exe` reads it as "run another command"). The scripts therefore call `node` on Vite and TypeScript
> directly, so `npm run …` works from PowerShell, Git Bash or cmd. If you rename the folder you can switch
> them back to plain `vite` / `tsc`.

## What's on the page

| Section | What it does |
| --- | --- |
| **Hero** | Four translucent ink plates (cyan, magenta, yellow, key) float in 3D and slide into **registration** as you scroll, printing the shop's visiting card. Pointer parallax; live registration readout. |
| **Marquee** | Every service on the card, scrolling in two lines of gold foil lettering. |
| **Promises** | The card's three promises as CSS‑3D tilt cards (each illustration on a gilt-framed proof plate), plus "The full range" — the card's four columns as a typographic index. |
| **Colour lab** | Slide C/M/Y/K and watch the inks multiply; "Print this colour" fills the enquiry form. |
| **Print Showroom** | All **17 services** as 3D objects on a turntable (drag to turn). Includes an offset press with rolling cylinders, a screen‑printing frame and squeegee, a flex banner that waves, a tear‑off daily calendar and a monthly calendar that shows the real current month. |
| **Contact** | A flip‑card business card, phone/email/Instagram, and an enquiry form that writes the email for you (`mailto:`). |

## Luxury edition & themes

The whole site is dressed as a premium print house: gilt hairlines, foil lettering, ivory stock, slow
easing, and a four-ink detail kept as a quiet signature.

**Opening sequence.** On the first visit of a session the page opens with the hero scene itself as the
loading animation: the four ink plates slide into register in the middle of the screen (with a live
percentage), lock into the finished visiting card with a foil sweep, hold a beat, then the card eases to
its place and the page opens up. Any click, tap, key or scroll skips it; it is skipped for
`prefers-reduced-motion` and when WebGL is missing, and never waits more than a few seconds on a slow
download. Code: `src/lib/intro.ts` (timeline), `Hero.tsx` (drives it), `index.html` (sets `data-intro`
before first paint so there is no flash). There are **four themes**, chosen with the round chip in the nav (inside the menu on phones).
The choice is remembered, and the new theme is revealed in a circle growing from the button you pressed.

| Theme | Mood |
| --- | --- |
| **Ivory & Gold** (default) | Warm paper, gilt edges |
| **Midnight Noir** | Black lacquer, champagne gold |
| **Royal Indigo** | Deep violet, antique gold |
| **Rosewood** | Burgundy velvet, rose gold |

A theme re-colours the page **and** both 3D scenes: the hero's plates are laid on a pool of light that
suits the theme (so the inks still read on a dark page), and the showroom's turntable, rim and gold dust
change with it. The Showroom, Marquee and Footer are deliberately always dark — a gallery at night — in every theme.

**Adding or editing a theme** takes two edits that must agree:

1. `src/index.css` — a `:root[data-theme='…']` block of colour variables (`"r g b"` triplets).
2. `src/data/themes.ts` — the matching entry, including the `three` colours the WebGL scenes use
   (`three.bg` must equal the CSS `--paper`). Add the id to `ThemeId`.

## Where things live

```
src/data/site.ts          ← the business's details and service list (edit text here)
src/data/themes.ts        ← the four themes (swatches + the colours the 3D scenes use)
src/lib/theme.tsx         ← ThemeProvider: applies a theme, persists it, notifies the 3D scenes
src/index.css             ← theme variables, buttons, foil text, panels, intro curtain
src/three/HeroScene.ts    ← hero scene;  heroArt.ts draws each ink plate
src/three/ShowroomScene.ts← turntable, lights, camera, product swapping
src/three/models/         ← one builder per service (stationery / print / binding / calendars)
src/components/           ← page sections
```

## Notes for the owner

- **Nothing is invented.** The site only uses what is printed on the business card: name, phone numbers,
  email, Instagram, the three promises and the service list ("Daily Calaendar" is spelled *Calendar* here).
  No street address, opening hours, prices or years in business appear anywhere — add them in
  `src/data/site.ts` / `Contact.tsx` when you have them.
- **Logo.** The pinwheel mark is redrawn as vector (`src/components/Logo.tsx`) from the logo on the card.
  To use the original artwork, replace `PinwheelMark` with an `<img>`.
- **Enquiry form** has no server: it opens the visitor's email app with the message written. To send
  directly, point it at a form service or small API.
- **Accessibility / motion.** `prefers-reduced-motion` turns off the scroll scrub, auto-rotation and
  animated reveals. Without WebGL the hero shows a flat card and the showroom keeps its list.
- Calendars use the visitor's real date; the diary shows next year from September onward.
