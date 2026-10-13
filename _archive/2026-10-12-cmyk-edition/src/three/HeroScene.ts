import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {
  CARD_W, CARD_H, PLATE_W, PLATE_H, TEX_W, TEX_H, INK,
  drawPlate, drawPaper, drawBackdrop, drawLightPool, type Channel,
} from './heroArt'
import { themeById, DEFAULT_THEME, type ThemeConfig } from '@/data/themes'

const CHANNELS: Channel[] = ['C', 'M', 'Y', 'K']
const THICK = 0.05 // card stock thickness
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const inkHex = (ch: Channel) => { const [r, g, b] = INK[ch]; return (r << 16) | (g << 8) | b }

/** Shared with the page: raw scroll progress in, smoothed progress out. */
export interface HeroProgress {
  raw: number
  smooth: number
  /** 1 pulls the stack to the middle of the screen (the opening sequence); 0 is its normal place beside the copy. */
  center?: number
}

interface Plate {
  ch: Channel
  mesh: THREE.Mesh
  tint: THREE.Mesh
  outline: THREE.LineSegments
  /** Where this plate sits when out of register: x, y, roll. */
  off: [number, number, number]
  redraw: () => void
}

/**
 * The hero: a visiting card built from four ink plates floating in space. As the
 * page scrolls they slide together and drop into register; the full-colour print
 * appears only when all four are perfectly aligned.
 */
