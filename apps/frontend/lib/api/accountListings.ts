import { ListingType } from "@/types/listings";
import { Event, Location, Service } from "@/types/payload-types";
import {
  normalizeListing,
  normalizeListings,
} from "@/lib/transforms/normalizeListing";
import {
  EventFormData,
  LocationFormData,
  ServiceFormData,
} from "@/forms/listing/schema";

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
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}/${listingId}?depth=1&draft=true`,
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
    // Filter out soft-deleted listings (deletedAt is null or doesn't exist)
    // Include draft=true to show the latest draft versions for owners
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[owner][equals]=${profileId}&where[deletedAt][exists]=false&depth=1&draft=true`,
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

  // Use BFF route for writes (validation, rate limiting, security)
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  try {
    const response = await fetch(
      `${baseUrl}/api/account/listings/${listingType}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`, // BFF will normalize to JWT
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
      // Create error with full details including errors array
      const error = new Error(
        responseData.error ||
          responseData.message ||
          responseData.errors?.[0]?.message ||
          "Failed to create listing",
      );
      // Attach errors array for field-level error handling
      (error as any).errors = responseData.errors || [];
      (error as any).responseData = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error("Error creating listing:", error);

    // Log API failures to Sentry (exclude expected validation errors)
    if (typeof window !== "undefined" && (window as any).Sentry) {
      const isNetworkError =
        error instanceof TypeError && error.message?.includes("fetch");
      const isServerError =
        error instanceof Error &&
        (error.message?.includes("500") ||
          error.message?.includes("502") ||
          error.message?.includes("503") ||
          error.message?.includes("504"));
      const isAuthError =
        error instanceof Error &&
        (error.message?.includes("401") ||
          error.message?.includes("403") ||
          error.message?.includes("Unauthorized"));

      if (isNetworkError || isServerError || isAuthError) {
        (window as any).Sentry.withScope((scope: any) => {
          scope.setTag("operation", "create_listing_api");
          scope.setTag("component", "accountListings");
          scope.setTag(
            "error_type",
            isNetworkError ? "network" : isServerError ? "server" : "auth",
          );
          scope.setContext("api_call", {
            listingType,
            profileId,
            url: `${baseUrl}/api/account/listings/${listingType}`,
            hasAccessToken: !!accessToken,
          });
          scope.setContext("error_details", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            responseData: (error as any).responseData,
          });
          (window as any).Sentry.captureException(error);
        });
      }
    }

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
  draft?: boolean,
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

  // Use BFF route for writes (validation, rate limiting, security)
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  const draftParam = draft ? "?draft=true" : "";

  try {
    const res = await fetch(
      `${baseUrl}/api/account/listings/${listingType}/${id}${draftParam}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`, // BFF will normalize to JWT
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await res.json();

    if (!res.ok) {
      // Create error with full details including errors array
      const error = new Error(
        responseData.error ||
          responseData.message ||
          responseData.errors?.[0]?.message ||
          "Failed to update listing",
      );
      // Attach errors array for field-level error handling
      (error as any).errors = responseData.errors || [];
      (error as any).responseData = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error("Error updating listing:", error);

    // Log API failures to Sentry (exclude expected validation errors)
    if (typeof window !== "undefined" && (window as any).Sentry) {
      const isNetworkError =
        error instanceof TypeError && error.message?.includes("fetch");
      const isServerError =
        error instanceof Error &&
        (error.message?.includes("500") ||
          error.message?.includes("502") ||
          error.message?.includes("503") ||
          error.message?.includes("504"));
      const isAuthError =
        error instanceof Error &&
        (error.message?.includes("401") ||
          error.message?.includes("403") ||
          error.message?.includes("Unauthorized"));

      if (isNetworkError || isServerError || isAuthError) {
        (window as any).Sentry.withScope((scope: any) => {
          scope.setTag("operation", "update_listing_api");
          scope.setTag("component", "accountListings");
          scope.setTag(
            "error_type",
            isNetworkError ? "network" : isServerError ? "server" : "auth",
          );
          scope.setContext("api_call", {
            listingType,
            listingId: id,
            profileId,
            draft,
            url: `${baseUrl}/api/account/listings/${listingType}/${id}${draftParam}`,
            hasAccessToken: !!accessToken,
          });
          scope.setContext("error_details", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            responseData: (error as any).responseData,
          });
          (window as any).Sentry.captureException(error);
        });
      }
    }

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

  // Use BFF route for writes (validation, rate limiting, security)
  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  try {
    const res = await fetch(
      `${baseUrl}/api/account/listings/${listingType}/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`, // BFF will normalize to JWT
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage =
        responseData.error ||
        responseData.message ||
        responseData.errors?.[0]?.message ||
        "Failed to delete listing";
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error("Error deleting listing:", error);

    // Log API failures to Sentry (exclude expected validation errors)
    if (typeof window !== "undefined" && (window as any).Sentry) {
      const isNetworkError =
        error instanceof TypeError && error.message?.includes("fetch");
      const isServerError =
        error instanceof Error &&
        (error.message?.includes("500") ||
          error.message?.includes("502") ||
          error.message?.includes("503") ||
          error.message?.includes("504"));
      const isAuthError =
        error instanceof Error &&
        (error.message?.includes("401") ||
          error.message?.includes("403") ||
          error.message?.includes("Unauthorized"));

      if (isNetworkError || isServerError || isAuthError) {
        (window as any).Sentry.withScope((scope: any) => {
          scope.setTag("operation", "delete_listing_api");
          scope.setTag("component", "accountListings");
          scope.setTag(
            "error_type",
            isNetworkError ? "network" : isServerError ? "server" : "auth",
          );
          scope.setContext("api_call", {
            listingType,
            listingId: id,
            profileId,
            url: `${baseUrl}/api/account/listings/${listingType}/${id}`,
            hasAccessToken: !!accessToken,
          });
          scope.setContext("error_details", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          (window as any).Sentry.captureException(error);
        });
      }
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete listing");
  }
}
