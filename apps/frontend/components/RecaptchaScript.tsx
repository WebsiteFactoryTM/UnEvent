"use client";

import Script from "next/script";

export function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn(
      "[RecaptchaScript] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
    );
    return null;
  }

  // reCAPTCHA Enterprise requires the site key in the URL as ?render=SITE_KEY
  const scriptUrl = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;

  return (
    <Script
      src={scriptUrl}
      strategy="lazyOnload"
      onLoad={() => {
        console.log("[RecaptchaScript] ✅ reCAPTCHA Enterprise script loaded");
      }}
      onError={(e) => {
        console.error(
          "[RecaptchaScript] ❌ Failed to load reCAPTCHA script:",
          e,
        );
      }}
    />
  );
}
