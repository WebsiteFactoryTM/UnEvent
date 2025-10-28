"use client"

import { FaPlus } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface AddListingButtonProps {
  listingType: "locatii" | "servicii" | "evenimente"
}

export function AddListingButton({ listingType }: AddListingButtonProps) {
  const { toast } = useToast()

  const getButtonText = () => {
    switch (listingType) {
      case "locatii":
        return "Adaugă locație"
      case "servicii":
        return "Adaugă serviciu"
      case "evenimente":
        return "Adaugă eveniment"
      default:
        return "Adaugă"
    }
  }

  const handleClick = () => {
    toast({
      title: "În curând",
      description: `Funcționalitatea de adăugare ${listingType === "locatii" ? "locație" : listingType === "servicii" ? "serviciu" : "eveniment"} va fi disponibilă în curând.`,
    })
  }

  return (
    <Button onClick={handleClick} className="gap-2 w-full sm:w-auto shrink-0">
      <FaPlus className="h-4 w-4" />
      {getButtonText()}
    </Button>
  )
}
