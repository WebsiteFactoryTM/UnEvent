import React from "react";
import { UnifiedListingForm } from "@/components/cont/listings/UnifiedListingForm";

const CreateLocationPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Adaugă o nouă locație
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Adaugă o nouă locație pe platformă
          </p>
        </div>
      </div>
      <UnifiedListingForm listingType="location" />
    </div>
  );
};

export default CreateLocationPage;
