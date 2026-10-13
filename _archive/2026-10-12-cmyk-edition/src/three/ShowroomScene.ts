import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ACCENT_HEX, serviceById, type ServiceId } from '@/data/site'
import { themeById, DEFAULT_THEME, type ThemeConfig } from '@/data/themes'
import { buildModel, type BuiltModel } from './models'

const TURNTABLE_R = 2.55
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const easeOutBack = (t: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }
const easeInCubic = (t: number) => t * t * t

interface Live extends BuiltModel {
  id: ServiceId
  holder: THREE.Group
}

/**
 * The showroom stage: a dark turntable under studio light, with one product on it
 * at a time. Products swap with a quick spin-out / spin-in, and the visitor can
 * drag to turn the product round (it keeps turning on its own when left alone).
 */
export class ShowroomScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  private controls: OrbitControls
  private table = new THREE.Group()
  private ring!: THREE.Mesh
  private ringMat!: THREE.MeshStandardMaterial
  private baseMat!: THREE.MeshStandardMaterial
  private topCanvas!: HTMLCanvasElement
  private topTex!: THREE.CanvasTexture
  private motes!: THREE.Points
  private moteBase!: Float32Array
  private cfg: ThemeConfig
  /** The glow on the turntable's rim: the theme's tint, drawn toward the product's own ink. */
  private glow = new THREE.Color('#ec008c')
  private glowTarget = new THREE.Color('#ec008c')
  private productInk = new THREE.Color('#ec008c')

  private live: Live | null = null
  private wantId: ServiceId | null = null
  private phase: 'idle' | 'out' | 'in' = 'idle'
  private phaseT = 0
  private disposables: { dispose(): void }[] = []

  private raf = 0
  private active = true
  private disposed = false
  private lastT = 0
  private clock = 0
  private resumeTimer = 0
  private userActive = false
  private polarTarget = 1.0
  private sph = new THREE.Spherical()
  private off = new THREE.Vector3()
  private reduce: boolean
  onInteract?: () => void

  constructor(canvas: HTMLCanvasElement, opts: { reduceMotion: boolean; theme?: ThemeConfig }) {
    this.reduce = opts.reduceMotion
    this.cfg = opts.theme ?? themeById(DEFAULT_THEME)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.92

    // Studio reflections without loading an HDR: three's built-in "room".
    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environment = envTex
    this.disposables.push(pmrem, envTex)

    this.buildLights()
    this.buildTurntable()
    this.buildMotes()
    this.scene.add(this.table)

    this.camera.position.set(0, 5.6, 8.2)
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.target.set(0, 1.05, 0)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enableZoom = false
    this.controls.enablePan = false
    this.controls.minPolarAngle = 0.7
    this.controls.maxPolarAngle = 1.52
    this.controls.autoRotate = !this.reduce
    this.controls.autoRotateSpeed = 1.6
    // Vertical swipes should still scroll the page on touch screens.
    canvas.style.touchAction = 'pan-y'
    this.controls.addEventListener('start', this.onStart)
    this.controls.addEventListener('end', this.onEnd)
  }

  private onStart = () => {
    this.userActive = true
    window.clearTimeout(this.resumeTimer)
    this.controls.autoRotate = false
    this.onInteract?.()
  }
  private onEnd = () => {
    window.clearTimeout(this.resumeTimer)
    this.resumeTimer = window.setTimeout(() => {
      this.userActive = false
      if (!this.reduce) this.controls.autoRotate = true
    }, 2600)
  }

  private track<T extends { dispose(): void }>(o: T): T {
    this.disposables.push(o)
    return o
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2140, 0.55))
    const key = new THREE.DirectionalLight(0xfff0e0, 2.2)
    key.position.set(3.6, 6.4, 4.2)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.camera.left = -3.6; key.shadow.camera.right = 3.6
    key.shadow.camera.top = 3.6; key.shadow.camera.bottom = -3.6
    key.shadow.camera.near = 1; key.shadow.camera.far = 20
    key.shadow.bias = -0.0004
    key.shadow.normalBias = 0.025
    key.shadow.radius = 4
    this.scene.add(key)
    const fill = new THREE.DirectionalLight(0xa9b8ff, 0.7)
    fill.position.set(-5, 2.5, 3)
    this.scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffc7ee, 1.5)
    rim.position.set(-2.5, 4, -5.5)
    this.scene.add(rim)
  }

  private buildTurntable() {
    const th = this.cfg.three
    const base = this.track(new THREE.CylinderGeometry(TURNTABLE_R + 0.08, TURNTABLE_R + 0.18, 0.24, 120))
    this.baseMat = this.track(new THREE.MeshStandardMaterial({ color: th.tableBase, roughness: 0.28, metalness: 0.8 }))
    const disc = new THREE.Mesh(base, this.baseMat)
    disc.position.y = -0.12
    disc.receiveShadow = true
    this.table.add(disc)

    // Top surface: lacquered, with a fine graticule — concentric rings, tick marks, registration targets.
    this.topCanvas = document.createElement('canvas')
    this.topCanvas.width = this.topCanvas.height = 1024
    this.topTex = this.track(new THREE.CanvasTexture(this.topCanvas))
    this.topTex.colorSpace = THREE.SRGBColorSpace
    this.topTex.anisotropy = 8
    this.paintTable()
    const topMat = this.track(new THREE.MeshPhysicalMaterial({ map: this.topTex, roughness: 0.32, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }))
    const top = new THREE.Mesh(this.track(new THREE.CircleGeometry(TURNTABLE_R, 120)), topMat)
    top.rotation.x = -Math.PI / 2
    top.position.y = 0.001
    top.receiveShadow = true
    this.table.add(top)

    // A gilt rim that glows faintly in the product's ink.
    this.glow.set(th.ringGlow)
    this.glowTarget.copy(this.glow)
    this.ringMat = this.track(new THREE.MeshStandardMaterial({ color: th.ring, emissive: this.glow, emissiveIntensity: 0.55, roughness: 0.22, metalness: 1 }))
    this.ring = new THREE.Mesh(this.track(new THREE.TorusGeometry(TURNTABLE_R + 0.04, 0.028, 16, 180)), this.ringMat)
    this.ring.rotation.x = Math.PI / 2
    this.ring.position.y = 0.005
    this.table.add(this.ring)
  }

  /** (Re)draws the turntable's top for the current theme. */
  private paintTable() {
    const th = this.cfg.three
    const ctx = this.topCanvas.getContext('2d')!
    const R = 512
    ctx.clearRect(0, 0, 1024, 1024)
    const g = ctx.createRadialGradient(R, R * 0.8, 0, R, R, R)
    g.addColorStop(0, th.tableTop[0]); g.addColorStop(1, th.tableTop[1])
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(R, R, R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = th.tableLine; ctx.lineWidth = 2
    for (const r of [0.32, 0.55, 0.78, 0.96]) { ctx.beginPath(); ctx.arc(R, R, R * r, 0, Math.PI * 2); ctx.stroke() }
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2, long = i % 6 === 0
      ctx.beginPath()
      ctx.moveTo(R + Math.cos(a) * R * (long ? 0.9 : 0.94), R + Math.sin(a) * R * (long ? 0.9 : 0.94))
      ctx.lineTo(R + Math.cos(a) * R * 0.98, R + Math.sin(a) * R * 0.98)
      ctx.stroke()
    }
    // Four registration targets, one in each process ink — the shop's signature, kept quiet.
    const inks = ['#00aeef', '#ec008c', '#ffd400', '#f4f0ff']
    ;[0, 1, 2, 3].forEach((i) => {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      const x = R + Math.cos(a) * R * 0.86, y = R + Math.sin(a) * R * 0.86
      ctx.strokeStyle = inks[i]; ctx.globalAlpha = 0.75; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y); ctx.moveTo(x, y - 22); ctx.lineTo(x, y + 22); ctx.stroke()
      ctx.globalAlpha = 1
    })
    this.topTex.needsUpdate = true
  }

  /** Gold dust hanging in the light above the turntable. */
  private buildMotes() {
    const n = 150
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    let seed = 5
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const palette = this.cfg.three.dust.map((h) => new THREE.Color(h))
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, r = 0.6 + Math.sqrt(rnd()) * 3.2
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = rnd() * 4.2
      pos[i * 3 + 2] = Math.sin(a) * r
      const c = palette[i % palette.length]
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    this.moteBase = pos.slice()
    const geo = this.track(new THREE.BufferGeometry())
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d')!
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 30)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64)
    const tex = this.track(new THREE.CanvasTexture(c))
    const mat = this.track(new THREE.PointsMaterial({ size: 0.075, map: tex, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }))
    this.motes = new THREE.Points(geo, mat)
    this.table.add(this.motes)
  }

  /** Re-colour the stage for a theme. */
  applyTheme(cfg: ThemeConfig) {
    this.cfg = cfg
    const th = cfg.three
    this.baseMat.color.setHex(th.tableBase)
    this.ringMat.color.setHex(th.ring)
    this.paintTable()
    const col = this.motes.geometry.getAttribute('color') as THREE.BufferAttribute
    const palette = th.dust.map((h) => new THREE.Color(h))
    for (let i = 0; i < col.count; i++) { const c = palette[i % palette.length]; col.setXYZ(i, c.r, c.g, c.b) }
    col.needsUpdate = true
    this.retintGlow()
    this.renderOnce()
  }

  /** The theme's tint, nudged toward the current product's ink. */
  private retintGlow() {
    this.glowTarget.setHex(this.cfg.three.ringGlow).lerp(this.productInk, 0.5)
  }

  // ── Public ────────────────────────────────────────────────────────────────
  setModel(id: ServiceId) {
    if (this.live?.id === id && this.phase !== 'out') { this.wantId = null; return }
    this.productInk.set(ACCENT_HEX[serviceById(id).accent] === '#16121E' ? '#a28def' : ACCENT_HEX[serviceById(id).accent])
    this.retintGlow()
    this.wantId = id
    if (!this.live) this.swapIn()
    else if (this.phase !== 'out') { this.phase = 'out'; this.phaseT = 0 }
  }

  refreshArt() {
    this.live?.kit.redrawAll()
  }

  /** Swing the camera round to a given compass angle (0 = looking at the front) and hold it there. */
  setAzimuth(theta: number) {
    this.controls.autoRotate = false
    this.off.copy(this.camera.position).sub(this.controls.target)
    this.sph.setFromVector3(this.off)
    this.sph.theta = theta
    this.sph.phi = this.polarTarget
    this.off.setFromSpherical(this.sph)
    this.camera.position.copy(this.controls.target).add(this.off)
    this.controls.update()
  }

  setActive(on: boolean) {
    if (this.active === on) return
    this.active = on
    if (on) { this.lastT = performance.now(); this.loop() } else cancelAnimationFrame(this.raf)
  }

  resize(w: number, h: number) {
    if (w < 2 || h < 2) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // Pull back for narrow stages so the product always fits.
    const narrow = clamp(1.35 / this.camera.aspect, 1, 1.7)
    this.camera.position.setLength(Math.hypot(2.9 - 1.05, 8.8) * narrow + 0.9)
    this.camera.updateProjectionMatrix()
    this.renderOnce()
  }

  start() {
    this.lastT = performance.now()
    this.loop()
  }

  // ── Model swapping ─────────────────────────────────────────────────────────
  private swapIn() {
    const id = this.wantId
    if (!id) return
    this.wantId = null
    if (this.live) this.disposeLive()
    const built = buildModel(id, this.renderer)
    const holder = new THREE.Group()
    holder.add(built.model.group)
    // Tame the studio reflections on matte surfaces so paper keeps its colour; metals keep the full sheen.
    built.model.group.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
      for (const m of mats) {
        const sm = m as THREE.MeshStandardMaterial
        if (sm.isMeshStandardMaterial && sm.metalness < 0.5) sm.envMapIntensity = 0.55
      }
    })
    // Fit to the turntable: centred, standing on it, never bigger than the stage.
    const box = new THREE.Box3().setFromObject(built.model.group)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const f = clamp(Math.min(3.9 / Math.max(size.x, size.z, 0.01), 3.2 / Math.max(size.y, 0.01)), 0.35, 1.7)
    built.model.group.position.set(-center.x, -box.min.y, -center.z)
    holder.scale.setScalar(f)
    holder.userData.base = f
    holder.position.y = 0.002
    this.table.add(holder)
    this.live = { ...built, id, holder }
    this.polarTarget = built.model.polar ?? 1.1
    this.phase = 'in'
    this.phaseT = this.reduce ? 1 : 0
    // Aim the camera a little higher for tall products, lower for flat ones.
    this.controls.target.y = clamp(0.35 + (size.y * f) * 0.5, 0.75, 1.5)
  }

  private disposeLive() {
    if (!this.live) return
    this.table.remove(this.live.holder)
    this.live.kit.dispose()
    this.live = null
  }

  // ── Loop ───────────────────────────────────────────────────────────────────
  private loop = () => {
    if (this.disposed || !this.active) return
    this.raf = requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.lastT) / 1000)
    this.lastT = now
    this.update(dt)
    this.renderer.render(this.scene, this.camera)
  }

  renderOnce() {
    if (this.disposed) return
    this.update(0.016)
    this.renderer.render(this.scene, this.camera)
  }

  private update(dt: number) {
    this.clock += dt
    // Ease the camera to the elevation this product looks best from — unless the
    // visitor has taken hold of it.
    if (!this.userActive) {
      this.off.copy(this.camera.position).sub(this.controls.target)
      this.sph.setFromVector3(this.off)
      this.sph.phi += (this.polarTarget - this.sph.phi) * (1 - Math.exp(-dt * 2.6))
      this.off.setFromSpherical(this.sph)
      this.camera.position.copy(this.controls.target).add(this.off)
    }
    this.controls.update()

    if (this.live) {
      const { holder, model } = this.live
      if (this.phase === 'out') {
        this.phaseT += dt / 0.26
        const k = easeInCubic(clamp(this.phaseT, 0, 1))
        holder.scale.setScalar(Math.max(0.0001, this.baseScale() * (1 - k)))
        holder.rotation.y += dt * 9
        holder.position.y = 0.002 + k * 0.4
        if (this.phaseT >= 1) this.swapIn()
      } else if (this.phase === 'in') {
        this.phaseT += dt / 0.8
        const k = clamp(this.phaseT, 0, 1)
        holder.scale.setScalar(Math.max(0.0001, this.baseScale() * easeOutBack(k)))
        holder.rotation.y = (1 - (1 - Math.pow(1 - k, 3))) * -Math.PI * 1.4
        holder.position.y = 0.002 + (1 - k) * 0.5
        if (k >= 1) { this.phase = 'idle'; holder.rotation.y = 0; holder.position.y = 0.002 }
      }
      model.update?.(this.clock, dt)
    }

    // the rim's glow eases toward the current product's ink
    this.glow.lerp(this.glowTarget, 1 - Math.exp(-dt * 5))
    this.ringMat.emissive.copy(this.glow)

    // gold dust drifting upward
    if (!this.reduce) {
      const pos = this.motes.geometry.getAttribute('position') as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        const y = (this.moteBase[i * 3 + 1] + this.clock * (0.06 + (i % 7) * 0.012)) % 4.2
        pos.setXYZ(i, this.moteBase[i * 3] + Math.sin(this.clock * 0.4 + i) * 0.08, y, this.moteBase[i * 3 + 2] + Math.cos(this.clock * 0.35 + i * 1.3) * 0.08)
      }
      pos.needsUpdate = true
    }
  }

  /** The scale the holder was fitted to; animation multiplies it. */
  private baseScale(): number {
    return (this.live!.holder.userData.base as number) ?? 1
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.clearTimeout(this.resumeTimer)
    this.controls.removeEventListener('start', this.onStart)
    this.controls.removeEventListener('end', this.onEnd)
    this.controls.dispose()
    this.disposeLive()
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
