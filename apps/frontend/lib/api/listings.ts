import { Listing } from "@/types/listings";
import { ListingType } from "@/types/listings";
import { frontendTypeToCollectionSlug } from "./reviews";

export const fetchListing = async (
  listingType: ListingType,
  slug: string,
  accessToken?: string,
): Promise<{ data: Listing | null; error: Error | null }> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${listingType}?where[slug][equals]=${slug}&includeReviewState=true&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        next: {
          tags: [`${listingType}_${slug}`],
          revalidate: 3600,
        },
      },
    );
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      return { data: null, error: new Error(errorMessage) };
    }
    const data = await response.json();
    return { data: data.docs[0], error: null };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(errorMessage);
    return { data: null, error: new Error(errorMessage) };
  }
};

export const fetchTopListings = async (
  listingType: ListingType,
  limit: number = 10,
  accessToken?: string,
): Promise<Listing[]> => {
  try {
    const collectionSlug = frontendTypeToCollectionSlug(listingType);
    const url = new URL(
      `/api/${collectionSlug}`,
      process.env.NEXT_PUBLIC_API_URL,
    );
    url.searchParams.set("where[tier][equals]", "sponsored");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "rating:asc");
    // url.searchParams.set(
    //   "select",
    //   "id,title,slug,featuredImage,city,rating,reviewCount",
    // );
    // url.searchParams.set("populate[featuredImage][url]", "true");
    // url.searchParams.set("populate[featuredImage][alt]", "true");
    // url.searchParams.set("populate[city][name]", "true");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: {
        tags: [`${collectionSlug}_top_listings_${limit}`],
        revalidate: 3600,
      },
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.docs as Listing[];
  } catch (error) {
    throw new Error(
      `Failed to fetch top listings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
