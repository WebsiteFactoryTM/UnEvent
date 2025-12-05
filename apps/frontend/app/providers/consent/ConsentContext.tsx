"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Consent Context
 *
 * Custom lightweight consent management solution using localStorage.
 * GDPR-compliant with persistent user choices.
 */

export type ConsentService = "necessary" | "analytics" | "tracking" | "social";

interface ConsentContextType {
  consent: ConsentService[];
  hasConsented: boolean;
  acceptAll: () => void;
  declineAll: () => void;
  acceptSelected: (services: ConsentService[]) => void;
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const CONSENT_STORAGE_KEY = "unevent-cookie-consent";

interface ConsentStorage {
  services: ConsentService[];
  timestamp: number;
  hasConsented: boolean;
}

export const ConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [consent, setConsent] = useState<ConsentService[]>(["necessary"]); // Always include necessary
  const [hasConsented, setHasConsented] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      try {
        const data: ConsentStorage = JSON.parse(stored);
        setConsent(data.services);
        setHasConsented(data.hasConsented);
      } catch (error) {
        console.error("[Cookie Consent] Failed to parse consent data:", error);
      }
    }
  }, []);

  const saveConsent = (services: ConsentService[], consented: boolean) => {
    const data: ConsentStorage = {
      services,
      timestamp: Date.now(),
      hasConsented: consented,
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(data));
    setConsent(services);
    setHasConsented(consented);
  };

  const acceptAll = () => {
    saveConsent(["necessary", "analytics", "tracking", "social"], true);
  };

  const declineAll = () => {
    saveConsent(["necessary"], true);
  };

  const acceptSelected = (services: ConsentService[]) => {
    // Always include necessary
    const servicesWithNecessary: ConsentService[] = services.includes(
      "necessary",
    )
      ? services
      : ["necessary", ...services];
    saveConsent(servicesWithNecessary, true);
  };

  const resetConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setConsent(["necessary"]);
    setHasConsented(false);
  };

  return (
    <ConsentContext.Provider
      value={{
        consent,
        hasConsented,
        acceptAll,
        declineAll,
        acceptSelected,
        resetConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
};
