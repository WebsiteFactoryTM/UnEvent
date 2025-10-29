import type { ListingType } from "./ListingTypes";

export function buildJsonLd(type: ListingType, data: any) {
  if (type === "evenimente") return buildEventJsonLd(data);
  if (type === "locatii") return buildLocationJsonLd(data);
  return buildServiceJsonLd(data);
}

export function buildEventJsonLd(event: any) {
  const cityName =
    typeof event?.city === "object" && event?.city
      ? event.city.name
      : "România";
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event?.title,
    description: event?.description,
    startDate: event?.startDate,
    endDate: event?.endDate,
    eventStatus:
      event?.eventStatus === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventCancelled",
    location: {
      "@type": "Place",
      name:
        event?.venue && typeof event?.venue === "object"
          ? event.venue.title
          : cityName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event?.address,
        addressLocality: cityName,
        addressCountry: "RO",
      },
    },
    offers: {
      "@type": "Offer",
      price: event?.pricing?.amount || 0,
      priceCurrency: event?.pricing?.currency || "RON",
      availability: event?.capacity?.remaining
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
    ...(event?.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: event?.rating,
        reviewCount: event?.reviewCount || 0,
      },
    }),
  };
}

export function buildLocationJsonLd(location: any) {
  const cityName =
    typeof location?.city === "object" ? location.city.name : "România";
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: location?.title,
    description: location?.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: location?.address,
      addressLocality: cityName,
      addressCountry: "RO",
    },
    ...(location?.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: Array.isArray(location?.geo) ? location.geo[0] : undefined,
        longitude: Array.isArray(location?.geo) ? location.geo[1] : undefined,
      },
    }),
    ...(location?.rating &&
      location?.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: location?.rating,
          reviewCount: location?.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(location?.contact?.phone && { telephone: location.contact.phone }),
    ...(location?.contact?.website && { url: location.contact.website }),
  };
}

export function buildServiceJsonLd(service: any) {
  const cityName =
    typeof service?.city === "object" && service?.city
      ? service.city.name
      : "România";
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service?.title,
    description: service?.description,
    provider: {
      "@type": "LocalBusiness",
      name: typeof service?.owner === "object" ? service.owner.name : "",
      telephone: service?.contact?.phone,
      email: service?.contact?.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressCountry: "RO",
      },
    },
    ...(service?.rating &&
      service?.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: service?.rating,
          reviewCount: service?.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(service?.pricing?.amount && {
      offers: {
        "@type": "Offer",
        price: service?.pricing?.amount,
        priceCurrency: service?.pricing?.currency || "RON",
      },
    }),
  };
}
