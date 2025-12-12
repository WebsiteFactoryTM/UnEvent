"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClaimForm } from "./ClaimForm";
import type { ListingType } from "@/types/listings";

interface ClaimFormDialogProps {
  listingId: number;
  listingType: ListingType;
  listingSlug?: string;
  trigger: React.ReactNode;
}

export function ClaimFormDialog({
  listingId,
  listingType,
  listingSlug,
  trigger,
}: ClaimFormDialogProps) {
  const [open, setOpen] = useState(false);

  // Get dynamic text based on listing type
  const getListingTypeText = () => {
    switch (listingType) {
      case "locatii":
        return "proprietarul acestei locații";
      case "servicii":
        return "furnizorul acestui serviciu";
      case "evenimente":
        return "organizatorul acestui eveniment";
      default:
        return "proprietarul";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revendică listarea</DialogTitle>
          <DialogDescription>
            Completează formularul de mai jos pentru a revendica această
            listare. Dacă nu ai cont, vei fi redirecționat către crearea unuia
            după trimitere. Vei primi un email când cererea ta va fi aprobată.
          </DialogDescription>
        </DialogHeader>
        <ClaimForm
          listingId={listingId}
          listingType={listingType}
          listingSlug={listingSlug}
          listingTypeSlug={listingType}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
