"use client";

import {
  formatDate,
  getCityName,
  getStatusColor,
  getStatusLabel,
} from "@/lib/ui/accountListingsUtils";

import React, { useState } from "react";
import {
  FaCalendarDays,
  FaChartLine,
  FaEye,
  FaLocationDot,
  FaPencil,
  FaTrash,
} from "react-icons/fa6";
import { Button } from "../ui/button";
import { Listing, ListingType } from "@/types/listings";
import Link from "next/link";
import { ListingMetrics } from "./ListingMetrics";
import { getListingTypeSlug } from "@/lib/getListingType";
import { DeleteListingDialog } from "./DeleteListingDialog";

const MobileListingView = ({
  listings,
  listingType,
  listingTypePath,
  onDelete,
  isDeleting,
}: {
  listings: Listing[];
  listingType: ListingType;
  listingTypePath: string;
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleDeleteClick = (listing: Listing) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const listingTypeSlug = getListingTypeSlug(listingType) as
    | "locations"
    | "events"
    | "services";

  return (
    <>
      {selectedListing && (
        <DeleteListingDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          listing={selectedListing}
          listingType={listingTypeSlug}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      )}
      <div className="md:hidden space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm space-y-3"
          >
            {/* Title and Status */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-foreground text-lg flex-1">
                {listing.title}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                  listing.status,
                )}`}
              >
                {getStatusLabel(listing.status)}
              </span>
            </div>

            {/* Description */}
            {/* <p className="text-sm text-muted-foreground line-clamp-2">
              {listing.description}
            </p> */}

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm">
                <FaLocationDot className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {getCityName(listing.city)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm col-span-2">
                <FaCalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {formatDate(listing.createdAt)}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-border/30">
                {listing.tier === "sponsored" && (
                  <ListingMetrics
                    listingId={listing.id}
                    kind={getListingTypeSlug(listingType)}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              {listing.status === "draft" ||
              listing.moderationStatus === "pending" ? (
                <Link
                  href={`/api/preview?url=${encodeURIComponent(
                    `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${listingType}/${listing.slug}/preview`,
                  )}&secret=${process.env.NEXT_PUBLIC_DRAFT_SECRET}`}
                  target="_blank"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-xs"
                  >
                    <FaEye className="h-3 w-3" />
                    Previzualizare
                  </Button>
                </Link>
              ) : (
                <Link href={`/${listingType}/${listing.slug}/`} target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-xs"
                  >
                    <FaEye className="h-3 w-3" />
                    Vezi
                  </Button>
                </Link>
              )}
              <Link href={`${listingTypePath}/${listing.id}/editeaza`}>
                <Button
                  variant="outline"
                  size="sm"
                  // onClick={() => handleEdit(listing)}
                  className="flex-1 gap-2 text-xs"
                >
                  <FaPencil className="h-3 w-3" />
                  Editează
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(listing)}
                className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
              >
                <FaTrash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MobileListingView;
