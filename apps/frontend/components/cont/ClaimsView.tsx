"use client";

import React from "react";
import { useUserClaims } from "@/lib/react-query/claims.queries";
import { useSession } from "next-auth/react";
import { SectionCard } from "./SectionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getListingTypeSlug } from "@/lib/getListingType";
import type { ListingType } from "@/types/listings";
import type { Claim } from "@/types/payload-types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

interface ClaimsViewProps {
  listingType: "locations" | "events" | "services";
  frontendListingType: ListingType;
}

const statusConfig = {
  pending: {
    label: "În așteptare",
    icon: FaClock,
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  approved: {
    label: "Aprobată",
    icon: FaCircleCheck,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  rejected: {
    label: "Respinsă",
    icon: FaCircleXmark,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

function ClaimCard({
  claim,
  frontendListingType,
}: {
  claim: Claim;
  frontendListingType: ListingType;
}) {
  const listing =
    typeof claim.listing === "object" && "value" in claim.listing
      ? typeof claim.listing.value === "object"
        ? claim.listing.value
        : null
      : null;

  const listingTitle = listing?.title || `Listare #${claim.id}`;
  const listingSlug = listing?.slug;

  // Map backend listing type to frontend slug
  const listingTypeSlugMap: Record<
    "locations" | "events" | "services",
    string
  > = {
    locations: "locatii",
    events: "evenimente",
    services: "servicii",
  };
  const listingTypeSlug =
    listingTypeSlugMap[claim.listingType] || frontendListingType;

  const statusInfo = statusConfig[claim.status];
  const StatusIcon = statusInfo.icon;

  const submittedDate = claim.submittedAt
    ? format(new Date(claim.submittedAt), "d MMM yyyy", { locale: ro })
    : null;

  return (
    <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {listingTitle}
            </h3>
            <Badge
              className={`${statusInfo.className} shrink-0 flex items-center gap-1.5`}
            >
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>

          {submittedDate && (
            <p className="text-sm text-muted-foreground">
              Trimisă pe {submittedDate}
            </p>
          )}

          {claim.status === "rejected" && claim.rejectionReason && (
            <div className="mt-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 font-medium">
                Motiv respingere:
              </p>
              <p className="text-sm text-red-300/80 mt-1">
                {claim.rejectionReason}
              </p>
            </div>
          )}

          {claim.status === "approved" && listingSlug && (
            <div className="mt-2">
              <Link
                href={`/${listingTypeSlug}/${listingSlug}`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Vezi listarea
                <FaArrowUpRightFromSquare className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClaimsView({
  listingType,
  frontendListingType,
}: ClaimsViewProps) {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken;

  const { data: claims, isLoading, error } = useUserClaims(listingType);

  if (status === "loading" || isLoading) {
    return (
      <SectionCard
        title="Cereri de revendicare"
        description="Istoricul cererilor tale de revendicare"
      >
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </SectionCard>
    );
  }

  if (!accessToken) {
    return (
      <SectionCard
        title="Cereri de revendicare"
        description="Istoricul cererilor tale de revendicare"
      >
        <div className="text-muted-foreground">
          Trebuie să fii autentificat pentru a vedea cererile tale.
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard
        title="Cereri de revendicare"
        description="Istoricul cererilor tale de revendicare"
      >
        <div className="text-red-400">
          Eroare la încărcarea cererilor: {error.message}
        </div>
      </SectionCard>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <SectionCard
        title="Cereri de revendicare"
        description="Istoricul cererilor tale de revendicare"
      >
        <div className="text-center py-8 text-muted-foreground">
          Nu ai trimis încă cereri de revendicare pentru acest tip de listare.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Cereri de revendicare"
      description="Istoricul cererilor tale de revendicare"
    >
      <div className="space-y-4">
        {claims.map((claim) => (
          <ClaimCard
            key={claim.id}
            claim={claim}
            frontendListingType={frontendListingType}
          />
        ))}
      </div>
    </SectionCard>
  );
}
