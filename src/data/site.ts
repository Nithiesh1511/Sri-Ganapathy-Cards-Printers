// Everything the site says about the business lives here, taken from the printed
// business card. Nothing is invented: no address, hours, prices, years in business
// or customer numbers appear anywhere, because the card does not give them.

export const BUSINESS = {
  name: 'Sri Ganapathy Cards and Printers',
  /** Display name, split so the second line can be set smaller. */
  line1: 'Sri Ganapathy',
  line2: 'Cards & Printers',
  phones: [
    { display: '93644 22577', tel: '+919364422577' },
    { display: '90036 84725', tel: '+919003684725' },
  ],
  // As printed on the card (the card prints it without spaces).
  email: 'sriganapathycardsandprinters@gmail.com',
  instagram: {
    handle: 'sri_ganapathy_cards_printers',
    url: 'https://www.instagram.com/sri_ganapathy_cards_printers/',
  },
} as const

/**
 * The number enquiries are sent to on WhatsApp: country code + number, digits only.
 * ⚠ Confirm with the owner that this number is on WhatsApp before going live —
 * change it here and every WhatsApp button on the site follows.
 */
export const WHATSAPP_NUMBER = '919364422577'

/** The three promises printed across the middle of the card. */
export const PROMISES = [
  'We handle all your school printing needs',
  'Invitations with professional printing for all occasions',
  'Complete range of business printing, from visiting cards to more',
] as const

/** The card's four columns of services, in the card's own order. */
export const SERVICE_GROUPS = [
  { name: 'Business Printing', items: ['Visiting Cards', 'Letterheads', 'Bill Books', 'Stamps', 'ID Cards'] },
  { name: 'Professional Printing', items: ['Invitation Printing', 'Offset Printing', 'Screen Printing', 'Flex Printing'] },
  { name: 'Finishing and Binding', items: ['Paper and Charts', 'Book Binding', 'Rexin Binding', 'Chart Binding', 'Spiral Binding'] },
  { name: 'Calendars and Diaries', items: ['Daily Calendars', 'Monthly Calendars', 'Diary Printing'] },
] as const

/** Every individual service on the card, for the enquiry form's dropdown. */
export const ALL_SERVICE_NAMES: string[] = SERVICE_GROUPS.flatMap((g) => [...g.items])
