export function collectionToPageSlug(collection: string) {
  const collectionToPageSlug: Record<string, string> = {
    events: 'evenimente',
    locations: 'locatii',
    services: 'servicii',
  }
  return collectionToPageSlug[collection]
}

export function collectionToAccountPageSlug(collection: string) {
  const collectionToPageSlug: Record<string, string> = {
    events: 'evenimentele-mele',
    locations: 'locatiile-mele',
    services: 'serviciile-mele',
  }
  return collectionToPageSlug[collection]
}
