import { NextResponse } from "next/server";
import { getRedis } from "@/utils/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redis = getRedis();
    const lastUpdate = await redis.get("home:lastUpdate");

    // If no timestamp in Redis, return current time as fallback
    const timestamp = lastUpdate ? parseInt(lastUpdate) : Date.now();

    return NextResponse.json({
      lastUpdate: timestamp,
      success: true
    });
  } catch (error) {
    console.error("Error fetching home update timestamp:", error);
    // Fallback to current time if Redis fails
    return NextResponse.json({
      lastUpdate: Date.now(),
      success: true
    });
  }
}
