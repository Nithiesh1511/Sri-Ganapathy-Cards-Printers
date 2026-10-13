import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clamp01, lerp, smoothstep } from '@/lib/ease'
import { ART_H, ART_W, paintFace, roughnessFromFoil, type FaceId } from './cardArt'

/** Scroll progress through the hero runway, 0 → 1, written by the page. */
export type HeroProgress = { current: number }

const CARD_W = 3.5
const CARD_H = CARD_W * (ART_H / ART_W)
const CARD_T = 0.05 // exaggerated a touch, so the layered edge reads
const RADIUS = 0.07

interface CardSpec {
  front: FaceId
  back: FaceId
  /** Paper colours of the three plies, face → back: the middle one shows on the edge. */
  plies: [number, number, number]
  rest: { p: [number, number, number]; r: [number, number, number] }
  spread: { p: [number, number, number]; r: [number, number, number] }
}

// Bottom → top. The top card is the brand card; it flips as you scroll.
const CARDS: CardSpec[] = [
  {
    front: 'minimal-front',
    back: 'minimal-back',
    plies: [0x221d29, 0xc8a56a, 0x221d29],
    rest: { p: [0.45, -0.5, -0.35], r: [-0.62, 0.18, 0.34] },
    spread: { p: [0, 1.05, -0.9], r: [-0.2, 0.05, -0.04] },
  },
  {
    front: 'invite-front',
    back: 'invite-back',
    plies: [0xf1d8e0, 0xe7c2cf, 0xf1d8e0],
    rest: { p: [-0.2, 0.02, 0.05], r: [-0.55, -0.12, -0.14] },
    spread: { p: [2.85, -0.05, 0.1], r: [-0.12, -0.4, -0.06] },
  },
  {
    front: 'brand-front',
    back: 'brand-back',
    plies: [0xfbf4e8, 0x5a2c9e, 0xfbf4e8],
    rest: { p: [0.1, 0.5, 0.48], r: [-0.4, -0.26, 0.07] },
    spread: { p: [-2.85, 0.05, 0.35], r: [-0.1, 0.38, 0.06] },
  },
]

function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** A flat face with 0…1 UVs across the card (ShapeGeometry's UVs are in world units). */
function faceGeometry(shape: THREE.Shape): THREE.ShapeGeometry {
  const g = new THREE.ShapeGeometry(shape, 8)
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + CARD_W / 2) / CARD_W, (pos.getY(i) + CARD_H / 2) / CARD_H)
  }
  uv.needsUpdate = true
  return g
}

interface FaceTextures {
  id: FaceId
  color: HTMLCanvasElement
  foil: HTMLCanvasElement
  rough: HTMLCanvasElement
  maps: THREE.CanvasTexture[]
}

interface Card {
  spec: CardSpec
  pivot: THREE.Group
  flip: THREE.Group
}

