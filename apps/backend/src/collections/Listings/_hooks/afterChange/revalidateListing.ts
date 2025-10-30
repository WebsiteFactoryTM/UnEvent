import { revalidate } from '@/utils/revalidate'
import { CollectionAfterChangeHook } from 'payload'
import { Location, Service, Event } from '@/payload-types'
export const revalidateListing: CollectionAfterChangeHook<Location | Service | Event> = async ({
  doc,
  req,
  collection,
}) => {
  const { payload } = req

  if (doc.status === 'approved') {
    revalidate({ payload, collection: collection.slug as string, slug: doc.slug as string })
  }

  return doc
}
