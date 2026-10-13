// Everything the site says about the business lives here, taken from the printed
// business card. Nothing is invented: no address, hours, prices or years in
// business appear anywhere, because the card does not give them.

export const BUSINESS = {
  name: 'Sri Ganapathy Cards and Printers',
  /** Display name, split so the second line can be set smaller. */
  line1: 'Sri Ganapathy',
  line2: 'Cards & Printers',
  phones: [
    { display: '93644 22577', tel: '+919364422577' },
    { display: '90036 84725', tel: '+919003684725' },
  ],
  email: 'sriganapathycardsandprinters@gmail.com',
  instagram: {
    handle: 'sri_ganapathy_cards_printers',
    url: 'https://www.instagram.com/sri_ganapathy_cards_printers/',
  },
} as const

/** The three promises printed across the middle of the card. */
export const PROMISES = [
  'We handle all your school printing needs',
  'Invitations with professional printing for all occasions',
  'Complete range of business printing, from visiting cards to more',
] as const

export type ServiceId =
  | 'visiting-card' | 'letterhead' | 'bill-book' | 'stamp' | 'id-card'
  | 'invitation' | 'offset' | 'screen' | 'flex'
  | 'paper-charts' | 'book-binding' | 'rexin-binding' | 'chart-binding' | 'spiral-binding'
  | 'daily-calendar' | 'monthly-calendar' | 'diary'

export interface Service {
  id: ServiceId
  name: string
  /** One line, shown beside the 3D model. */
  blurb: string
  /** Accent used for the model's turntable ring and its list marker. */
  accent: 'cy' | 'mg' | 'ye' | 'key'
}

export interface ServiceGroup {
  id: 'stationery' | 'print' | 'binding' | 'calendars'
  name: string
  caption: string
  items: Service[]
}

// The four columns of the card, in the card's own order.
export const GROUPS: ServiceGroup[] = [
  {
    id: 'stationery',
    name: 'Cards & Stationery',
    caption: 'Everyday business paper',
    items: [
      { id: 'visiting-card', name: 'Visiting Card', blurb: 'The smallest piece of your brand, printed to be remembered.', accent: 'mg' },
      { id: 'letterhead', name: 'Letterhead', blurb: 'Official paper that looks the part.', accent: 'cy' },
      { id: 'bill-book', name: 'Bill Book', blurb: 'Neat, numbered bills for everyday business.', accent: 'ye' },
      { id: 'stamp', name: 'Stamp', blurb: 'Your name, seal or signature — pressed in one clean stroke.', accent: 'key' },
      { id: 'id-card', name: 'ID Card', blurb: 'Photo ID cards for schools, offices and events.', accent: 'cy' },
    ],
  },
  {
    id: 'print',
    name: 'Print Services',
    caption: 'Every process, every surface',
    items: [
      { id: 'invitation', name: 'Invitation Printing', blurb: 'Invitations printed with the care your occasion deserves.', accent: 'mg' },
      { id: 'offset', name: 'Offset Printing', blurb: 'Big runs, sharp colour, an even finish.', accent: 'cy' },
      { id: 'screen', name: 'Screen Printing', blurb: 'Bold, durable ink pulled through a mesh screen.', accent: 'ye' },
      { id: 'flex', name: 'Flex Printing', blurb: 'Banners and boards that get noticed from the road.', accent: 'mg' },
    ],
  },
  {
    id: 'binding',
    name: 'Paper & Binding',
    caption: 'Sheets, charts and covers',
    items: [
      { id: 'paper-charts', name: 'Paper & Charts', blurb: 'Chart papers and sheets for classrooms and presentations.', accent: 'ye' },
      { id: 'book-binding', name: 'Book Binding', blurb: 'Loose pages, bound into something that lasts.', accent: 'cy' },
      { id: 'rexin-binding', name: 'Rexin Binding', blurb: 'Soft-touch rexin covers for a rich, finished look.', accent: 'mg' },
      { id: 'chart-binding', name: 'Chart Binding', blurb: 'Charts bound so they hang, flip and stay in order.', accent: 'key' },
      { id: 'spiral-binding', name: 'Spiral Binding', blurb: 'Spiral-bound, so every page lies flat.', accent: 'cy' },
    ],
  },
  {
    id: 'calendars',
    name: 'Calendars & Diaries',
    caption: 'Your name, all year round',
    items: [
      { id: 'daily-calendar', name: 'Daily Calendar', blurb: 'A fresh page every morning, with your name on it.', accent: 'mg' },
      { id: 'monthly-calendar', name: 'Monthly Calendar', blurb: 'A whole year on the wall, branded to you.', accent: 'ye' },
      { id: 'diary', name: 'Diary Printing', blurb: 'Custom diaries for staff, students and clients.', accent: 'cy' },
    ],
  },
]

export const ALL_SERVICES: Service[] = GROUPS.flatMap((g) => g.items)

export function serviceById(id: ServiceId): Service {
  return ALL_SERVICES.find((s) => s.id === id)!
}

export function groupOf(id: ServiceId): ServiceGroup {
  return GROUPS.find((g) => g.items.some((s) => s.id === id))!
}

export const ACCENT_HEX: Record<Service['accent'], string> = {
  cy: '#00AEEF',
  mg: '#EC008C',
  ye: '#FFD400',
  key: '#16121E',
}
