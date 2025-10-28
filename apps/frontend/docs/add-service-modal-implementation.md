# Add Service Modal - Implementation Summary

## What's Implemented ✅

### 1. **Types & Schema** (`forms/service/schema.ts`)
- Complete Zod validation schema matching `Service` interface from `payload-types.ts`
- All fields map directly to Payload CMS types (no mock-only fields)
- Romanian validation messages
- Default values for form initialization

### 2. **Mock Data**
- **`mocks/services/categories.ts`**: 40+ service categories grouped by type
  - DJ & Sonorizare, Lumini & Efecte, Foto-Video, MC/Host, Catering, Decorațiuni, Transport, Beauty, Rochii, Invitații, etc.
- **`mocks/shared/cities.ts`**: Romanian cities with counties (reusable across locations/services/events)

### 3. **Modal Component** (`components/cont/services/AddServiceModal.tsx`)
- Multi-tab form with React Hook Form + Zod validation
- 5 tabs: Informații, Servicii, Adresă, Imagini, Contact
- Navigation: Previous/Next buttons, progress indicator (Pas 1/5)
- Submit only enabled when form is valid
- Unsaved changes confirmation dialog
- Error handling with toast notifications and auto-navigation to error tab
- Final success screen after submit
- Responsive: almost full width on desktop (90vw, max 1600px), mobile-friendly (95vw)

### 4. **Tab Components**

#### **InfoTab** (`tabs/InfoTab.tsx`)
- ✅ Nume furnizor servicii (required, min 3 chars)
- ✅ Destinat pentru — multiselect with search, displays as tags
- ✅ Descriere servicii (optional, 50-5000 chars with counter)
- ✅ Preț checkbox reveals:
  - Facturare period (pe oră/zi/eveniment)
  - Preț RON (positive number)
  - Live price preview

#### **ServicesTab** (`tabs/ServicesTab.tsx`)
- ✅ Service categories multiselect with search
- ✅ Grouped display by category (DJ & Sonorizare, Foto-Video, etc.)
- ✅ Selected items displayed as grouped tags by category
- ✅ Clear all selections button

#### **AddressTab** (`tabs/AddressTab.tsx`)
- ✅ Oraș — searchable select from Romanian cities
- ✅ Adresă completă (required, min 5 chars)
- ✅ Google Maps placeholder UI
- ✅ "Setează manual pin-ul" checkbox
  - Shows drag handle icon (UI only)
  - Displays lat/lon coordinates
- ✅ Privacy note about address visibility

#### **ImagesTab** (`tabs/ImagesTab.tsx`)
- ✅ Imagine profil — single file upload (UI only)
  - Displays filename & size
  - Remove button
- ✅ Galerie foto — multiple files (max 10)
  - Upload progress (X/10)
  - List view with filename/size
  - Individual remove buttons
- ✅ Linkuri YouTube (max 3)
  - URL validation (YouTube only)
  - Add/remove functionality
  - Visual feedback with YouTube icon
- ✅ ImageConstraintsNote component (reused from location modal)
  - Formats: JPG, PNG, WebP
  - Compression: WebP ≤ 500KB
  - Max dimensions: 1920×1920px
  - Portrait images: black background
  - ALT text: auto-generated

#### **ContactTab** (`tabs/ContactTab.tsx`)
- ✅ Telefoane (max 2) — +40XXXXXXXXX format validation
  - Add/remove buttons
  - Empty state with CTA
- ✅ Email (required) — email validation
- ✅ Website (optional) — URL validation
- ✅ Social Media (all optional) — URL validation for:
  - Facebook, Instagram, X (Twitter), LinkedIn, YouTube, TikTok
  - Icons from `lucide-react` and `react-icons/fa6`
  - Responsive 2-column grid on desktop

### 5. **Success Screen** (`components/cont/services/SubmitDone.tsx`)
- ✅ Large success icon (green checkmark)
- ✅ "Datele au fost transmise cu succes" heading
- ✅ Approval timeline message (24-48 hours)
- ✅ "Închide" button with toast notification
- ✅ Helpful note about next steps

