"use client";
import React from "react";
import { useListingsManager } from "@/lib/react-query/accountListings.queries";
import { useSession } from "next-auth/react";
import { ListingType } from "@/types/listings";
import { Button } from "../ui/button";
import DesktopListingView from "./DesktopListingView";
import { SectionCard } from "./SectionCard";
import MobileListingView from "./MobileListingView";
import { FaPlus } from "react-icons/fa6";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
const listingTypeToPath = {
  evenimente: "/cont/evenimentele-mele",
  locatii: "/cont/locatiile-mele",
  servicii: "/cont/serviciile-mele",
};
const ListingView = ({
  type,
  label,
  description,
  buttonLabel,
  noListingsMessage,
}: {
  type: ListingType;
  label?: string;
  description?: string;
  buttonLabel?: string;
  noListingsMessage?: string;
}) => {
  const { data: session, status } = useSession();

  const accessToken = session?.accessToken;
  const profileId = session?.user?.profile as number | undefined;

  // Call hooks unconditionally, but only fetch when we have credentials
  const { listings, isLoading, error } = useListingsManager({
    type,
    profileId,
    accessToken,
  });

  if (status === "loading") {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!accessToken || !profileId) {
    return (
      <div>Trebuie să fii autentificat pentru a vedea această secțiune.</div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <div>Eroare: {error.message}</div>;
  }

  const listingPath =
    listingTypeToPath[type as keyof typeof listingTypeToPath] ?? "";

  return (
    <SectionCard
      title={label || `Lista ${type}`}
      description={description || `Toate ${type} tale`}
    >
      <MobileListingView
        listings={listings}
        listingType={type}
        listingTypePath={listingPath}
      />
      <DesktopListingView
        listings={listings}
        listingType={type}
        listingTypePath={listingPath}
      />

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {noListingsMessage || `Nu ai încă ${type} adăugate.`}
          </p>
          <Link href={`${listingPath}/adauga`}>
            <Button className="mt-4 gap-2 w-full">
              <FaPlus className="h-4 w-4" />
              {buttonLabel || `Adaugă prima ${type}`}
            </Button>
          </Link>
        </div>
      )}
    </SectionCard>
  );
};

export default ListingView;
