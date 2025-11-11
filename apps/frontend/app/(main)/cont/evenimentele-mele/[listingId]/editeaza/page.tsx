import { authOptions } from "@/auth";
import { UnifiedListingForm } from "@/components/cont/listings/UnifiedListingForm";
import { getUserListing } from "@/lib/api/accountListings";
import { getServerSession } from "next-auth";
import React from "react";

const EditEventPage = async ({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) => {
  const { listingId } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  const profileId = session?.user?.profile as number;

  if (!listingId || !accessToken || !profileId) {
    return <div>Unauthorized</div>;
  }

  const listing = await getUserListing(
    "events",
    parseInt(listingId),
    accessToken,
    profileId,
  );

  if (!listing) {
    return <div>Evenimentul nu a fost găsit</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Editează eveniment
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Editează evenimentul tău
          </p>
        </div>
      </div>
      <UnifiedListingForm
        listingType="event"
        editMode={true}
        existingListing={listing}
      />
    </div>
  );
};

export default EditEventPage;
