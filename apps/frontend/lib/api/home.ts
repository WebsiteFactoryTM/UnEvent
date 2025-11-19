"use server";

import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { getRedis } from "../redis";
import { homeKeys } from "../cacheKeys";
import { redisKey } from "../react-query/utils";

export const fetchHomeListings = async () => {
  const redis = getRedis();
  const cacheKey = redisKey(homeKeys.listings());

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cached data found for home listings");
      // Upstash Redis may return objects directly, so check type before parsing
      if (typeof cachedData === "string") {
        return JSON.parse(cachedData);
      }
      return cachedData;
    }
    console.log("🌐 Fetching home listings from API...");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/home`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!response.ok) {
      console.error("Failed to fetch home listings:", response.statusText);
      console.error("Response:", await response.text());
      throw new Error("Failed to fetch home listings");
    }

    let data = await response.json();
    await redis.set(cacheKey, JSON.stringify(data), "EX", 60);

    return data;
  } catch (error) {
    console.error("Error fetching home listings:", error);
    // optional: fallback to last cached data if available
    const fallback = await redis.get(cacheKey);
    if (fallback) {
      // Upstash Redis may return objects directly, so check type before parsing
      if (typeof fallback === "string") {
        return JSON.parse(fallback);
      }
      return fallback;
    }
    throw new Error("No cached home listings available");
  }
};
