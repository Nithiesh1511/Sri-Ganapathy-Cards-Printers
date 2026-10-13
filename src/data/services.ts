// The product gallery: the card's services, gathered into eight showcase pieces.
// Descriptions say what the service is — never prices, turnaround times, machinery
// or finishes the business hasn't confirmed.

export type GalleryId =
  | 'visiting-cards'
  | 'invitations'
  | 'letterheads'
  | 'id-stamps'
  | 'offset-screen-flex'
  | 'binding'
  | 'paper-charts'
  | 'calendars-diaries'

export interface GalleryItem {
  id: GalleryId
  no: string
  name: string
  /** Shown on the card. */
  short: string
  /** Shown in the detail dialog. */
  long: string
  /** The card's own service names this piece covers (used in enquiries). */
  includes: string[]
  /** What hovering does, said in words for the affordance hint. */
  hint: string
  /** Layout weight in the asymmetric grid. */
  size: 'wide' | 'tall' | 'std'
}

export const GALLERY: GalleryItem[] = [
  {
    id: 'visiting-cards',
    no: '01',
    name: 'Visiting Cards',
    short: 'The smallest piece of your brand — printed to be kept, not thrown away.',
    long: 'Visiting cards for shops, offices and professionals. Share your name, logo and details and we will help you plan the layout, paper and finish for your card.',
    includes: ['Visiting Cards'],
    hint: 'Hover to fan the stack',
    size: 'wide',
  },
  {
    id: 'invitations',
    no: '02',
    name: 'Invitation Printing',
    short: 'Invitations with professional printing for all occasions.',
    long: 'Weddings, housewarmings, naming ceremonies, school and family functions — invitations printed with care, so the first thing your guests hold feels like the occasion itself.',
    includes: ['Invitation Printing'],
    hint: 'Hover to open the invitation',
    size: 'tall',
  },
  {
    id: 'letterheads',
    no: '03',
    name: 'Letterheads & Bill Books',
    short: 'Official stationery and neat bill books for everyday business.',
    long: 'Letterheads that make every letter look official, and bill books for your counter. Tell us your business details and the format you need.',
    includes: ['Letterheads', 'Bill Books'],
    hint: 'Hover to lift the pages',
    size: 'std',
  },
  {
    id: 'id-stamps',
    no: '04',
    name: 'ID Cards & Stamps',
    short: 'Photo ID cards and custom rubber stamps for schools, offices and shops.',
    long: 'ID cards for students, staff and events, and stamps with your name, seal or address — so your paperwork carries your mark.',
    includes: ['ID Cards', 'Stamps'],
    hint: 'Hover to press the stamp',
    size: 'std',
  },
  {
    id: 'offset-screen-flex',
    no: '05',
    name: 'Offset, Screen & Flex Printing',
    short: 'Three printing processes — from paper runs to bold banners.',
    long: 'Offset printing for paper jobs, screen printing for bold, solid ink, and flex printing for banners and boards. Tell us what you are printing and we will suggest the right process.',
    includes: ['Offset Printing', 'Screen Printing', 'Flex Printing'],
    hint: 'Hover to align the colour layers',
    size: 'wide',
  },
  {
    id: 'binding',
    no: '06',
    name: 'Book, Rexin, Chart & Spiral Binding',
    short: 'Loose pages, bound into something that lasts.',
    long: 'Book binding, rexin binding, chart binding and spiral binding — for records, projects, reports and notebooks that need to stay together and look finished.',
    includes: ['Book Binding', 'Rexin Binding', 'Chart Binding', 'Spiral Binding'],
    hint: 'Hover to open the notebook',
    size: 'tall',
  },
  {
    id: 'paper-charts',
    no: '07',
    name: 'Paper & Charts',
    short: 'Paper and chart stock for classrooms, projects and presentations.',
    long: 'Paper and charts for school projects, classrooms and presentations. Ask us for what you need.',
    includes: ['Paper and Charts'],
    hint: 'Hover to fan the sheets',
    size: 'std',
  },
  {
    id: 'calendars-diaries',
    no: '08',
    name: 'Calendars & Diaries',
    short: 'Daily and monthly calendars and printed diaries — your name, all year.',
    long: 'Daily calendars, monthly calendars and diary printing for businesses, schools and organisations — a useful gift that keeps your name in view every day of the year.',
    includes: ['Daily Calendars', 'Monthly Calendars', 'Diary Printing'],
    hint: 'Hover to turn the pages',
    size: 'std',
  },
]

export const galleryById = (id: GalleryId) => GALLERY.find((g) => g.id === id)!
