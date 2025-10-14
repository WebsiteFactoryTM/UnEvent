**UN:EVENT — Tech Checklist pentru Ads (Meta, TikTok, Google)**

*Stack: Next.js (App Router) \+ TypeScript \+ Payload CMS*

————————————————————————————————————————

**1\) Evenimente standardizate (naming & schema)**

* Definește un „event contract” (tipuri \+ payload) și folosește aceleași nume peste tot (GTM, Pixel, TikTok, GA4, server).  
* Navigation & content: page\_view (path, title, referrer), search\_used (city, type, date, results\_count), listing\_view (listing\_id, type, city), filter\_use (filters\[\]).  
* Engagement: contact\_click (listing\_id, method: phone | email | message), message\_sent (listing\_id), save\_listing, share\_listing.  
* Growth/Monetizare: signup\_host, listing\_published / listing\_completed, upgrade\_view / upgrade\_start / upgrade\_success (plan, billing, value).  
* În TS, fă un tip comun și un dispatcher (client & server) ca să previi typo-uri.

**2\) Consent & încărcare tag-uri (GDPR / RO)**

* Implementare Google Consent Mode v2 (ad\_storage, analytics\_storage, ad\_personalization, ad\_user\_data).  
* Meta/TikTok încărcate numai după accept (și trimite server-side fallback pentru conversii critice).  
* Salvează starea consimțământului și propagă-o către GTM/Pixel/TikTok.  
* Deduplicare: folosește event\_id comun între client (pixel) și server (CAPI/Events API).

**3\) SPA tracking (Next.js App Router)**

* Ascultă schimbările de rută și trimite page\_view către GA4, Meta (PageView) și TikTok (Browse/ViewContent).  
* Dacă folosești GTM, activează History/Location Change trigger (Single Page Applications).  
* Snippet (client): vezi secțiunea de cod mai jos.

**4\) CAPI / Events API (server-side)**

* Trimite server-side events pentru upgrade\_success, listing\_published, message\_sent din route handlers/server actions.  
* Dedup: generează event\_id (UUID) pe server, include-l și în client la același eveniment.  
* Meta CAPI: Purchase cu event\_id comun; include advanced matching (email/phone SHA-256), client\_user\_agent, client\_ip\_address.  
* Integrează similar TikTok Events API și GA4 Measurement Protocol pentru server-side purchase/generate\_lead.

**5\) Atribuție, UTM & first‑party storage**

* Capturează UTM-uri, gclid, fbclid, ttclid la prima vizită (după consent) și salvează first-party (cookie SameSite=Lax \+ fallback localStorage).  
* Stochează session\_id \+ sursa atribuită; atașează-le la evenimentele de conversie.  
* Taie UTM-urile din URL după captură (UX/SEO), dar păstrează-le în storage.

**6\) Payload CMS — webhooks & audit**

* Webhooks pe Users, Listings, Subscriptions/Orders → trimite evenimente către un queue (Redis/BullMQ) → CAPI/Events API.  
* Event log în Payload (collection TrackingEvents) cu event\_name, event\_id, status, retries.  
* Normalizează denumirile (aceleași ca în secți. 1\) pentru rapoarte coerente.

**7\) SEO & social previews**

* OpenGraph per listing (titlu, descriere, imagine 1200×630; păstrează și 1080×1920 ca asset social).  
* Schema.org/Event/LocalBusiness pentru listări & evenimente.  
* Canonical corect; noindex pentru pagini de sistem unde e cazul.

**8\) Performance & UX (impact pe ROAS)**

* Defer/async pentru scripturi de tracking, dar respectă evenimentele critice după consent.  
* Optimizează Core Web Vitals (ISR la listing pages, lazy-load media).  
* Trimite evenimentul de contact\_click înainte de navigare (navigator.sendBeacon).

**9\) Advanced Matching & iOS/ATT**

* Pentru utilizatori logați, trimite hashed email (SHA-256) către Meta/TikTok (după consent).  
* Pe iOS/ATT, așteaptă acceptul marketing cookies; CAPI rămâne fallback.

**10\) Guardrails & debugging**

* Folosește Test Events (Meta/TikTok) și DebugView (GA4) înainte de live.  
* Verifică deduplicarea pe Meta (Received from Browser & Server).  
* Retry server-side cu backoff pentru apelurile către APIs.  
* Feature flags pentru a opri rapid trackingul unei platforme dacă e incident.

**Ordinea practică de implementare (1–2 zile)**

* Consent Manager \+ GTM (Consent Mode v2) → Pixel Meta/TikTok după accept.  
* AnalyticsProvider (SPA pageviews) \+ dataLayer global.  
* Event contract TypeScript \+ util track(eventName, payload).  
* Server endpoints pentru CAPI/Events API (Meta/TikTok/GA4) cu event\_id dedup.  
* UTM capture \+ first-party storage \+ atașare la conversii.  
* Payload webhooks (listing\_published, upgrade\_success) → queue → CAPI.  
* OG/Schema pe paginile de listing & event.

**Fragmente de cod (exemple)**

// AnalyticsProvider (client) – Next.js App Router  
'use client';  
import { useEffect } from 'react';  
import { usePathname, useSearchParams } from 'next/navigation';

export default function AnalyticsProvider() {  
  const pathname \= usePathname();  
  const search \= useSearchParams();

  useEffect(() \=\> {  
    const url \= pathname \+ (search?.toString() ? \`?${search}\` : '');  
    window.gtag?.('event', 'page\_view', { page\_location: url });  
    window.fbq?.('track', 'PageView');  
    window.ttq?.instance?.track?.('Browse'); // sau ttq.track('ViewContent')  
    window.dataLayer?.push({ event: 'page\_view', page\_location: url });  
  }, \[pathname, search\]);

  return null;  
}

// Meta CAPI helper (server) – exemplu minimal  
import crypto from 'crypto';

export async function sendMetaPurchase({ eventId, email, value, currency \= 'RON', ip, ua }) {  
  const hashedEmail \= email ? crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex') : undefined;  
  const payload \= {  
    data: \[{  
      event\_name: 'Purchase',  
      event\_time: Math.floor(Date.now() / 1000),  
      event\_id: eventId,  
      action\_source: 'website',  
      user\_data: {  
        em: hashedEmail ? \[hashedEmail\] : undefined,  
        client\_ip\_address: ip,  
        client\_user\_agent: ua,  
      },  
      custom\_data: { value, currency },  
    }\],  
  };

  await fetch(\`https://graph.facebook.com/v20.0/${process.env.META\_PIXEL\_ID}/events?access\_token=${process.env.META\_ACCESS\_TOKEN}\`, {  
    method: 'POST',  
    headers: { 'Content-Type': 'application/json' },  
    body: JSON.stringify(payload),  
  });  
}

// Click-to-contact – trimite înainte de navigare  
function contactClick(listingId, method) {  
  window.dataLayer?.push({ event: 'contact\_click', listing\_id: listingId, method });  
  window.fbq?.('trackCustom', 'ContactClick', { listing\_id: listingId, method });  
  window.ttq?.track?.('ClickButton', { content\_id: listingId });  
  navigator.sendBeacon?.('/api/track', JSON.stringify({ event: 'contact\_click', listingId, method }));  
}