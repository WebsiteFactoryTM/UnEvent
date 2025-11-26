export const fetchHomeListings = async () => {
  try {
    // Use BFF route for edge caching
    // During build time, fallback to direct Payload call if BFF unavailable
    const isBuildTime =
      process.env.NEXT_PHASE === "phase-production-build" ||
      (typeof window === "undefined" &&
        !process.env.VERCEL_URL &&
        !process.env.NEXT_PUBLIC_FRONTEND_URL);

    // Use BFF route at runtime, direct Payload call during build
    if (!isBuildTime && process.env.NEXT_PUBLIC_FRONTEND_URL) {
      const baseUrl =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

      const bffUrl = `${baseUrl}/api/public/home?t=${Date.now()}`;

      try {
        const res = await fetch(bffUrl, {
          headers: { Accept: "application/json" },
          next: { revalidate: 300 },
        });

        if (res.ok) {
          return await res.json();
        }
        // Fall through to fallback if BFF fails
      } catch (bffError) {
        console.error(
          "BFF home route failed, falling back to Payload:",
          bffError,
        );
        // Fall through to fallback
      }
    }

    // Fallback to direct Payload call (build time or BFF failure)
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL not configured");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/home?t=${Date.now()}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => `HTTP ${response.status}`);
      throw new Error(`Failed to fetch home listings: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching home listings:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch home listings");
  }
};
