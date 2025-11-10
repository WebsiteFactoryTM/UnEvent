import React from "react";
import { Listing, ListingType } from "@/types/listings";
import { Button } from "../ui/button";
import { FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import {
  getCityName,
  getStatusLabel,
  getStatusColor,
  formatDate,
} from "@/lib/ui/accountListingsUtils";
import Link from "next/link";

const DesktopListingView = ({
  listings,
  listingType,
}: {
  listings: Listing[];
  listingType: ListingType;
}) => {
  return (
    <div className="hidden md:block overflow-x-scroll">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Titlu
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Scurtă descriere
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Locație (oraș)
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Data creării
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Vizualizări
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
              Status
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
              Acțiuni
            </th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            console.log("listing", listing.slug);
            return (
              <tr
                key={listing.id}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="font-medium text-foreground">
                    {listing.title}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {listing.description}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-foreground">
                    {getCityName(listing.city)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDate(listing.createdAt)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-foreground font-medium">
                    {listing.views?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      listing.status,
                    )}`}
                  >
                    {getStatusLabel(listing.status)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/${listingType}/${listing.slug}/`}
                      target="_blank"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => handleView(listing)}
                        className="h-8 w-8 p-0"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/cont/locatiile-mele/${listing.id}/editeaza`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => handleEdit(listing)}
                        className="h-8 w-8 p-0"
                      >
                        <FaPencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/cont/locatiile-mele/${listing.id}/sterge`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        // onClick={() => handleDelete(location)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopListingView;
