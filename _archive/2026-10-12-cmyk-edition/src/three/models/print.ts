import * as THREE from 'three'
import { BUSINESS } from '@/data/site'
import { Kit, type ProductModel } from './kit'
import { COLORS as C, F, pinwheel, halftone, mandala, roundRect, paperGrain } from './art'

const TAU = Math.PI * 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const ease = (t: number) => t * t * (3 - 2 * t)

// ─────────────────────────────────────────────────────────────────────────────
// Invitation
// ─────────────────────────────────────────────────────────────────────────────
function inviteBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#6b1236'); g.addColorStop(1, '#2b0716')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  // a tone-on-tone damask of small mandalas
  for (let y = 0; y < 6; y++) for (let x = 0; x < 4; x++) {
    mandala(ctx, (x + (y % 2 ? 0.0 : 0.5)) * (w / 3.5) + 20, (y + 0.4) * (h / 5.4), w * 0.075, 'rgba(255,200,160,0.07)', 2)
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)')
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h, 1)
}

function inviteFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'
  ctx.lineWidth = 5
  roundRect(ctx, 34, 34, w - 68, h - 68, 12); ctx.stroke()
  ctx.lineWidth = 2
  roundRect(ctx, 52, 52, w - 104, h - 104, 8); ctx.stroke()
  // corner flourishes
  for (const [cx, cy, sx, sy] of [[70, 70, 1, 1], [w - 70, 70, -1, 1], [70, h - 70, 1, -1], [w - 70, h - 70, -1, -1]] as const) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, sy)
    ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(0, 0, 60, 0); ctx.stroke()
    ctx.beginPath(); ctx.arc(14, 14, 7, 0, TAU); ctx.fill()
    ctx.restore()
  }
  mandala(ctx, w / 2, h * 0.3, w * 0.2, '#fff', 3)
  ctx.textAlign = 'center'
  ctx.font = F.mono(w * 0.032, 500)
  ctx.fillText('· · ·   TOGETHER WITH OUR FAMILIES   · · ·', w / 2, h * 0.55)
  ctx.font = F.display(w * 0.125, true, 500)
  ctx.fillText('You are', w / 2, h * 0.65)
  ctx.fillText('invited', w / 2, h * 0.74)
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(w * 0.3, h * 0.79); ctx.lineTo(w * 0.7, h * 0.79); ctx.stroke()
  ctx.font = F.mono(w * 0.03, 500)
  ctx.fillText('DATE   ·   TIME   ·   VENUE', w / 2, h * 0.855)
  ctx.textAlign = 'left'
}

function envelopeGold(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f2e2bd'; ctx.fillRect(0, 0, w, h)
  paperGrain(ctx, w, h, 1.4)
  ctx.strokeStyle = 'rgba(150,110,50,0.35)'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w / 2, h * 0.42); ctx.lineTo(w, 0); ctx.stroke()
  mandala(ctx, w / 2, h * 0.42, w * 0.07, 'rgba(150,100,40,0.7)', 3)
}

