import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { DEFAULT_THEME, THEME_KEY, THEMES, themeById, type ThemeConfig, type ThemeId } from '@/data/themes'
import { prefersReducedMotion } from './hooks'

type Listener = (t: ThemeConfig) => void

interface ThemeCtx {
  theme: ThemeConfig
  themes: ThemeConfig[]
  /** Switch theme. If a point is given, the new theme is revealed in a circle growing from it. */
  setTheme(id: ThemeId, origin?: { x: number; y: number }): void
  /** Called synchronously on every change (the WebGL scenes use this, so they update with the page). */
  subscribe(fn: Listener): () => void
}

const Ctx = createContext<ThemeCtx | null>(null)

function readInitial(): ThemeConfig {
  // index.html's inline script has already put the saved theme on <html>.
  const fromDom = document.documentElement.dataset.theme
  if (fromDom) return themeById(fromDom)
  try { return themeById(localStorage.getItem(THEME_KEY)) } catch { return themeById(DEFAULT_THEME) }
}

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(readInitial)
  const listeners = useRef(new Set<Listener>())

  const apply = useCallback((t: ThemeConfig) => {
    const root = document.documentElement
    root.dataset.theme = t.id
    root.style.colorScheme = t.dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.chrome)
    try { localStorage.setItem(THEME_KEY, t.id) } catch { /* private mode */ }
    setThemeState(t)
    listeners.current.forEach((fn) => fn(t))
  }, [])

  const setTheme = useCallback((id: ThemeId, origin?: { x: number; y: number }) => {
    const next = themeById(id)
    const doc = document as ViewTransitionDoc
    if (!doc.startViewTransition || prefersReducedMotion() || !origin) {
      apply(next)
      return
    }
    // A circular reveal from the button that was pressed, via the View Transitions API.
    const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y))
    const vt = doc.startViewTransition(() => { flushSync(() => apply(next)) })
    vt.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
          { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => undefined)
  }, [apply])

  // Keep <html> in step on first mount (colour-scheme, theme-color) without re-saving.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme.id
    root.style.colorScheme = theme.dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.chrome)
  }, [])

  const subscribe = useCallback((fn: Listener) => {
    listeners.current.add(fn)
    return () => { listeners.current.delete(fn) }
  }, [])

  const value = useMemo<ThemeCtx>(() => ({ theme, themes: THEMES, setTheme, subscribe }), [theme, setTheme, subscribe])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useTheme must be used inside <ThemeProvider>')
  return c
}
