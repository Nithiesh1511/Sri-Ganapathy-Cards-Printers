// The site's themes. Each one is a complete palette: the CSS custom properties that
// re-colour the page (declared in index.css under [data-theme="…"]) and the colours
// the two 3D scenes use, so switching theme changes the hero and the showroom too.
// Keep the `three` values in step with the matching CSS block.

export type ThemeId = 'ivory' | 'noir' | 'royal' | 'rosewood'

export interface ThemeConfig {
  id: ThemeId
  name: string
  mood: string
  dark: boolean
  /** Three swatches for the picker: page, gold, text. */
  swatch: [string, string, string]
  /** <meta name="theme-color">. */
  chrome: string
  three: {
    /** Hero scene clear colour — must equal the page background. */
    bg: string
    /** The proof sheet / light table the hero plates are laid on. */
    sheet: string
    /** Hairline round the proof sheet. */
    sheetLine: number
    /** Backdrop glows (CSS colours with alpha) and the dot-screen colour. */
    glowA: string
    glowB: string
    glowC: string
    dots: string
    /** Gold-dust motes (hex numbers). */
    dust: number[]
    /** Showroom turntable. */
    tableTop: [string, string]
    tableLine: string
    tableBase: number
    ring: number
    /** Emissive tint on the ring, mixed with each product's own ink. */
    ringGlow: number
  }
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'ivory',
    name: 'Ivory & Gold',
    mood: 'Warm paper, gilt edges',
    dark: false,
    swatch: ['#FBF7EF', '#B8862B', '#1B1711'],
    chrome: '#FBF7EF',
    three: {
      bg: '#FBF7EF',
      sheet: '#FFFDF8',
      sheetLine: 0xb8862b,
      glowA: 'rgba(238,205,150,0.55)',
      glowB: 'rgba(120,100,200,0.14)',
      glowC: 'rgba(0,174,239,0.07)',
      dots: 'rgba(150,108,30,',
      dust: [0xd9b45e, 0xc89a3a, 0xf0d58c, 0xb8862b],
      tableTop: ['#2c241c', '#17120d'],
      tableLine: 'rgba(235,205,140,0.26)',
      tableBase: 0x14100b,
      ring: 0xd6a944,
      ringGlow: 0xd6a944,
    },
  },
  {
    id: 'noir',
    name: 'Midnight Noir',
    mood: 'Black lacquer, champagne gold',
    dark: true,
    swatch: ['#0C0B0F', '#D6B260', '#F4EEE0'],
    chrome: '#0C0B0F',
    three: {
      bg: '#0C0B0F',
      sheet: '#EFE8D8',
      sheetLine: 0xd6b260,
      glowA: 'rgba(214,178,96,0.14)',
      glowB: 'rgba(120,110,160,0.10)',
      glowC: 'rgba(255,255,255,0.03)',
      dots: 'rgba(214,178,96,',
      dust: [0xf0d58c, 0xd6b260, 0xfff1c4, 0xc89a3a],
      tableTop: ['#1d1a22', '#0d0c11'],
      tableLine: 'rgba(240,213,140,0.24)',
      tableBase: 0x08070b,
      ring: 0xe0bd6a,
      ringGlow: 0xe0bd6a,
    },
  },
  {
    id: 'royal',
    name: 'Royal Indigo',
    mood: 'Deep violet, antique gold',
    dark: true,
    swatch: ['#110A32', '#E0BC64', '#F7F2E8'],
    chrome: '#110A32',
    three: {
      bg: '#110A32',
      sheet: '#EEE9F6',
      sheetLine: 0xe0bc64,
      glowA: 'rgba(122,92,224,0.28)',
      glowB: 'rgba(224,188,100,0.10)',
      glowC: 'rgba(0,174,239,0.06)',
      dots: 'rgba(224,188,100,',
      dust: [0xf3d98a, 0xe0bc64, 0xcdbdff, 0xffe9b0],
      tableTop: ['#241659', '#100a30'],
      tableLine: 'rgba(205,189,255,0.26)',
      tableBase: 0x0a0622,
      ring: 0xe0bc64,
      ringGlow: 0x9a7cf0,
    },
  },
  {
    id: 'rosewood',
    name: 'Rosewood',
    mood: 'Burgundy velvet, rose gold',
    dark: true,
    swatch: ['#1A0B10', '#E2AA92', '#FAF0E8'],
    chrome: '#1A0B10',
    three: {
      bg: '#1A0B10',
      sheet: '#F4E7E1',
      sheetLine: 0xe2aa92,
      glowA: 'rgba(226,110,130,0.20)',
      glowB: 'rgba(226,170,146,0.12)',
      glowC: 'rgba(255,255,255,0.03)',
      dots: 'rgba(226,170,146,',
      dust: [0xf6c9b4, 0xe2aa92, 0xffe2d4, 0xd4876e],
      tableTop: ['#3a1824', '#1a0b10'],
      tableLine: 'rgba(246,201,180,0.26)',
      tableBase: 0x0f0509,
      ring: 0xeab59e,
      ringGlow: 0xe06f86,
    },
  },
]

export const DEFAULT_THEME: ThemeId = 'ivory'
export const THEME_KEY = 'sgc-theme'

export function themeById(id: string | null | undefined): ThemeConfig {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