export function buildInvitation(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const W = 1.15, H = 1.6
  const base = kit.tex(720, 1000, inviteBase)
  const foil = kit.tex(720, 1000, inviteFoil)
  const env = kit.tex(800, 1000, envelopeGold)
  const stock = kit.paper(base, { roughness: 0.7 })
  const side = kit.paper(null, { color: 0x4a0d27, roughness: 0.8 })

  // Envelope behind
  const envelope = kit.mesh(kit.rbox(1.4, 1.75, 0.016, 0.008, 2), [side, side, side, side, kit.paper(env), kit.paper(env)])
  envelope.position.set(-0.28, 0.98, -0.28)
  envelope.rotation.set(-0.05, 0.22, -0.1)
  g.add(envelope)

  // Card, standing in a dark display base
  const card = new THREE.Group()
  const body = kit.mesh(kit.rbox(W, H, 0.045, 0.02), [side, side, side, side, stock, stock])
  card.add(body)
  const foilMesh = new THREE.Mesh(kit.plane(W, H), kit.foilMat(foil))
  foilMesh.position.z = 0.0235
  card.add(foilMesh)
  card.position.set(0.1, 0.95, 0.1)
  card.rotation.set(-0.06, -0.12, 0.02)
  g.add(card)
  const stand = kit.mesh(kit.rbox(1.3, 0.1, 0.34, 0.04), kit.mat({ color: 0x1d1830, roughness: 0.3, metalness: 0.55 }))
  stand.position.set(0.1, 0.05, 0.12)
  stand.rotation.y = -0.12
  g.add(stand)
  // a gold wax-style seal
  const seal = kit.mesh(kit.cyl(0.11, 0.12, 0.03, 32), kit.mat({ color: 0xd9ad43, metalness: 1, roughness: 0.28 }))
  seal.rotation.x = Math.PI / 2
  seal.position.set(0.07, 0.38, 0.17)
  g.add(seal)
  return { group: g, polar: 1.28 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Offset press
// ─────────────────────────────────────────────────────────────────────────────
function printedPoster(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h)
  const stripes = [C.cy, C.mg, C.ye, C.ink]
  stripes.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect((i * w) / 4, 0, w / 4, h * 0.2) })
  halftone(ctx, 0, h * 0.2, w, h * 0.42, C.mg, 22, 0.3, 'y')
  halftone(ctx, 0, h * 0.2, w, h * 0.42, 'rgba(0,174,239,0.8)', 22, 1.1, 'x')
  pinwheel(ctx, w / 2, h * 0.44, w * 0.2)
  ctx.fillStyle = C.ink; ctx.textAlign = 'center'
  ctx.font = F.display(w * 0.11, true)
  ctx.fillText('Sri Ganapathy', w / 2, h * 0.76)
  ctx.font = F.mono(w * 0.036)
  ctx.fillText('CARDS & PRINTERS', w / 2, h * 0.82)
  ctx.textAlign = 'left'
  ;[C.cy, C.mg, C.ye, C.ink].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(w * (0.35 + i * 0.1), h * 0.92, h * 0.022, 0, TAU); ctx.fill() })
}

