import { FaPencil, FaPlus } from "react-icons/fa6";
import { SectionCard } from "@/components/cont/SectionCard";
import { Button } from "@/components/ui/button";
import { getQueryClient } from "@/lib/react-query/config";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { listingsKeys } from "@/lib/cacheKeys";
import { getUserListings } from "@/lib/api/accountListings";
import { Listing } from "@/types/listings";
import RejectedListings from "@/components/cont/RejectedListings";
import ListingView from "@/components/cont/ListingView";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";

export default async function EvenimentelemePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.profile as number;
  const token = session?.accessToken;

  if (!userId || !token) {
    return (
      <div>Trebuie să fii autentificat pentru a accesa această pagină.</div>
    );
  }

  const queryClient = getQueryClient();
  const listings: Listing[] = await getUserListings("events", token, userId);

  await queryClient.setQueryData(
    listingsKeys.userListings("events", String(userId)),
    listings,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Evenimentele mele
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestionează evenimentele tale listate pe platformă
          </p>
        </div>
        <Link href="/cont/evenimentele-mele/adauga">
          <Button className="gap-2 w-full sm:w-auto">
            <FaPlus className="h-4 w-4" />
            Adaugă eveniment
          </Button>
        </Link>
      </div>

      {/* Locations List */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ListingView
          type="evenimente"
          label="Locațiile mele"
          description="Toate evenimentele tale"
          buttonLabel="Adaugă eveniment"
          noListingsMessage="Nu ai încă evenimente adăugate."
        />

        {/* Rejection Reason Alert (if any rejected) */}
        {listings.some((l) => l.status === "rejected") && (
          <SectionCard
            title="Evenimente respinse"
            description="Evenimente care necesită atenție"
          >
            <RejectedListings listings={listings} />
          </SectionCard>
        )}
      </HydrationBoundary>
    </div>
  );
}
