export interface ToggleFavoriteResponse {
  isFavorite: boolean;
  favorites: number;
}

export const toggleFavorite = async (
  listingTypeSlug: "events" | "locations" | "services",
  listingId: number,
  accessToken?: string,
): Promise<ToggleFavoriteResponse> => {
  if (!accessToken) throw new Error("Unauthorized");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${accessToken}`,
      },
      body: JSON.stringify({ entity: listingTypeSlug, id: listingId }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to toggle favorite (${res.status})`);
  }
  return res.json();
};
