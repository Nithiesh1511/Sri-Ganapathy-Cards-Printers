# Sri Ganapathy Cards and Printers — website

"Print Atelier" edition: a premium 3D site for **Sri Ganapathy Cards and Printers**, built from the shop's
visiting card. React + TypeScript + Vite + Tailwind, with [three.js](https://threejs.org) for the hero.
No other runtime libraries. The scroll scenes and product art are CSS 3D driven by a few custom properties.

## Run it

```bash
npm install
npm run dev         # http://127.0.0.1:5180
npm run typecheck   # TypeScript, strict
npm run build       # type-checks, then builds to ./dist (relative URLs — host it anywhere)
npm run preview     # serve the built site locally
```

> The folder name contains `&`, which breaks npm's `.bin` shims on Windows, so the scripts call `node` on
> Vite and TypeScript directly. If you rename the folder you can switch them back to plain `vite` / `tsc`.

## The page, top to bottom

| Section | File | What it does |
| --- | --- | --- |
| Navigation | `Navigation.tsx` | Transparent over the hero, ivory once scrolled; active-section marker; mobile sheet menu. |
| Hero | `HeroSection.tsx`, `three/HeroScene.ts`, `three/cardArt.ts` | Three physical cards (layered plies, purple foil, soft shadows, dust motes). Pointer parallax; on scroll they centre, the top card flips, and the stack spreads. |
| Paper story | `ScrollStory.tsx` | Pinned: blank sheet → emboss → purple ink flows → type → the invitation lifts. |
| Services | `ServiceGallery.tsx`, `ServiceVisuals.tsx`, `data/services.ts` | Eight CSS-3D product pieces with hover states (fan, gatefold, stamp press, colour registration, notebook, sheet fan, calendar flip). Click for a detail dialog. |
| School printing | `SchoolPrinting.tsx` | Composition plus the card's school-relevant services. |
| Our craft | `PrintingPress.tsx` | Pinned: paper feeds under turning rollers, prints, then becomes a set of products. |
| Customizer | `ProductCustomizer.tsx`, `lib/designArt.ts` | Product, colour, typeface, finish and orientation; drag or arrow keys to rotate; front/back; reset; PNG download; "Request This Design" on WhatsApp. |
| Craftsmanship | `Craftsmanship.tsx` | Sticky headline; paper, type, ink and finishing panels. |
| About | `BrandStory.tsx` | Sheets that unfold: how a print comes together, plus the card's three promises. |
| Contact | `ContactSection.tsx` | Phones, email, Instagram, and an enquiry form (see below). |
| Footer | `Footer.tsx` | Services, contacts, a slowly turning card. |

## Before going live — please check

- **WhatsApp number.** Enquiries go to `WHATSAPP_NUMBER` in `src/data/site.ts` (currently 93644 22577).
  Confirm that number is on WhatsApp; change it there and every button follows.
- **Email spelling.** The site uses `sriganapathycardsandprinters@gmail.com`. Check it against the printed card.
- **Logo.** The pinwheel is redrawn as vector from the card (`components/Logo.tsx`). Swap in original artwork if available.

## How the enquiry form works

There is no server. After validation (with a hidden spam field, a minimum fill time and a short cool-down),
the form writes the message into **WhatsApp** (`wa.me` link, new tab) or the visitor's **email app** (`mailto:`).
It never claims a message was sent. It tells the visitor to press send in WhatsApp or email, and shows
a direct link if the browser blocks the new tab. To send directly, point `submit` in `ContactSection.tsx`
at a form service or a small API.

## Nothing is invented

Only what is on the card appears: name, phone numbers, email, Instagram, the three promises and the service
list. No address, map, hours, prices, testimonials, years in business or capabilities. Sample names in the
artwork ("Ananya & Karthik", "Your Name") are placeholders. Add real details in `src/data/site.ts`.

## Motion, accessibility, fallbacks

- `prefers-reduced-motion`: no scroll pinning. Scenes show their finished state, the hero uses a still CSS stack, and reveals are instant.
- Phones and browsers without WebGL get the CSS card stack (same artwork as the 3D cards). three.js is lazy-loaded, and a lost WebGL context falls back too.
- Native radios for customizer options, labelled fields, inline errors with focus on the first one, a native `<dialog>` for service details, and visible focus rings.

The previous "CMYK" edition is archived in `_archive/2026-10-12-cmyk-edition/`.
