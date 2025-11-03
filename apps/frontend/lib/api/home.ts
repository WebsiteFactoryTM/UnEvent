"use server";

import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export const fetchHomeListings = async () => {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/home`,
      {
        next: {
          tags: ["home-listings"],
          // revalidate: 1800, // 30 minutes
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
