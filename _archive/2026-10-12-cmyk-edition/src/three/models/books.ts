import * as THREE from 'three'
import { Kit } from './kit'
import { F, pinwheelMono, leatherBump } from './art'

/** Cloth weave as a bump map: a fine crosshatch. */
export function linenBump(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#8c8c8c'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < w; i += 3) { ctx.fillStyle = i % 6 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)'; ctx.fillRect(i, 0, 1, h) }
  for (let j = 0; j < h; j += 3) { ctx.fillStyle = j % 6 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.18)'; ctx.fillRect(0, j, w, 1) }
}

/** The striped page edges of a block of paper. */
export function pageEdgeTex(kit: Kit) {
  return kit.tex(16, 256, (ctx, w, h) => {
    for (let y = 0; y < h; y += 3) { ctx.fillStyle = y % 6 ? '#f6efe0' : '#fffaf0'; ctx.fillRect(0, y, w, 3) }
    ctx.fillStyle = 'rgba(90,60,30,0.16)'
    for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 1)
  }, { repeat: true })
}

export interface BookOpts {
  w: number
  h: number
  t: number
  color: number
  bump?: 'linen' | 'leather'
  /** Lines of gold-foil title on the front, largest first. */
  title: string[]
  tagline?: string
  /** Text for the spine foil. */
  spine?: string
  /** Elastic closure band (colour), if any. */
  elastic?: number
  /** Ribbon marker colour, if any. */
  ribbon?: number
  /** Corner radius of the boards. */
  round?: number
  /** Show the shop's pinwheel in foil above the title. */
  mark?: boolean
}

/**
 * A bound book standing upright: spine to the left, front cover facing +z. Built from
 * two boards, a rounded spine, a block of pages, and optional foil, elastic and ribbon.
 * Pivot at the base-centre of the book.
 */
export function hardcover(kit: Kit, o: BookOpts): THREE.Group {
  const g = new THREE.Group()
  const { w, h, t } = o
  const board = 0.035
  const bumpTex = kit.tex(256, 256, o.bump === 'leather' ? leatherBump : linenBump, { repeat: true, data: true })
  bumpTex.repeat.set(o.bump === 'leather' ? 3 : 6, o.bump === 'leather' ? 4 : 8)
  const cloth = kit.track(new THREE.MeshPhysicalMaterial({
    color: o.color, roughness: o.bump === 'leather' ? 0.55 : 0.8, bumpMap: bumpTex, bumpScale: o.bump === 'leather' ? 1.8 : 0.9,
    clearcoat: o.bump === 'leather' ? 0.3 : 0, clearcoatRoughness: 0.5,
  }))

  const bodyW = w - t / 2
  const front = kit.mesh(kit.rbox(bodyW, h, board, o.round ?? 0.03), cloth)
  front.position.set(t / 4, h / 2, t / 2 - board / 2)
  g.add(front)
  const back = kit.mesh(kit.rbox(bodyW, h, board, o.round ?? 0.03), cloth)
  back.position.set(t / 4, h / 2, -t / 2 + board / 2)
  g.add(back)
  // rounded spine
  const spineGeo = kit.track(new THREE.CylinderGeometry(t / 2, t / 2, h, 28, 1, false, Math.PI, Math.PI))
  const spine = kit.mesh(spineGeo, cloth)
  spine.position.set(-w / 2 + t / 2, h / 2, 0)
  g.add(spine)

  // pages
  const edge = pageEdgeTex(kit)
  const pageMat = kit.paper(edge, { roughness: 0.9 })
  const hidden = kit.paper(null, { color: 0xfaf4e6 })
  const pages = kit.mesh(kit.rbox(bodyW - 0.05, h - 0.09, t - 2 * board - 0.01, 0.006, 2), [pageMat, hidden, pageMat, pageMat, hidden, hidden])
  pages.position.set(t / 4 - 0.015, h / 2, 0)
  g.add(pages)

  // gold foil: front title…
  const foilW = bodyW - 0.16, foilH = h - 0.16
  const foilTex = kit.tex(640, Math.round((640 * foilH) / foilW), (ctx, cw, ch) => {
    ctx.clearRect(0, 0, cw, ch)
    ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'
    ctx.lineWidth = 6; ctx.strokeRect(24, 24, cw - 48, ch - 48)
    ctx.lineWidth = 2; ctx.strokeRect(40, 40, cw - 80, ch - 80)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    let y = ch * 0.38
    if (o.mark) { pinwheelMono(ctx, cw / 2, ch * 0.2, cw * 0.1, '#fff'); y = ch * 0.4 }
    o.title.forEach((line, i) => {
      const px = (i === 0 ? cw * 0.15 : cw * 0.1)
      ctx.font = F.display(px, true, 600)
      ctx.fillText(line, cw / 2, y)
      y += px * 1.15
    })
    ctx.fillRect(cw * 0.3, y + 18, cw * 0.4, 3)
    if (o.tagline) { ctx.font = F.mono(cw * 0.04, 500); ctx.fillText(o.tagline, cw / 2, y + 56) }
    ctx.textAlign = 'left'
  })
  const foil = new THREE.Mesh(kit.plane(foilW, foilH), kit.foilMat(foilTex))
  foil.position.set(t / 4, h / 2, t / 2 + 0.002)
  g.add(foil)

  // …and spine title
  if (o.spine) {
    const spTex = kit.tex(128, 512, (ctx, cw, ch) => {
      ctx.clearRect(0, 0, cw, ch)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.save(); ctx.translate(cw / 2, ch / 2); ctx.rotate(Math.PI / 2)
      ctx.font = F.display(cw * 0.5, true, 600)
      ctx.fillText(o.spine!, 0, 0)
      ctx.restore()
      ctx.fillRect(cw * 0.15, ch * 0.05, cw * 0.7, 3); ctx.fillRect(cw * 0.15, ch * 0.95, cw * 0.7, 3)
    })
    const sp = new THREE.Mesh(kit.plane(h * 0.8, t * 0.6), kit.foilMat(spTex))
    sp.rotation.y = -Math.PI / 2
    sp.rotation.order = 'YXZ'
    sp.rotation.z = Math.PI / 2
    sp.position.set(-w / 2 - 0.003, h / 2, 0)
    g.add(sp)
  }

  if (o.elastic !== undefined) {
    const band = kit.mesh(kit.rbox(0.05, h + 0.02, t + 0.015, 0.012), kit.mat({ color: o.elastic, roughness: 0.7 }))
    band.position.set(w / 2 - 0.2, h / 2, 0)
    g.add(band)
  }
  if (o.ribbon !== undefined) {
    const rib = kit.mesh(kit.box(0.04, 0.45, 0.006), kit.mat({ color: o.ribbon, roughness: 0.5 }))
    rib.position.set(t / 4 + 0.05, -0.12, t / 2 - board - 0.02)
    g.add(rib)
  }
  return g
}
