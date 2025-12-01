import React from "react";
import { UnifiedListingForm } from "@/components/cont/listings/UnifiedListingForm";
import BackButton from "@/components/cont/shared/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { hasRequiredRole } from "@/lib/auth/checkRole";
import { NoRoleAccess } from "@/components/cont/NoRoleAccess";

const CreateServicePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div>Trebuie să fii autentificat pentru a accesa această pagină.</div>
    );
  }

  if (!hasRequiredRole(session, "provider")) {
    return <NoRoleAccess requiredRole="provider" pageName="Adaugă serviciu" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Adaugă serviciu
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Adaugă un serviciu nou pe platformă
          </p>
        </div>
        <BackButton href="/cont/serviciile-mele" />
      </div>
      <UnifiedListingForm listingType="service" />
    </div>
  );
};

export default CreateServicePage;
