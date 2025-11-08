"use client";

import { SectionCard } from "@/components/cont/SectionCard";
import { FaUser, FaCircleCheck, FaUpload } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProfilePersonalDetailsForm from "@/components/profile/ProfilePersonalDetailsForm";
import { Media } from "@/types/payload-types";
import { useProfile } from "@/lib/react-query/listings.queries";

export default function ProfilPageClient() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: profile, isLoading, error } = useProfile(user?.profile);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-lg mb-6"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nu s-a putut încărca profilul.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <SectionCard title="Informații Profil">
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={(profile.avatar as Media)?.url || "/placeholder.svg"}
                alt={profile.displayName || profile.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
                <FaUpload className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {profile.displayName || profile.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Schimbă fotografia de profil
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <ProfilePersonalDetailsForm profile={profile} />
        </div>
      </SectionCard>

      {/* Verification Section */}
      <SectionCard title="Verificare Cont">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
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
    </div>
  );
}
