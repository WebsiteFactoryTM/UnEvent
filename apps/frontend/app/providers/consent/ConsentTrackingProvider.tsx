"use client";

import { useEffect } from "react";
import Script from "next/script";
import { ConsentService, useConsent } from "./ConsentContext";

/**
 * ConsentTrackingProvider
 *
 * Loads Google Analytics and Meta Pixel scripts based on user consent.
 * Implements Google Consent Mode v2 for enhanced privacy.
 */
export const ConsentTrackingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { consent, hasConsented } = useConsent();

  const isServiceConsented = (serviceId: ConsentService) =>
    consent.includes(serviceId);

  // Configure Google Consent Mode
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: any[]) {
        window.dataLayer!.push(args);
      };

    // Set default consent state (denied until user accepts)
    if (window.gtag) {
      window.gtag("consent", "default", {
        ad_storage: "denied",
        analytics_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        wait_for_update: 500,
      });

      // Update consent based on user choices
      if (hasConsented) {
        window.gtag("consent", "update", {
          ad_storage: isServiceConsented("tracking") ? "granted" : "denied",
          analytics_storage: isServiceConsented("analytics")
            ? "granted"
            : "denied",
          ad_user_data: isServiceConsented("tracking") ? "granted" : "denied",
          ad_personalization: isServiceConsented("social")
            ? "granted"
            : "denied",
        });
      }
    }
  }, [consent, hasConsented]);

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  // Debug logging for production troubleshooting
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    console.log("[Tracking] Consent state:", {
      hasConsented,
      consent,
      socialConsent: isServiceConsented("social"),
      trackingConsent: isServiceConsented("tracking"),
      analyticsConsent: isServiceConsented("analytics"),
      gaMeasurementId: gaMeasurementId ? "SET" : "NOT_SET",
      fbPixelId: fbPixelId ? "SET" : "NOT_SET",
      willLoadGA: hasConsented && isServiceConsented("analytics") && !!gaMeasurementId,
      willLoadFB: hasConsented && (isServiceConsented("social") || isServiceConsented("tracking")) && !!fbPixelId,
    });
  }, [hasConsented, consent, gaMeasurementId, fbPixelId]);

  return (
    <>
      {/* Google Analytics - Load if analytics consent is given */}
      {hasConsented && isServiceConsented("analytics") && gaMeasurementId && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', {
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {/* Meta/Facebook Pixel - Load if social/tracking consent is given */}
      {hasConsented &&
        (isServiceConsented("social") || isServiceConsented("tracking")) &&
        fbPixelId && (
          <>
            <Script id="facebook-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
                alt="Facebook Pixel"
              />
            </noscript>
          </>
        )}

      {children}
    </>
  );
};
