"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useConsent } from "@/app/providers/consent";

/**
 * CookieDetectionTable
 *
 * Detects cookies from the browser and displays them in categorized tables
 * with indicators showing which cookies are currently active.
 */

interface CookieDefinition {
  name: string;
  pattern?: string; // For wildcard matching like _ga_*
  provider: string;
  purpose: string;
  duration: string;
  type: string;
  storageType?: "cookie" | "localStorage" | "both";
}

interface CookieCategory {
  title: string;
  description: string;
  color: string;
  cookies: CookieDefinition[];
}

// Embedded cookie definitions
const COOKIE_DEFINITIONS: Record<string, CookieCategory> = {
  necessary: {
    title: "Strict necesare",
    description:
      "Asigură funcționarea de bază: autentificare, securitate, anti-fraudă, încărcare pagini, gestionare consimțământ.",
    color: "blue",
    cookies: [
      {
        name: "next-auth.session-token",
        provider: "UN:EVENT",
        purpose: "Sesiune login, menținere stare utilizator",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
      },
      {
        name: "__Secure-next-auth.session-token",
        provider: "UN:EVENT",
        purpose: "Sesiune login securizată (producție)",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
      },
      {
        name: "unevent-cookie-consent",
        provider: "UN:EVENT",
        purpose: "Reținere opțiuni consimțământ",
        duration: "Persistent",
        type: "1st party",
        storageType: "localStorage",
      },
      {
        name: "__cf_bm",
        provider: "Cloudflare",
        purpose: "Anti-bot/anti-abuz, performanță",
        duration: "Până la 30 min",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "__Secure-next-auth.callback-url",
        provider: "UN:EVENT",
        purpose: "URL de redirecționare după autentificare",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
      },
      {
        name: "__Secure-next-auth.csrf-token",
        provider: "UN:EVENT",
        purpose: "Protecție CSRF pentru formulare",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
      },
    ],
  },
  preferences: {
    title: "Preferințe",
    description: "Rețin opțiuni precum limbă, oraș, sortări, filtre.",
    color: "purple",
    cookies: [
      {
        name: "ue_city",
        provider: "UN:EVENT",
        purpose: "Reține orașul preferat/detectat",
        duration: "1–6 luni",
        type: "1st party",
        storageType: "both",
      },
      {
        name: "ue_lang",
        provider: "UN:EVENT",
        purpose: "Reține limba interfeței",
        duration: "6–12 luni",
        type: "1st party",
        storageType: "both",
      },
    ],
  },
  analytics: {
    title: "Statistici/Analitice",
    description:
      "Măsoară traficul și performanța (ex.: Google Analytics). Datele sunt agregate/anonimizate pe cât posibil.",
    color: "cyan",
    cookies: [
      {
        name: "_ga",
        pattern: "_ga",
        provider: "Google Analytics",
        purpose: "Identificare unică utilizator",
        duration: "24 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_ga_*",
        pattern: "_ga_",
        provider: "Google Analytics",
        purpose: "Măsurare trafic & sesiuni (property-specific)",
        duration: "24 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_gid",
        pattern: "_gid",
        provider: "Google Analytics",
        purpose: "Identificare sesiune",
        duration: "24 ore",
        type: "3rd party",
        storageType: "cookie",
      },
    ],
  },
  marketing: {
    title: "Marketing",
    description:
      "Remarketing, măsurarea conversiilor și personalizarea reclamelor (ex.: Meta, TikTok).",
    color: "orange",
    cookies: [
      {
        name: "_fbp",
        pattern: "_fbp",
        provider: "Meta (Facebook)",
        purpose: "Pixel Facebook - remarketing & conversii",
        duration: "3 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_fbc",
        pattern: "_fbc",
        provider: "Meta (Facebook)",
        purpose: "Pixel Facebook - tracking conversii click",
        duration: "24 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "fr",
        pattern: "fr",
        provider: "Meta (Facebook)",
        purpose: "Remarketing Facebook",
        duration: "3 luni",
        type: "3rd party",
        storageType: "cookie",
      },
    ],
  },
};

