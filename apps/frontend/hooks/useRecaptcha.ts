"use client";

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      // Enterprise API
      enterprise?: {
        ready: (callback: () => void) => void;
        execute: (
          siteKey: string,
          options: { action: string },
        ) => Promise<string>;
      };
      // Regular v3 API
      ready?: (callback: () => void) => void;
      execute?: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }
}

interface UseRecaptchaReturn {
  executeRecaptcha: (action: string) => Promise<string | null>;
  isReady: boolean;
}

export function useRecaptcha(): UseRecaptchaReturn {
  const [isReady, setIsReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isEnterprise = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE === "true";

  useEffect(() => {
    if (!siteKey) {
      console.warn(
        "[useRecaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
      );
      return;
    }

    const checkRecaptchaReady = () => {
      if (isEnterprise) {
        // Check for Enterprise API
        if (window.grecaptcha?.enterprise) {
          window.grecaptcha.enterprise.ready(() => {
            setIsReady(true);
            console.log("[useRecaptcha] ✅ reCAPTCHA Enterprise ready");
          });
          return true;
        }
      } else {
        // Check for regular v3 API
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(() => {
            setIsReady(true);
            console.log("[useRecaptcha] ✅ reCAPTCHA v3 ready");
          });
          return true;
        }
      }
      return false;
    };

    // Check if grecaptcha is already loaded
    if (checkRecaptchaReady()) {
      return;
    }

    // Poll for grecaptcha to become available
    const pollInterval = setInterval(() => {
      if (checkRecaptchaReady()) {
        clearInterval(pollInterval);
      }
    }, 100);

    // Clear interval after 10 seconds and warn if not loaded
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (!isReady) {
        console.error(
          `[useRecaptcha] ⚠️ reCAPTCHA ${isEnterprise ? "Enterprise" : "v3"} failed to load.`,
        );
        console.error(
          "Troubleshooting: 1) Check if domain is allowed in Google Console 2) Verify NEXT_PUBLIC_RECAPTCHA_ENTERPRISE is set correctly",
        );
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [siteKey, isEnterprise, isReady]);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        console.error(
          "[useRecaptcha] Cannot execute: NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
        );
        return null;
      }

      if (!isReady || !window.grecaptcha) {
        console.error("[useRecaptcha] reCAPTCHA not ready yet");
        return null;
      }

      try {
        let token: string;

        console.log("[useRecaptcha] Executing reCAPTCHA:", {
          action,
          siteKey,
          isEnterprise,
          hasEnterpriseAPI: !!window.grecaptcha?.enterprise,
          hasRegularAPI: !!window.grecaptcha?.execute,
        });

        if (isEnterprise && window.grecaptcha.enterprise) {
          // Use Enterprise API
          console.log("[useRecaptcha] Using Enterprise API");
          token = await window.grecaptcha.enterprise.execute(siteKey, {
            action,
          });
        } else if (!isEnterprise && window.grecaptcha.execute) {
          // Use regular v3 API
          console.log("[useRecaptcha] Using regular v3 API");
          token = await window.grecaptcha.execute(siteKey, {
            action,
          });
        } else {
          console.error("[useRecaptcha] reCAPTCHA API not available");
          return null;
        }

        console.log("[useRecaptcha] ✅ Token received:", {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 50) + "...",
        });

        return token;
      } catch (error) {
        console.error("[useRecaptcha] Failed to execute reCAPTCHA:", error);
        return null;
      }
    },
    [isReady, siteKey, isEnterprise],
  );

  return { executeRecaptcha, isReady };
}
