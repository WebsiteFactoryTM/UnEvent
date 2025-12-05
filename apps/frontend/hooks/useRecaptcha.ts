"use client";

import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (
          siteKey: string,
          options: { action: string },
        ) => Promise<string>;
      };
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

  useEffect(() => {
    if (!siteKey) {
      console.warn(
        "[useRecaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
      );
      return;
    }

    // Check if grecaptcha is already loaded
    if (window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.ready(() => {
        setIsReady(true);
      });
    } else {
      // Poll for grecaptcha to become available
      const pollInterval = setInterval(() => {
        if (window.grecaptcha?.enterprise) {
          clearInterval(pollInterval);
          window.grecaptcha.enterprise.ready(() => {
            setIsReady(true);
          });
        }
      }, 100);

      // Clear interval after 10 seconds and warn if not loaded
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        if (!window.grecaptcha?.enterprise) {
          console.error(
            "[useRecaptcha] ⚠️ reCAPTCHA failed to load. Make sure localhost is added to allowed domains in Google Cloud Console.",
          );
        }
      }, 10000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [siteKey]);

  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!siteKey) {
        console.error(
          "[useRecaptcha] Cannot execute: NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
        );
        return null;
      }

      if (!isReady || !window.grecaptcha?.enterprise) {
        console.error("[useRecaptcha] reCAPTCHA not ready yet");
        return null;
      }

      try {
        const token = await window.grecaptcha.enterprise.execute(siteKey, {
          action,
        });
        return token;
      } catch (error) {
        console.error("[useRecaptcha] Failed to execute reCAPTCHA:", error);
        return null;
      }
    },
    [isReady, siteKey],
  );

  return { executeRecaptcha, isReady };
}
