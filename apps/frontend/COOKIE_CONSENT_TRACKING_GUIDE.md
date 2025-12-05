# Cookie Consent & Tracking Implementation Guide

## Overview

This guide extracts the cookie consent and tracking implementation from the ScarInfluence project to help you implement Google Analytics and Meta Pixel (Facebook) tracking with consent management in your new Next.js project.

**Key Features:**
- ✅ GDPR-compliant cookie consent banner
- ✅ Client-side tracking (browser-based)
- ✅ Google Analytics 4 with Consent Mode
- ✅ Meta/Facebook Pixel
- ✅ Consent choices saved in localStorage
- ✅ TypeScript support

---

## Table of Contents

1. [Dependencies](#1-dependencies)
2. [Provider Structure](#2-provider-structure)
3. [Cookie Consent Banner](#3-cookie-consent-banner)
4. [Consent-Based Script Loading](#4-consent-based-script-loading)
5. [Tracking Events Provider](#5-tracking-events-provider)
6. [Client-Side Tracking Methods](#6-client-side-tracking-methods)
7. [Usage in Components](#7-usage-in-components)
8. [Event Mapping](#8-event-mapping)
9. [Environment Variables](#9-environment-variables)
10. [Complete Integration](#10-complete-integration)

---

## 1. Dependencies

### Install Required Package

```bash
npm install react-hook-consent
```

### Package.json Reference

```json
{
  "dependencies": {
    "react-hook-consent": "^3.5.3",
    "next": "^14.2.17",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

## 2. Provider Structure

### Folder Structure

```
your-project/
├── app/
│   ├── providers/
│   │   ├── index.tsx                    # Main provider wrapper
│   │   ├── ConsentTrackingProvider.tsx  # Script loader
│   │   └── TrackingEventsProvider.tsx   # Event tracking context
│   ├── components/
│   │   └── CookieBanner.tsx            # Cookie consent UI
│   ├── lib/
│   │   └── tracking/
│   │       ├── google.ts               # Google Analytics methods
│   │       ├── meta.ts                 # Meta Pixel methods
│   │       └── types.ts                # TypeScript types
│   └── layout.tsx                      # Root layout
```

### Main Providers Wrapper

**File: `app/providers/index.tsx`**

```typescript
'use client'

import React from 'react'
import { ConsentProvider } from 'react-hook-consent'
import { ConsentTrackingProvider } from './ConsentTrackingProvider'
import { TrackingEventsProvider } from './TrackingEventsProvider'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ConsentProvider
      options={{
        services: [
          { id: 'necessary', name: 'Cookie-uri necesare', mandatory: true },
          { id: 'analytics', name: 'Analytics', mandatory: false },
          { id: 'tracking', name: 'Tracking and Advertising', mandatory: false },
          { id: 'social', name: 'Social Media and Marketing', mandatory: false },
        ],
        theme: 'dark',
      }}
    >
      <ConsentTrackingProvider>
        <TrackingEventsProvider>
          {children}
        </TrackingEventsProvider>
      </ConsentTrackingProvider>
    </ConsentProvider>
  )
}
```

**Integration in Root Layout:**

**File: `app/layout.tsx`**

```typescript
import { Providers } from './providers'
import CookieBanner from './components/CookieBanner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
```

---

## 3. Cookie Consent Banner

### Banner Component

**File: `app/components/CookieBanner.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { ConsentBanner } from 'react-hook-consent'
import 'react-hook-consent/dist/styles/style.css' // Import default styles

const CookieBanner = () => (
  <ConsentBanner
    settings={{
      hidden: false,
      label: <span className="p-2">Settings</span>,
      modal: {
        approve: { label: 'Approve Selection' },
        decline: { label: 'Only Necessary' },
        approveAll: { label: 'Accept All' },
        title: 'Manage Cookie Preferences',
        description: (
          <div className="text-sm">
            <p className="font-semibold">Available Options:</p>
            <ul>
              <li>
                <b>Strictly Necessary:</b> Essential cookies for site functionality,
                such as authentication and session management.
              </li>
              <li>
                <b>Analytics:</b> Help us understand how visitors interact with our
                website by collecting and reporting information anonymously.
              </li>
              <li>
                <b>Tracking and Advertising:</b> Used to track visitors across websites
                to display relevant advertisements.
              </li>
              <li>
                <b>Social Media:</b> Enable social media features and personalized content.
              </li>
            </ul>
          </div>
        ),
      },
    }}
    approve={{ label: <span className="p-2">Accept All</span> }}
    decline={{ label: <span className="p-2">Decline</span> }}
  >
    <div className="text-xs">
      <h5>This website uses cookies</h5>
      <p>
        We use cookies to provide you with a personalized experience, analyze traffic,
        and deliver relevant content. You can choose to accept all cookies or customize
        your preferences. You can modify or revoke your consent at any time through settings.
      </p>
      For more details, please see our{' '}
      <Link href="/privacy-policy">Privacy Policy</Link> and{' '}
      <Link href="/cookie-policy">Cookie Policy</Link>
    </div>
  </ConsentBanner>
)

export default CookieBanner
```

### Custom Styling (Optional)

Add custom CSS to override default styles:

```css
/* app/globals.css or component styles */
.react-hook-consent-banner {
  background: rgba(0, 0, 0, 0.95);
  padding: 1.5rem;
}

.react-hook-consent-banner button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
```

---

## 4. Consent-Based Script Loading

### ConsentTrackingProvider Component

**File: `app/providers/ConsentTrackingProvider.tsx`**

```typescript
'use client'

import { useConsent } from 'react-hook-consent'
import Script from 'next/script'
import { useEffect } from 'react'

export const ConsentTrackingProvider = ({ children }) => {
  const { consent } = useConsent()
  
  const isServiceConsented = (serviceId: string) => consent.includes(serviceId)

  // Configure Google Consent Mode
  const configureGoogleConsent = () => {
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments)
    }
    
    // Update Google Consent Mode based on user consent
    window.gtag('consent', 'default', {
      ad_storage: isServiceConsented('tracking') ? 'granted' : 'denied',
      analytics_storage: isServiceConsented('analytics') ? 'granted' : 'denied',
      ad_user_data: isServiceConsented('tracking') ? 'granted' : 'denied',
      ad_personalization: isServiceConsented('social') ? 'granted' : 'denied',
      wait_for_update: 500,
    })
  }

  // Run configureGoogleConsent when consent changes
  useEffect(() => {
    configureGoogleConsent()
  }, [consent])

  return (
    <>
      {/* Google Analytics - Load if analytics consent is given */}
      {consent && isServiceConsented('analytics') && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                anonymize_ip: true
              });
            `}
          </Script>

          {/* Google Tag Manager (Optional) */}
          <Script id="gtm-head" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel - Load if social/tracking consent is given */}
      {consent && (isServiceConsented('social') || isServiceConsented('tracking')) && (
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
              fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
              alt="Facebook Pixel"
            />
          </noscript>
        </>
      )}

      {children}
    </>
  )
}
```

---

## 5. Tracking Events Provider

### Context Provider for Unified Tracking

**File: `app/providers/TrackingEventsProvider.tsx`**

```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useConsent } from 'react-hook-consent'
import {
  trackGooglePageView,
  trackGoogleEvent,
  trackGoogleViewContent,
  trackGoogleSearch,
  trackGoogleLead,
} from '../lib/tracking/google'
import {
  trackMetaPageView,
  trackMetaEvent,
  trackMetaViewContent,
  trackMetaSearch,
  trackMetaLead,
} from '../lib/tracking/meta'

// Define Custom Data Type
interface CustomData {
  currency?: string
  value?: number
  content_name?: string
  content_category?: string
  content_ids?: string[]
  contents?: Array<{ id: string; quantity: number; item_price?: number }>
  num_items?: number
  search_string?: string
  [key: string]: any // Allow additional properties
}

// Define Event Types
type EventType =
  | 'pageView'
  | 'viewContent'
  | 'search'
  | 'lead'
  | 'addToFavorites'
  | 'addListing'
  | 'contactClick'
  | 'filterSearch'
  | 'custom'

interface TrackingEventsContextType {
  trackEvent: (
    eventType: EventType,
    eventName?: string,
    customData?: CustomData,
  ) => void
  isTrackingAllowed: () => boolean
}

const TrackingEventsContext = createContext<TrackingEventsContextType | undefined>(undefined)

interface Props {
  children: React.ReactNode
}

export const TrackingEventsProvider: React.FC<Props> = ({ children }) => {
  const { consent } = useConsent()

  // Determine if tracking is allowed based on consent
  const isTrackingAllowed = () => {
    return consent.includes('tracking') || consent.includes('social') || consent.includes('analytics')
  }

  // Track initial page view
  useEffect(() => {
    if (isTrackingAllowed()) {
      const sourceUrl = window.location.href
      trackGooglePageView(sourceUrl)
      trackMetaPageView()
    }
  }, [consent])

  // Unified function to track events
  const trackEvent = (
    eventType: EventType,
    eventName?: string,
    customData?: CustomData,
  ) => {
    if (!isTrackingAllowed()) return

    const sourceUrl = window.location.href

    switch (eventType) {
      case 'pageView':
        trackGooglePageView(sourceUrl)
        trackMetaPageView()
        break

      case 'viewContent':
        trackGoogleViewContent(sourceUrl, customData)
        trackMetaViewContent(customData)
        break

      case 'search':
        trackGoogleSearch(sourceUrl, customData?.search_string || '')
        trackMetaSearch(customData?.search_string || '')
        break

      case 'lead':
        trackGoogleLead(sourceUrl)
        trackMetaLead()
        break

      case 'addToFavorites':
        trackGoogleEvent('add_to_wishlist', customData)
        trackMetaEvent('AddToWishlist', customData)
        break

      case 'addListing':
        trackGoogleEvent('add_listing', customData)
        trackMetaEvent('SubmitApplication', customData) // or custom event
        break

      case 'contactClick':
        trackGoogleEvent('contact', { method: eventName, ...customData })
        trackMetaEvent('Contact', { contact_type: eventName, ...customData })
        break

      case 'filterSearch':
        trackGoogleEvent('filter_results', customData)
        trackMetaEvent('CustomizeProduct', customData) // or trackCustom
        break

      case 'custom':
        if (eventName) {
          trackGoogleEvent(eventName, customData)
          trackMetaEvent(eventName, customData)
        }
        break

      default:
        return
    }
  }

  return (
    <TrackingEventsContext.Provider value={{ trackEvent, isTrackingAllowed }}>
      {children}
    </TrackingEventsContext.Provider>
  )
}

// Custom hook to use the context
export const useTrackingEvents = () => {
  const context = useContext(TrackingEventsContext)
  if (!context) {
    throw new Error('useTrackingEvents must be used within a TrackingEventsProvider')
  }
  return context
}
```

---

## 6. Client-Side Tracking Methods

### Google Analytics Methods

**File: `app/lib/tracking/google.ts`**

```typescript
// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export const trackGooglePageView = (sourceUrl: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_location: sourceUrl,
    })
  }
}

export const trackGoogleEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

export const trackGoogleViewContent = (sourceUrl: string, customData?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      page_location: sourceUrl,
      items: customData?.contents || [],
      value: customData?.value,
      currency: customData?.currency,
    })
  }
}

export const trackGoogleSearch = (sourceUrl: string, searchString: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      page_location: sourceUrl,
      search_term: searchString,
    })
  }
}

export const trackGoogleLead = (sourceUrl: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      page_location: sourceUrl,
    })
  }
}

// Add more specific events as needed
export const trackGoogleAddToCart = (customData?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      items: customData?.contents || [],
      value: customData?.value,
      currency: customData?.currency,
    })
  }
}

export const trackGooglePurchase = (customData?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: customData?.order_id,
      value: customData?.value,
      currency: customData?.currency,
      items: customData?.contents || [],
    })
  }
}
```

### Meta/Facebook Pixel Methods

**File: `app/lib/tracking/meta.ts`**

```typescript
// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _fbq?: any
  }
}

export const trackMetaPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export const trackMetaEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params)
  }
}

export const trackMetaCustomEvent = (eventName: string, params?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params)
  }
}

export const trackMetaViewContent = (customData?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: customData?.content_name,
      content_ids: customData?.content_ids || [],
      content_type: customData?.content_category || 'product',
      value: customData?.value,
      currency: customData?.currency || 'USD',
    })
  }
}

export const trackMetaSearch = (searchString: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchString,
    })
  }
}

export const trackMetaLead = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead')
  }
}

export const trackMetaCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration')
  }
}

export const trackMetaAddToWishlist = (customData?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToWishlist', {
      content_ids: customData?.content_ids || [],
      content_name: customData?.content_name,
      value: customData?.value,
      currency: customData?.currency,
    })
  }
}

export const trackMetaContact = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact')
  }
}
```

### TypeScript Types

**File: `app/lib/tracking/types.ts`**

```typescript
export interface CustomData {
  currency?: string
  value?: number
  content_name?: string
  content_category?: string
  content_ids?: string[]
  contents?: Array<{ 
    id: string
    quantity: number
    item_price?: number
    item_name?: string
  }>
  num_items?: number
  search_string?: string
  order_id?: string
  [key: string]: any
}

export type EventType =
  | 'pageView'
  | 'viewContent'
  | 'search'
  | 'lead'
  | 'addToFavorites'
  | 'addListing'
  | 'contactClick'
  | 'filterSearch'
  | 'custom'

export interface TrackingEvent {
  eventType: EventType
  eventName?: string
  customData?: CustomData
}
```

---

## 7. Usage in Components

### Example 1: Track Account Creation

```typescript
'use client'

import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function SignupPage() {
  const { trackEvent } = useTrackingEvents()

  const handleSignup = async (formData) => {
    // ... signup logic ...
    
    // Track account creation
    trackEvent('lead') // or 'custom' with 'CompleteRegistration'
  }

  return (
    // ... form UI ...
  )
}
```

### Example 2: Track View Listing Details

```typescript
'use client'

import { useEffect } from 'react'
import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function ListingDetailPage({ listing }) {
  const { trackEvent } = useTrackingEvents()

  useEffect(() => {
    // Track when user views listing details
    trackEvent('viewContent', undefined, {
      content_ids: [listing.id],
      content_name: listing.title,
      content_category: listing.category,
      value: listing.price,
      currency: 'RON',
    })
  }, [listing.id])

  return (
    // ... listing details UI ...
  )
}
```

### Example 3: Track Contact Actions

```typescript
'use client'

import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function ContactButtons({ listing }) {
  const { trackEvent } = useTrackingEvents()

  const handlePhoneClick = () => {
    trackEvent('contactClick', 'phone', {
      listing_id: listing.id,
    })
    // Open phone dialer
  }

  const handleMessageClick = () => {
    trackEvent('contactClick', 'message', {
      listing_id: listing.id,
    })
    // Open message form
  }

  const handleDirectionsClick = () => {
    trackEvent('contactClick', 'directions', {
      listing_id: listing.id,
    })
    // Open maps
  }

  return (
    <div>
      <button onClick={handlePhoneClick}>Call</button>
      <button onClick={handleMessageClick}>Message</button>
      <button onClick={handleDirectionsClick}>Directions</button>
    </div>
  )
}
```

### Example 4: Track Search/Filter

```typescript
'use client'

import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function SearchFilters() {
  const { trackEvent } = useTrackingEvents()

  const handleSearch = (searchTerm: string) => {
    trackEvent('search', undefined, {
      search_string: searchTerm,
    })
  }

  const handleFilterChange = (filters: any) => {
    trackEvent('filterSearch', undefined, {
      filters: JSON.stringify(filters),
    })
  }

  return (
    // ... search/filter UI ...
  )
}
```

### Example 5: Track Add to Favorites

```typescript
'use client'

import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function FavoriteButton({ listing }) {
  const { trackEvent } = useTrackingEvents()

  const handleAddToFavorites = () => {
    trackEvent('addToFavorites', undefined, {
      content_ids: [listing.id],
      content_name: listing.title,
      value: listing.price,
      currency: 'RON',
    })
    // Add to favorites logic
  }

  return (
    <button onClick={handleAddToFavorites}>
      Add to Favorites
    </button>
  )
}
```

### Example 6: Track Add Listing

```typescript
'use client'

import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

export default function CreateListingPage() {
  const { trackEvent } = useTrackingEvents()

  const handleSubmitListing = async (listingData: any) => {
    // ... submit logic ...
    
    trackEvent('addListing', undefined, {
      listing_type: listingData.type,
      value: listingData.price,
      currency: 'RON',
    })
  }

  return (
    // ... form UI ...
  )
}
```

---

## 8. Event Mapping

### Your Requirements → Tracking Events

| User Action | Google Analytics Event | Meta Pixel Event | Usage |
|------------|------------------------|------------------|-------|
| **creare cont** (account creation) | `generate_lead` | `Lead` or `CompleteRegistration` | `trackEvent('lead')` |
| **adaugare listare** (add listing) | `add_listing` (custom) | `SubmitApplication` or custom | `trackEvent('addListing', undefined, data)` |
| **link-uri contact** (contact links) | `contact` | `Contact` | `trackEvent('contactClick', 'phone', data)` |
| **Filtrare cautari** (filter search) | `filter_results` (custom) | `CustomizeProduct` or custom | `trackEvent('filterSearch', undefined, data)` |
| **Vezi detalii card** (view listing) | `view_item` | `ViewContent` | `trackEvent('viewContent', undefined, data)` |
| **Adaugare favorite** (add favorite) | `add_to_wishlist` | `AddToWishlist` | `trackEvent('addToFavorites', undefined, data)` |

### Standard E-commerce Events (if needed)

| Action | Google Analytics | Meta Pixel |
|--------|------------------|------------|
| Add to Cart | `add_to_cart` | `AddToCart` |
| Begin Checkout | `begin_checkout` | `InitiateCheckout` |
| Purchase | `purchase` | `Purchase` |
| View Item List | `view_item_list` | N/A |

---

## 9. Environment Variables

### .env.local

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Meta/Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345

# Optional: Add others as needed
```

### Where to Find These IDs

- **Google Analytics ID**: Google Analytics Dashboard → Admin → Data Streams → Measurement ID
- **Google Tag Manager ID**: GTM Dashboard → Container ID (starts with GTM-)
- **Facebook Pixel ID**: Meta Events Manager → Data Sources → Your Pixel → Pixel ID

---

## 10. Complete Integration

### Step-by-Step Integration Guide

#### Step 1: Install Dependencies

```bash
npm install react-hook-consent
```

#### Step 2: Create Folder Structure

```bash
mkdir -p app/providers
mkdir -p app/components
mkdir -p app/lib/tracking
```

#### Step 3: Copy Files

1. Create `app/providers/index.tsx` with the main Providers wrapper
2. Create `app/providers/ConsentTrackingProvider.tsx` with script loading logic
3. Create `app/providers/TrackingEventsProvider.tsx` with tracking context
4. Create `app/components/CookieBanner.tsx` with consent banner UI
5. Create `app/lib/tracking/google.ts` with Google Analytics methods
6. Create `app/lib/tracking/meta.ts` with Meta Pixel methods
7. Create `app/lib/tracking/types.ts` with TypeScript types

#### Step 4: Update Root Layout

```typescript
// app/layout.tsx
import { Providers } from './providers'
import CookieBanner from './components/CookieBanner'
import 'react-hook-consent/dist/styles/style.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}
```

#### Step 5: Add Environment Variables

Create `.env.local` with your tracking IDs (see section 9).

#### Step 6: Use in Components

Import the hook and use it:

```typescript
import { useTrackingEvents } from '@/app/providers/TrackingEventsProvider'

const { trackEvent } = useTrackingEvents()

trackEvent('viewContent', undefined, { content_ids: ['123'] })
```

---

## Key Benefits of This Approach

✅ **GDPR Compliant**: Only loads tracking scripts after user consent  
✅ **Persistent Consent**: Choices saved in localStorage  
✅ **Client-Side Only**: No server actions needed, simple browser APIs  
✅ **Unified Interface**: Single `trackEvent()` function for all platforms  
✅ **Type-Safe**: Full TypeScript support  
✅ **Google Consent Mode**: Enhanced privacy for GA4  
✅ **Flexible**: Easy to add more tracking platforms  

---

## Troubleshooting

### Scripts Not Loading

- Check browser console for errors
- Verify environment variables are set correctly
- Ensure consent is granted (check localStorage: `react-hook-consent`)

### Events Not Firing

- Open browser console and check for `gtag` or `fbq` functions
- Verify consent includes required services ('analytics', 'tracking', or 'social')
- Use browser extensions (Google Tag Assistant, Facebook Pixel Helper) to debug

### TypeScript Errors

- Ensure you've declared `window.gtag` and `window.fbq` in global types
- Add `declare global` blocks in your tracking files

---

## Additional Resources

- [react-hook-consent Documentation](https://www.npmjs.com/package/react-hook-consent)
- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Meta Pixel Documentation](https://developers.facebook.com/docs/meta-pixel)
- [Next.js Script Optimization](https://nextjs.org/docs/app/api-reference/components/script)

---

## License

This implementation guide is based on the ScarInfluence project and is provided as-is for educational and implementation purposes.
