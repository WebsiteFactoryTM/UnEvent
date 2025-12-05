"use client";

import Script from "next/script";

export function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isEnterprise = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE === "true";

  if (!siteKey) {
    console.warn(
      "[RecaptchaScript] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured",
    );
    return null;
  }

  // Enterprise v3 (score-based) uses ?render=, just like regular v3
  const baseUrl = isEnterprise
    ? "https://www.google.com/recaptcha/enterprise.js"
    : "https://www.google.com/recaptcha/api.js";

  const scriptUrl = `${baseUrl}?render=${siteKey}`;

  return (
    <Script
      src={scriptUrl}
      strategy="lazyOnload"
      onLoad={() => {
        console.log(
          `[RecaptchaScript] ✅ reCAPTCHA ${isEnterprise ? "Enterprise" : "v3"} script loaded`,
        );
      }}
      onError={(e) => {
        console.error(
          "[RecaptchaScript] ❌ Failed to load reCAPTCHA script:",
          e,
        );
        console.error(
          "Troubleshooting:",
          "\n1. Check if domain is whitelisted in Google Cloud Console",
          "\n2. Verify key type matches NEXT_PUBLIC_RECAPTCHA_ENTERPRISE setting",
          "\n3. For Enterprise, make sure you created a 'Score-based (v3)' key, not 'Checkbox (v2)'",
        );
      }}
    />
  );
}
