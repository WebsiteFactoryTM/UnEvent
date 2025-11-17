import {
  UnifiedListingFormData,
  LocationFormData,
  ServiceFormData,
  EventFormData,
} from "@/forms/listing/schema";
import {
  Location,
  Event,
  Service,
  City,
  ListingType,
  Facility,
} from "@/types/payload-types";

/**
 * Clean payload to remove null values from array fields
 * Payload Drizzle adapter doesn't handle null for array fields - they must be arrays or omitted
 */
function cleanPayload(payload: any): any {
  if (payload === null || payload === undefined) {
    return undefined;
  }

  if (Array.isArray(payload)) {
    // Keep empty arrays - they're valid
    return payload;
  }

  if (typeof payload === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(payload)) {
      // Remove null values for known array fields (schedule, youtubeLinks, gallery, etc.)
      // These should be undefined (omitted) or an array, never null
      if (
        value === null &&
        (key === "schedule" ||
          key === "youtubeLinks" ||
          key === "gallery" ||
          key === "features" ||
          key === "requirements")
      ) {
        continue; // Omit null array fields
      }
      const cleanedValue = cleanPayload(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  return payload;
}

/**
 * Transform form data to Payload API format
 * Ensures proper types and structure for API submission
 */
export function formToPayload(
  formData: UnifiedListingFormData,
): Partial<Location | Event | Service> {
  // Base payload fields common to all listing types
  const basePayload = {
    title: formData.title,
    description: formData.description || null,
    city: formData.city,
    address: formData.address || null,
    geo:
      formData.geo?.lat && formData.geo?.lon
        ? ([formData.geo.lat, formData.geo.lon] as [number, number])
        : null,
    contact: {
      email: formData.contact.email,
      phone: formData.contact.phones[0]?.number || null,
      website: formData.contact.website || null,
    },
    socialLinks: {
      facebook: formData.socialLinks.facebook || null,
      instagram: formData.socialLinks.instagram || null,
      x: formData.socialLinks.x || null,
      linkedin: formData.socialLinks.linkedin || null,
      youtube: formData.socialLinks.youtube || null,
      tiktok: formData.socialLinks.tiktok || null,
    },
    youtubeLinks:
      formData.youtubeLinks && formData.youtubeLinks.length > 0
        ? formData.youtubeLinks.map((link) => ({
            youtubeLink: link.url,
          }))
        : undefined,
    moderationStatus: formData.moderationStatus,
    _status: formData._status,
    // Images will be handled separately if needed
    featuredImage: formData.featuredImage,
    gallery:
      formData.gallery && formData.gallery.length > 0
        ? formData.gallery
        : undefined,
  };

  // Location-specific transformation
  if (formData.listingType === "location") {
    const locationData = formData as LocationFormData;
    const locationPayload = {
      ...basePayload,
      type: locationData.type ?? [],
      suitableFor: locationData.suitableFor ?? [],
      capacity:
        locationData.capacity &&
        (locationData.capacity.indoor ||
          locationData.capacity.outdoor ||
          locationData.capacity.seating ||
          locationData.capacity.parking)
          ? {
              indoor: locationData.capacity.indoor || null,
              outdoor: locationData.capacity.outdoor || null,
              seating: locationData.capacity.seating || null,
              parking: locationData.capacity.parking || null,
            }
          : undefined,
      surface: locationData.surface || undefined,
      facilities: locationData.facilities ?? [],
      pricing: {
        type: locationData.pricing.type || "contact",
        amount: locationData.pricing.enabled
          ? locationData.pricing.amount || null
          : null,
        currency: locationData.pricing.enabled
          ? locationData.pricing.currency || null
          : null,
        period: locationData.pricing.period || null,
      },
      availability: {
        type: "always" as const,
        // schedule is an array field - omit it entirely, don't set to null
      },
    } as Partial<Location>;

    return cleanPayload(locationPayload) as Partial<Location>;
  }

  // Service-specific transformation
  if (formData.listingType === "service") {
    const serviceData = formData as ServiceFormData;
    const servicePayload = {
      ...basePayload,
      type: serviceData.type ?? [],
      suitableFor: serviceData.suitableFor ?? [],
      pricing: {
        type: serviceData.pricing.type || "contact",
        amount: serviceData.pricing.enabled
          ? serviceData.pricing.amount || null
          : null,
        currency: serviceData.pricing.enabled
          ? serviceData.pricing.currency || null
          : null,
        period: serviceData.pricing.period || null,
      },
      features:
        serviceData.features && serviceData.features.length > 0
          ? serviceData.features.map((f) => ({
              feature: f.feature,
              description: f.description || null,
            }))
          : undefined,
      availability: {
        type: "always" as const,
        // schedule is an array field - omit it entirely, don't set to null
      },
    } as Partial<Service>;

    return cleanPayload(servicePayload) as Partial<Service>;
  }

  // Event-specific transformation
  if (formData.listingType === "event") {
    const eventData = formData as EventFormData;
    const eventPayload = {
      ...basePayload,
      type: eventData.type ?? [],
      pricing: {
        type: eventData.pricing.type || "free",
        amount: eventData.pricing.enabled
          ? eventData.pricing.amount || null
          : null,
        currency: eventData.pricing.enabled
          ? eventData.pricing.currency || null
          : null,
      },
      allDayEvent: eventData.allDayEvent,
      startDate: eventData.startDate,
      endDate: eventData.endDate || null,
      capacity: eventData.capacity
        ? {
            total: eventData.capacity.total || null,
            remaining: eventData.capacity.remaining || null,
          }
        : undefined,
      eventStatus: "upcoming" as const,
    } as Partial<Event>;

    return cleanPayload(eventPayload) as Partial<Event>;
  }

  return cleanPayload(basePayload) as Partial<Location | Event | Service>;
}

/**
 * Transform Payload API response to form data
 * Handles relationship expansion and ID extraction
 */
export function payloadToForm(
  listing: Location | Event | Service,
  listingType: "location" | "service" | "event",
): Partial<UnifiedListingFormData> {
  // Helper to extract ID from relationship field
  const extractId = (field: any): number => {
    if (typeof field === "number") return field;
    if (field && typeof field === "object" && "id" in field) return field.id;
    return 0;
  };

  // Helper to extract array of IDs
  const extractIds = (field: any[]): number[] => {
    if (!field || !Array.isArray(field)) return [];
    return field.map(extractId).filter((id) => id > 0);
  };

  // Base form data common to all types
  const baseForm = {
    title: listing.title,
    description: listing.description || "",
    city: extractId(listing.city),
    address: listing.address || "",
    geo: listing.geo
      ? {
          lat: listing.geo[0],
          lon: listing.geo[1],
          manualPin: false,
        }
      : {
          lat: 45.7489,
          lon: 21.2087,
          manualPin: false,
        },
    contact: {
      phones: listing.contact?.phone
        ? [{ number: listing.contact.phone }]
        : [{ number: "" }],
      email: listing.contact?.email || "",
      website: listing.contact?.website || "",
    },
    socialLinks: {
      facebook: listing.socialLinks?.facebook || "",
      instagram: listing.socialLinks?.instagram || "",
      x: listing.socialLinks?.x || "",
      linkedin: listing.socialLinks?.linkedin || "",
      youtube: listing.socialLinks?.youtube || "",
      tiktok: listing.socialLinks?.tiktok || "",
    },
    youtubeLinks:
      listing.youtubeLinks?.map((link) => ({
        url: link.youtubeLink || "",
      })) || [],
    featuredImage: listing.featuredImage,
    gallery: listing.gallery || undefined,
    moderationStatus: listing.moderationStatus || "pending",
  };

  // Location-specific transformation
  if (listingType === "location") {
    const locationData = listing as Location;
    return {
      ...baseForm,
      listingType: "location" as const,
      type: extractIds(locationData.type),
      suitableFor: extractIds(locationData.suitableFor),
      capacity: {
        indoor: locationData.capacity?.indoor || undefined,
        outdoor: locationData.capacity?.outdoor || undefined,
        seating: locationData.capacity?.seating || undefined,
        parking: locationData.capacity?.parking || undefined,
      },
      surface: locationData.surface || undefined,
      facilities: extractIds(locationData.facilities || []),
      pricing: {
        enabled: locationData.pricing.type !== "contact",
        type: locationData.pricing.type,
        amount: locationData.pricing.amount || undefined,
        currency: locationData.pricing.currency || "RON",
        period: locationData.pricing.period || "event",
      },
    } as Partial<LocationFormData>;
  }

  // Service-specific transformation
  if (listingType === "service") {
    const serviceData = listing as Service;
    return {
      ...baseForm,
      listingType: "service" as const,
      type: extractIds(serviceData.type),
      suitableFor: extractIds(serviceData.suitableFor),
      pricing: {
        enabled: serviceData.pricing.type !== "contact",
        type: serviceData.pricing.type,
        amount: serviceData.pricing.amount || undefined,
        currency: serviceData.pricing.currency || "RON",
        period: serviceData.pricing.period || "event",
      },
      features:
        serviceData.features?.map((f) => ({
          feature: f.feature,
          description: f.description || "",
        })) || [],
    } as Partial<ServiceFormData>;
  }

  // Event-specific transformation
  if (listingType === "event") {
    const eventData = listing as Event;
    return {
      ...baseForm,
      listingType: "event" as const,
      type: extractIds(eventData.type),
      pricing: {
        enabled: eventData.pricing.type !== "free",
        type: eventData.pricing.type,
        amount: eventData.pricing.amount || undefined,
        currency: eventData.pricing.currency || "RON",
      },
      allDayEvent: eventData.allDayEvent || false,
      startDate: eventData.startDate,
      startTime: "",
      endDate: eventData.endDate || "",
      endTime: "",
      capacity: {
        total: eventData.capacity?.total || undefined,
        remaining: eventData.capacity?.remaining || undefined,
      },
    } as Partial<EventFormData>;
  }

  return baseForm;
}
