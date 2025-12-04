"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@/types/listings";

interface DeleteListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
  listingType: "locations" | "events" | "services";
  onDelete: (id: number) => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteListingDialog({
  open,
  onOpenChange,
  listing,
  listingType,
  onDelete,
  isDeleting = false,
}: DeleteListingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      await onDelete(listing.id);
      toast({
        title: "Listare ștearsă",
        description:
          "Listarea a fost ștearsă cu succes. Va fi eliminată permanent după 6 luni.",
      });
      onOpenChange(false);
    } catch (error) {
      const err = error as any;
      const message =
        err?.message ||
        "Nu am putut șterge listarea. Te rugăm să încerci din nou.";

      toast({
        title: "Eroare",
        description: message,
        variant: "destructive",
      } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  const listingTypeLabel =
    listingType === "locations"
      ? "locație"
      : listingType === "events"
        ? "eveniment"
        : "serviciu";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Șterge {listingTypeLabel}</DialogTitle>
          <DialogDescription>
            Ești sigur că vrei să ștergi "{listing.title}"?
            <br />
            <br />
            Această acțiune va ascunde listarea de pe platformă. Listarea va fi
            păstrată în baza de date timp de 6 luni, după care va fi eliminată
            permanent. Nu vei putea anula această acțiune după confirmare.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isDeleting}
          >
            Anulează
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting || isDeleting ? "Se șterge..." : "Șterge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
