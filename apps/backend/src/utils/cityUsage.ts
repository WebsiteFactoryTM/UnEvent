import { Payload } from 'payload'
import { Location, Service, Event } from '@/payload-types'

function toID(val: any): string | undefined {
  if (!val) return undefined
  return typeof val === 'object' ? String(val.id ?? val.value ?? '') : String(val)
}

function isPublic(doc: any) {
  return doc?.status ? doc.status === 'approved' : true
}

export async function syncCityUsage(
  payload: Payload,
  nextDoc: Location | Service | Event,
  prevDoc?: Location | Service | Event,
) {
  const prevCity = toID(prevDoc?.city)
  const nextCity = toID(nextDoc?.city)
  const wasPublic = prevDoc ? isPublic(prevDoc) : false
  const isNowPublic = isPublic(nextDoc)

  const ops: Array<{ id: string; dTotal: number; dPublic: number }> = []

  if (prevCity && prevCity !== nextCity)
    ops.push({ id: prevCity, dTotal: -1, dPublic: wasPublic ? -1 : 0 })
  if (nextCity && prevCity !== nextCity)
    ops.push({ id: nextCity, dTotal: +1, dPublic: isNowPublic ? +1 : 0 })

  if (prevCity === nextCity && nextCity && wasPublic !== isNowPublic) {
    ops.push({ id: nextCity, dTotal: 0, dPublic: isNowPublic ? +1 : -1 })
  }

  for (const { id, dTotal } of ops) {
    try {
      const city = await payload.findByID({ collection: 'cities', id, depth: 0 })
      await payload.update({
        collection: 'cities',
        id,
        data: {
          usageCount: Math.max(0, (city.usageCount ?? 0) + dTotal),
        },
        depth: 0,
      })
    } catch (e) {
      console.error('syncCityUsage error for city', id, e)
    }
  }
}
