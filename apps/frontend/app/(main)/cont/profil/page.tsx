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
import ProfileHeader from "./ProfileHeader";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profile || !session.accessToken) {
    return <div>Nu există profil asociat acestui cont.</div>;
  }

  const queryClient = getQueryClient();
  const profileData = await getProfile(
    session.user.profile,
    session.accessToken,
  );
  await queryClient.setQueryData(
    profileKeys.detail(String(session.user.profile)),
    profileData,
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SectionCard title="Informații Profil">
        <div className="space-y-6">
          <ProfileHeader profileId={Number(session.user.profile)} />
          <ProfilePersonalDetailsForm profile={profileData} />
        </div>
      </SectionCard>
      {/* Verification Section */}
      <SectionCard title="Verificare Cont">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <FaCircleCheck className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                Verificare în Așteptare
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Documentele tale sunt în curs de verificare. Vei primi un email
                când procesul este finalizat.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Trimis la: 15 ianuarie 2025
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">
              Beneficiile Verificării
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Badge de verificare pe profil
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Prioritate în rezultatele căutării
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Acces la funcții premium
              </li>
              <li className="flex items-center gap-2">
                <FaCircleCheck className="w-4 h-4 text-green-500" />
                Încredere crescută din partea clienților
              </li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </HydrationBoundary>
  );
}
