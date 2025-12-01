"use server";

import { Profile, Review } from "@/types/payload-types";
import { ProfileFormData } from "@/components/cont/ProfilePersonalDetailsForm";

export async function getProfile(
  profileId?: number | string,
  authToken?: string | undefined,
): Promise<Profile> {
  if (!authToken) {
    throw new Error("No authentication token provided");
  }
  if (!profileId) {
    throw new Error("No profile ID provided");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

type FetchProfileResult = {
  data: Profile | null;
  error: Error | null;
};

export async function fetchProfileBySlug(
  slug: string,
  isDraftMode?: boolean,
): Promise<FetchProfileResult> {
  try {
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const draftParam = isDraftMode ? "?draft=1" : "";

    // Prefer BFF route at runtime when FRONTEND_URL is configured
    if (!isBuildTime && process.env.NEXT_PUBLIC_FRONTEND_URL) {
      const bffUrl = `${baseUrl}/api/public/profiles/${encodeURIComponent(
        slug,
      )}${draftParam}`;

      const response = await fetch(bffUrl, {
        next: isDraftMode ? { revalidate: 0 } : { revalidate: 300 },
      });

      if (response.ok) {
        const doc = await response.json();
        return { data: doc as Profile, error: null };
      }

      const errorMessage = await response
        .text()
        .catch(() => `HTTP ${response.status}`);
      console.error(`Profile BFF route failed:`, errorMessage);
    }

    // Fallback: direct Payload call
    if (!process.env.NEXT_PUBLIC_API_URL) {
      return {
        data: null,
        error: new Error("NEXT_PUBLIC_API_URL not configured"),
      };
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/profiles?where[slug][equals]=${encodeURIComponent(
      slug,
    )}&depth=2&limit=1`;

    const res = await fetch(url, {
      cache: isDraftMode ? "no-store" : "force-cache",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        data: null,
        error: new Error(
          text || `Failed to fetch profile from Payload (${res.status})`,
        ),
      };
    }

    const data = await res.json();
    const doc = data?.docs?.[0];

    if (!doc) {
      return { data: null, error: new Error("Profile not found") };
    }

    return { data: doc as Profile, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("fetchProfileBySlug error:", message);
    return { data: null, error: new Error(message) };
  }
}

export type ProfileListingsResponse = {
  profileId: number;
  slug: string;
  locations: unknown[];
  events: unknown[];
  services: unknown[];
};

export async function fetchProfileListings(
  slug: string,
  profileId?: number,
): Promise<ProfileListingsResponse | null> {
  try {
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    if (!process.env.NEXT_PUBLIC_FRONTEND_URL || isBuildTime) {
      // For now, only expose listings via BFF at runtime
      return null;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const usp = new URLSearchParams();
    if (profileId) {
      usp.set("profileId", String(profileId));
    }

    const queryString = usp.toString();
    const bffUrl = `${baseUrl}/api/public/profiles/${encodeURIComponent(
      slug,
    )}/listings${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(bffUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("fetchProfileListings BFF error:", text);
      return null;
    }

    return (await response.json()) as ProfileListingsResponse;
  } catch (error) {
    console.error("fetchProfileListings error:", error);
    return null;
  }
}

// Backward compatibility alias
export const fetchProfileListingsBySlug = fetchProfileListings;

export type ProfileReviewsResponse = {
  docs: Review[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function fetchProfileReviews(
  slug: string,
  page: number = 1,
  limit: number = 10,
  profileId?: number,
): Promise<ProfileReviewsResponse | null> {
  try {
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    if (!process.env.NEXT_PUBLIC_FRONTEND_URL || isBuildTime) {
      return null;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const usp = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (profileId) {
      usp.set("profileId", String(profileId));
    }

    const bffUrl = `${baseUrl}/api/public/profiles/${encodeURIComponent(
      slug,
    )}/reviews?${usp.toString()}`;

    const response = await fetch(bffUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("fetchProfileReviews BFF error:", text);
      return null;
    }

    return (await response.json()) as ProfileReviewsResponse;
  } catch (error) {
    console.error("fetchProfileReviews error:", error);
    return null;
  }
}

// Backward compatibility alias
export const fetchProfileReviewsBySlug = fetchProfileReviews;

export async function updateProfile(
  profile: ProfileFormData,
  profileId: number,
  authToken?: string | undefined,
): Promise<Profile> {
  if (!authToken) {
    throw new Error("No authentication token provided");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }
    const data = await response.json();

    return data.doc;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update profile");
  }
}

export async function updateProfileAvatar(
  avatarId: number | null,
  profileId: number,
  authToken?: string | undefined,
): Promise<Profile> {
  if (!authToken) {
    throw new Error("No authentication token provided");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatar: avatarId }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || "Failed to update avatar");
    }
    const data = await response.json();
    return data.doc;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
}