export class HeroScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
  private stack = new THREE.Group()
  private plates: Plate[] = []
  private paper!: THREE.Mesh
  private paperRedraw!: () => void
  private connectors!: THREE.LineSegments
  private backdrop!: THREE.Mesh
  private backdropMat!: THREE.MeshBasicMaterial
  private backdropRedraw!: () => void
  private shadow!: THREE.Mesh
  private pulse!: THREE.Mesh
  private dots!: THREE.Points
  private dotBase!: Float32Array
  private pool!: THREE.Mesh
  private poolMat!: THREE.MeshBasicMaterial
  private sheen!: THREE.Mesh
  private sheenT = 1
  private cfg: ThemeConfig

  private disposables: { dispose(): void }[] = []
  private raf = 0
  private active = true
  private disposed = false
  private lastT = 0
  private aspect = 1
  private wide = true
  private shiftX = 0
  private shiftY = 0
  private baseScale = 1
  private px = 0
  private py = 0
  private spx = 0
  private spy = 0
  private locked = false
  private pulseT = 1
  private bgAspect = 0
  /** Eased copy of prog.center, so a change glides rather than jumps. */
  private cs: number

  constructor(
    canvas: HTMLCanvasElement,
    private prog: HeroProgress,
    private opts: { reduceMotion: boolean; theme?: ThemeConfig },
  ) {
    this.cfg = opts.theme ?? themeById(DEFAULT_THEME)
    this.cs = prog.center ?? 0
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2))
    this.renderer.toneMapping = THREE.NoToneMapping
    this.scene.background = new THREE.Color(this.cfg.three.bg)
    this.scene.add(this.camera)

    this.buildBackdrop()
    this.buildPool()
    this.buildLights()
    this.buildStack()
    this.buildDots()
    this.buildPulse()
    this.buildSheen()

    this.scene.add(this.stack)
  }

  // ── Construction ───────────────────────────────────────────────────────────
  private track<T extends { dispose(): void }>(o: T): T {
    this.disposables.push(o)
    return o
  }

  private canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    draw(ctx, w, h)
    const tex = this.track(new THREE.CanvasTexture(c))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
    return {
      tex,
      redraw: () => { ctx.clearRect(0, 0, w, h); draw(ctx, w, h); tex.needsUpdate = true },
    }
  }

  private buildBackdrop() {
    const mat = this.track(new THREE.MeshBasicMaterial({ toneMapped: false, depthTest: false, depthWrite: false }))
    this.backdropMat = mat
    const geo = this.track(new THREE.PlaneGeometry(1, 1))
    this.backdrop = new THREE.Mesh(geo, mat)
    this.backdrop.renderOrder = -100
    this.backdrop.position.z = -60
    this.camera.add(this.backdrop)
  }

  /** (Re)draws the backdrop at the screen's own aspect, so its dots stay round. */
  private paintBackdrop() {
    const w = 1600
    const h = Math.max(400, Math.round(w / this.aspect))
    const old = this.backdropMat.map
    const th = () => this.cfg.three
    const { tex, redraw } = this.canvasTex(w, h, (ctx, cw, ch) => drawBackdrop(ctx, cw, ch, { bg: th().bg, glowA: th().glowA, glowB: th().glowB, glowC: th().glowC, dots: th().dots }))
    this.backdropMat.map = tex
    this.backdropMat.needsUpdate = true
    this.backdropRedraw = redraw
    this.bgAspect = this.aspect
    if (old) { old.dispose(); this.disposables = this.disposables.filter((d) => d !== old) }
  }

  /** The "light table": a pool of light on the page that the plates are laid on. Plates
   *  multiply onto it, so ink reads on dark themes too, and fades out toward its edge. */
  private buildPool() {
    this.poolMat = this.track(new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false }))
    this.pool = new THREE.Mesh(this.track(new THREE.PlaneGeometry(1, 1)), this.poolMat)
    this.pool.renderOrder = -60
    this.scene.add(this.pool)
    this.paintPool()
  }

  private paintPool() {
    const old = this.poolMat.map
    const { tex } = this.canvasTex(512, 512, (ctx, w, h) => drawLightPool(ctx, w, h, this.cfg.three.sheet))
    this.poolMat.map = tex
    this.poolMat.needsUpdate = true
    if (old) { old.dispose(); this.disposables = this.disposables.filter((d) => d !== old) }
  }

  /** A band of light that crosses the finished card — the foil catching the lamp. */
  private buildSheen() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 8
    const x = c.getContext('2d')!
    const g = x.createLinearGradient(0, 0, 256, 0)
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,248,226,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 256, 8)
    const tex = this.track(new THREE.CanvasTexture(c))
    const mat = this.track(new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }))
    this.sheen = new THREE.Mesh(this.track(new THREE.PlaneGeometry(0.9, CARD_H * 1.5)), mat)
    this.sheen.rotation.z = -0.42
    this.sheen.renderOrder = 15
    this.stack.add(this.sheen)
  }

  /** Re-colour the scene for a theme. */
  applyTheme(cfg: ThemeConfig) {
    this.cfg = cfg
    ;(this.scene.background as THREE.Color).set(cfg.three.bg)
    this.paintPool()
    this.paintBackdrop()
    // dust motes
    const col = this.dots.geometry.getAttribute('color') as THREE.BufferAttribute
    const palette = cfg.three.dust.map((h) => new THREE.Color(h))
    for (let i = 0; i < col.count; i++) {
      const c = palette[i % palette.length]
      col.setXYZ(i, c.r, c.g, c.b)
    }
    col.needsUpdate = true
    ;(this.dots.material as THREE.PointsMaterial).opacity = cfg.dark ? 0.8 : 0.55
    // contact shadow reads darker on light pages, deeper on dark
    ;(this.shadow.material as THREE.MeshBasicMaterial).opacity = cfg.dark ? 0.55 : 0.9
    this.renderOnce()
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffe6d5, 1.15))
    const key = new THREE.DirectionalLight(0xffffff, 1.35)
    key.position.set(-3.5, 5, 6)
    this.scene.add(key)
  }

  private buildStack() {
    // Card stock
    const paperTex = this.canvasTex(1120, 640, drawPaper)
    this.paperRedraw = paperTex.redraw
    const edge = this.track(new THREE.MeshStandardMaterial({ color: 0xf3e6d6, roughness: 0.95 }))
    const face = this.track(new THREE.MeshStandardMaterial({ map: paperTex.tex, roughness: 0.92, emissive: 0xfff3e6, emissiveIntensity: 0.28 }))
    const geo = this.track(new RoundedBoxGeometry(CARD_W, CARD_H, THICK, 4, 0.05))
    this.paper = new THREE.Mesh(geo, [edge, edge, edge, edge, face, edge])
    this.stack.add(this.paper)
    // A hairline round the card stock, so the blank sheet still reads when the plates are apart.
    const paperEdges = this.track(new THREE.EdgesGeometry(this.track(new THREE.PlaneGeometry(CARD_W, CARD_H))))
    const paperLine = new THREE.LineSegments(paperEdges, this.track(new THREE.LineBasicMaterial({ color: 0x16121e, transparent: true, opacity: 0.35, toneMapped: false })))
    paperLine.position.z = THICK / 2 + 0.002
    this.paper.add(paperLine)

    // Four ink plates. Each is white-with-ink, multiplied over whatever is behind.
    const planeGeo = this.track(new THREE.PlaneGeometry(PLATE_W, PLATE_H))
    const edgeGeo = this.track(new THREE.EdgesGeometry(planeGeo))
    const offsets: [number, number, number][] = [[0.1, -0.06, 0.018], [-0.08, 0.07, -0.014], [0.06, 0.08, 0.01], [-0.05, -0.07, -0.02]]
    CHANNELS.forEach((ch, i) => {
      const { tex, redraw } = this.canvasTex(TEX_W, TEX_H, (ctx, w, h) => drawPlate(ctx, ch, w, h))
      const mat = this.track(new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        blending: THREE.MultiplyBlending,
        premultipliedAlpha: true,
        depthWrite: false,
        toneMapped: false,
      }))
      const mesh = new THREE.Mesh(planeGeo, mat)
      mesh.renderOrder = 4 + i
      const tintMat = this.track(new THREE.MeshBasicMaterial({ color: inkHex(ch), transparent: true, opacity: 0.07, depthWrite: false, toneMapped: false }))
      const tint = new THREE.Mesh(planeGeo, tintMat)
      tint.renderOrder = 2
      const lineMat = this.track(new THREE.LineBasicMaterial({ color: inkHex(ch), transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }))
      const outline = new THREE.LineSegments(edgeGeo, lineMat)
      outline.renderOrder = 12
      this.stack.add(tint, mesh, outline)
      this.plates.push({ ch, mesh, tint, outline, off: offsets[i], redraw })
    })

    // Dashed-looking corner connectors that make the exploded view read as one stack.
    const pts: number[] = []
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) pts.push(sx * CARD_W / 2, sy * CARD_H / 2, 0, sx * CARD_W / 2, sy * CARD_H / 2, 1)
    const cgeo = this.track(new THREE.BufferGeometry())
    cgeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    const cmat = this.track(new THREE.LineBasicMaterial({ color: 0x4b2bb8, transparent: true, opacity: 0.4, depthWrite: false }))
    this.connectors = new THREE.LineSegments(cgeo, cmat)
    this.connectors.renderOrder = 11
    this.stack.add(this.connectors)

    // Soft contact shadow, drawn in world space beneath the stack.
    const sc = document.createElement('canvas'); sc.width = sc.height = 128
    const sx = sc.getContext('2d')!
    const g = sx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(36,22,99,0.38)'); g.addColorStop(1, 'rgba(36,22,99,0)')
    sx.fillStyle = g; sx.fillRect(0, 0, 128, 128)
    const stex = this.track(new THREE.CanvasTexture(sc))
    const smat = this.track(new THREE.MeshBasicMaterial({ map: stex, transparent: true, depthWrite: false, toneMapped: false }))
    this.shadow = new THREE.Mesh(this.track(new THREE.PlaneGeometry(1, 1)), smat)
    this.shadow.renderOrder = -50
    this.scene.add(this.shadow)
  }

  private buildDots() {
    const n = 170
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const palette = this.cfg.three.dust.map((h) => new THREE.Color(h))
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 16
      pos[i * 3 + 1] = (rnd() - 0.5) * 9
      pos[i * 3 + 2] = -5 + rnd() * 6
      const c = palette[Math.floor(rnd() * palette.length)]
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    this.dotBase = pos.slice()
    const geo = this.track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const dc = document.createElement('canvas'); dc.width = dc.height = 64
    const dx = dc.getContext('2d')!
    dx.beginPath(); dx.arc(32, 32, 28, 0, Math.PI * 2); dx.fillStyle = '#fff'; dx.fill()
    const dtex = this.track(new THREE.CanvasTexture(dc))
    const mat = this.track(new THREE.PointsMaterial({
      size: 0.075, map: dtex, vertexColors: true, transparent: true, opacity: 0.6, depthWrite: false, sizeAttenuation: true, toneMapped: false,
    }))
    this.dots = new THREE.Points(geo, mat)
    this.dots.renderOrder = -90
    this.scene.add(this.dots)
  }

  private buildPulse() {
    const geo = this.track(new THREE.RingGeometry(0.97, 1, 120))
    const mat = this.track(new THREE.MeshBasicMaterial({ color: 0x4b2bb8, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }))
    this.pulse = new THREE.Mesh(geo, mat)
    this.pulse.renderOrder = 14
    this.stack.add(this.pulse)
  }

  // ── Public controls ────────────────────────────────────────────────────────
  setPointer(x: number, y: number) { this.px = x; this.py = y }

  setActive(on: boolean) {
    if (this.active === on) return
    this.active = on
    if (on) { this.lastT = performance.now(); this.loop() } else cancelAnimationFrame(this.raf)
  }

  /** Redraw every texture once the webfonts have arrived. */
  refreshArt() {
    this.plates.forEach((p) => p.redraw())
    this.paperRedraw()
    if (this.backdropRedraw) this.backdropRedraw()
    this.renderOnce()
  }

  resize(w: number, h: number) {
    if (w < 2 || h < 2) return
    this.renderer.setSize(w, h, false)
    this.aspect = w / h
    this.camera.aspect = this.aspect
    // Side-by-side whenever the screen is landscape enough to hold copy and stack together.
    this.wide = w >= 700 && w / h >= 1.15
    this.camera.updateProjectionMatrix()

    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const frac = this.wide ? 0.43 : 0.88
    const distW = PLATE_W / (2 * tanHalf * this.aspect * frac)
    const distH = PLATE_H / (2 * tanHalf * (this.wide ? 0.66 : 0.4))
    const dist = Math.max(distW, distH)
    this.camera.position.set(0, 0, dist)

    const visH = 2 * tanHalf * dist
    const visW = visH * this.aspect
    this.shiftX = this.wide ? visW * 0.245 : 0
    this.shiftY = this.wide ? 0 : -visH * 0.19
    this.baseScale = 1

    // Backdrop: a quad that always fills the view (it is parented to the camera).
    const bgD = 60
    const bgH = 2 * tanHalf * bgD * 1.06
    this.backdrop.scale.set(bgH * this.aspect, bgH, 1)
    this.backdrop.position.set(0, 0, -bgD)
    if (Math.abs(this.bgAspect - this.aspect) > 0.04) this.paintBackdrop()

    this.renderOnce()
  }

  start() {
    this.lastT = performance.now()
    this.loop()
  }

  private loop = () => {
    if (this.disposed || !this.active) return
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.lastT) / 1000)
    this.lastT = now
    this.update(dt, now / 1000)
    this.renderer.render(this.scene, this.camera)
  }

  renderOnce() {
    if (this.disposed) return
    this.update(0.016, performance.now() / 1000)
    this.renderer.render(this.scene, this.camera)
  }

  // ── Per frame ──────────────────────────────────────────────────────────────
  private update(dt: number, t: number) {
    const prog = this.prog
    const target = this.opts.reduceMotion ? 1 : prog.raw
    prog.smooth = this.opts.reduceMotion ? 1 : prog.smooth + (target - prog.smooth) * (1 - Math.exp(-dt * 7))
    if (Math.abs(prog.smooth - target) < 0.0005) prog.smooth = target
    const p = prog.smooth
    const e = easeInOutCubic(p)
    const reg = smoothstep(0.8, 0.975, p)

    const wantCenter = prog.center ?? 0
    this.cs += (wantCenter - this.cs) * (1 - Math.exp(-dt * 5))
    if (Math.abs(this.cs - wantCenter) < 0.0005) this.cs = wantCenter
    const sx = this.shiftX * (1 - this.cs)
    const sy = this.shiftY * (1 - this.cs)

    const gap = lerp(0.95, 0, e)
    const zc = -2 * gap
    const front = THICK / 2 + 0.003

    this.paper.position.z = zc
    this.plates.forEach((pl, i) => {
      const z = zc + front + (i + 1) * gap + i * 0.0015
      const k = 1 - reg
      pl.mesh.position.set(pl.off[0] * k, pl.off[1] * k, z)
      pl.mesh.rotation.z = pl.off[2] * k
      pl.tint.position.copy(pl.mesh.position); pl.tint.position.z -= 0.0008
      pl.tint.rotation.z = pl.mesh.rotation.z
      pl.outline.position.copy(pl.mesh.position)
      pl.outline.rotation.z = pl.mesh.rotation.z
      const showSheet = 1 - smoothstep(0.55, 0.95, p)
      ;(pl.tint.material as THREE.MeshBasicMaterial).opacity = 0.075 * showSheet
      ;(pl.outline.material as THREE.LineBasicMaterial).opacity = 0.95 * showSheet
    })
    this.connectors.position.z = zc + front
    this.connectors.scale.z = Math.max(0.0001, 4 * gap)
    ;(this.connectors.material as THREE.LineBasicMaterial).opacity = 0.4 * (1 - smoothstep(0.1, 0.85, p))

    // Pointer parallax, eased.
    this.spx += (this.px - this.spx) * (1 - Math.exp(-dt * 4))
    this.spy += (this.py - this.spy) * (1 - Math.exp(-dt * 4))
    const idle = this.opts.reduceMotion ? 0 : Math.sin(t * 0.7) * 0.012
    this.stack.rotation.y = lerp(-0.66, -0.07, e) + this.spx * 0.17 + idle
    this.stack.rotation.x = lerp(0.34, 0.05, e) - this.spy * 0.11
    this.stack.rotation.z = lerp(0.05, 0, e)
    const s = this.baseScale * lerp(0.8, 1.13, e)
    this.stack.scale.setScalar(s)
    this.stack.position.set(
      sx,
      sy + (this.opts.reduceMotion ? 0 : Math.sin(t * 0.9) * 0.035 * (0.4 + 0.6 * e)),
      0,
    )

    // Contact shadow follows the stack, wider when it is exploded.
    this.shadow.position.set(sx, sy - CARD_H * 0.82, -1.4)
    this.shadow.scale.set(lerp(5.2, 4.4, e), lerp(1.1, 0.7, e), 1)

    // "Registered" pulse: a ring expands off the card the moment the plates lock.
    if (p >= 0.985 && !this.locked) { this.locked = true; this.pulseT = 0; this.sheenT = 0 }
    else if (p < 0.9) this.locked = false
    if (this.pulseT < 1) {
      this.pulseT = Math.min(1, this.pulseT + dt / 1.1)
      const pe = 1 - Math.pow(1 - this.pulseT, 3)
      this.pulse.position.z = zc + front + 0.01
      this.pulse.scale.setScalar(lerp(1.6, 3.1, pe))
      this.pulse.scale.y *= CARD_H / CARD_W + 0.1
      ;(this.pulse.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - pe)
    } else {
      ;(this.pulse.material as THREE.MeshBasicMaterial).opacity = 0
    }

    // The light pool sits well behind the stack, so it never intersects the plates.
    this.pool.position.set(sx, sy, -3.6)
    this.pool.scale.set(9.2, 6.2, 1)

    // Foil sheen: one sweep when the plates lock, then a faint glint that follows the pointer.
    if (this.sheenT < 1) this.sheenT = Math.min(1, this.sheenT + dt / 1.5)
    const sweep = Math.sin(Math.PI * this.sheenT)
    const glint = smoothstep(0.96, 1, p) * 0.16
    const sheenMat = this.sheen.material as THREE.MeshBasicMaterial
    sheenMat.opacity = Math.max(sweep * 0.55, glint)
    this.sheen.position.set(
      this.sheenT < 1 ? lerp(-CARD_W * 0.72, CARD_W * 0.72, easeInOutCubic(this.sheenT)) : this.spx * CARD_W * 0.42,
      0,
      zc + front + 0.03,
    )

    // Ink dots drift, and the backdrop leans a touch the other way for depth.
    if (!this.opts.reduceMotion) {
      const pos = this.dots.geometry.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const bx = this.dotBase[i * 3], by = this.dotBase[i * 3 + 1]
        pos.setXYZ(i, bx + Math.sin(t * 0.25 + i) * 0.18, by + Math.cos(t * 0.21 + i * 1.7) * 0.22, this.dotBase[i * 3 + 2])
      }
      pos.needsUpdate = true
    }
    this.dots.position.x = this.spx * -0.25
    this.dots.position.y = this.spy * 0.15
    this.backdrop.position.x = this.spx * -1.4
    this.backdrop.position.y = this.spy * 0.9
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
