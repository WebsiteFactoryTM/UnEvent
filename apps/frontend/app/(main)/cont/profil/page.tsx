import { SectionCard } from "@/components/cont/SectionCard";
import { FaUser, FaCircleCheck, FaUpload } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getProfile } from "@/lib/api/profile";
import ProfilePersonalDetailsForm from "@/components/profile/ProfilePersonalDetailsForm";
import { Media } from "@/types/payload-types";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { profileKeys } from "@/lib/cacheKeys";
import ProfilPageClient from "./client";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Pre-fetch profile data
  const queryClient = getQueryClient();
  if (user?.profile && session?.accessToken) {
    const profileData = await getProfile(user.profile, session.accessToken);
    await queryClient.setQueryData(
      profileKeys.detail(user.profile),
      profileData,
    );
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProfilPageClient />
    </HydrationBoundary>
  );
}
