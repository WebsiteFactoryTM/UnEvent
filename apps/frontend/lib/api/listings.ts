import { Listing } from "@/types/listings";

export const fetchListing = async (
  listingType: string,
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