export function CookieDetectionTable() {
  const [activeCookies, setActiveCookies] = useState<string[]>([]);
  const [activeLocalStorage, setActiveLocalStorage] = useState<string[]>([]);
  const { consent } = useConsent();

  // Detect cookies from browser
  useEffect(() => {
    const detectCookies = () => {
      if (typeof window === "undefined") return;

      // Get all cookies from document.cookie
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const cookieNames = cookies.map((c) => c.split("=")[0]);
      setActiveCookies(cookieNames);

      // Check localStorage
      const localStorageKeys: string[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) localStorageKeys.push(key);
        }
      } catch (e) {
        // localStorage access denied
      }
      setActiveLocalStorage(localStorageKeys);
    };

    detectCookies();

    // Re-detect when consent changes (cookies may be added/removed)
    const interval = setInterval(detectCookies, 2000);
    return () => clearInterval(interval);
  }, [consent]);

  // Check if a cookie is active
  const isCookieActive = (cookieDef: CookieDefinition): boolean => {
    const pattern = cookieDef.pattern || cookieDef.name;

    // Check cookies
    if (cookieDef.storageType !== "localStorage") {
      const found = activeCookies.some((name) => name.includes(pattern));
      if (found) return true;
    }

    // Check localStorage
    if (
      cookieDef.storageType === "localStorage" ||
      cookieDef.storageType === "both"
    ) {
      const found = activeLocalStorage.some((key) => key.includes(pattern));
      if (found) return true;
    }

    return false;
  };

  const renderCategoryTable = (
    categoryKey: string,
    category: CookieCategory,
  ) => {
    return (
      <div key={categoryKey} className="space-y-3">
        <div
          className={`bg-${category.color}-500/10 border border-${category.color}-500/20 rounded-lg p-4 sm:p-6`}
        >
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
            {category.title}
          </h3>
          <p className="text-sm text-foreground/80 mb-4">
            {category.description}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 sm:p-3 font-semibold">Status</th>
                <th className="text-left p-2 sm:p-3 font-semibold">Nume</th>
                <th className="text-left p-2 sm:p-3 font-semibold">Furnizor</th>
                <th className="text-left p-2 sm:p-3 font-semibold">Scop</th>
                <th className="text-left p-2 sm:p-3 font-semibold">Durată</th>
                <th className="text-left p-2 sm:p-3 font-semibold">Tip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {category.cookies.map((cookie, index) => {
                const isActive = isCookieActive(cookie);
                return (
                  <tr
                    key={`${categoryKey}-${index}`}
                    className={isActive ? "bg-green-500/5" : "opacity-60"}
                  >
                    <td className="p-2 sm:p-3">
                      <div className="flex items-center justify-center">
                        {isActive ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {cookie.name}
                      </code>
                    </td>
                    <td className="p-2 sm:p-3">{cookie.provider}</td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      {cookie.purpose}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">{cookie.duration}</td>
                    <td className="p-2 sm:p-3 text-xs">
                      <span className="inline-block px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {cookie.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {categoryKey !== "necessary" && (
          <p className="text-xs text-muted-foreground mt-2">
            * Cookie-urile sunt activate doar dacă ați dat consimțământ pentru
            această categorie
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Notă:</strong> Tabelele de mai jos afișează cookie-urile
          detectate în timp real în browserul dvs. Cookie-urile marcate cu{" "}
          <Check className="inline h-3 w-3 text-green-500" /> sunt active în
          acest moment. Cookie-urile marcate cu{" "}
          <X className="inline h-3 w-3 text-muted-foreground" /> nu sunt
          prezente (fie nu sunt activate, fie nu ați dat consimțământ pentru
          categoria respectivă).
        </p>
      </div>

      {Object.entries(COOKIE_DEFINITIONS).map(([key, category]) =>
        renderCategoryTable(key, category),
      )}

      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          <strong>Actualizare automată:</strong> Această listă se actualizează
          automat pentru a reflecta cookie-urile prezente în browserul dvs.
          Pentru a vedea modificări, acceptați sau respingeți diferite categorii
          de cookie-uri din banner-ul de consimțământ.
        </p>
      </div>
    </div>
  );
}
