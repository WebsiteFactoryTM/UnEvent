import { authOptions } from "@/auth";
import { UnifiedListingForm } from "@/components/cont/listings/UnifiedListingForm";
import BackButton from "@/components/cont/shared/BackButton";
import { getUserListing } from "@/lib/api/accountListings";
import { getServerSession } from "next-auth";
import Link from "next/link";
import React from "react";
import { hasRequiredRole } from "@/lib/auth/checkRole";
import { NoRoleAccess } from "@/components/cont/NoRoleAccess";

const EditServicePage = async ({
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

  if (!hasRequiredRole(session, "provider")) {
    return (
      <NoRoleAccess requiredRole="provider" pageName="Editează serviciu" />
    );
  }

  const listing = await getUserListing(
    "services",
    parseInt(listingId),
    accessToken,
    profileId,
  );

  if (!listing) {
    return <div>Serviciu nu a fost găsit</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Editează serviciu
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Editează serviciul tău
          </p>
        </div>
        <BackButton href="/cont/serviciile-mele" />
      </div>
      <UnifiedListingForm
        listingType="service"
        editMode={true}
        existingListing={listing}
      />
    </div>
  );
};

export default EditServicePage;
