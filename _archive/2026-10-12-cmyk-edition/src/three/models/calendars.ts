import * as THREE from 'three'
import { BUSINESS } from '@/data/site'
import { Kit, type ProductModel } from './kit'
import { COLORS as C, F, pinwheel, halftone, paperGrain } from './art'
import { hardcover, pageEdgeTex } from './books'

const TAU = Math.PI * 2
const ease = (t: number) => t * t * (3 - 2 * t)
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']

const dayFromNow = (n: number) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d }

// ─────────────────────────────────────────────────────────────────────────────
// Daily tear-off calendar
// ─────────────────────────────────────────────────────────────────────────────
function dailyArt(getDate: () => Date) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const d = getDate()
    const sunday = d.getDay() === 0
    ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, w, h)
    paperGrain(ctx, w, h)
    ctx.fillStyle = C.iris; ctx.fillRect(0, 0, w, h * 0.17)
    pinwheel(ctx, w * 0.09, h * 0.085, h * 0.055)
    ctx.fillStyle = '#fff'
    ctx.font = F.display(h * 0.05, true, 600)
    ctx.fillText(BUSINESS.line1, w * 0.17, h * 0.075)
    ctx.font = F.mono(h * 0.022)
    ctx.fillText('CARDS & PRINTERS', w * 0.172, h * 0.108)
    ctx.textAlign = 'right'
    ctx.font = F.sans(h * 0.04, 800)
    ctx.fillText(MONTHS[d.getMonth()], w * 0.94, h * 0.082)
    ctx.font = F.mono(h * 0.03)
    ctx.fillText(String(d.getFullYear()), w * 0.94, h * 0.115)
    ctx.textAlign = 'center'
    ctx.fillStyle = sunday ? C.vermilion : C.irisDeep
    ctx.font = F.display(h * 0.44, false, 800)
    ctx.fillText(String(d.getDate()), w / 2, h * 0.56)
    ctx.font = F.sans(h * 0.058, 800)
    ctx.fillStyle = sunday ? C.vermilion : C.ink
    ctx.fillText(DAYS[d.getDay()], w / 2, h * 0.67)
    halftone(ctx, 0, h * 0.7, w, h * 0.12, 'rgba(236,0,140,0.8)', 16, 0.5, 'x')
    halftone(ctx, 0, h * 0.7, w, h * 0.12, 'rgba(0,174,239,0.7)', 16, 1.1, 'x')
    ctx.fillStyle = 'rgba(22,18,30,0.55)'
    ctx.font = F.mono(h * 0.026)
    ctx.textAlign = 'left'
    ctx.fillText('NOTES', w * 0.07, h * 0.875)
    ctx.strokeStyle = 'rgba(22,18,30,0.16)'; ctx.lineWidth = 2
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(w * 0.07, h * (0.9 + i * 0.035)); ctx.lineTo(w * 0.93, h * (0.9 + i * 0.035)); ctx.stroke() }
  }
}

