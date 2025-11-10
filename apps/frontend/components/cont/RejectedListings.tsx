import React from "react";
import { Button } from "../ui/button";
import { FaPencil } from "react-icons/fa6";
import { Listing } from "@/types/listings";

const RejectedListings = ({ listings }: { listings: Listing[] }) => {
  return (
    <div className="space-y-4">
      {listings
        .filter((l) => l.status === "rejected")
        .map((listing) => (
          <div
            key={listing.id}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {listing.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-red-400">
                    Motiv respingere:
                  </span>{" "}
                  {listing.rejectionReason || "Nu a fost specificat un motiv."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                // onClick={() => handleEdit(listing)}
                className="gap-2 w-full sm:w-auto"
              >
                <FaPencil className="h-3 w-3" />
                Corectează
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default RejectedListings;
