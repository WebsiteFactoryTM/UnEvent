export const listingTypes = ["locatii", "servicii", "evenimente"] as const;

export type ListingType = (typeof listingTypes)[number];

export const cities = [
  { slug: "bucuresti", label: "București" },
  { slug: "cluj-napoca", label: "Cluj-Napoca" },
  { slug: "timisoara", label: "Timișoara" },
  { slug: "iasi", label: "Iași" },
  { slug: "brasov", label: "Brașov" },
  { slug: "constanta", label: "Constanța" },
] as const;

export const locationTypes = [
  { slug: "nunta", label: "Nuntă" },
  { slug: "botez", label: "Botez" },
  { slug: "conferinta", label: "Conferință" },
  { slug: "petrecere", label: "Petrecere" },
  { slug: "corporate", label: "Corporate" },
] as const;

export const serviceTypes = [
  { slug: "catering", label: "Catering" },
  { slug: "fotografie", label: "Fotografie" },
  { slug: "muzica", label: "Muzică" },
  { slug: "decoratiuni", label: "Decorațiuni" },
  { slug: "video", label: "Video" },
] as const;

export const eventTypes = [
  { slug: "targ", label: "Târg" },
  { slug: "festival", label: "Festival" },
  { slug: "concert", label: "Concert" },
  { slug: "workshop", label: "Workshop" },
  { slug: "gala", label: "Gală" },
] as const;

export function labelFrom(
  list: { slug: string; label: string }[],
  slug: string,
): string {
  return list.find((x) => x.slug === slug)?.label ?? slug;
}

// Helper to get label from slug
export function getCityLabel(slug: string): string {
  return cities.find((c) => c.slug === slug)?.label || slug;
}

export function getTypeLabel(listingType: string, typeSlug: string): string {
  if (listingType === "locatii") {
    return locationTypes.find((t) => t.slug === typeSlug)?.label || typeSlug;
  }
  if (listingType === "servicii") {
    return serviceTypes.find((t) => t.slug === typeSlug)?.label || typeSlug;
  }
  if (listingType === "evenimente") {
    return eventTypes.find((t) => t.slug === typeSlug)?.label || typeSlug;
  }
  return typeSlug;
}

export function getListingTypeLabel(slug: string): string {
  const labels: Record<string, string> = {
    locatii: "Locații",
    servicii: "Servicii",
    evenimente: "Evenimente",
  };
  return labels[slug] || slug;
}

export function getTypesByListingType(listingType: string) {
  if (listingType === "locatii") return locationTypes;
  if (listingType === "servicii") return serviceTypes;
  if (listingType === "evenimente") return eventTypes;
  return locationTypes; // fallback
}
