"use client";

import { useState, useEffect } from "react";
import { Check, X, Lock } from "lucide-react";
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
  httpOnly?: boolean; // For cookies that can't be read by JavaScript
}

interface CookieCategory {
  title: string;
  description: string;
  color: string;
  cookies: CookieDefinition[];
}

// Embedded cookie definitions - VERIFIED cookies only
const COOKIE_DEFINITIONS: Record<string, CookieCategory> = {
  necessary: {
    title: "Strict necesare",
    description:
      "Asigură funcționarea de bază: autentificare, securitate, gestionare consimțământ.",
    color: "blue",
    cookies: [
      {
        name: "next-auth.session-token",
        provider: "NextAuth.js",
        purpose: "Sesiune autentificare utilizator (development)",
        duration: "30 zile (sau până la logout)",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "__Secure-next-auth.session-token",
        provider: "NextAuth.js",
        purpose: "Sesiune autentificare utilizator (production)",
        duration: "30 zile (sau până la logout)",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "next-auth.csrf-token",
        provider: "NextAuth.js",
        purpose: "Protecție CSRF pentru autentificare (development)",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "__Secure-next-auth.csrf-token",
        provider: "NextAuth.js",
        purpose: "Protecție CSRF pentru autentificare (production)",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "next-auth.callback-url",
        provider: "NextAuth.js",
        purpose: "URL redirecționare după autentificare (development)",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "__Secure-next-auth.callback-url",
        provider: "NextAuth.js",
        purpose: "URL redirecționare după autentificare (production)",
        duration: "Sesiune",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "unevent-cookie-consent",
        provider: "UN:EVENT",
        purpose: "Stochează preferințele de consimțământ cookie",
        duration: "Persistent (până la resetare)",
        type: "1st party",
        storageType: "localStorage",
      },
      {
        name: "payload-token",
        provider: "Payload CMS",
        purpose: "Token autentificare backend CMS",
        duration: "7 zile",
        type: "1st party",
        storageType: "cookie",
        httpOnly: true,
      },
      {
        name: "unevent_session_id",
        provider: "UN:EVENT",
        purpose: "Identificator unic sesiune utilizator pentru analytics",
        duration: "Persistent",
        type: "1st party",
        storageType: "localStorage",
      },
      {
        name: "nextauth.message",
        provider: "NextAuth.js",
        purpose: "Comunicare între taburi pentru sincronizare sesiune",
        duration: "Sesiune",
        type: "1st party",
        storageType: "localStorage",
      },
      {
        name: "lng",
        provider: "UN:EVENT",
        purpose: "Preferință limbă interfață utilizator",
        duration: "6-12 luni",
        type: "1st party",
        storageType: "cookie",
      },
      {
        name: "homeLastChecked",
        provider: "UN:EVENT",
        purpose: "Timestamp ultima verificare pagină principală (cache)",
        duration: "Persistent",
        type: "1st party",
        storageType: "localStorage",
      },
      {
        name: "_vercel_session",
        provider: "Vercel",
        purpose: "Sesiune platformă hosting (preview, toolbar)",
        duration: "Sesiune",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "__vercel_toolbar",
        provider: "Vercel",
        purpose: "Activare toolbar development Vercel",
        duration: "Persistent",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "__vercel_toolbar_injector",
        provider: "Vercel",
        purpose: "Injectare toolbar Vercel în pagină",
        duration: "Persistent",
        type: "3rd party",
        storageType: "cookie",
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
        provider: "Google Analytics 4",
        purpose: "Identificare unică utilizator pentru analiza traficului",
        duration: "24 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_ga_*",
        pattern: "_ga_",
        provider: "Google Analytics 4",
        purpose: "Măsurare trafic & sesiuni pentru property specific",
        duration: "24 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_gid",
        pattern: "_gid",
        provider: "Google Analytics 4",
        purpose: "Identificare sesiune pentru analiza vizitatorilor",
        duration: "24 ore",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_gat",
        pattern: "_gat",
        provider: "Google Analytics 4",
        purpose: "Limitare rată de cereri (throttling)",
        duration: "1 minut",
        type: "3rd party",
        storageType: "cookie",
      },
    ],
  },
  marketing: {
    title: "Marketing",
    description:
      "Remarketing, măsurarea conversiilor și personalizarea reclamelor (ex.: Meta).",
    color: "orange",
    cookies: [
      {
        name: "_fbp",
        pattern: "_fbp",
        provider: "Meta Pixel (Facebook)",
        purpose: "Browser ID pentru remarketing și măsurare conversii",
        duration: "3 luni",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "_fbc",
        pattern: "_fbc",
        provider: "Meta Pixel (Facebook)",
        purpose: "Click ID pentru tracking conversii din Facebook ads",
        duration: "7 zile",
        type: "3rd party",
        storageType: "cookie",
      },
      {
        name: "fr",
        pattern: "fr",
        provider: "Meta Pixel (Facebook)",
        purpose: "Remarketing și targetare ads personalizate",
        duration: "3 luni",
        type: "3rd party",
        storageType: "cookie",
      },
    ],
  },
};

