# Add Location Modal - Implementation Notes

## ✅ What's Implemented

### Files Created

#### **Core Modal & Form**
- ✅ `components/cont/locations/AddLocationModal.tsx` - Main modal wrapper with tab navigation
- ✅ `forms/location/schema.ts` - Zod schema + TypeScript types (maps to payload-types.ts Location interface)

#### **Tab Components**
- ✅ `components/cont/locations/tabs/InfoTab.tsx` - Tab 1: Basic info, types, capacity, pricing
- ✅ `components/cont/locations/tabs/AddressTab.tsx` - Tab 2: City, address, map placeholder
- ✅ `components/cont/locations/tabs/FacilitiesTab.tsx` - Tab 3: Multi-select facilities with search
- ✅ `components/cont/locations/tabs/ImagesTab.tsx` - Tab 4: Featured image, gallery, YouTube links
- ✅ `components/cont/locations/tabs/ContactTab.tsx` - Tab 5: Phones, email, website, social media

#### **Final Screen**
- ✅ `components/cont/locations/SubmitDone.tsx` - Success screen with animated checkmark

#### **Mock Data**
- ✅ `mocks/locations/cities.ts` - 25 Romanian cities with slugs & counties
- ✅ `mocks/locations/facilities.ts` - 38 facilities grouped by 6 categories
- ✅ `mocks/locations/types.ts` - 12 location types + 18 event types

#### **UI Components**
- ✅ `lib/ui/ImageConstraintsNote.tsx` - Reusable image specifications note

#### **Page Integration**
- ✅ Updated `app/cont/locatiile-mele/page.tsx` to open modal
- ✅ Added `.required` CSS class in `app/globals.css`

---

## 🎯 Features Implemented

### Form Validation (React Hook Form + Zod)
- ✅ Real-time validation with `mode: 'onChange'`
- ✅ Romanian error messages
- ✅ Field-level error display with `aria-describedby`
- ✅ Submit button disabled until form is valid
- ✅ Scroll to first error on validation failure

### Multi-Tab Navigation
- ✅ 5 tabs: Informații, Adresă, Facilități, Imagini, Contact
- ✅ Next/Previous buttons with step counter
- ✅ Submit only on last tab
- ✅ Tab navigation via TabsList (clickable tabs)

### Tab 1: Informații
- ✅ Title (text input, required, min 5 chars)
- ✅ Location types (multi-select via badges, required)
- ✅ Suitable for event types (multi-select via badges, required)
- ✅ Description (textarea, min 50 chars)
- ✅ Capacity (indoor, outdoor, seating, parking - all optional numbers)
- ✅ Surface area (m²)
- ✅ Pricing toggle with conditional fields:
  - Period (hour/day/event)
  - Amount (RON)
  - Live preview text

### Tab 2: Adresă
- ✅ City (searchable select, required, 25 options)
- ✅ Address (text input, required)
- ✅ Map placeholder container with:
  - Mock Google Maps auto-detect message
  - Manual pin toggle checkbox
  - Simulate pin movement button (generates mock lat/lon)
  - Coordinate display (lat/lon)

### Tab 3: Facilități
- ✅ Multi-select dropdown with search
- ✅ 38 facilities grouped by 6 categories
- ✅ Search filtering by facility name
- ✅ Selected facilities displayed as removable chips
- ✅ Clear all button
- ✅ Category headings in dropdown

### Tab 4: Imagini
- ✅ Featured image upload (single file, UI only)
- ✅ Gallery upload (multiple files, max 10, UI only)
- ✅ File display with name, size, remove button
- ✅ YouTube links (max 3, validated URLs)
- ✅ ImageConstraintsNote component with specs:
  - Formats: JPG, PNG, WebP
  - Auto-compression to WebP ≤ 500KB
  - Max dimensions: 1920×1920px
  - Portrait images on black background
  - Auto-generated ALT text