### 6. **Page Integration** (`app/cont/serviciile-mele/page.tsx`)
- ✅ "Adaugă serviciu" button opens modal
- ✅ Modal state management (open/close)
- ✅ Existing services list (desktop table + mobile cards)
- ✅ Status badges, category icons, rejection reasons

---

## Styling & UX ✅

- **Glassmorphism**: consistent with location modal
- **Responsive**: 90vw desktop (max 1600px), 95vw mobile
- **ScrollArea**: proper scrolling within modal content
- **Accessibility**:
  - `aria-label` for icon buttons
  - `aria-invalid` and `aria-describedby` for form errors
  - Keyboard navigation
  - Focus rings on interactive elements
- **Romanian UI**: all labels, placeholders, errors, tooltips
- **Toasts**: success/error feedback
- **Icons**: `lucide-react` + `react-icons/fa6`

---

## TODO (Backend Integration) 🚧

### 1. **File Uploads** (Tab 4: Imagini)
```typescript
// TODO: Replace File objects with Media IDs after upload
// 1. Upload featuredImage to /api/media → get Media ID
// 2. Upload gallery images to /api/media → get array of Media IDs
// 3. Update form data with IDs before submit

const uploadImage = async (file: File): Promise<number> => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/media', { method: 'POST', body: formData })
  const data = await res.json()
  return data.doc.id // Media ID
}
```

### 2. **City & Type Mapping** (Tab 3: Adresă, Tab 1: Info, Tab 2: Servicii)
```typescript
// TODO: Fetch real data from Payload
// 1. Cities: GET /api/cities → map to { value: slug, label: name }
// 2. Event types (suitableFor): GET /api/listing-types?type=events
// 3. Service categories (type): GET /api/listing-types?type=services

// TODO: Before submit, convert slugs to IDs
const cityId = await getCityIdBySlug(formData.city)
const typeIds = await getListingTypeIdsBySlug(formData.type)
const suitableForIds = await getListingTypeIdsBySlug(formData.suitableFor)
```