interface DetectedCookie {
  name: string;
  value: string;
  isKnown: boolean;
}

export function CookieDetectionTable() {
  const [activeCookies, setActiveCookies] = useState<string[]>([]);
  const [activeLocalStorage, setActiveLocalStorage] = useState<string[]>([]);
  const [allDetectedCookies, setAllDetectedCookies] = useState<
    DetectedCookie[]
  >([]);
  const [allDetectedLocalStorage, setAllDetectedLocalStorage] = useState<
    { key: string; value: string }[]
  >([]);
  const { consent } = useConsent();

  // Detect cookies from browser
  useEffect(() => {
    const detectCookies = () => {
      if (typeof window === "undefined") return;

      // Get all cookies from document.cookie with values
      const cookieString = document.cookie;

      const cookies = cookieString.split(";").map((c) => c.trim());

      const cookieData: DetectedCookie[] = cookies
        .filter((c) => c.length > 0)
        .map((c) => {
          const [name, ...valueParts] = c.split("=");
          const value = valueParts.join("=");
          const isKnown = isKnownCookie(name.trim());
          return { name: name.trim(), value: value || "", isKnown };
        });

      const cookieNames = cookieData.map((c) => c.name);
      setActiveCookies(cookieNames);
      setAllDetectedCookies(cookieData);

      // Check localStorage
      const localStorageKeys: string[] = [];
      const localStorageData: { key: string; value: string }[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localStorageKeys.push(key);
            const value = localStorage.getItem(key);
            localStorageData.push({ key, value: value || "" });
          }
        }
      } catch (e) {
        console.error("[Cookie Detection] localStorage access denied:", e);
      }
      setActiveLocalStorage(localStorageKeys);
      setAllDetectedLocalStorage(localStorageData);
    };

    detectCookies();

    // Re-detect when consent changes (cookies may be added/removed)
    const interval = setInterval(detectCookies, 2000);
    return () => clearInterval(interval);
  }, [consent]);

  // Check if a cookie is in our known definitions
  const isKnownCookie = (cookieName: string): boolean => {
    for (const category of Object.values(COOKIE_DEFINITIONS)) {
      for (const cookie of category.cookies) {
        const pattern = cookie.pattern || cookie.name;
        // Match both ways: exact match or pattern is contained in name
        if (
          cookieName === pattern ||
          cookieName.includes(pattern) ||
          pattern.includes(cookieName)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if a cookie is active - improved matching
  const isCookieActive = (cookieDef: CookieDefinition): boolean => {
    const pattern = cookieDef.pattern || cookieDef.name;

    // Check cookies
    if (cookieDef.storageType !== "localStorage") {
      const found = activeCookies.some((name) => {
        // Exact match
        if (name === pattern) return true;
        // Pattern matches (for wildcards like _ga_*)
        if (name.includes(pattern)) return true;
        // Handle __Secure- prefix (production NextAuth cookies)
        if (name.includes(pattern.replace(/^__Secure-/, ""))) return true;
        if (pattern.includes(name)) return true;
        return false;
      });
      if (found) return true;
    }

    // Check localStorage
    if (
      cookieDef.storageType === "localStorage" ||
      cookieDef.storageType === "both"
    ) {
      const found = activeLocalStorage.some((key) => {
        // Exact match or contains pattern
        return (
          key === pattern || key.includes(pattern) || pattern.includes(key)
        );
      });
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
                    className={
                      cookie.httpOnly
                        ? "bg-blue-500/5"
                        : isActive
                          ? "bg-green-500/5"
                          : "opacity-60"
                    }
                  >
                    <td className="p-2 sm:p-3">
                      <div className="flex items-center justify-center">
                        {cookie.httpOnly ? (
                          <Lock
                            className="h-4 w-4 text-blue-500"
                            name="Cookie HttpOnly - nu poate fi detectat de JavaScript (securitate)"
                          />
                        ) : isActive ? (
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

  // Get unknown cookies (detected but not in definitions)
  const unknownCookies = allDetectedCookies.filter((c) => !c.isKnown);
  const unknownLocalStorage = allDetectedLocalStorage.filter(
    (item) => !isKnownCookie(item.key),
  );

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-3">
          <strong>Notă:</strong> Tabelele de mai jos afișează cookie-urile
          folosite pe site, cu detectare în timp real acolo unde este posibil.
        </p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
            <span>
              <strong>Activ</strong> - Cookie-ul este detectat în browserul dvs.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <X className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <span>
              <strong>Inactiv</strong> - Cookie-ul nu este prezent (fie nu este
              activat, fie nu ați dat consimțământ pentru categoria respectivă)
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
            <span>
              <strong>HttpOnly (Securizat)</strong> - Cookie-ul nu poate fi
              detectat de JavaScript pentru protecție împotriva atacurilor XSS.
              Aceste cookie-uri sunt prezente când sunteți autentificat, dar nu
              pot fi verificate din motive de securitate.
            </span>
          </div>
        </div>
      </div>

      {Object.entries(COOKIE_DEFINITIONS).map(([key, category]) =>
        renderCategoryTable(key, category),
      )}

      {/* Debug Section - All Detected Cookies */}
      {(unknownCookies.length > 0 || unknownLocalStorage.length > 0) && (
        <div className="space-y-3">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Cookie-uri detectate nedocumentate
            </h3>
            <p className="text-sm text-foreground/80 mb-4">
              Aceste cookie-uri au fost detectate în browserul dvs. dar nu sunt
              încă documentate în lista de mai sus. Pot proveni de la terți sau
              servicii noi adăugate.
            </p>
          </div>

          {unknownCookies.length > 0 && (
            <div className="overflow-x-auto">
              <h4 className="text-sm font-semibold mb-2">
                Cookie-uri HTTP ({unknownCookies.length})
              </h4>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 sm:p-3 font-semibold">Nume</th>
                    <th className="text-left p-2 sm:p-3 font-semibold">
                      Valoare (preview)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unknownCookies.map((cookie, index) => (
                    <tr
                      key={`unknown-cookie-${index}`}
                      className="bg-yellow-500/5"
                    >
                      <td className="p-2 sm:p-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {cookie.name}
                        </code>
                      </td>
                      <td className="p-2 sm:p-3">
                        <code className="text-xs text-muted-foreground truncate block max-w-md">
                          {cookie.value.substring(0, 50)}
                          {cookie.value.length > 50 ? "..." : ""}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {unknownLocalStorage.length > 0 && (
            <div className="overflow-x-auto">
              <h4 className="text-sm font-semibold mb-2">
                localStorage ({unknownLocalStorage.length})
              </h4>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 sm:p-3 font-semibold">Key</th>
                    <th className="text-left p-2 sm:p-3 font-semibold">
                      Valoare (preview)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unknownLocalStorage.map((item, index) => (
                    <tr key={`unknown-ls-${index}`} className="bg-yellow-500/5">
                      <td className="p-2 sm:p-3">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {item.key}
                        </code>
                      </td>
                      <td className="p-2 sm:p-3">
                        <code className="text-xs text-muted-foreground truncate block max-w-md">
                          {item.value.substring(0, 50)}
                          {item.value.length > 50 ? "..." : ""}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {allDetectedCookies.length}
            </div>
            <div className="text-xs text-muted-foreground">Cookie-uri HTTP</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">
              {allDetectedLocalStorage.length}
            </div>
            <div className="text-xs text-muted-foreground">localStorage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {allDetectedCookies.filter((c) => c.isKnown).length +
                allDetectedLocalStorage.filter((item) =>
                  isKnownCookie(item.key),
                ).length}
            </div>
            <div className="text-xs text-muted-foreground">Documentate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {unknownCookies.length + unknownLocalStorage.length}
            </div>
            <div className="text-xs text-muted-foreground">Nedocumentate</div>
          </div>
        </div>
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
