export const fetchHomeListings = async () => {
  try {
    const isServer = typeof window === "undefined";

    // 1. Server-Side: Direct Payload Call (ISR/Static)
    // Avoid loopback requests on server
    if (isServer && process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/home`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        },
      );

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => `HTTP ${response.status}`);
        throw new Error(
          `Failed to fetch home listings from Payload: ${errorText}`,
        );
      }

      return await response.json();
    }

    // 2. Client-Side: BFF Call (Edge Caching)
    if (process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL) {
      const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const bffUrl = `${baseUrl}/api/public/home`;

      try {
        const res = await fetch(bffUrl, {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (bffError) {
        console.error("BFF home route failed:", bffError);
      }
    }

    // Fallback if client-side BFF fails or no URL configured
    // This part effectively duplicates logic if we were on server but somehow fell through,
    // but with the new structure, we only fall through here if client-side failed or server-side lacks API_URL.

    // If we are on client and BFF failed, we *could* try direct API_URL if CORS allows, but usually API_URL is internal or protected.
    // However, the original code fell back to API_URL regardless.
    // Let's keep the fallback but it will likely fail on client if API_URL is not public.
    // Actually NEXT_PUBLIC_API_URL is public.

    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/home`,
        {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        },
      );

      if (response.ok) return await response.json();
    }

    throw new Error("Failed to fetch home listings");
  } catch (error) {
    console.error("Error fetching home listings:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch home listings");
  }
};
