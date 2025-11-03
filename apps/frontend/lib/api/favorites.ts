export interface ToggleFavoriteResponse {
  isFavorite: boolean;
  favorites: number;
}

export const toggleFavorite = async (
  listingTypeSlug: "events" | "locations" | "services",
  listingId: number,
  accessToken?: string,
): Promise<ToggleFavoriteResponse> => {
  if (!accessToken) {
    const error = new Error("Unauthorized");
    (error as any).status = 401;
    throw error;
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/toggle`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ entity: listingTypeSlug, id: listingId }),
    },
  );

  if (!res.ok) {
    let message = "";
    try {
      const maybeJson = await res.clone().json();
      message = maybeJson?.message || maybeJson?.error || "";
    } catch {}
    if (!message) {
      message = await res.text().catch(() => "");
    }
    const error = new Error(
      message || `Failed to toggle favorite (${res.status})`,
    );
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

export const checkIfIsFavorited = async (
  listingTypeSlug: "events" | "locations" | "services",
  listingId: number,
  accessToken?: string,
): Promise<boolean> => {
  if (!accessToken) {
    return false;
  }
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/checkIfIsFavorited?targetKey=${listingTypeSlug}:${listingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!res.ok) {
      return false;
    }
    const data = await res.json();

    return data.isFavorited;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("checkIfIsFavorited error", errMsg);
    return false;
  }
};
