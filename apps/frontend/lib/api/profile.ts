"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Profile } from "@/types/payload-types";
import { ProfileFormData } from "@/components/profile/ProfilePersonalDetailsForm";

export async function getProfile(
  profileId?: number | string,
  authToken?: string | undefined,
): Promise<Profile> {
  if (!authToken) {
    throw new Error("No authentication token provided");
  }
  if (!profileId) {
    throw new Error("No profile ID provided");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

export async function updateProfile(
  profile: ProfileFormData,
  profileId: number,
  authToken?: string | undefined,
): Promise<Profile> {
  if (!authToken) {
    throw new Error("No authentication token provided");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profiles/${profileId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }
    return response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update profile");
  }
}
