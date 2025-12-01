"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { Profile } from "@/types/payload-types";
import { ProfileFormData } from "@/components/cont/ProfilePersonalDetailsForm";

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
    const data = await response.json();

    return data.doc;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update profile");
  }
}

export async function updateProfileAvatar(
  avatarId: number | null,
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
        body: JSON.stringify({ avatar: avatarId }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(errorText || "Failed to update avatar");
    }
    const data = await response.json();
    return data.doc;
  } catch (error) {
    console.error("Error updating avatar:", error);
    throw error;
  }
}
