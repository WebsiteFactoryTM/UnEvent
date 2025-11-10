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
    <div className="h-screen flex flex-col">
      <UnifiedListingForm
        listingType="location"
        editMode={true}
        existingListing={listing}
      />
    </div>
  );
};

export default EditLocationPage;
