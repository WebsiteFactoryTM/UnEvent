import React from "react";
import { Button } from "../ui/button";
import { FaHeart } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { ListingType } from "@/types/listings";

const FavoriteButton = ({
  listingType,
  listingId,
  initialIsFavorited,
}: {
  listingType: ListingType;
  listingId: number;
  initialIsFavorited?: boolean;
}) => {
  const { toast } = useToast();
  const { toggleAsync, isFavorited, isLoading, isToggling } = useFavorites({
    listingType,
    listingId,
    initialIsFavorited: initialIsFavorited ?? false,
  });

  const handleFavorite = async () => {
    try {
      const result = await toggleAsync();
      toast({
        title: result.isFavorite
          ? "Adăugat la favorite"
          : "Eliminat din favorite",
        description: result.isFavorite
          ? "Listarea a fost adăugată la favorite."
          : "Listarea a fost eliminată din favorite.",
      });
    } catch (e) {
      const err = e as any;
      const status = err?.status as number | undefined;
      const message = (err?.message as string | undefined) || "";
      if (status === 401 || /unauthorized/i.test(message)) {
        toast({
          title: "Autentificare necesară",
          description: "Trebuie să te autentifici pentru a adăuga la favorite.",
          variant: "destructive",
        } as any);
      } else {
        toast({
          title: "Eroare",
          description:
            message || "Nu am putut actualiza favoritele. Încearcă din nou.",
          variant: "destructive",
        } as any);
      }
    }
  };
  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
      onClick={handleFavorite}
      disabled={isLoading || isToggling}
    >
      <FaHeart className={`h-4 w-4 ${isFavorited ? "fill-red-500" : ""}`} />
    </Button>
  );
};

export default FavoriteButton;
