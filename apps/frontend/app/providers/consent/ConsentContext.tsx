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

/**
 * Validate consent data from localStorage
 * Returns validated data or null if invalid
 */
const validateConsentData = (data: any): ConsentStorage | null => {
  try {
    if (typeof data !== "object" || !Array.isArray(data.services)) {
      return null;
    }

    // Ensure services is an array of valid consent services
    const validServices: ConsentService[] = [
      "necessary",
      "analytics",
      "tracking",
      "social",
    ];
    const services = data.services.filter((service: string) =>
      validServices.includes(service as ConsentService),
    );

    return {
      services: services.length > 0 ? services : ["necessary"],
      timestamp:
        typeof data.timestamp === "number" ? data.timestamp : Date.now(),
      hasConsented:
        typeof data.hasConsented === "boolean" ? data.hasConsented : false,
    };
  } catch {
    return null;
  }
};

export const ConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [consent, setConsent] = useState<ConsentService[]>(["necessary"]); // Always include necessary
  const [hasConsented, setHasConsented] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          const validatedData = validateConsentData(parsedData);

          if (validatedData) {
            setConsent(validatedData.services);
            setHasConsented(validatedData.hasConsented);
          } else {
            console.warn(
              "[Cookie Consent] Invalid stored consent data, resetting",
            );
            localStorage.removeItem(CONSENT_STORAGE_KEY);
          }
        } catch (error) {
          console.error(
            "[Cookie Consent] Failed to parse consent data:",
            error,
          );
          // Clear corrupted data
          localStorage.removeItem(CONSENT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("[Cookie Consent] Failed to access localStorage:", error);
      // If localStorage is unavailable, continue with defaults
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
