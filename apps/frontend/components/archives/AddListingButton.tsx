"use client";

import { FaPlus } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AddListingButtonProps {
  listingType: "locatii" | "servicii" | "evenimente";
}

export function AddListingButton({ listingType }: AddListingButtonProps) {
  const { toast } = useToast();

  const getButtonText = () => {
    switch (listingType) {
      case "locatii":
        return "Adaugă locație";
      case "servicii":
        return "Adaugă serviciu";
      case "evenimente":
        return "Adaugă eveniment";
      default:
        return "Adaugă";
    }
  };

  const getButtonHref = () => {
    switch (listingType) {
      case "locatii":
        return "/cont/locatiile-mele/adauga";
      case "servicii":
        return "/cont/serviciile-mele/adauga";
      case "evenimente":
        return "/cont/evenimentele-mele/adauga";
      default:
        return "/cont";
    }
  };

  return (
    <Link href={getButtonHref()}>
      <Button className="gap-2 w-full sm:w-auto shrink-0">
        <FaPlus className="h-4 w-4" />
        {getButtonText()}
      </Button>
    </Link>
  );
}
