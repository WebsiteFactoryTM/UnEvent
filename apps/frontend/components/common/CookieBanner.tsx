"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConsent } from "@/app/providers/consent";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConsentService } from "@/app/providers/consent/ConsentContext";

/**
 * CookieBanner
 *
 * GDPR-compliant cookie consent banner with Romanian translations.
 * Allows users to accept all, decline, or customize their preferences.
 */
export const CookieBanner = () => {
  const { hasConsented, acceptAll, declineAll, acceptSelected } = useConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ConsentService[]>([
    "necessary",
  ]);

  // Show banner after mount if user hasn't consented
  useEffect(() => {
    // Delay showing banner slightly for better UX
    const timer = setTimeout(() => {
      if (!hasConsented) {
        setShowBanner(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasConsented]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleDecline = () => {
    declineAll();
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    acceptSelected(selectedServices);
    setShowBanner(false);
    setShowSettings(false);
  };

  const toggleService = (service: ConsentService) => {
    if (service === "necessary") return; // Can't disable necessary cookies

    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom">
        <Card className="mx-auto max-w-7xl bg-background/95 backdrop-blur-md border-2 shadow-2xl">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Content */}
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold">
                  🍪 Acest site folosește cookie-uri
                </h3>
                <p className="text-sm text-muted-foreground">
                  Folosim cookie-uri pentru a îmbunătăți experiența ta, pentru a
                  analiza traficul și pentru a personaliza conținutul. Poți
                  alege să accepți toate cookie-urile sau să personalizezi
                  preferințele tale. Pentru mai multe detalii, consultă{" "}
                  <Link
                    href="/politica-de-confidentialitate"
                    className="underline hover:text-primary"
                  >
                    Politica de Confidențialitate
                  </Link>{" "}
                  și{" "}
                  <Link
                    href="/politica-cookie"
                    className="underline hover:text-primary"
                  >
                    Politica Cookie
                  </Link>
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Setări
                </Button>
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  Refuz
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90"
                >
                  Accept toate
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preferințe Cookie</DialogTitle>
            <DialogDescription>
              Alege ce tipuri de cookie-uri vrei să accepți. Poți modifica
              aceste setări oricând.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
              <Checkbox
                id="necessary"
                checked={true}
                disabled={true}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="necessary"
                  className="text-sm font-semibold cursor-not-allowed"
                >
                  Cookie-uri necesare (obligatorii)
                </label>
                <p className="text-xs text-muted-foreground">
                  Esențiale pentru funcționarea site-ului, cum ar fi
                  autentificarea și gestionarea sesiunii. Nu pot fi dezactivate.
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <Checkbox
                id="analytics"
                checked={selectedServices.includes("analytics")}
                onCheckedChange={() => toggleService("analytics")}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="analytics"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Analytics
                </label>
                <p className="text-xs text-muted-foreground">
                  Ne ajută să înțelegem cum interacționează vizitatorii cu
                  site-ul nostru prin colectarea și raportarea anonimă a
                  informațiilor. Include Google Analytics.
                </p>
              </div>
            </div>

            {/* Tracking Cookies */}
            <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <Checkbox
                id="tracking"
                checked={selectedServices.includes("tracking")}
                onCheckedChange={() => toggleService("tracking")}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="tracking"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Tracking și Advertising
                </label>
                <p className="text-xs text-muted-foreground">
                  Folosite pentru a urmări vizitatorii pe diferite site-uri
                  pentru a afișa reclame relevante. Include Meta Pixel.
                </p>
              </div>
            </div>

            {/* Social Media Cookies */}
            <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
              <Checkbox
                id="social"
                checked={selectedServices.includes("social")}
                onCheckedChange={() => toggleService("social")}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="social"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Social Media și Marketing
                </label>
                <p className="text-xs text-muted-foreground">
                  Permit funcționalități social media și conținut personalizat
                  pentru marketing.
                </p>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleDecline}>
              Doar Necesare
            </Button>
            <Button onClick={handleSavePreferences}>
              Salvează Preferințele
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