export class HeroScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60)
  private stack = new THREE.Group()
  private cards: Card[] = []
  private faces: FaceTextures[] = []
  private dust!: THREE.Points
  private dustVel!: Float32Array
  private disposables: { dispose(): void }[] = []
  private clock = new THREE.Clock()
  private raf = 0
  private active = true
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  private layout = { x: 2.1, y: -0.15, scale: 0.7, spreadScale: 0.8 }
  private smoothP = 0

  constructor(canvas: HTMLCanvasElement, private progress: HeroProgress) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // No filmic curve: it greys the purple and lifts the black stock.
    renderer.toneMapping = THREE.NoToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.VSMShadowMap
    this.renderer = renderer

    // Soft studio reflections, so the foil has something to mirror.
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture
    this.scene.environment = env
    pmrem.dispose()
    this.disposables.push(env)

    this.camera.position.set(0, 0.5, 10)
    this.camera.lookAt(0, 0, 0)

    this.buildLights()
    this.buildCards()
    this.buildDust()
    this.scene.add(this.stack)
  }

  private buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xfff6ea, 0xe6d4ee, 0.9))
    const key = new THREE.DirectionalLight(0xfff1e0, 1.6)
    key.position.set(-3.5, 6, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.radius = 14
    key.shadow.blurSamples = 20
    key.shadow.bias = -0.0005
    const sc = key.shadow.camera
    sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 20
    this.scene.add(key)
    // A restrained violet rim from behind-right.
    const rim = new THREE.PointLight(0x8a55d0, 18, 14, 2)
    rim.position.set(4.5, 2.2, -2.5)
    this.scene.add(rim)

    // An invisible floor that only shows shadow, tinted plum, under the cards.
    const floorGeo = new THREE.PlaneGeometry(30, 30)
    const floorMat = new THREE.ShadowMaterial({ color: 0x2b1453, opacity: 0.11 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -2.1
    floor.receiveShadow = true
    this.scene.add(floor)
    this.disposables.push(floorGeo, floorMat)
  }

  private makeFace(id: FaceId): FaceTextures {
    const color = document.createElement('canvas')
    const foil = document.createElement('canvas')
    const rough = document.createElement('canvas')
    const maps = [color, foil, rough].map((c) => {
      const t = new THREE.CanvasTexture(c)
      t.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
      this.disposables.push(t)
      return t
    })
    maps[0].colorSpace = THREE.SRGBColorSpace
    const f: FaceTextures = { id, color, foil, rough, maps }
    this.paint(f)
    this.faces.push(f)
    return f
  }

  private paint(f: FaceTextures) {
    paintFace(f.color, f.id, 'color')
    paintFace(f.foil, f.id, 'foil')
    roughnessFromFoil(f.foil, f.rough)
    f.maps.forEach((m) => (m.needsUpdate = true))
  }

  private faceMaterial(f: FaceTextures) {
    const [map, foil, rough] = f.maps
    const m = new THREE.MeshPhysicalMaterial({
      map,
      metalness: 1,
      metalnessMap: foil,
      roughness: 1,
      roughnessMap: rough,
      bumpMap: foil,
      bumpScale: 0.6,
      // Low: rough paper shouldn't mirror the room; foil (metal) still picks it up.
      envMapIntensity: 0.45,
    })
    this.disposables.push(m)
    return m
  }

  private buildCards() {
    const shape = roundedRect(CARD_W, CARD_H, RADIUS)
    const face = faceGeometry(shape)
    const ply = new THREE.ExtrudeGeometry(shape, { depth: CARD_T / 3, bevelEnabled: false, curveSegments: 6 })
    this.disposables.push(face, ply)

    CARDS.forEach((spec, i) => {
      const pivot = new THREE.Group()
      const flip = new THREE.Group()
      pivot.add(flip)

      // Three plies, so the edge shows a coloured core like duplex/triplex board.
      spec.plies.forEach((c, k) => {
        const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, envMapIntensity: 0.3 })
        this.disposables.push(mat)
        const m = new THREE.Mesh(ply, mat)
        m.position.z = CARD_T / 2 - (CARD_T / 3) * (k + 1)
        m.castShadow = true
        flip.add(m)
      })
      const front = new THREE.Mesh(face, this.faceMaterial(this.makeFace(spec.front)))
      front.position.z = CARD_T / 2 + 0.0008
      const back = new THREE.Mesh(face, this.faceMaterial(this.makeFace(spec.back)))
      back.rotation.y = Math.PI
      back.position.z = -CARD_T / 2 - 0.0008
      front.castShadow = back.castShadow = true
      flip.add(front, back)

      pivot.renderOrder = i
      this.stack.add(pivot)
      this.cards.push({ spec, pivot, flip })
    })
  }

  private buildDust() {
    const N = window.innerWidth < 1200 ? 140 : 240
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    this.dustVel = new Float32Array(N)
    const tints = [new THREE.Color(0xe8d3a6), new THREE.Color(0xb79be0), new THREE.Color(0xffffff)]
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9
      pos[i * 3 + 2] = -5 + Math.random() * 7
      const t = tints[i % 3]
      col[i * 3] = t.r; col[i * 3 + 1] = t.g; col[i * 3 + 2] = t.b
      this.dustVel[i] = 0.04 + Math.random() * 0.1
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))

    // A soft round sprite.
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.5)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    const sprite = new THREE.CanvasTexture(c)
    const mat = new THREE.PointsMaterial({ size: 0.07, map: sprite, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false })
    this.dust = new THREE.Points(geo, mat)
    this.scene.add(this.dust)
    this.disposables.push(geo, mat, sprite)
  }

  /** Repaint the card art (call once the webfonts have arrived). */
  refreshArt() {
    this.faces.forEach((f) => this.paint(f))
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
  }

  resize(w: number, h: number) {
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    const a = w / h
    // Wide screens: the stack sits right of the headline. Narrower (tablet portrait):
    // centred under it, a little smaller.
    // Half the visible width at the resting camera distance (z = 10, 30° fov).
    const halfW = Math.tan((15 * Math.PI) / 180) * 10 * a
    // When spread, the three cards span about ±4.3 units; keep them inside the frame.
    const spreadScale = Math.min(0.82, (halfW * 0.9) / 4.3)
    this.layout = a >= 1.25 && w >= 1024
      ? { x: halfW * 0.5, y: -0.15, scale: 0.7, spreadScale }
      : { x: 0, y: -1.2, scale: 0.6, spreadScale }
  }

  setActive(on: boolean) {
    this.active = on
    if (on && !this.raf) this.start()
  }

  start() {
    this.clock.getDelta()
    const loop = () => {
      this.raf = 0
      if (!this.active || document.hidden) return
      this.frame(Math.min(this.clock.getDelta(), 0.05), this.clock.elapsedTime)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  private frame(dt: number, t: number) {
    // Smooth the scroll value a little so wheel steps glide.
    this.smoothP = lerp(this.smoothP, clamp01(this.progress.current), 1 - Math.pow(0.0015, dt))
    const p = this.smoothP
    const ptr = this.pointer
    const k = 1 - Math.pow(0.02, dt)
    ptr.sx = lerp(ptr.sx, ptr.x, k)
    ptr.sy = lerp(ptr.sy, ptr.y, k)

    const centre = smoothstep(0, 0.45, p)
    const flip = smoothstep(0.2, 0.55, p)
    const spread = smoothstep(0.5, 0.95, p)
    const { x, y, scale, spreadScale } = this.layout

    // Centred, the stack rides high so the caption below has room.
    this.stack.position.set(lerp(x, 0, centre), lerp(y, 0.45, centre), 0)
    this.stack.scale.setScalar(lerp(scale, spreadScale, centre))
    this.stack.rotation.set(ptr.sy * 0.14, ptr.sx * 0.26, 0)

    this.cards.forEach((c, i) => {
      const { rest, spread: s } = c.spec
      const float = Math.sin(t * 0.65 + i * 1.9) * 0.07
      c.pivot.position.set(
        lerp(rest.p[0], s.p[0], spread),
        lerp(rest.p[1], s.p[1], spread) + float,
        lerp(rest.p[2], s.p[2], spread),
      )
      c.pivot.rotation.set(
        lerp(rest.r[0], s.r[0], spread) + Math.sin(t * 0.5 + i) * 0.02,
        lerp(rest.r[1], s.r[1], spread),
        lerp(rest.r[2], s.r[2], spread) + Math.cos(t * 0.45 + i * 2) * 0.025,
      )
      // The top card turns over to show its back.
      c.flip.rotation.y = i === CARDS.length - 1 ? flip * Math.PI : 0
    })

    // The camera eases in as the cards come to the centre.
    this.camera.position.set(ptr.sx * 0.35, 0.5 - ptr.sy * 0.2, lerp(10, 9, centre) + spread * 0.6)
    this.camera.lookAt(0, 0, 0)

    // Dust drifts upward and wraps.
    const pos = this.dust.geometry.attributes.position as THREE.BufferAttribute
    const arr = pos.array as Float32Array
    for (let i = 0; i < this.dustVel.length; i++) {
      arr[i * 3 + 1] += this.dustVel[i] * dt
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.002
      if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = -4.5
    }
    pos.needsUpdate = true

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