### Tab 5: Contact
- ✅ Phone numbers (max 2, Romanian format validation)
- ✅ Email (required, validated)
- ✅ Website (optional URL)
- ✅ Social media (6 platforms with icons):
  - Facebook, Instagram, X/Twitter, LinkedIn, YouTube, TikTok

### Final Screen (Submit Done)
- ✅ Animated checkmark with glow effect
- ✅ Success message
- ✅ "What happens next" info box
- ✅ Close button triggers toast notification
- ✅ Auto-reset form state

### UX Enhancements
- ✅ Unsaved changes confirmation dialog
- ✅ Form reset on modal close
- ✅ Toast notifications (success, validation errors)
- ✅ Glassmorphism styling
- ✅ ScrollArea for long content
- ✅ Keyboard accessible (focus management)
- ✅ ARIA labels and descriptions
- ✅ Responsive design (works on mobile)
- ✅ Loading states (disabled buttons during submission)

---

## 📋 Type Safety

### From `payload-types.ts` (Used)
The form schema correctly maps to these fields from the Location interface:

- `title` - string
- `description` - string | null
- `city` - City relation (using slug in form)
- `address` - string | null
- `geo` - [number, number] tuple (lat/lon)
- `contact` - object (email, phone, website)
- `featuredImage` - Media relation
- `gallery` - Media[] relation
- `socialLinks` - object (facebook, instagram, x, linkedin, youtube, tiktok)
- `youtubeLinks` - array of {youtubeLink: string}
- `type` - ListingType[] (location types)
- `suitableFor` - ListingType[] (event types)
- `capacity` - object (indoor, outdoor, seating, parking)
- `surface` - number (m²)
- `pricing` - object (type, amount, currency, period)
- `facilities` - Facility[] relation

### Mock-Only Fields (Local State)
These are UI-only for development:

- `pricing.enabled` - boolean toggle (controls visibility of pricing fields)
- `manualPin` - boolean (controls map pin UI)
- `contact.phones` - array of {number: string} (backend expects single phone in contact.phone)
- File upload handling (storing File objects locally)

---

## 🚧 TODO: Backend Integration

When connecting to Payload CMS backend:

### 1. File Uploads
```typescript
// TODO: Replace mock file handling
// Current: stores File objects locally
// Needed: 
// - Upload to /api/media endpoint
// - Get back Media IDs
// - Store IDs in featuredImage & gallery fields
```

### 2. Geocoding
```typescript
// TODO: Integrate Google Maps Geocoding API
// Current: mock lat/lon on pin movement
// Needed:
// - Auto-detect coordinates from address
// - Allow manual pin adjustment
// - Validate coordinates
```

### 3. Form Submission
```typescript
// TODO: Replace console.log with API call
// File: components/cont/locations/AddLocationModal.tsx, line ~67

const onSubmit = async (data: LocationFormData) => {
  // 1. Upload images first
  const featuredImageId = await uploadImage(data.featuredImage)
  const galleryIds = await uploadImages(data.gallery)
  
  // 2. Transform form data to Payload format
  const payload = {
    title: data.title,
    description: data.description,
    city: await getCityIdBySlug(data.city), // lookup City ID
    address: data.address,
    geo: data.geo,
    contact: {
      email: data.contact.email,
      phone: data.contact.phones[0]?.number, // take first phone
      website: data.contact.website,
    },
    featuredImage: featuredImageId,
    gallery: galleryIds,
    socialLinks: data.socialLinks,
    youtubeLinks: data.youtubeLinks?.map(yl => ({ youtubeLink: yl.url })),
    type: await getTypeIdsBySlugs(data.type), // lookup ListingType IDs
    suitableFor: await getTypeIdsBySlugs(data.suitableFor),
    capacity: data.capacity,
    surface: data.surface,
    pricing: data.pricing.enabled ? {
      type: data.pricing.type || 'contact',
      amount: data.pricing.amount,
      currency: data.pricing.currency,
      period: data.pricing.period,
    } : { type: 'contact' },
    facilities: await getFacilityIdsBySlugs(data.facilities),
    status: 'pending', // always pending for new submissions
  }
  
  // 3. POST to /api/locations
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(payload),
  })
  
  if (!response.ok) throw new Error('Failed to create location')
  
  // 4. Show success state
  setIsSubmitted(true)
}
```

