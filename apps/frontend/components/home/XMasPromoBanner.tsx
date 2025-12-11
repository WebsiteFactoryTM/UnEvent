"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGift, FaX, FaHandSparkles } from "react-icons/fa6";

/**
 * Option 1: Top Banner (Sticky)
 * A subtle banner at the top of the page that stays visible while scrolling
 */
export function XMasPromoBannerTop() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed it before
    const dismissed = localStorage.getItem("xmas-promo-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("xmas-promo-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div className="sticky top-16 z-40 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-primary shrink-0">
              <FaHandSparkles className="h-4 w-4 animate-pulse" />
              <FaGift className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                🎄 Promoție de Crăciun: Câștigă Status Recomandat pe Viață!
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Extragere pe 24 Decembrie - Listează-te acum
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" className="glow-on-hover">
              <Link href="/promotie-de-craciun">Vezi detalii</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDismiss}
              aria-label="Închide"
            >
              <FaX className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Option 2: Floating Banner (Appears after scroll)
 * A floating banner that appears after user scrolls down a bit
 */
export function XMasPromoBannerFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("xmas-promo-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("xmas-promo-dismissed", "true");
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 animate-in slide-in-from-top-2 duration-300 sm:left-auto sm:right-6 sm:max-w-md">
      <div className="glass-card p-4 shadow-lg border-2 border-primary/30">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 text-primary shrink-0 mt-0.5">
            <FaHandSparkles className="h-4 w-4 animate-pulse" />
            <FaGift className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              🎄 Promoție de Crăciun
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Câștigă Status Recomandat pe Viață! Extragere pe 24 Decembrie.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" className="glow-on-hover flex-1">
                <Link href="/promotie-de-craciun">Vezi detalii</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleDismiss}
                aria-label="Închide"
              >
                <FaX className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Option 3: Hero Badge (Integrated into hero)
 * A subtle badge that appears above the main heading
 */
export function XMasPromoBadge() {
  return (
    <Link
      href="/promotie-de-craciun"
      className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 backdrop-blur-sm hover:border-primary/50 hover:from-primary/30 hover:to-primary/30 transition-all duration-300 mb-4 animate-fade-in-up"
    >
      <FaHandSparkles className="h-4 w-4 text-primary animate-pulse" />
      <span className="text-sm font-semibold text-foreground">
        🎄 Promoție de Crăciun
      </span>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Câștigă Status Recomandat pe Viață →
      </span>
    </Link>
  );
}

/**
 * Option 4: Modal Popup (One-time for first visitors)
 * A modal that appears once for new visitors
 */
export function XMasPromoModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("xmas-promo-modal-seen");
    if (!hasSeenModal) {
      // Show after a short delay
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("xmas-promo-modal-seen", "true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card p-6 md:p-8 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30">
              <FaGift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🎄 Promoție de Crăciun</h3>
              <p className="text-sm text-muted-foreground">
                Status Recomandat pe Viață
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Închide"
          >
            <FaX className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Sărbătorește lansarea UN:EVENT! Listează-ți afacerea și intră în
          extragere pentru a câștiga Status Recomandat pe viață. Extragere pe{" "}
          <span className="font-semibold text-foreground">24 Decembrie</span>.
        </p>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Mai târziu
          </Button>
          <Button asChild className="flex-1 glow-on-hover">
            <Link href="/promotie-de-craciun" onClick={handleClose}>
              Vezi detalii
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
