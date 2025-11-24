// This hook is now replaced by the centralized afterChange hook
// which handles moderationStatus changes properly
// Keeping this file for backward compatibility but it delegates to the centralized hook
import { CollectionAfterChangeHook } from 'payload'
import { Location, Service, Event } from '@/payload-types'
import { afterChange } from '@/hooks/afterChange'

export const revalidateListing: CollectionAfterChangeHook<Location | Service | Event> = async (
  args,
) => {
  // Delegate to centralized hook which handles moderationStatus logic
  await afterChange(args)
  return args.doc
}