### 4. Data Fetching
```typescript
// TODO: Replace mock data with Payload queries

// mocks/locations/cities.ts -> fetch from /api/cities
// mocks/locations/facilities.ts -> fetch from /api/facilities  
// mocks/locations/types.ts -> fetch from /api/listing-types

// Use React Query for caching:
const { data: cities } = useQuery({
  queryKey: ['cities'],
  queryFn: () => fetch('/api/cities').then(r => r.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### 5. Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000 # or your Payload URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### 6. Image Upload Implementation
```typescript
// lib/api/media.ts
export async function uploadImage(file: File): Promise<number> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: formData,
  })
  
  if (!response.ok) throw new Error('Upload failed')
  
  const { doc } = await response.json()
  return doc.id
}
```

### 7. Map Integration
```typescript
// components/cont/locations/tabs/AddressTab.tsx
// TODO: Replace placeholder with real Google Maps

import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'

const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
})

// Add draggable marker, geocoding, etc.
```

---

## 🎨 Styling Notes

- Uses shadcn/ui components throughout
- Glassmorphism effects on cards: `bg-muted/30 backdrop-blur-sm`
- Focus rings visible for accessibility
- Romanian UI text throughout
- Icons from lucide-react + react-icons (FaXTwitter, FaTiktok)
- Responsive: works on mobile with ScrollArea for long forms
- Dark mode compatible (uses CSS variables)

---

## ♿ Accessibility

- ✅ All interactive elements keyboard navigable
- ✅ ARIA labels on icon buttons
- ✅ `aria-invalid` and `aria-describedby` on form fields
- ✅ Focus management (auto-focus first error)
- ✅ Screen reader friendly error messages
- ✅ Semantic HTML (labels associated with inputs)

---

## 🧪 Testing Checklist

Before connecting to backend, test these flows:

- [ ] Open modal from "Adaugă locație" button
- [ ] Navigate all tabs with Next/Previous
- [ ] Fill all required fields and submit
- [ ] Try to submit with validation errors
- [ ] Test unsaved changes dialog (make changes, try to close)
- [ ] Upload mock images (check File display)
- [ ] Add/remove facilities, YouTube links, phone numbers
- [ ] Toggle pricing checkbox
- [ ] Simulate pin movement on map
- [ ] Submit form and see success screen
- [ ] Close success screen and verify toast
- [ ] Test on mobile viewport

---

## 📦 Dependencies Used

All already installed in package.json:

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@radix-ui/*` - UI primitives (via shadcn/ui)
- `lucide-react` - Icons
- `react-icons` - Additional icons (FaXTwitter, FaTiktok)

---

## 🎯 Next Steps

1. **Set up environment variables** (API_URL, Maps API key)
2. **Implement image upload** service (lib/api/media.ts)
3. **Fetch real data** for cities, facilities, types
4. **Integrate Google Maps** in AddressTab
5. **Connect form submission** to Payload /api/locations
6. **Add authentication** checks (only logged-in users)
7. **Handle success/error states** from API
8. **Add loading spinners** during upload/submit
9. **Test with real backend** and adjust types if needed
10. **Add edit mode** (reuse modal for editing existing locations)

---

## 📝 Form Flow Summary

```
User clicks "Adaugă locație"
  ↓
Modal opens → Tab 1 (Informații)
  ↓
User fills required fields → validation real-time
  ↓
User navigates tabs (Next/Previous)
  ↓
User reaches Tab 5 (Contact)
  ↓
Submit button enabled if all valid
  ↓
User clicks "Trimite spre aprobare"
  ↓
Form data logged to console (TODO: API call)
  ↓
Success screen shown with animated checkmark
  ↓
User clicks "Închide"
  ↓
Toast notification displayed
  ↓
Modal closes, form resets
```

---

**Status:** ✅ UI Complete | 🔄 Backend Integration Pending