export function buildDailyCalendar(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const wood = kit.mat({ color: 0x8a5a2e, roughness: 0.5 })
  const dark = kit.mat({ color: 0x1b1730, roughness: 0.5, metalness: 0.3 })
  const base = kit.mesh(kit.rbox(1.95, 0.12, 1.1, 0.04), wood)
  base.position.set(0, 0.06, 0)
  g.add(base)

  const tilt = new THREE.Group()
  tilt.position.set(0, 0.1, -0.2)
  tilt.rotation.x = -0.13
  g.add(tilt)
  const board = kit.mesh(kit.rbox(1.72, 2.1, 0.08, 0.03), dark)
  board.position.set(0, 1.1, 0)
  tilt.add(board)
  const header = kit.tex(860, 220, (ctx, w, h) => {
    const gr = ctx.createLinearGradient(0, 0, w, 0)
    gr.addColorStop(0, '#2a1a80'); gr.addColorStop(1, '#4b2bb8')
    ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ebd08f'; ctx.textAlign = 'center'
    ctx.font = F.display(h * 0.38, true, 600)
    ctx.fillText('Daily Calendar', w / 2, h * 0.58)
    ctx.font = F.mono(h * 0.11)
    ctx.fillText('MAKE EVERY DAY COUNT', w / 2, h * 0.8)
  })
  const cap = kit.mesh(kit.rbox(1.72, 0.3, 0.1, 0.03), [dark, dark, dark, dark, kit.paper(header), dark])
  cap.position.set(0, 2.05, 0.01)
  tilt.add(cap)

  // the pad: a block of dated sheets on a black binding strip
  const edge = pageEdgeTex(kit)
  const pad = kit.mesh(kit.rbox(1.45, 1.6, 0.2, 0.008, 2), [kit.paper(edge), kit.paper(edge), kit.paper(edge), kit.paper(edge), kit.paper(null, { color: 0xfffdf6 }), kit.paper(null, { color: 0xfffdf6 })])
  pad.position.set(0, 1.0, 0.14)
  tilt.add(pad)
  const strip = kit.mesh(kit.rbox(1.5, 0.09, 0.24, 0.03), kit.mat({ color: 0x15111f, roughness: 0.5 }))
  strip.position.set(0, 1.84, 0.14)
  tilt.add(strip)

  let offset = 0
  const topTex = kit.tex(760, 810, dailyArt(() => dayFromNow(offset)))
  const nextTex = kit.tex(760, 810, dailyArt(() => dayFromNow(offset + 1)))
  const SH_W = 1.45, SH_H = 1.55
  const nextMat = kit.paper(nextTex, { side: THREE.DoubleSide })
  const topMat = kit.paper(topTex, { side: THREE.DoubleSide, transparent: true })
  const Z = 0.246
  const below = kit.mesh(kit.plane(SH_W, SH_H), nextMat)
  below.position.set(0, 1.0, Z - 0.004)
  tilt.add(below)
  const pivot = new THREE.Group()
  pivot.position.set(0, 1.0 + SH_H / 2, Z)
  tilt.add(pivot)
  const topSheet = kit.mesh(kit.plane(SH_W, SH_H), topMat)
  topSheet.position.y = -SH_H / 2
  pivot.add(topSheet)

  const T = 6.4
  let swapped = false
  return {
    group: g,
    polar: 1.12,
    update(t) {
      const k = (t % T) / T
      let tear = 0
      if (k > 0.72 && k < 0.9) tear = ease((k - 0.72) / 0.18)
      if (k >= 0.9) {
        if (!swapped) {
          swapped = true
          offset += 1
          ;(topTex.userData.redraw as () => void)()
          ;(nextTex.userData.redraw as () => void)()
        }
      } else if (k < 0.5) swapped = false
      const peel = k >= 0.9 ? 0 : tear
      pivot.rotation.x = -1.45 * peel
      pivot.position.y = 1.0 + SH_H / 2 + 0.5 * peel
      pivot.position.z = Z + 0.45 * peel
      topMat.opacity = 1 - clamp((peel - 0.55) / 0.45)
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Monthly wall calendar
// ─────────────────────────────────────────────────────────────────────────────
function monthlyArt(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), today = now.getDate()
  ctx.fillStyle = '#fffdf6'; ctx.fillRect(0, 0, w, h)
  // art panel: overlapping process-colour discs, multiplied, over a halftone
  const artH = h * 0.4
  ctx.fillStyle = '#fff6ee'; ctx.fillRect(0, 0, w, artH)
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, w, artH); ctx.clip()
  ctx.globalCompositeOperation = 'multiply'
  const discs: [string, number, number, number][] = [[C.cy, 0.34, 0.42, 0.32], [C.mg, 0.55, 0.4, 0.3], [C.ye, 0.45, 0.62, 0.3]]
  for (const [col, x, yy, r] of discs) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(w * x, artH * yy * 1.1, w * r * 0.82, 0, TAU); ctx.fill() }
  ctx.globalCompositeOperation = 'source-over'
  halftone(ctx, w * 0.5, 0, w * 0.5, artH, 'rgba(22,18,30,0.22)', 20, 0.6, 'x')
  ctx.restore()
  pinwheel(ctx, w * 0.84, artH * 0.2, w * 0.075)
  // month title on its own strip beneath the art
  ctx.fillStyle = C.irisDeep; ctx.fillRect(0, artH, w, h * 0.095)
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'
  ctx.font = F.display(w * 0.12, true, 600)
  ctx.fillText(MONTHS[m][0] + MONTHS[m].slice(1).toLowerCase(), w * 0.07, artH + h * 0.07)
  ctx.font = F.mono(w * 0.045, 500)
  ctx.textAlign = 'right'
  ctx.fillText(String(y), w * 0.93, artH + h * 0.066)
  ctx.textAlign = 'left'
  // the month grid
  const gx = w * 0.06, gw = w * 0.88, top = artH + h * 0.14
  const colW = gw / 7
  ctx.font = F.sans(w * 0.034, 800)
  ;['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((d, i) => {
    ctx.fillStyle = i === 0 ? C.vermilion : C.irisDeep
    ctx.textAlign = 'center'
    ctx.fillText(d, gx + colW * (i + 0.5), top + h * 0.02)
  })
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(gx, top + h * 0.035); ctx.lineTo(gx + gw, top + h * 0.035); ctx.stroke()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const rowH = (h - top - h * 0.1) / 6
  for (let dnum = 1; dnum <= days; dnum++) {
    const idx = first + dnum - 1
    const col = idx % 7, row = Math.floor(idx / 7)
    const cx = gx + colW * (col + 0.5), cy = top + h * 0.035 + rowH * (row + 0.62)
    if (dnum === today) { ctx.fillStyle = C.mg; ctx.beginPath(); ctx.arc(cx, cy - w * 0.012, w * 0.05, 0, TAU); ctx.fill() }
    ctx.fillStyle = dnum === today ? '#fff' : col === 0 ? C.vermilion : C.ink
    ctx.font = F.sans(w * 0.046, dnum === today ? 800 : 600)
    ctx.textAlign = 'center'
    ctx.fillText(String(dnum), cx, cy)
  }
  ctx.fillStyle = 'rgba(22,18,30,0.5)'
  ctx.font = F.mono(w * 0.03)
  ctx.textAlign = 'center'
  ctx.fillText(`${BUSINESS.name.toUpperCase()}  ·  ${BUSINESS.phones[0].display}`, w / 2, h * 0.965)
  ctx.textAlign = 'left'
}