### 3. **Google Maps Integration** (Tab 3: Adresă)
```typescript
// TODO: Integrate Google Maps Geocoding API
// 1. Geocode address on blur → auto-fill lat/lon
// 2. If manualPin enabled, allow dragging marker
// 3. Update geo coordinates in real-time

const geocodeAddress = async (address: string, city: string) => {
  const fullAddress = `${address}, ${city}, România`
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}`
  )
  const data = await response.json()
  if (data.results[0]) {
    return {
      lat: data.results[0].geometry.location.lat,
      lon: data.results[0].geometry.location.lng,
    }
  }
}
```

### 4. **Submit to Backend** (`AddServiceModal.tsx`)
```typescript
// TODO: Replace console.log with real API call
const onSubmit = async (data: ServiceFormData) => {
  // 1. Upload images → get Media IDs
  const featuredImageId = data.featuredImage
    ? await uploadImage(data.featuredImage)
    : undefined
  const galleryIds = await Promise.all(
    (data.gallery || []).map(uploadImage)
  )

  // 2. Map slugs to IDs
  const cityId = await getCityIdBySlug(data.city)
  const typeIds = await getListingTypeIdsBySlug(data.type)
  const suitableForIds = await getListingTypeIdsBySlug(data.suitableFor)

  // 3. Transform to Payload Service structure
  const servicePayload = {
    title: data.title,
    description: data.description,
    type: typeIds,
    suitableFor: suitableForIds,
    city: cityId,
    address: data.address,
    geo: data.geo ? [data.geo.lat, data.geo.lon] : undefined,
    featuredImage: featuredImageId,
    gallery: galleryIds,
    youtubeLinks: data.youtubeLinks?.map(yt => ({ youtubeLink: yt.url })),
    pricing: {
      type: data.pricing.enabled ? 'from' : 'contact',
      amount: data.pricing.enabled ? data.pricing.amount : undefined,
      currency: 'RON',
      period: data.pricing.period,
    },
    contact: {
      email: data.contact.email,
      phone: data.contact.phones[0]?.number, // Primary phone
      website: data.contact.website,
    },
    socialLinks: data.socialLinks,
    status: 'pending', // Admin approval required
  }

  // 4. POST to backend
  const response = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicePayload),
  })

  if (!response.ok) {
    throw new Error('Failed to create service')
  }

  setIsSubmitted(true)
}
```

### 5. **Error Handling**
```typescript
// TODO: Add proper error handling
// 1. Network errors → toast + keep modal open
// 2. Validation errors from backend → map to form fields
// 3. Upload failures → retry logic
// 4. Auth errors → redirect to login
```

### 6. **Authentication**
```typescript
// TODO: Check if user is logged in and has 'provider' role
// 1. useCurrentUser() hook to get user
// 2. If not logged in → redirect to /auth/autentificare
// 3. If not 'provider' role → show role request prompt
```

---

## Field Mapping: Form → Payload

| Form Field | Payload Field | Type | Notes |
|------------|---------------|------|-------|
| `title` | `title` | `string` | Service provider name |
| `suitableFor` | `suitableFor` | `ListingType[]` | Event types (IDs) |
| `description` | `description` | `string` | Service description |
| `pricing.enabled` | `pricing.type` | `'from' \| 'contact'` | If enabled → 'from' |
| `pricing.amount` | `pricing.amount` | `number` | Price in RON |
| `pricing.period` | `pricing.period` | `'hour' \| 'day' \| 'event'` | Billing period |
| `type` | `type` | `ListingType[]` | Service categories (IDs) |
| `city` | `city` | `City` (ID) | City relation |
| `address` | `address` | `string` | Full address |
| `geo` | `geo` | `[number, number]` | [lat, lon] |
| `featuredImage` | `featuredImage` | `Media` (ID) | Profile image |
| `gallery` | `gallery` | `Media[]` (IDs) | Photo gallery |
| `youtubeLinks` | `youtubeLinks` | `{youtubeLink: string}[]` | YouTube videos |
| `contact.phones` | `contact.phone` | `string` | Primary phone |
| `contact.email` | `contact.email` | `string` | Email |
| `contact.website` | `contact.website` | `string` | Website URL |
| `socialLinks` | `socialLinks` | `object` | Facebook, Instagram, etc. |

---

## Testing Checklist ✅

- [x] Modal opens on "Adaugă serviciu" click
- [x] Tab navigation (Previous/Next buttons)
- [x] Form validation (required fields, formats)
- [x] Multi-select with search (event types, service categories)
- [x] Selected items displayed as tags
- [x] File upload UI (profile, gallery, YouTube)
- [x] Phone add/remove (max 2)
- [x] Pricing toggle shows/hides fields
- [x] Manual pin toggle shows coordinates
- [x] Submit disabled when invalid
- [x] Error navigation to first tab with errors
- [x] Success screen after submit
- [x] Unsaved changes confirmation on close
- [x] Responsive layout (desktop/mobile)
- [x] Accessibility (keyboard, screen readers)
- [x] Toast notifications

---

## Files Created

```
UnEvent---frontend/
├── forms/service/
│   └── schema.ts                      # Zod schema + types
├── mocks/
│   ├── services/
│   │   └── categories.ts              # Service categories mock
│   └── shared/
│       └── cities.ts                  # Romanian cities (shared)
├── components/cont/services/
│   ├── AddServiceModal.tsx            # Main modal wrapper
│   ├── SubmitDone.tsx                 # Success screen
│   └── tabs/
│       ├── InfoTab.tsx                # Tab 1: Informații
│       ├── ServicesTab.tsx            # Tab 2: Servicii
│       ├── AddressTab.tsx             # Tab 3: Adresă
│       ├── ImagesTab.tsx              # Tab 4: Imagini
│       └── ContactTab.tsx             # Tab 5: Contact
└── docs/
    └── add-service-modal-implementation.md  # This file
```

---

## Notes

- **No mock-only fields**: All form fields map directly to `Service` interface from `payload-types.ts`
- **UI only**: File uploads and API calls are placeholders (console.log)
- **Reusable components**: Cities mock is shared, ImageConstraintsNote reused from location modal
- **Consistent styling**: Matches location modal (glassmorphism, spacing, colors)
- **Romanian UI**: All text in Romanian
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Mobile-friendly**: Responsive layout, touch-friendly buttons

