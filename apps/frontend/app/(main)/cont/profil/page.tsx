import { SectionCard } from "@/components/cont/SectionCard";
import {
  FaUser,
  FaCircleCheck,
  FaUpload,
  FaPlus,
  FaLocationDot,
  FaBriefcase,
  FaCalendarDays,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getProfile } from "@/lib/api/profile";
import ProfilePersonalDetailsForm from "@/components/cont/ProfilePersonalDetailsForm";
import { getQueryClient } from "@/lib/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { profileKeys } from "@/lib/cacheKeys";
import ProfileHeader from "./ProfileHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          <div className="flex flex-col sm:flex-row justify-between gap-5">
            <ProfileHeader profileId={Number(session.user.profile)} />
            <div className="flex flex-row gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="order-first sm:order-last"
              >
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/profil/${profileData.slug}`}
                >
                  Vezi profil
                </Link>
              </Button>
              {(() => {
                const hasHostRole = profileData.userType?.includes("host");
                const hasProviderRole =
                  profileData.userType?.includes("provider");
                const hasOrganizerRole =
                  profileData.userType?.includes("organizer");

                // Don't show button if user only has client role
                if (!hasHostRole && !hasProviderRole && !hasOrganizerRole) {
                  return null;
                }

                const listingOptions = [];
                if (hasHostRole) {
                  listingOptions.push({
                    href: "/cont/locatiile-mele/adauga",
                    label: "Listează locație",
                    icon: FaLocationDot,
                  });
                }
                if (hasProviderRole) {
                  listingOptions.push({
                    href: "/cont/serviciile-mele/adauga",
                    label: "Listează serviciu",
                    icon: FaBriefcase,
                  });
                }
                if (hasOrganizerRole) {
                  listingOptions.push({
                    href: "/cont/evenimentele-mele/adauga",
                    label: "Listează eveniment",
                    icon: FaCalendarDays,
                  });
                }

                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        className="order-first sm:order-last"
                      >
                        <FaPlus className="h-4 w-4 mr-2" />
                        Crează listare
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {listingOptions.map((option) => (
                        <DropdownMenuItem key={option.href} asChild>
                          <Link
                            rel="noopener noreferrer"
                            href={option.href}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })()}
            </div>
          </div>

          <ProfilePersonalDetailsForm profile={profileData} />
        </div>
      </SectionCard>
      {/* Verification Section */}
      <SectionCard title="Verificare Cont">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <FaCircleCheck className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">În curând!</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Funcționalitate de verificare cont este în dezvoltare. Vei primi
                un email când este disponibilă.
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
