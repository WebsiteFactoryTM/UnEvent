import { authOptions } from "@/auth";
import { UnifiedListingForm } from "@/components/cont/listings/UnifiedListingForm";
import { getUserListing } from "@/lib/api/accountListings";
import { getServerSession } from "next-auth";
import React from "react";

const EditLocationPage = async ({
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
    "locations",
    parseInt(listingId),
    accessToken,
    profileId,
  );

  if (!listing) {
    return <div>Locație nu a fost găsită</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Editează locația ta
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Editează locația tău
          </p>
        </div>
      </div>
      <UnifiedListingForm
        listingType="location"
        editMode={true}
        existingListing={listing}
      />
    </div>
  );
};

export default EditLocationPage;
