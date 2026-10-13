import type { ServiceId } from '@/data/site'

// Small cross-section "verbs". Sections that don't know about each other talk through
// window events, so the showroom, promises and contact form stay decoupled.

/** Point the 3D showroom at a product and scroll to it. */
export function openInShowroom(id: ServiceId) {
  window.dispatchEvent(new CustomEvent('showroom:select', { detail: id }))
  document.getElementById('showroom')?.scrollIntoView({ behavior: 'smooth' })
}

/** Scroll to the enquiry form with a product (and optionally a note) already filled in. */
export function openContact(opts: { service?: ServiceId; note?: string } = {}) {
  if (opts.service) window.dispatchEvent(new CustomEvent('contact:prefill', { detail: opts.service }))
  if (opts.note) window.dispatchEvent(new CustomEvent('contact:note', { detail: opts.note }))
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}
