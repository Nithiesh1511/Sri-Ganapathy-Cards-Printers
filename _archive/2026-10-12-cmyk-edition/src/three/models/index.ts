import type * as THREE from 'three'
import type { ServiceId } from '@/data/site'
import { Kit, type ProductModel } from './kit'
import { buildVisitingCard, buildLetterhead, buildBillBook, buildStamp, buildIdCard } from './stationery'
import { buildInvitation, buildOffset, buildScreen, buildFlex } from './print'
import { buildPaperCharts, buildBookBinding, buildRexinBinding, buildChartBinding, buildSpiralBinding } from './binding'
import { buildDailyCalendar, buildMonthlyCalendar, buildDiary } from './calendars'

type Builder = (kit: Kit) => ProductModel

/** One builder per service on the card. */
export const BUILDERS: Record<ServiceId, Builder> = {
  'visiting-card': buildVisitingCard,
  letterhead: buildLetterhead,
  'bill-book': buildBillBook,
  stamp: buildStamp,
  'id-card': buildIdCard,
  invitation: buildInvitation,
  offset: buildOffset,
  screen: buildScreen,
  flex: buildFlex,
  'paper-charts': buildPaperCharts,
  'book-binding': buildBookBinding,
  'rexin-binding': buildRexinBinding,
  'chart-binding': buildChartBinding,
  'spiral-binding': buildSpiralBinding,
  'daily-calendar': buildDailyCalendar,
  'monthly-calendar': buildMonthlyCalendar,
  diary: buildDiary,
}

export interface BuiltModel {
  model: ProductModel
  kit: Kit
}

export function buildModel(id: ServiceId, renderer: THREE.WebGLRenderer): BuiltModel {
  const kit = new Kit(renderer)
  const build = BUILDERS[id]
  return { model: build(kit), kit }
}
