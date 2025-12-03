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
    events: 'evenimente-mele',
    locations: 'locatii-mele',
    services: 'servicii-mele',
  }
  return collectionToPageSlug[collection]
}
