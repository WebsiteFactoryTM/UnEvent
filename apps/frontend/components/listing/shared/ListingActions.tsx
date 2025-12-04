"use client";
import { Button } from "@/components/ui/button";
import {
  FaHeart,
  FaShareNodes,
  FaFlag,
  FaEnvelope,
  FaTicket,
} from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { ListingType } from "@/types/listings";
import { useState } from "react";

interface ListingActionsProps {
  title: string;
  id: number;
  isFavoritedByViewer: boolean;
  description: string;
  listingType: ListingType;
  ticketUrl?: string;
  phone?: string;
}

export function ListingActions({
  title,
  description,
  id,
  isFavoritedByViewer,
  listingType,
  ticketUrl,
  phone,
}: ListingActionsProps) {
  const { isFavorited, toggleAsync } = useFavorites({
    listingType: listingType as ListingType,
    listingId: id,
    initialIsFavorited: isFavoritedByViewer,
  });
  const { toast } = useToast();
  const [isParticipating, setIsParticipating] = useState(false);

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
          variant: " ",
        } as any);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiat",
        description: "Link-ul a fost copiat în clipboard.",
      });
    }
  };

  const handleReport = () => {
    console.log("[v0] Report event:", id);
  };

  const handleParticipate = () => {
    setIsParticipating(!isParticipating);
    console.log("[v0] Participate in event:", id);
  };

  const handleContact = () => {
    if (phone) {
      // Format phone number for WhatsApp (remove spaces and non-digit characters except +)
      let cleanPhone = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");

      // Handle Romanian phone numbers: convert 0xxx to +40xxx
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "+40" + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith("40") && !cleanPhone.startsWith("+40")) {
        cleanPhone = "+" + cleanPhone;
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+" + cleanPhone;
      }

      // Remove + for WhatsApp URL (wa.me expects digits only)
      const whatsappPhone = cleanPhone.replace(/\+/g, "");
      const currentUrl = window.location.href;
      // WhatsApp automatically detects URLs and makes them clickable (no HTML tags needed)
      const message = `Bună! Am văzut listarea "${title}" pe UN:EVENT și aș dori să discut mai multe detalii.\n\nLink: ${currentUrl}`;
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-between">
      <div className="inline-flex gap-3">
        <Button
          onClick={handleFavorite}
          variant={isFavorited ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <FaHeart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
          <span className="hidden sm:inline">
            {isFavorited ? "Salvat" : "Salvează"}
          </span>
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <FaShareNodes className="h-4 w-4" />
          <span className="hidden sm:inline">Distribuie</span>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <FaFlag className="h-4 w-4" />
              <span className="hidden sm:inline">Raportează</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raportează listarea</DialogTitle>
              <DialogDescription>
                Dacă ai identificat o problemă cu această listare, te rugăm să
                ne informezi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-reason">Motivul raportării</Label>
                <Textarea
                  id="report-reason"
                  placeholder="Descrie problema..."
                  className="mt-2"
                />
              </div>
              <Button className="w-full">Trimite raport</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {listingType === "evenimente" && (
        <div className="gap-3 inline-flex place-self-end">
          {/* <Button
            size="sm"
            onClick={handleParticipate}
            className="col-span-3 sm:col-span-1 sm:ml-auto gap-2 bg-primary hover:bg-primary/90"
            // disabled={capacity?.remaining === 0}
          >
            <FaTicket className="h-4 w-4" />
            {isParticipating
              ? "Anulează participarea"
              : "Participă la eveniment"}
          </Button> */}
          {ticketUrl ? (
            <Button
              asChild
              variant="default"
              size="sm"
              className="col-span-3 sm:col-span-1 sm:ml-auto gap-2 bg-primary hover:bg-primary/90"
            >
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2 flex items-center"
              >
                <FaTicket className="h-4 w-4" />
                Cumpără bilet
              </a>
            </Button>
          ) : null}
        </div>
      )}
      {listingType !== "evenimente" && (
        <>
          {phone ? (
            <Button
              size="sm"
              className="gap-2 col-span-3 sm:col-span-1 sm:ml-auto"
              onClick={handleContact}
            >
              <FaEnvelope className="h-4 w-4" />
              Trimite mesaj
            </Button>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 col-span-3 sm:col-span-1 sm:ml-auto"
                >
                  <FaEnvelope className="h-4 w-4" />
                  Trimite mesaj
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Mesagerie directă</SheetTitle>
                  <SheetDescription>
                    Trimite un mesaj direct proprietarului acestei locații.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor="message">Mesajul tău</Label>
                    <Textarea
                      id="message"
                      placeholder="Scrie mesajul tău aici..."
                      className="mt-2 min-h-[200px]"
                    />
                  </div>
                  <Button className="w-full">Trimite mesaj</Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </>
      )}
    </div>
  );
}
