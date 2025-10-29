import type { ListingType, ListingViewModel } from "./ListingTypes";

export function normalizeToViewModel(
  type: ListingType,
  raw: any,
): ListingViewModel {
  switch (type) {
    case "evenimente":
      return normalizeEvent(raw);
    case "locatii":
      return normalizeLocation(raw);
    case "servicii":
      return normalizeService(raw);
    default:
      // Fallback minimal model
      return {
        type,
        slug: raw?.slug ?? "",
        title: raw?.title ?? "",
        description: raw?.description,
        cityName: typeof raw?.city === "object" ? raw.city?.name : undefined,
        featuredImageUrl: raw?.featuredImage?.url,
        galleryUrls: Array.isArray(raw?.gallery)
          ? raw.gallery
              .map((g: any) => (typeof g === "object" ? g?.url : undefined))
              .filter(Boolean)
          : undefined,
        youtubeLinks: raw?.youtubeLinks,
        latitude: Array.isArray(raw?.geo) ? raw.geo[0] : undefined,
        longitude: Array.isArray(raw?.geo) ? raw.geo[1] : undefined,
        rating: raw?.rating,
        reviewCount: raw?.reviewCount,
        priceAmount: raw?.pricing?.amount,
        priceCurrency: raw?.pricing?.currency,
        raw,
      };
  }
}

function normalizeEvent(event: any): ListingViewModel {
  const cityName =
    typeof event?.city === "object" && event?.city
      ? event.city.name
      : undefined;
  const galleryUrls = Array.isArray(event?.gallery)
    ? event.gallery
        .map((img: any) => (typeof img === "object" ? img.url : undefined))
        .filter(Boolean)
    : undefined;

  return {
    type: "evenimente",
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    description: event?.description,
    cityName,
    featuredImageUrl: event?.featuredImage?.url,
    galleryUrls,
    youtubeLinks: event?.youtubeLinks,
    latitude: undefined,
    longitude: undefined,
    rating: event?.rating,
    reviewCount: event?.reviewCount,
    priceAmount: event?.pricing?.amount,
    priceCurrency: event?.pricing?.currency,
    raw: event,
  };
}

function normalizeLocation(location: any): ListingViewModel {
  const cityName =
    typeof location?.city === "object" ? location.city.name : undefined;
  const galleryUrls = Array.isArray(location?.gallery)
    ? location.gallery
        .map((img: any) => (typeof img === "object" ? img.url : undefined))
        .filter(Boolean)
    : undefined;

  const lat = Array.isArray(location?.geo) ? location.geo[0] : undefined;
  const lng = Array.isArray(location?.geo) ? location.geo[1] : undefined;

  return {
    type: "locatii",
    slug: location?.slug ?? "",
    title: location?.title ?? "",
    description: location?.description,
    cityName,
    featuredImageUrl: location?.featuredImage?.url,
    galleryUrls,
    youtubeLinks: location?.youtubeLinks,
    latitude: lat,
    longitude: lng,
    rating: location?.rating,
    reviewCount: location?.reviewCount,
    raw: location,
  };
}

function normalizeService(service: any): ListingViewModel {
  const cityName =
    typeof service?.city === "object" && service?.city
      ? service.city.name
      : undefined;
  const galleryUrls = Array.isArray(service?.gallery)
    ? service.gallery
        .map((img: any) => (typeof img === "object" ? img.url : undefined))
        .filter(Boolean)
    : undefined;

  return {
    type: "servicii",
    slug: service?.slug ?? "",
    title: service?.title ?? "",
    description: service?.description,
    cityName,
    featuredImageUrl: service?.featuredImage?.url,
    galleryUrls,
    youtubeLinks: service?.youtubeLinks,
    rating: service?.rating,
    reviewCount: service?.reviewCount,
    priceAmount: service?.pricing?.amount,
    priceCurrency: service?.pricing?.currency,
    raw: service,
  };
}
