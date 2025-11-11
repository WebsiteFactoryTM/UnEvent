import {
  formatDate,
  getCityName,
  getStatusColor,
  getStatusLabel,
} from "@/lib/ui/accountListingsUtils";

import React from "react";
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

const MobileListingView = ({
  listings,
  listingType,
  listingTypePath,
}: {
  listings: Listing[];
  listingType: ListingType;
  listingTypePath: string;
}) => {
  return (
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
          <p className="text-sm text-muted-foreground line-clamp-2">
            {listing.description}
          </p>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2 text-sm">
              <FaLocationDot className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {getCityName(listing.city)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaChartLine className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {listing.views?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <FaCalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(listing.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Link href={`/${listingType}/${listing.slug}/`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                // onClick={() => handleView(listing)}
                className="flex-1 gap-2 text-xs"
              >
                <FaEye className="h-3 w-3" />
                Vezi
              </Button>
            </Link>
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
            <Link href={`${listingTypePath}/${listing.id}/sterge`}>
              <Button
                variant="outline"
                size="sm"
                // onClick={() => handleDelete(listing)}
                className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
              >
                <FaTrash className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileListingView;
