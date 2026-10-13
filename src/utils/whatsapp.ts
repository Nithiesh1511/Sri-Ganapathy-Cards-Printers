import { BUSINESS, WHATSAPP_NUMBER } from '@/data/site'

/** A wa.me link that opens WhatsApp with `message` typed in, ready to send. */
export function whatsappUrl(message: string, number: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

/** The opening line every enquiry shares. */
const greeting = `Hello ${BUSINESS.name},`

/** "I would like to enquire about Visiting Card Printing. Please share the available options." */
export function serviceMessage(service: string): string {
  return `${greeting} I would like to enquire about ${service}. Please share the available options.`
}

/** A message built from labelled lines, skipping empty ones. */
export function detailedMessage(intro: string, fields: [label: string, value: string | undefined][]): string {
  const lines = fields.filter(([, v]) => v && v.trim()).map(([k, v]) => `${k}: ${v!.trim()}`)
  return [`${greeting} ${intro}`, '', ...lines].join('\n')
}

/**
 * Opens a link in a new tab. Returns false if the browser blocked the popup, so the
 * caller can show a plain link instead of pretending it worked.
 */
export function openExternal(url: string): boolean {
  // Not passing `noopener` (that makes window.open always return null, hiding a
  // block); the opener link is cut by hand instead.
  try {
    const w = window.open(url, '_blank')
    if (!w) return false
    w.opener = null
    return true
  } catch {
    return false
  }
}

export function mailtoUrl(subject: string, body: string): string {
  return `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
