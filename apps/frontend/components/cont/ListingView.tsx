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
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const profileId = session?.user?.profile as number;
  const { listings, isLoading, error, refetch } = useListingsManager({
    type: "locatii",
    profileId: profileId,
    accessToken: (accessToken as string) || "",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <SectionCard
      title={label || `Lista ${type}`}
      description={description || `Toate ${type} tale`}
    >
      <MobileListingView listings={listings} listingType={type} />
      <DesktopListingView listings={listings} listingType={type} />

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {noListingsMessage || `Nu ai încă ${type} adăugate.`}
          </p>
          <Link href={`/adauga`}>
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
