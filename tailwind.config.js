/** @type {import('tailwindcss').Config} */

// The "Print Atelier" palette — taken from the visiting card's royal purple, set on
// warm ivory stock with blush atmosphere and a little champagne gold.
//   plum   #402078  deep royal purple — the brand colour
//   violet #6A35B4  rich violet — highlights, ink
//   ivory  #FFF9F0  warm ivory — the page
//   blush  #F3DCE3  soft blush — atmosphere
//   gold   #C8A56A  champagne gold — selective accents (never body text on ivory)
//   ink    #211D28  ink black — text
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: { xs: '420px' },
      colors: {
        plum: { DEFAULT: '#402078', deep: '#2B1453', night: '#1D0E38' },
        violet: { DEFAULT: '#6A35B4', soft: '#B79BE0' },
        ivory: { DEFAULT: '#FFF9F0', 2: '#F8EFE2', 3: '#EFE3D1' },
        blush: { DEFAULT: '#F3DCE3', deep: '#E7C2CF' },
        // gold.text is the darker gold that passes contrast on ivory
        gold: { DEFAULT: '#C8A56A', hi: '#E8D3A6', lo: '#A3824A', text: '#7F622E' },
        ink: { DEFAULT: '#211D28', soft: '#4A4354', mute: '#6E6578' },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        classic: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        paper: '0 1px 1px rgb(33 29 40 / 0.06), 0 12px 24px -12px rgb(33 29 40 / 0.18), 0 40px 70px -40px rgb(64 32 120 / 0.35)',
        lift: '0 2px 2px rgb(33 29 40 / 0.05), 0 24px 40px -18px rgb(33 29 40 / 0.25), 0 60px 100px -50px rgb(64 32 120 / 0.45)',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
        paper: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
}
