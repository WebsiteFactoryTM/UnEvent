type ListingKind = "locations" | "events" | "services";

export type MetricsData = {
  views: number;
  favorites: number;
  impressions: number;
};

export async function fetchListingMetrics(
  listingId: number,
  kind: ListingKind,
  accessToken?: string,
): Promise<MetricsData> {
  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const payloadUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!payloadUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  // Fetch from aggregates collection (precomputed, single record)
  const url = `${payloadUrl}/api/aggregates?where[target.value][equals]=${listingId}&where[target.relationTo][equals]=${kind}&limit=1`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch listing metrics");
  }

  const data = await response.json();
  const aggregate = data?.docs?.[0];

  if (!aggregate) {
    // Return zeros if no aggregate record exists yet
    return { views: 0, favorites: 0, impressions: 0 };
  }

  // Extract all-time metrics from aggregate
  return {
    views: aggregate.views || 0,
    favorites: aggregate.favorites || 0,
    impressions: aggregate.impressions || 0,
  };
}
