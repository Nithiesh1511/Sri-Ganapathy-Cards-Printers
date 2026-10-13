/** @type {import('tailwindcss').Config} */

// Colours are CSS variables holding "r g b" triplets, defined per theme in
// src/index.css, so every utility (bg-paper, text-ink, border-gold/40 …) re-colours
// when the theme changes and still supports Tailwind's /opacity syntax.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Listed in full and in order: a raw screen (mdl) switches off Tailwind's automatic
    // sorting, and breakpoints are emitted in the order written here.
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      // Landscape tablets only — bounded, so it can't fight the lg: rules.
      mdl: { raw: '(min-width: 768px) and (max-width: 1023px) and (orientation: landscape)' },
    },
    extend: {
      colors: {
        paper: { DEFAULT: v('paper'), 2: v('paper-2'), 3: v('paper-3') },
        card: v('card'),
        ink: { DEFAULT: v('ink'), soft: v('ink-soft'), mute: v('ink-mute') },
        night: v('night'),
        accent: { DEFAULT: v('accent'), soft: v('accent-soft') },
        // `gold-text` is the darker gold that stays legible on the page surface.
        gold: { DEFAULT: v('gold'), hi: v('gold-hi'), lo: v('gold-lo'), text: v('gold-text') },
        'on-gold': v('on-gold'),
        wine: v('wine'),
        // Fixed light text for use on the always-dark panels.
        ivory: 'rgb(248 242 230 / <alpha-value>)',
        // Process inks — the four plates every print is built from. Constant across themes.
        cy: '#00AEEF',
        mg: '#EC008C',
        ye: '#FFD400',
        key: '#16121E',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // Variable fonts: pull the weights down a notch for a lighter, more refined colour.
      fontWeight: {
        medium: '460',
        semibold: '440',
        bold: '600',
        extrabold: '700',
      },
      boxShadow: {
        card: '0 30px 60px -38px rgb(var(--shadow) / 0.5)',
        lift: '0 40px 80px -40px rgb(var(--shadow) / 0.65)',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'marquee-rev': { '0%': { transform: 'translateX(-50%)' }, '100%': { transform: 'translateX(0)' } },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        marquee: 'marquee 70s linear infinite',
        'marquee-rev': 'marquee-rev 80s linear infinite',
        'rise-in': 'rise-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 1s ease both',
      },
    },
  },
  plugins: [],
}