export function buildMonthlyCalendar(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const wood = kit.mat({ color: 0x8a5a2e, roughness: 0.5 })
  const metal = kit.mat({ color: 0xd8dbe4, metalness: 1, roughness: 0.28 })
  const TOP = 3.0
  // a small gallows to hang it from
  for (const sx of [-1, 1]) {
    const post = kit.mesh(kit.rbox(0.09, TOP + 0.12, 0.09, 0.02), wood)
    post.position.set(sx * 1.2, (TOP + 0.12) / 2, 0)
    g.add(post)
    const foot = kit.mesh(kit.rbox(0.5, 0.08, 0.9, 0.03), wood)
    foot.position.set(sx * 1.2, 0.04, 0)
    g.add(foot)
  }
  const beam = kit.mesh(kit.rbox(2.6, 0.1, 0.1, 0.02), wood)
  beam.position.set(0, TOP + 0.05, 0)
  g.add(beam)

  const W = 1.7, H = 2.3
  const pivot = new THREE.Group()
  pivot.position.set(0, TOP - 0.02, 0)
  g.add(pivot)
  const hook = kit.mesh(kit.track(new THREE.TorusGeometry(0.07, 0.016, 10, 28)), metal)
  hook.position.y = 0.02
  hook.rotation.y = Math.PI / 2
  pivot.add(hook)
  const tex = kit.tex(850, 1150, monthlyArt)
  const sheet = kit.mesh(kit.rbox(W, H, 0.03, 0.012), [kit.paper(null, { color: 0xeee6d6 }), kit.paper(null, { color: 0xeee6d6 }), kit.paper(null, { color: 0xeee6d6 }), kit.paper(null, { color: 0xeee6d6 }), kit.paper(tex, { roughness: 0.55 }), kit.paper(null, { color: 0xf3ecdd })])
  sheet.position.set(0, -0.16 - H / 2, 0)
  pivot.add(sheet)
  // wire-o binding along the top edge
  const ringGeo = kit.track(new THREE.TorusGeometry(0.055, 0.011, 8, 20))
  const N = 17
  for (let i = 0; i < N; i++) {
    const r = new THREE.Mesh(ringGeo, metal)
    r.rotation.y = Math.PI / 2
    r.position.set(-W / 2 + 0.07 + (i * (W - 0.14)) / (N - 1), -0.16, 0)
    r.castShadow = true
    pivot.add(r)
  }
  return {
    group: g,
    polar: 1.2,
    update(t) {
      pivot.rotation.z = Math.sin(t * 0.9) * 0.05
      pivot.rotation.y = Math.sin(t * 0.5) * 0.08
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Diary
// ─────────────────────────────────────────────────────────────────────────────
export function buildDiary(kit: Kit): ProductModel {
  const g = new THREE.Group()
  const now = new Date()
  const year = String(now.getFullYear() + (now.getMonth() >= 8 ? 1 : 0))
  const a = hardcover(kit, {
    w: 1.3, h: 1.85, t: 0.4, color: 0x2b1d86, bump: 'leather', title: ['Diary', year], tagline: BUSINESS.line1.toUpperCase(),
    spine: `DIARY ${year}`, elastic: 0xec008c, ribbon: 0xffd400, round: 0.05, mark: true,
  })
  a.position.set(-0.45, 0, -0.1)
  a.rotation.y = 0.3
  g.add(a)
  // a pocket diary lying flat in front
  const b = hardcover(kit, {
    w: 0.95, h: 1.35, t: 0.24, color: 0x9a1430, bump: 'leather', title: ['Diary'], spine: 'POCKET', elastic: 0x15111f, round: 0.04,
  })
  const flat = new THREE.Group()
  b.rotation.x = -Math.PI / 2
  b.position.set(0, 0.12, 0.68)
  flat.add(b)
  flat.position.set(0.85, 0, 0.15)
  flat.rotation.y = -0.5
  g.add(flat)
  return { group: g, polar: 1.1 }
}

