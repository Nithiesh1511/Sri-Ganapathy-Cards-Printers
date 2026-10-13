// Sections that don't know about each other talk through one window event: anything
// can ask the contact form to fill itself in and scroll into view.

export interface EnquiryPrefill {
  /** Must match one of the form's service options. */
  service?: string
  requirements?: string
  message?: string
}

const EVENT = 'enquiry:prefill'

export function prefillEnquiry(detail: EnquiryPrefill) {
  window.dispatchEvent(new CustomEvent<EnquiryPrefill>(EVENT, { detail }))
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
}

export function onEnquiryPrefill(fn: (d: EnquiryPrefill) => void): () => void {
  const h = (e: Event) => fn((e as CustomEvent<EnquiryPrefill>).detail)
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}
