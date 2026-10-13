import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/** What a product builder returns: a group to put on the turntable, and an optional animator. */
export interface ProductModel {
  group: THREE.Group
  update?(t: number, dt: number): void
  /** Preferred camera angle from straight above, radians: ~0.85 looks down on flat paper, ~1.3 is eye level. */
  polar?: number
}

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

/**
 * Everything a model needs to build itself — and the bookkeeping to throw it all
 * away again. Every geometry, material and texture a model creates goes through
 * here, so swapping products on the turntable never leaks GPU memory. Textures
 * remember how they were drawn, so they can be repainted once webfonts arrive.
 */
export class Kit {
  private disposables: { dispose(): void }[] = []
  private redraws: (() => void)[] = []

  constructor(readonly renderer: THREE.WebGLRenderer) {}

  track<T extends { dispose(): void }>(o: T): T {
    this.disposables.push(o)
    return o
  }

  /** A canvas-drawn texture. `data: true` for non-colour maps (bump, alpha). */
  tex(w: number, h: number, draw: Draw, opts: { repeat?: boolean; data?: boolean } = {}): THREE.CanvasTexture {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    draw(ctx, w, h)
    const t = this.track(new THREE.CanvasTexture(c))
    t.colorSpace = opts.data ? THREE.NoColorSpace : THREE.SRGBColorSpace
    t.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
    if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
    const redraw = () => {
      ctx.clearRect(0, 0, w, h)
      draw(ctx, w, h)
      t.needsUpdate = true
    }
    this.redraws.push(redraw)
    t.userData.redraw = redraw // models that change their own artwork (calendars) call this
    return t
  }

  mat(p: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
    return this.track(new THREE.MeshStandardMaterial(p))
  }

  /** Printed paper or board: matte, lit from the front. */
  paper(map: THREE.Texture | null, extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
    return this.mat({ map, roughness: 0.82, metalness: 0, ...extra })
  }

  /** Metallic foil, laid as an overlay on top of a printed face. */
  foilMat(map: THREE.Texture, color = 0xf2cf6a): THREE.MeshStandardMaterial {
    return this.mat({
      map,
      color,
      emissive: 0x6a4a10,
      emissiveIntensity: 0.55,
      metalness: 1,
      roughness: 0.22,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    })
  }

  rbox(w: number, h: number, d: number, r = 0.02, seg = 3): THREE.BufferGeometry {
    return this.track(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)))
  }

  box(w: number, h: number, d: number): THREE.BoxGeometry {
    return this.track(new THREE.BoxGeometry(w, h, d))
  }

  plane(w: number, h: number, ws = 1, hs = 1): THREE.PlaneGeometry {
    return this.track(new THREE.PlaneGeometry(w, h, ws, hs))
  }

  cyl(rt: number, rb: number, h: number, seg = 40, open = false): THREE.CylinderGeometry {
    return this.track(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open))
  }

  mesh(geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], shadow = true): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = shadow
    m.receiveShadow = true
    return m
  }

  redrawAll() {
    this.redraws.forEach((r) => r())
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose())
    this.disposables = []
    this.redraws = []
  }
}