export function buildOffset(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const steel = kit.mat({ color: 0xcfd3dc, metalness: 1, roughness: 0.28 })
  const rubber = kit.mat({ color: 0x1b1a24, metalness: 0.2, roughness: 0.55 })
  const frameMat = kit.mat({ color: 0x2a2540, metalness: 0.7, roughness: 0.4 })
  const R = 0.42, LEN = 1.5
  const NIP_Y = 1.05

  // frame
  const base = kit.mesh(kit.rbox(2.9, 0.26, 1.9, 0.05), frameMat)
  base.position.y = 0.13
  g.add(base)
  const backPlate = kit.mesh(kit.rbox(1.5, 2.9, 0.1, 0.05), frameMat)
  backPlate.position.set(0, 1.55, -0.88)
  g.add(backPlate)
  for (const sx of [-1, 1]) for (const y of [0.3, 2.75]) {
    const bar = kit.mesh(kit.rbox(0.1, 0.1, 1.7, 0.03), frameMat)
    bar.position.set(sx * 0.7, y, 0)
    g.add(bar)
  }
  for (const sx of [-1, 1]) {
    const post = kit.mesh(kit.rbox(0.1, 2.55, 0.1, 0.03), frameMat)
    post.position.set(sx * 0.7, 1.52, 0.8)
    g.add(post)
  }

  // cylinders (axis along z)
  const plateTex = kit.tex(512, 128, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, w, 0)
    gr.addColorStop(0, '#d9dde6'); gr.addColorStop(1, '#aab0c0')
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h)
    ;[C.cy, C.mg, C.ye, C.ink].forEach((c, i) => { ctx.fillStyle = c; ctx.globalAlpha = 0.85; ctx.fillRect(w * 0.08 + i * w * 0.22, h * 0.2, w * 0.16, h * 0.6) })
    ctx.globalAlpha = 1
  })
  const cylinder = (r: number, mat: THREE.Material, y: number, x = 0) => {
    const c = kit.mesh(kit.cyl(r, r, LEN, 56), mat)
    c.rotation.x = Math.PI / 2
    c.position.set(x, y, 0)
    g.add(c)
    return c
  }
  const impression = cylinder(R, steel, NIP_Y - R)
  const blanket = cylinder(R, rubber, NIP_Y + R)
  const plate = cylinder(R, kit.mat({ map: plateTex, metalness: 0.9, roughness: 0.3 }), NIP_Y + 3 * R + 0.04)
  // ink rollers feeding the plate cylinder
  const inkA = cylinder(0.17, kit.mat({ color: 0x00aeef, roughness: 0.4 }), NIP_Y + 3 * R + 0.28, -0.52)
  const inkB = cylinder(0.17, kit.mat({ color: 0xec008c, roughness: 0.4 }), NIP_Y + 3 * R + 0.28, 0.52)
  for (const c of [impression, blanket, plate]) {
    for (const sz of [-1, 1]) {
      const cap = kit.mesh(kit.cyl(R * 0.6, R * 0.6, 0.06, 32), steel)
      cap.rotation.x = Math.PI / 2
      cap.position.set(c.position.x, c.position.y, sz * (LEN / 2 + 0.03))
      g.add(cap)
    }
  }

  // feeder and delivery tables at nip height, with piles of paper
  const table = (x: number) => {
    const t = kit.mesh(kit.rbox(1.35, 0.06, 1.55, 0.02), frameMat)
    t.position.set(x, NIP_Y - 0.03, 0)
    g.add(t)
    for (const sx of [-0.55, 0.55]) for (const sz of [-0.62, 0.62]) {
      const leg = kit.mesh(kit.rbox(0.07, NIP_Y - 0.26, 0.07, 0.02), frameMat)
      leg.position.set(x + sx, 0.26 + (NIP_Y - 0.26) / 2 - 0.03, sz)
      g.add(leg)
    }
  }
  table(-1.35); table(1.35)
  const SHEET_W = 1.2, SHEET_L = 1.15
  const pileEdge = kit.tex(8, 96, (ctx, w, h) => { for (let y = 0; y < h; y += 4) { ctx.fillStyle = y % 8 ? '#f4efe6' : '#ffffff'; ctx.fillRect(0, y, w, 4) } }, { repeat: true })
  const pileSide = kit.paper(pileEdge)
  const blankPile = kit.mesh(kit.rbox(SHEET_L, 0.22, SHEET_W, 0.01), pileSide)
  blankPile.position.set(-1.75, NIP_Y + 0.11, 0)
  g.add(blankPile)
  const donePile = kit.mesh(kit.rbox(SHEET_L, 0.3, SHEET_W, 0.01), [pileSide, pileSide, kit.paper(kit.tex(520, 560, printedPoster)), pileSide, pileSide, pileSide])
  donePile.position.set(1.75, NIP_Y + 0.15, 0)
  g.add(donePile)

  // sheets that travel through the nip, blank on the way in and printed on the way out
  const SPEED = 0.85, SPAN = 4.4, N = 3, GAP = SPAN / N
  interface Sheet { blank: THREE.Mesh; printed: THREE.Mesh; tb: THREE.CanvasTexture; tp: THREE.CanvasTexture }
  const sheets: Sheet[] = []
  const planeGeo = kit.plane(1, 1)
  for (let i = 0; i < N; i++) {
    const tb = kit.tex(256, 280, (ctx, w, h) => { ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, w, h); paperGrain(ctx, w, h) })
    const tp = kit.tex(520, 560, printedPoster)
    const blank = new THREE.Mesh(planeGeo, kit.mat({ map: tb, roughness: 0.8, side: THREE.DoubleSide }))
    const printed = new THREE.Mesh(planeGeo, kit.mat({ map: tp, roughness: 0.55, side: THREE.DoubleSide }))
    for (const m of [blank, printed]) { m.rotation.x = -Math.PI / 2; m.receiveShadow = true; m.castShadow = true; g.add(m) }
    sheets.push({ blank, printed, tb, tp })
  }

  return {
    group: g,
    polar: 1.1,
    update(t, dt) {
      // rollers turn at the speed of the paper
      // each cylinder spins about its own axis (local y, before the quarter-turn onto z)
      const w = SPEED / R
      impression.rotation.y -= w * dt
      blanket.rotation.y += w * dt
      plate.rotation.y -= w * dt
      inkA.rotation.y += w * 1.6 * dt
      inkB.rotation.y += w * 1.6 * dt
      sheets.forEach((s, i) => {
        // wrap each sheet's position along the run
        const x0 = ((t * SPEED + i * GAP) % SPAN) - SPAN / 2
        const left = x0 - SHEET_L / 2
        const blankLen = clamp(-left, 0, SHEET_L)
        const printLen = SHEET_L - blankLen
        // fade at the ends so sheets seem to come off one pile and settle onto the other
        const edge = Math.min(1, (SPAN / 2 - Math.abs(x0)) / 0.5)
        const y = NIP_Y + 0.012 + (1 - clamp(edge)) * 0.0
        const apply = (mesh: THREE.Mesh, len: number, from: number, tex: THREE.CanvasTexture, u0: number) => {
          mesh.visible = len > 0.004 && edge > 0.02
          if (!mesh.visible) return
          mesh.scale.set(len, SHEET_W, 1)
          mesh.position.set(left + from + len / 2, y, 0)
          tex.repeat.x = len / SHEET_L
          tex.offset.x = u0
        }
        apply(s.blank, blankLen, 0, s.tb, 0)
        apply(s.printed, printLen, blankLen, s.tp, blankLen / SHEET_L)
        // sheets thin out as they pass under the piles' edges (cheap fade)
        const op = clamp(edge * 1.4)
        ;(s.blank.material as THREE.MeshStandardMaterial).transparent = op < 1
        ;(s.blank.material as THREE.MeshStandardMaterial).opacity = op
        ;(s.printed.material as THREE.MeshStandardMaterial).transparent = op < 1
        ;(s.printed.material as THREE.MeshStandardMaterial).opacity = op
      })
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen printing
// ─────────────────────────────────────────────────────────────────────────────
function shirtShape(): THREE.Shape {
  const s = new THREE.Shape()
  // a T-shirt, flat, centred, in units where the body is ~1.5 wide
  s.moveTo(-0.34, 0.95)
  s.lineTo(-0.62, 0.84)
  s.lineTo(-1.12, 0.46)
  s.lineTo(-0.9, 0.12)
  s.lineTo(-0.66, 0.3)
  s.lineTo(-0.66, -0.95)
  s.lineTo(0.66, -0.95)
  s.lineTo(0.66, 0.3)
  s.lineTo(0.9, 0.12)
  s.lineTo(1.12, 0.46)
  s.lineTo(0.62, 0.84)
  s.lineTo(0.34, 0.95)
  s.quadraticCurveTo(0, 0.6, -0.34, 0.95)
  return s
}

function shirtPrint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  pinwheel(ctx, w / 2, h * 0.4, w * 0.3)
  ctx.fillStyle = '#16121e'; ctx.textAlign = 'center'
  ctx.font = F.display(w * 0.13, true)
  ctx.fillText('Your Logo', w / 2, h * 0.84)
  ctx.font = F.mono(w * 0.05)
  ctx.fillText('SCREEN PRINTED', w / 2, h * 0.94)
  ctx.textAlign = 'left'
}

export function buildScreen(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const wood = kit.mat({ color: 0xb98a58, roughness: 0.6 })
  const alu = kit.mat({ color: 0xd8dbe4, metalness: 1, roughness: 0.3 })

  // platen and shirt
  const platen = kit.mesh(kit.rbox(2.6, 0.12, 2.2, 0.03), wood)
  platen.position.y = 0.06
  g.add(platen)
  const shirtGeo = kit.track(new THREE.ExtrudeGeometry(shirtShape(), { depth: 0.035, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 12 }))
  const shirt = kit.mesh(shirtGeo, kit.mat({ color: 0x2d2870, roughness: 0.95 }))
  shirt.rotation.x = -Math.PI / 2
  shirt.scale.set(0.95, 0.95, 1)
  shirt.position.set(0, 0.125, 0.05)
  g.add(shirt)
  const printTex = kit.tex(512, 512, shirtPrint)
  const printMat = kit.mat({ map: printTex, transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
  const PW = 0.9
  const print = new THREE.Mesh(kit.plane(1, 1), printMat)
  print.rotation.x = -Math.PI / 2
  g.add(print)

  // frame, hinged at the back edge of the platen
  const hinge = new THREE.Group()
  hinge.position.set(0, 0.2, -1.05)
  g.add(hinge)
  const FW = 2.3, FD = 1.85, B = 0.11
  const place = (w: number, d: number, x: number, z: number) => {
    const bar = kit.mesh(kit.rbox(w, 0.1, d, 0.02), alu)
    bar.position.set(x, 0.05, z)
    hinge.add(bar)
  }
  place(FW, B, 0, B / 2)
  place(FW, B, 0, FD - B / 2)
  place(B, FD, -FW / 2 + B / 2, FD / 2)
  place(B, FD, FW / 2 - B / 2, FD / 2)
  const mesh = new THREE.Mesh(kit.plane(FW - 2 * B, FD - 2 * B), kit.mat({
    map: kit.tex(512, 512, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(120,120,160,0.35)'; ctx.lineWidth = 1
      for (let i = 0; i < w; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke() }
      // the stencil: ink blocked everywhere except the open design
      ctx.fillStyle = 'rgba(255,170,60,0.55)'
      ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.28, 0, TAU); ctx.fill()
    }),
    transparent: true, side: THREE.DoubleSide, roughness: 0.4, depthWrite: false,
  }))
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(0, 0.05, FD / 2)
  hinge.add(mesh)

  // squeegee: handle + rubber blade + a bead of ink
  const sq = new THREE.Group()
  const handle = kit.mesh(kit.rbox(1.55, 0.12, 0.14, 0.04), wood)
  handle.position.y = 0.34
  sq.add(handle)
  const blade = kit.mesh(kit.rbox(1.5, 0.3, 0.035, 0.012), kit.mat({ color: 0x2a2a38, roughness: 0.6 }))
  blade.position.y = 0.17
  sq.add(blade)
  const bead = kit.mesh(kit.cyl(0.05, 0.05, 1.45, 18), kit.mat({ color: 0x00aeef, roughness: 0.2 }))
  bead.rotation.z = Math.PI / 2
  bead.position.set(0, 0.07, 0.07)
  sq.add(bead)
  g.add(sq)

  const T = 9
  const OPEN = -0.95
  const Z_START = -0.55, Z_END = 0.62 // blade's path across the platen
  const P_Z0 = -0.4 // print starts here…
  return {
    group: g,
    polar: 0.95,
    update(t) {
      const k = (t % T) / T
      let frame = OPEN, bladeZ = Z_START, lift = 1, drag = 0
      if (k < 0.12) { frame = lerp(OPEN, 0, ease(k / 0.12)) }
      else if (k < 0.2) { frame = 0; lift = 1 - ease((k - 0.12) / 0.08) }
      else if (k < 0.52) { frame = 0; lift = 0; drag = ease((k - 0.2) / 0.32); bladeZ = lerp(Z_START, Z_END, drag) }
      else if (k < 0.6) { frame = 0; bladeZ = Z_END; drag = 1; lift = ease((k - 0.52) / 0.08) }
      else if (k < 0.74) { frame = lerp(0, OPEN, ease((k - 0.6) / 0.14)); bladeZ = Z_END; drag = 1 }
      else { frame = OPEN; bladeZ = Z_END; drag = 1 }
      hinge.rotation.x = frame
      sq.position.set(0, 0.25 + lift * 0.55, bladeZ)
      bead.visible = lift < 0.2 && drag < 1

      // the image is laid down behind the blade, never ahead of it
      const edge = clamp(bladeZ - 0.05, P_Z0, P_Z0 + PW)
      const reveal = drag === 0 ? 0 : (edge - P_Z0) / PW
      print.visible = reveal > 0.01
      print.scale.set(PW, Math.max(0.001, PW * reveal), 1)
      print.position.set(0, 0.16, P_Z0 + (PW * reveal) / 2)
      printTex.repeat.y = Math.max(0.001, reveal)
      printTex.offset.y = 1 - reveal
      printMat.opacity = k > 0.9 ? 1 - ease((k - 0.9) / 0.1) : 1
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Flex banner
// ─────────────────────────────────────────────────────────────────────────────
function bannerArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#ec008c'); g.addColorStop(0.55, '#7a1fa8'); g.addColorStop(1, '#2b1a8c')
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  halftone(ctx, 0, 0, w, h, 'rgba(255,255,255,0.16)', 26, 0.5, 'r')
  ctx.fillStyle = '#ffd400'
  for (let i = 0; i < 18; i++) { // sunburst
    const a = (i / 18) * TAU
    ctx.beginPath(); ctx.moveTo(w * 0.78, h * 0.3)
    ctx.lineTo(w * 0.78 + Math.cos(a - 0.06) * w, h * 0.3 + Math.sin(a - 0.06) * w)
    ctx.lineTo(w * 0.78 + Math.cos(a + 0.06) * w, h * 0.3 + Math.sin(a + 0.06) * w)
    ctx.closePath(); ctx.globalAlpha = 0.16; ctx.fill(); ctx.globalAlpha = 1
  }
  ctx.fillStyle = '#fff'
  ctx.font = F.mono(w * 0.04, 500)
  ctx.fillText('FLEX PRINTED  ·  ANY SIZE', w * 0.06, h * 0.14)
  ctx.font = F.display(w * 0.2, true, 800)
  ctx.fillStyle = '#ffd400'
  ctx.fillText('GRAND', w * 0.06, h * 0.45)
  ctx.fillStyle = '#fff'
  ctx.fillText('OPENING', w * 0.06, h * 0.66)
  ctx.font = F.sans(w * 0.045, 800)
  ctx.fillText('YOUR BRAND  ·  YOUR OFFER  ·  YOUR NAME', w * 0.06, h * 0.78)
  pinwheel(ctx, w * 0.84, h * 0.3, w * 0.1)
  ctx.fillStyle = '#16121e'; ctx.fillRect(0, h * 0.86, w, h * 0.14)
  ctx.fillStyle = '#fff'
  ctx.font = F.sans(w * 0.05, 800)
  ctx.fillText(BUSINESS.phones[0].display + '   ' + BUSINESS.phones[1].display, w * 0.06, h * 0.945)
}

export function buildFlex(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const metal = kit.mat({ color: 0x2a2540, metalness: 0.8, roughness: 0.35 })
  const W = 2.7, H = 1.7, TOP = 2.9
  for (const sx of [-1, 1]) {
    const pole = kit.mesh(kit.cyl(0.05, 0.05, TOP + 0.1, 20), metal)
    pole.position.set(sx * (W / 2 + 0.12), (TOP + 0.1) / 2, 0)
    g.add(pole)
    const foot = kit.mesh(kit.cyl(0.32, 0.36, 0.1, 32), metal)
    foot.position.set(sx * (W / 2 + 0.12), 0.05, 0)
    g.add(foot)
  }
  const bar = kit.mesh(kit.cyl(0.045, 0.045, W + 0.4, 20), metal)
  bar.rotation.z = Math.PI / 2
  bar.position.set(0, TOP + 0.05, 0)
  g.add(bar)

  const tex = kit.tex(1280, 810, bannerArt)
  const geo = kit.plane(W, H, 48, 24)
  const banner = new THREE.Mesh(geo, kit.mat({ map: tex, roughness: 0.5, side: THREE.DoubleSide }))
  banner.position.set(0, TOP - H / 2 - 0.02, 0)
  banner.castShadow = true
  banner.receiveShadow = true
  g.add(banner)
  // eyelets along the top and bottom edges
  const eyeGeo = kit.track(new THREE.TorusGeometry(0.035, 0.012, 8, 16))
  const eyeMat = kit.mat({ color: 0xd9dbe2, metalness: 1, roughness: 0.25 })
  for (let i = 0; i <= 8; i++) {
    for (const y of [TOP - 0.05, TOP - H + 0.03]) {
      const e = new THREE.Mesh(eyeGeo, eyeMat)
      e.position.set(-W / 2 + 0.06 + (i * (W - 0.12)) / 8, y, 0.012)
      g.add(e)
    }
  }
  // the banner hangs from rings on the bar
  const ringGeo = kit.track(new THREE.TorusGeometry(0.06, 0.012, 8, 20))
  for (let i = 0; i <= 8; i++) {
    const r = new THREE.Mesh(ringGeo, eyeMat)
    r.rotation.y = Math.PI / 2
    r.position.set(-W / 2 + 0.06 + (i * (W - 0.12)) / 8, TOP, 0)
    g.add(r)
  }
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const base = (pos.array as Float32Array).slice()
  return {
    group: g,
    polar: 1.25,
    update(t) {
      const arr = pos.array as Float32Array
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1]
        const down = (H / 2 - y) / H // 0 at the top, 1 at the bottom
        arr[i * 3 + 2] = Math.sin(x * 2.4 + t * 1.7 + down * 1.2) * 0.065 * down + Math.sin(x * 5.1 - t * 2.3) * 0.012 * down
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
      banner.rotation.y = Math.sin(t * 0.5) * 0.04
    },
  }
}

