export const fetchHomeListings = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/home`,
      {
        next: {
          tags: ["home-listings"],
          revalidate: 3600,
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch home listings");
    }

    let data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching home listings:", error);
    throw new Error(
      `Failed to fetch home listings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
