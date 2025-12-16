"use server";

import { Profile, Review } from "@/types/payload-types";
import { ProfileFormData } from "@/components/cont/ProfilePersonalDetailsForm";
import { tag } from "@unevent/shared";

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
    const isServer = typeof window === "undefined";

    // 1. Server-Side: Direct Payload Call (ISR/Static)
    if (isServer && process.env.NEXT_PUBLIC_API_URL) {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/profiles?where[slug][equals]=${encodeURIComponent(
        slug,
      )}&depth=2&limit=1`;

      const res = await fetch(url, {
        cache: isDraftMode ? "no-store" : "default",
        next: isDraftMode
          ? { revalidate: 0 }
          : {
              tags: [tag.profileSlug(slug)],
              revalidate: 300,
            },
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
    }

    // 2. Client-Side: BFF Call (Edge Caching)
    const baseUrl =
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const draftParam = isDraftMode ? "?draft=1" : "";

    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
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

    // Fallback: direct Payload call (Client-side fallback)
    if (process.env.NEXT_PUBLIC_API_URL) {
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
    }

    return {
      data: null,
      error: new Error("NEXT_PUBLIC_API_URL not configured"),
    };
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
    const isServer = typeof window === "undefined";
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // 1. Server-Side: Direct Payload Call
    if (isServer && API_URL && process.env.SVC_TOKEN) {
      let pid = profileId;

      if (!pid) {
        // Resolve profile ID by slug
        const profileUrl = `${API_URL}/api/profiles?where[slug][equals]=${encodeURIComponent(
          slug,
        )}&limit=1`;

        const profileRes = await fetch(profileUrl, {
          headers: {
            Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
          },
          next: {
            tags: [tag.profileSlug(slug)],
            revalidate: 300,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          pid = profileData?.docs?.[0]?.id;
        }
      }

      if (pid) {
        const collectionSlugs = ["locations", "events", "services"] as const;

        const results = await Promise.all(
          collectionSlugs.map(async (collection) => {
            const url = `${API_URL}/api/${collection}?where[owner][equals]=${pid}&depth=1&limit=100`;

            const res = await fetch(url, {
              headers: {
                Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
              },
              next: {
                tags: [tag.collection(collection)],
                revalidate: 300,
              },
            });

            if (!res.ok) {
              return { collection, docs: [] };
            }

            const data = await res.json();
            return { collection, docs: data?.docs ?? [] };
          }),
        );

        return {
          profileId: pid,
          slug,
          locations:
            results.find((r) => r.collection === "locations")?.docs ?? [],
          events: results.find((r) => r.collection === "events")?.docs ?? [],
          services:
            results.find((r) => r.collection === "services")?.docs ?? [],
        };
      }
    }

    // 2. Client-Side: BFF Call
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
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

      if (response.ok) {
        return (await response.json()) as ProfileListingsResponse;
      }

      const text = await response.text().catch(() => "");
      console.error("fetchProfileListings BFF error:", text);
    }

    return null;
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
    const isServer = typeof window === "undefined";
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // 1. Server-Side: Direct Payload Call
    if (isServer && API_URL && process.env.SVC_TOKEN) {
      let pid = profileId;

      if (!pid) {
        // Resolve profile ID by slug
        const profileUrl = `${API_URL}/api/profiles?where[slug][equals]=${encodeURIComponent(
          slug,
        )}&limit=1`;

        const profileRes = await fetch(profileUrl, {
          headers: {
            Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
          },
          next: {
            tags: [tag.profileSlug(slug)],
            revalidate: 300,
          },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          pid = profileData?.docs?.[0]?.id;
        }
      }

      if (pid) {
        const reviewsUrl = `${API_URL}/api/reviews?where[user][equals]=${pid}&where[status][equals]=approved&depth=2&page=${page}&limit=${limit}`;

        const reviewsRes = await fetch(reviewsUrl, {
          headers: {
            Authorization: `users API-Key ${process.env.SVC_TOKEN}`,
          },
          next: {
            tags: [tag.profileSlug(slug)],
            revalidate: 300,
          },
        });

        if (reviewsRes.ok) {
          return (await reviewsRes.json()) as ProfileReviewsResponse;
        }

        const text = await reviewsRes.text().catch(() => "");
        console.error("fetchProfileReviews Payload error:", text);
      }
    }

    // 2. Client-Side: BFF Call
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
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

      if (response.ok) {
        return (await response.json()) as ProfileReviewsResponse;
      }

      const text = await response.text().catch(() => "");
      console.error("fetchProfileReviews BFF error:", text);
    }

    return null;
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
