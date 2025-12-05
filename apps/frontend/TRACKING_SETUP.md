# Cookie Consent & Tracking Setup

## Overview

This project implements GDPR-compliant cookie consent with Google Analytics 4 and Meta Pixel tracking. All events include rich metadata for per-user and per-listing analytics.

## Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta/Facebook Pixel
NEXT_PUBLIC_FB_PIXEL_ID=123456789012345
```

### Where to Get These IDs

#### Google Analytics ID
1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Admin** → **Data Streams**
3. Select your web stream
4. Copy the **Measurement ID** (starts with `G-`)

#### Facebook Pixel ID
1. Go to [Meta Events Manager](https://business.facebook.com/events_manager)
2. Navigate to **Data Sources** → Select your Pixel
3. Copy the **Pixel ID** (numeric value)

## Features

### Cookie Consent
- GDPR-compliant banner with Romanian translations
- Four consent categories:
  - **Necessary**: Always enabled (authentication, session)
  - **Analytics**: Google Analytics 4
  - **Tracking**: Meta Pixel advertising
  - **Social**: Social media integrations
- Consent choices persisted in localStorage
- Settings can be changed anytime

### Tracking Events

All tracking events include contextual metadata:

#### User Context
- `user_id`: User ID from NextAuth session
- `profile_id`: Profile ID
- `email`: User email

#### Listing Context
- `listing_id`: Unique listing identifier
- `listing_type`: `"evenimente"` | `"locatii"` | `"servicii"`
- `listing_slug`: URL-friendly identifier
- `city_name`: City name
- `city_id`: City identifier
- `owner_id`: Listing owner identifier
- `owner_slug`: Owner profile slug
- `price`: Listing price
- `currency`: Currency code (default: RON)

### Tracked Events

1. **Page Views** - Automatic on every page
   - Includes user context

2. **Sign Up** (`lead`)
   - `selected_roles`: User selected roles
   - `registration_method`: "email"

3. **Listing View** (`viewContent`)
   - Full listing context
   - Triggered on listing detail page load

4. **Add Listing** (`addListing`)
   - Listing details
   - Owner context

5. **Add to Favorites** (`addToFavorites`)
   - Listing identification
   - Owner context

6. **Remove from Favorites** (`removeFromFavorites`)
   - Listing identification

7. **Contact Click** (`contactClick`)
   - `contact_method`: "phone", "message", "email", etc.
   - Listing context

8. **Search/Filter** (`search` / `filterSearch`)
   - `search_term`: Search query
   - `filters`: Applied filters
   - `listing_type`: Category
   - `city_name`: Location

## Usage in Components

### Using the Tracking Hook

```typescript
import { useTracking } from '@/hooks/useTracking';

function MyComponent() {
  const { trackEvent } = useTracking();

  const handleAction = () => {
    trackEvent('custom', 'my_event_name', {
      listing_id: 123,
      listing_type: 'locatii',
      // ... other custom data
    });
  };
}
```

### Available Event Types

```typescript
type EventType =
  | 'pageView'
  | 'viewContent'
  | 'search'
  | 'lead'
  | 'addListing'
  | 'addToFavorites'
  | 'removeFromFavorites'
  | 'contactClick'
  | 'filterSearch'
  | 'custom';
```

## Google Analytics 4 Custom Dimensions

After deployment, configure these custom dimensions in GA4:

1. Go to **Admin** → **Custom definitions** → **Create custom dimensions**
2. Create dimensions for:
   - `user_id` (User Scope)
   - `profile_id` (User Scope)
   - `listing_id` (Event Scope)
   - `listing_type` (Event Scope)
   - `owner_id` (Event Scope)
   - `city_name` (Event Scope)
   - `listing_slug` (Event Scope)

These dimensions enable:
- Per-user analytics dashboards
- Per-listing performance metrics
- City-based analytics
- Listing type comparisons
- Owner attribution

## Debugging

### Development Mode
In development, all tracking events are logged to console:
```
[Google Tracking] event_name {...data}
[Meta Tracking] EventName {...data}
```

### Browser Extensions
- **Google Tag Assistant** - Verify GA4 events
- **Meta Pixel Helper** - Verify Facebook Pixel events

### GA4 DebugView
1. Enable debug mode in your browser
2. Navigate to GA4 → **Configure** → **DebugView**
3. Interact with your site to see real-time events

### Checking Consent Status
Open browser console and check localStorage:
```javascript
JSON.parse(localStorage.getItem('unevent-cookie-consent'))
```

## Architecture

### File Structure
```
apps/frontend/
├── app/
│   └── providers/
│       └── consent/
│           ├── index.tsx                    # Main export
│           ├── ConsentContext.tsx           # Consent state management
│           ├── ConsentTrackingProvider.tsx  # Script loading
│           └── TrackingEventsProvider.tsx   # Tracking interface
├── components/
│   └── common/
│       └── CookieBanner.tsx                 # Consent banner UI
├── lib/
│   └── tracking/
│       ├── google.ts                        # GA4 utilities
│       ├── meta.ts                          # Meta Pixel utilities
│       └── helpers.ts                       # Helper functions
├── hooks/
│   └── useTracking.ts                       # Convenience hook
└── types/
    └── tracking.ts                          # TypeScript types
```

### Consent Flow
1. User visits site → Banner appears
2. User accepts/declines → Consent saved to localStorage
3. Scripts load conditionally based on consent
4. Tracking events fire only if consent granted
5. Google Consent Mode updates automatically

## Privacy & Compliance

- ✅ GDPR compliant
- ✅ Cookie consent required before tracking
- ✅ User choices persist across sessions
- ✅ Can be changed anytime
- ✅ Google Consent Mode v2 implemented
- ✅ IP anonymization enabled
- ✅ No tracking without consent

## Performance

- Scripts load with `afterInteractive` strategy
- No impact on initial page load
- Tracking calls are non-blocking
- Consent stored in localStorage (no network calls)

## Testing Checklist

- [ ] Cookie banner appears on first visit
- [ ] Consent choices saved in localStorage
- [ ] GA4 script loads only after analytics consent
- [ ] Meta Pixel loads only after tracking/social consent
- [ ] Events visible in browser console (dev mode)
- [ ] Events appear in GA4 DebugView
- [ ] Events appear in Meta Events Manager
- [ ] Custom parameters visible in event payloads
- [ ] Tested: signup, listing view, favorites, contact, search

## Future Enhancements

Once deployed, you can:

1. **User Dashboards**: Build GA4 dashboards filtered by `owner_id` or `profile_id`
2. **Listing Analytics**: Show listing owners their performance metrics
3. **Conversion Tracking**: Track premium feature conversions
4. **A/B Testing**: Implement with consistent user tracking
5. **Cross-device Tracking**: Leverage `user_id` parameter

## Support

For issues or questions:
- Check browser console for errors
- Verify environment variables are set
- Test with GA4 DebugView and Meta Pixel Helper
- Ensure consent is granted for the service you're testing
