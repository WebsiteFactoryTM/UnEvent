import { EventFormData } from "@/forms/event/schema";
import { LocationFormData } from "@/forms/location/schema";
import { ServiceFormData } from "@/forms/service/schema";
import { ListingType } from "@/types/listings";
import { Event, Location, Service } from "@/types/payload-types";
import {
  normalizeListing,
  normalizeListings,
} from "@/lib/transforms/normalizeListing";

type ListingCollectionSlug = "locations" | "events" | "services";

export const getUserListing = async (
  listingType: ListingCollectionSlug,
  listingId: number,
  accessToken?: string,
  profileId?: number,
) => {
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  if (!listingId) {
    throw new Error("Listing ID is required");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}/${listingId}?depth=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to get user listing");
    }
    const data = await response.json();

    return normalizeListing(data);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user listing");
  }
};

export const getUserListings = async (
  listingType: ListingCollectionSlug,
  accessToken?: string,
  profileId?: number,
) => {
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[owner][equals]=${profileId}&depth=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.message ||
        data.errors?.[0]?.message ||
        "Failed to get user listings";
      throw new Error(errorMessage);
    }

    return normalizeListings(data.docs || []);
  } catch (error) {
    console.error("Error getting user listings:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to get user listings");
  }
};

export async function createListing(
  listingType: ListingCollectionSlug,
  data: LocationFormData | EventFormData | ServiceFormData,
  accessToken?: string,
  profileId?: number,
) {
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  if (!data) {
    throw new Error("Listing data is required");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          owner: profileId,
        }),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseData.message ||
        responseData.errors?.[0]?.message ||
        "Failed to create listing";
      throw new Error(errorMessage);
    }

    return responseData.doc || responseData;
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create listing");
  }
}

export async function updateListing(
  listingType: ListingCollectionSlug,
  id: number,
  data: LocationFormData | EventFormData | ServiceFormData,
  accessToken?: string,
  profileId?: number,
) {
  if (!id) {
    throw new Error("Listing ID is required");
  }
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }
  if (!data) {
    throw new Error("Listing data is required");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await res.json();

    if (!res.ok) {
      const errorMessage =
        responseData.message ||
        responseData.errors?.[0]?.message ||
        "Failed to update listing";
      throw new Error(errorMessage);
    }

    return responseData.doc || responseData;
  } catch (error) {
    console.error("Error updating listing:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update listing");
  }
}

export async function deleteListing(
  listingType: ListingCollectionSlug,
  id: number,
  accessToken?: string,
  profileId?: number,
) {
  if (!id) {
    throw new Error("Listing ID is required");
  }
  if (!profileId) {
    throw new Error("Profile ID is required");
  }
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await res.json();

    if (!res.ok) {
      const errorMessage =
        responseData.message ||
        responseData.errors?.[0]?.message ||
        "Failed to delete listing";
      throw new Error(errorMessage);
    }

    return responseData.doc || responseData;
  } catch (error) {
    console.error("Error deleting listing:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete listing");
  }
}
