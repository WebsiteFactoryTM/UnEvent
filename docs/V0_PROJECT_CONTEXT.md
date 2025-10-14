# UN:EVENT - Project Context & Overview

**Version:** October 2025  
**Purpose:** Initial context document for V0 AI development  
**Tech Stack:** React + Next.js 15 (App Router) + TypeScript + Tailwind CSS 4+ → Will be integrated with Payload CMS

---

## 📋 PROJECT SUMMARY

**UN:EVENT** is a comprehensive event marketplace platform for Romania that centralizes:
- **Venues/Locations** (locații) for any type of event
- **Service Providers** (servicii) - DJs, bands, caterers, photographers, planners, etc.
- **Events** (evenimente) - concerts, weddings, corporate, festivals, cultural events
- **Users** - clients searching for venues/services + hosts/organizers listing them

**Core Value Proposition:**
- **For Clients:** Simplify searching, comparing, and contacting venues/services in one platform
- **For Businesses:** Free listing with dedicated pages including photos, description, contact, messaging, map, reviews

**Business Model:**
- Free basic listings
- Paid subscriptions for enhanced visibility (69-399 lei/month)
- Future: promoted listings, booking fees

---

## 🎨 DESIGN SYSTEM REQUIREMENTS

### Theme & Colors

**Primary Theme:**
- Dark mode by default (pure black #000000 or oklch(0.145 0 0))
- Light mode available (white backgrounds)
- Automatic system detection using `prefers-color-scheme`
- CSS custom properties for theme switching

**Color Palette:**

**Backgrounds:**
- Dark: Pure black (#000000) or near-black
- Light: White (#FFFFFF)

**Romanian Flag Accent Colors:**
- Blue: #002b7f (rgb(0, 43, 127))
- Yellow: #fcd116 (rgb(252, 209, 22))
- Red: #ce1126 (rgb(206, 17, 38))

**Glassmorphism Colors:**
- White overlays: bg-white/5, bg-white/10, bg-white/20
- Black overlays: bg-black/80, bg-black/90, bg-black/95
- Borders: border-white/10, border-white/20, border-white/30

**Accent Colors (icons, badges, highlights):**
- Green: green-400/500 (success states)
- Blue: blue-400/500 (information)
- Purple: purple-400/500 (features)
- Yellow: yellow-400/500 (highlights)
- Cyan: cyan-400/500 (interactions)
- Pink: pink-400/500 (community)

### Glassmorphism Effects (CORE DESIGN LANGUAGE)

**Feature Cards:**
```css
background: rgba(255, 255, 255, 0.05)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.1)
box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

/* Hover */
background: rgba(255, 255, 255, 0.08)
border: 1px solid rgba(255, 255, 255, 0.2)
```

**Navigation/Buttons:**
```css
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(15px)
border: 1px solid rgba(255, 255, 255, 0.2)
/* Hover: scale(1.05) + increased glow */
```

**Form Inputs:**
```css
background: semi-transparent with backdrop blur
border: white with 10-20% opacity
/* Focus: glow 0 0 20px rgba(255,255,255,0.2) */
```

### Typography

**Font Family:**
- Manrope (Google Font, variable weight)
- font-sans, antialiased

**Headings:**
- H1: `text-3xl md:text-5xl lg:text-6xl font-bold leading-tight`
- H2: `text-4xl md:text-5xl font-bold`
- H3: `text-xl md:text-2xl font-bold`
- Color: `text-white` (dark bg)

**Body Text:**
- Base: `text-base` or `text-lg leading-relaxed`
- Muted: `text-white/70`, `text-white/80`
- Micro-copy: `text-sm text-white/60`

### Spacing & Layout

**Container Widths:**
- `max-w-4xl`, `max-w-5xl`, `max-w-6xl`, `max-w-7xl`
- Always centered: `mx-auto`
- Horizontal padding: `px-4`

**Section Spacing:**
- Standard section: `py-20`
- Vertical rhythm: `space-y-8 md:space-y-12`
- Grid/flex gaps: `gap-6 md:gap-8`

**Border Radius:**
- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)
- Circular: `rounded-full`

### Animations

**Background Orbs/Bubbles:**
- Large blurred circles using Romanian flag colors
- Radial gradients with transparency
- Floating animation (20-32s duration, infinite)
- Positioned absolutely with `blur(30px)` filter
- Used only on hero sections or high importance sections

**Entrance Animations:**
- fadeInUp: opacity 0→1 + translateY(30px→0)
- Staggered delays: 0s, 0.2s, 0.4s, 0.6s
- Duration: 0.8s ease-out

**Hover States:**
- Scale: `hover:scale-105` or `hover:scale-110`
- Smooth transitions: `transition-all duration-300`

### Buttons

**Primary CTA:**
- `bg-white text-black px-6 py-3 rounded-lg font-semibold shadow-xl`
- `hover:bg-white/90`

**Secondary:**
- `bg-black text-white border border-white`
- Glassmorphism with backdrop-blur
- Pulsing glow animation (2s infinite)

### Responsive Design

**Breakpoints:**
- Mobile-first approach
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

---

## 👥 USER ROLES & AUTHENTICATION

### User Roles (can have multiple)

1. **Client** - Caută locații, servicii și evenimente
2. **Furnizor servicii** - Oferă servicii pentru evenimente
3. **Organizator de evenimente** - Organizează și gestionează evenimente
4. **Proprietar locație** - Oferă spații pentru evenimente

### Authentication Features

- Email & password registration
- Google & Facebook OAuth
- Email verification required
- Password reset functionality
- Profile photo, bio, contact info
- Verification system (ID upload + business documents for verified badge)

### Verification Process

**User can submit:**
- Full name + address
- Copy of ID (carte de identitate)
- If business: Company name, CUI (VAT), registered address, CUI document

**Result:**
- "Verificat" badge on profile and all their listings
- Increases trust and visibility

---

## 🏗️ CORE FEATURES

### 1. Three Types of Listings

#### A. Locations (Locații)
**241 location types** including:
- Săli de evenimente, restaurante, hoteluri, baruri, cluburi
- Spații culturale (teatre, muzee, galerii)
- Outdoor (parcuri, grădini, terase, plaje, munți)
- Studiouri foto/video
- Spații corporate, coworking

**279 facility tags** across categories:
- Spațiu & configurare, Mobilier, Audio/Lumini/Video
- Electricitate, Internet, Bucătărie & Catering, Bar
- Grupuri sanitare, Acces & Logistică, Parcare
- Confort & Climat, Outdoor, Sport & Leisure
- Siguranță, Accesibilitate, Sustenabilitate, Politici

#### B. Services (Servicii)
**887 service types** across 40+ categories including:
- Organizare & Planificare (event planners, coordinators)
- Entertainment (MC, comedians, magicians, dancers)
- Muzică (DJ, live bands, musicians by genre)
- Sunet, Lumini, Video, Streaming
- Foto & Video, Decor, Flori, Catering & Bar
- Beauty & Styling, Copii, Transport, Securitate

#### C. Events (Evenimente)
**375 event types** across 27 categories:
- Nunți & ceremonii de familie
- Sărbători & sezoniere
- Muzică & petreceri (by genre)
- Concerte & scene live
- Corporate & Business
- Cultură & Artă
- Sport, Gastronomie, Familie & Copii, etc.

### 2. Search & Discovery

**Tab-Based Search (Homepage Hero):**

**Tab 1: Locații**
- Ce eveniment organizezi? (event type tags)
- Unde? (city selection)
- Tip Locație (dropdown)
- Avansate (reveal): Capacitate min-max, Preț interval

**Tab 2: Servicii**
- Ce serviciu cauți? (service categories)
- Unde? (city)
- Pentru ce tip de eveniment? (event type tags)

**Tab 3: Evenimente**
- Ce tip de eveniment?
- Unde? (city)
- Când? (any date, today, tomorrow, this week, next week, this month, specific date)

**Search URL Format:**
- `/locatii?city=timisoara&type=bar`
- `/servicii?city=cluj&type=dj&event=nunta`
- `/evenimente?city=bucuresti&date=2025-10-20`

**Features:**
- All dropdowns scrollable with search functionality
- Reset filters option
- Grid view / Map view toggle
- Map shows pins for all listings, updates with filters
- Click pin → popup with photo, title, type, "Vezi detalii" button

### 3. Dedicated Listing Pages

**URL Structure (SEO-friendly):**
- Location: `/oras/locatie/{slug}` (e.g., `/timisoara/locatie/salon-nora`)
- Service: `/oras/serviciu/{slug}` (e.g., `/cluj-napoca/serviciu/dj-marian`)
- Event: `/oras/eveniment/{slug}` (e.g., `/brasov/eveniment/concert-jazz`)

**Alternative:**
- `/locatie/{slug}`, `/serviciu/{slug}`, `/eveniment/{slug}`

**Common Elements (all listing types):**
- Breadcrumbs: Acasă › {Oraș} › {Tip} › {Titlu}
- Hero with title, verified badge, rating, favorite/share/report icons
- Main CTA: "Contactează" / "Trimite mesaj" (opens messaging)
- Photo gallery (1 main + up to 10) with lightbox
- YouTube embeds (up to 3 links)
- Host/Provider sidebar card (photo, name, verified badge, city, website, social, "Trimite mesaj", "Vezi toate listările")
- Contact section (phones, email, website, social icons)
- Map & full address
- Reviews section with star rating + add review (logged-in users only, 1 per listing)
- "Similar listings in {City}" carousel
- "Maybe you're interested" cross-recommendations

**Specific to Locations:**
- Location type badge
- Capacity (persons), Surface (m²)
- Price (optional, per hour or per day)
- Facilities organized by category (multi-select chips/tags)
- "Destinată pentru" (event type tags)

**Specific to Services:**
- Service provider name (e.g., "DJ Marian")
- Service category badges
- Price (optional, per hour or per day)
- Services offered (category tags)
- Profile photo + cover (first gallery image)

**Specific to Events:**
- Event type
- Start date/time, End date/time
- All-day event checkbox
- "Participă la eveniment" CTA + participant count
- Ticket price or "Intrare liberă"

### 4. User Profiles (`/profil/{username}`)

**Header:**
- Avatar (96-128px, round)
- Name + verified badge
- Rating average + number of reviews (★ 5.0 – 1 evaluări)
- "Membru din {date}" badge
- Bio/tagline
- Social media icons (Facebook, Instagram, X, LinkedIn, YouTube, TikTok)
- "Sună" button + Message/Share/Report options

**Tabs with Listings:**
- Evenimente (x)
- Locații (y)
- Servicii (z)
- Empty state: "Nu există evenimente publicate"

**Reviews Section:**
- List of reviews with avatar, name, rating, date, comment
- "Lasă o evaluare" CTA (if interaction occurred)

### 5. User Dashboard (`/cont`)

**Tabs:**
- Locațiile mele
- Serviciile mele
- Evenimentele mele
- Mesaje (live chat with conversation history)
- Favorite (saved listings, removable)
- Abonamente (future)

**Profile Settings:**
- Edit profile (photo, name, email, phone, website, bio)
- Request verification (upload ID, business docs)
- Role management (request additional roles)
- Change password
- Delete account

**My Listings Sections:**

Each section shows:
- List of listings with title, short description, city, created date, views count
- Status badge: În așteptare / Aprobat / Respins / Finalizat (events only)
- Actions: Edit, View, Delete

**Add New Listing (Popup/Modal Forms):**

All forms have tabs with final "Thank you" step showing large checkmark + success message.

**Add Location Form (Tabs):**
1. **Info:** Title, Location type (searchable dropdown), Event types (multi-select tags), Description, Max capacity (persons), Surface (m²), Price toggle (per hour/day + RON amount)
2. **Address:** City (searchable dropdown), Full address (Google Maps autocomplete), Manual pin placement on map
3. **Facilities:** Multi-choice dropdown with search, organized by categories
4. **Images:** Main image (1), Gallery (max 10 photos), YouTube links (max 3)
   - **Image specs:** JPG/PNG/WebP, auto-compress to WebP ≤500KB, max 1920×1920px, portrait on black background, auto-generated alt text
5. **Contact:** Phones (max 2), Email, Website, Social media links (with icons)

**Add Service Form (Tabs):**
1. **Info:** Service provider name, Event types (tags), Description, Price toggle (per hour/day + RON)
2. **Services:** Multi-choice categories (similar to facilities)
3. **Address:** City, Full address, Map pin
4. **Images:** Profile image (1), Gallery (max 10), YouTube (max 3)
5. **Contact:** Phones, Email, Website, Social links

**Add Event Form (Tabs):**
1. **Info:** Event title, Event type, Description, Ticket price toggle (RON or "Intrare liberă")
2. **Address:** City, Full address, Map pin
3. **Images:** Main image, Gallery (max 10), YouTube (max 3)
4. **Schedule:** All-day event toggle, Start date (dd/mm/yyyy) + time (24h), End date + time
5. **Contact:** Phones, Email, Website, Social links

**Approval Flow:**
- All submitted listings go to user's dashboard as "În așteptare"
- After admin approval → status "Aprobat" → becomes public
- Admin can reject with reason

**Messaging:**
- Live messaging with conversation history
- Email notification for each new message received

**Favorites:**
- Grid of saved listing cards (locations/services/events)
- Organized by category
- Remove from favorites option

### 6. Recommended Listings

**Homepage Carousels:**

**Locații recomandate:**
- Cards with: Main photo, verified badge, favorite icon, title (80-100 char limit), description (210 char limit), icons for location/capacity/type, "Vezi detalii" button, rating (if exists)

**Servicii recomandate:**
- Cards with: Profile photo, service name (e.g., "DJ Marian"), service type badge, verified badge, rating star + review count, city with location icon, favorite icon

**Evenimente populare:**
- Cards with: Main photo, verified badge, favorite icon, title (80-100 char), description (210 char), icons for day/date/time/city, rating (if exists)

**Admin controls:** Admin can mark listings as "recomandate" in admin panel

---

## 📄 PAGE STRUCTURE & ROUTES

### Public Pages

#### Homepage (`/`)

**Meta:**
- Title: "Locații de nuntă, săli evenimente, DJ & catering | UN:EVENT"
- Description: "Platformă pentru locații de nuntă, săli de evenimente, DJ, formații, catering și foto-video. Prețuri și contact direct în România. Listează gratuit."

**Sections:**
1. **Hero Section**
   - Title: "Locații, evenimente și servicii în România"
   - Description: "Caută ce faci azi sau în weekend, rezervă spații pentru petreceri, nunți, workshop-uri și contactează rapid prestatori verificați..."
   - Tab-based search (Locații/Evenimente/Servicii) with filters

2. **CTA Section**
   - "Ai o locație sau oferi servicii? Listează-te gratuit și fii găsit de organizatori"
   - Buttons: "Listează locația" / "Listează serviciile" / "Adaugă eveniment"
   - Routes to login (if not logged in) or dashboard (if logged in)

3. **Locații recomandate** (carousel)
4. **Servicii recomandate** (carousel)
5. **Evenimente populare** (carousel)
6. **"Câștigă un venit suplimentar"** CTA section
7. **About** section

**Footer (4 columns):**
1. Logo + tagline ("Orice poveste începe cu un loc") + social media icons
2. Contact (phone, email, address with icons)
3. Utile (useful pages with icons)
4. Terms & policies (Termeni, Politica confidențialitate, Politica cookie) + Copyright + ANPC badges

#### Filtered Listing Pages

**Routes:**
- `/locatii` - All locations
- `/servicii` - All services
- `/evenimente` - All events

**Layout:**
- Header: Title (left), Subtitle ("Descoperă {n} locații/servicii/evenimente"), "Listează" button (right)
- Filter section with tabs (same as homepage)
- Results grid (default: recommended first, then by publish date)
- "Arată hartă" / "Arată listă" toggle button (center bottom)
- Map view shows all pins, auto-adjusts to filtered results
- Sponsored/recommended listings marked as "Sponsorizat" or "Recomandat"
- Pagination

#### Individual Listing Pages
(Detailed in Core Features section above)

#### User Profile Pages
(Detailed in Core Features section above)

#### Static Pages
- `/despre-noi` - About Us
- `/contact` - Contact
- `/termeni-si-conditii` - Terms & Conditions
- `/politica-de-confidentialitate` - Privacy Policy
- `/politica-cookie` - Cookie Policy

### Authenticated Pages

#### User Dashboard (`/cont`)
(Detailed in Core Features section above)

### Admin Pages (`/admin`)

**Tab Navigation:**
- Listări / Recenzii / Recomandate / Verificări / Utilizatori / Raportări / Analitice (future) / Abonamente (future) / Promovate (future)

#### 1. Listări Tab
**Sub-tabs:** Locații, Servicii, Evenimente

**Columns:**
- Titlu
- Oraș
- Tip
- Utilizator (changeable via dropdown search)
- Data creării
- Status (În așteptare, Aprobat, Respins, Finalizat for events)

**Actions:**
- Vezi (view full listing regardless of status)
- Editează
- Aprobă / Respinge
- Șterge

#### 2. Recenzii Tab

**Columns:**
- Recenzie (content preview)
- Listarea asociată (link)
- Data creării
- Utilizator
- Status (În așteptare, Aprobat, Respins)

**Actions:**
- Aprobă / Respinge
- Șterge

#### 3. Recomandate Tab

**Function:** Manage recommended listings

**List:**
- All listings (any type)

**Actions:**
- Adaugă la recomandate / Elimină din recomandate

**Effect:**
- Appears in homepage carousels by category
- Appears first in searches by city + type/event

#### 4. Verificări Tab

**Function:** Process verification requests from `/cont → Verifică-ți contul`

**Shows:**
- All submitted data (name, address, ID copy, business: company name, CUI, address, CUI doc, declarations)

**Actions:**
- Aprobă
- Respinge

#### 5. Utilizatori Tab

**Columns:**
- Utilizator
- Data creării contului
- Rating
- Roluri (can add/modify)

**Actions:**
- Suspendă
- Adaugă "verificat"
- Șterge
- Vezi profil

#### 6. Raportări Tab

**Function:** Manage reported content

**Shows:**
- Reported listings or accounts

**Actions:**
- Elimină flag (resolve report)

#### 7. Analitice Tab (Future)

**Metrics:**
- Listings: view counts
- Categories/Event types/Locations/Services: view counts
- "Call" button clicks per listing

#### 8. Abonamente Tab (Future)

**Shows:**
- Subscribed users
- Subscription types

**Actions:**
- Suspendă
- Anulează

#### 9. Promovate Tab (Future)

**Shows:**
- Promoted listings
- Promotion type
- Start/End dates

**Actions:**
- Suspendă
- Anulează

---

## 💰 SUBSCRIPTION PLANS

### Backstage (Free)
- Public listing on platform
- Contact info visible (phone, email, social)
- Photo/video gallery, map, organizer profile

### Spotlight (69 lei/month or 690 lei/year)
- "Recomandat" label on listing
- Priority in city/type searches

### Headliner (199 lei/month or 1,990 lei/year)
- All Spotlight features
- Homepage carousel appearances
- 1 social media post/month (promoted)
- Est. reach: 6,000-10,000/month

### Mainstage (399 lei/month or 3,990 lei/year)
- All Headliner features
- Pinned in city hubs + "Top of the month"
- 2 social media posts/month (min 1 video, promoted)
- Est. reach: 12,000-20,000/month

**Note:** Promoted/sponsored listings must be visibly marked as "Sponsorizat" or "Recomandat"

---

## 🔧 TECHNICAL REQUIREMENTS

### Frontend Stack
- **Framework:** Next.js 15+ with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4+ with @theme inline
- **UI Library:** React 19+
- **Theming:** CSS custom properties
- **Portals:** Mobile overlays use createPortal

### Key Functionalities to Implement

**1. Multi-tab Search Form**
- Three tabs with different filter sets
- Searchable dropdowns
- Range sliders (capacity, price)
- Date picker for events
- URL parameter management
- Reset filters functionality

**2. Map Integration**
- Google Maps with pins for all listings
- Filter-reactive (updates pins based on search)
- Click pin → popup with listing preview
- Manual pin placement in forms
- Address autocomplete

**3. Image Upload & Management**
- Main image (1) + Gallery (max 10)
- Format support: JPG, PNG, WebP
- Auto-compress to WebP ≤500KB
- Max dimensions: 1920×1920px
- Portrait images: display on black background
- Auto-generated alt text
- YouTube link embedding (max 3)

**4. Real-time Messaging**
- Live chat between users
- Conversation history
- Email notifications for new messages
- Unread message indicators

**5. Favorites System**
- Heart icon on all listing cards
- Save/unsave functionality
- Favorites page in user dashboard
- Organized by category (locations/services/events)

**6. Reviews & Ratings**
- 5-star rating system
- Text review
- Only logged-in users can review
- 1 review per user per listing
- Calculate and display average rating
- Show review count
- Display on listing pages and cards

**7. Verification System**
- Multi-step form for document upload
- ID card upload
- Business documents (optional)
- Admin approval workflow
- "Verificat" badge on approved users
- Badge propagates to all user's listings

**8. Role Management**
- Multiple roles per user (Client, Service Provider, Event Organizer, Location Owner)
- Role-based UI (show/hide tabs in dashboard)
- Request additional roles
- Admin can modify user roles

**9. Status Management**
- Listings: În așteptare, Aprobat, Respins
- Events: add "Finalizat" status
- Reviews: În așteptare, Aprobat, Respins
- Visual badges per status
- Filter by status in admin

**10. Social Sharing**
- Share button on all listings
- Copy link functionality
- Social media share (Facebook, Twitter, WhatsApp, etc.)
- UTM parameters for tracking

**11. Breadcrumbs**
- Dynamic breadcrumbs on all pages
- Format: Acasă › {Oraș} › {Tip} › {Titlu}
- BreadcrumbList schema.org markup

**12. SEO Features**
- Dynamic meta tags (title, description, OG)
- Canonical URLs
- Schema.org markup (LocalBusiness, Event, MusicGroup, ItemList)
- Sitemap generation
- Robots.txt

**13. Responsive Design**
- Mobile-first approach
- Hamburger menu on mobile
- Swipe gestures for carousels
- Touch-friendly targets (min 44x44px)
- Adaptive image sizing

**14. Accessibility**
- ARIA labels on icon buttons
- Keyboard navigation
- Focus states (`focus-visible:ring-2`)
- WCAG AA color contrast
- Semantic HTML5
- Screen reader support

---

## 📊 DATA MODELS (for Payload CMS integration)

### Collections Needed

#### Users
- name, email, password (hashed)
- role: array of ["client", "service_provider", "event_organizer", "location_owner"]
- profilePhoto, bio, phone, website
- socialMedia: { facebook, instagram, twitter, linkedin, youtube, tiktok }
- verified: boolean
- verificationStatus: "none" | "pending" | "approved" | "rejected"
- verificationData: { fullName, address, idDocument, isCompany, companyName, cui, companyAddress, cuiDocument }
- memberSince: date
- createdAt, updatedAt

#### Locations
- title, slug
- owner: relationship to Users
- locationType: relationship to LocationTypes
- eventTypes: relationship to EventTypes (many)
- description
- capacity: number
- surface: number (m²)
- priceEnabled: boolean
- pricePer: "hour" | "day"
- price: number
- city: relationship to Cities
- address, geo: { lat, lng }
- facilities: relationship to Facilities (many)
- mainImage, gallery: array of images
- youtubeLinks: array of strings (max 3)
- contact: { phones: [string, string], email, website, social }
- status: "pending" | "approved" | "rejected"
- rejectionReason: string
- views: number
- featured: boolean
- sponsored: boolean
- rating: number (calculated)
- reviewCount: number
- createdAt, updatedAt

#### Services
- name, slug
- provider: relationship to Users
- eventTypes: relationship to EventTypes (many)
- description
- serviceCategories: relationship to ServiceCategories (many)
- priceEnabled: boolean
- pricePer: "hour" | "day"
- price: number
- city: relationship to Cities
- address, geo: { lat, lng }
- profileImage, gallery: array of images
- youtubeLinks: array of strings (max 3)
- contact: { phones, email, website, social }
- status: "pending" | "approved" | "rejected"
- rejectionReason: string
- views: number
- featured: boolean
- sponsored: boolean
- rating: number
- reviewCount: number
- createdAt, updatedAt

#### Events
- title, slug
- organizer: relationship to Users
- eventType: relationship to EventTypes
- description
- city: relationship to Cities
- address, geo: { lat, lng }
- allDayEvent: boolean
- startDate, startTime
- endDate, endTime
- ticketPriceEnabled: boolean
- ticketPrice: number OR freeEntry: boolean
- mainImage, gallery: array of images
- youtubeLinks: array of strings (max 3)
- contact: { phones, email, website, social }
- status: "pending" | "approved" | "rejected" | "finished"
- rejectionReason: string
- participants: number
- views: number
- featured: boolean
- sponsored: boolean
- rating: number
- reviewCount: number
- createdAt, updatedAt

#### Reviews
- listing: polymorphic relationship (Location | Service | Event)
- user: relationship to Users
- rating: number (1-5)
- comment: text
- status: "pending" | "approved" | "rejected"
- createdAt

#### Messages
- conversation: string (generated ID for user pairs)
- sender: relationship to Users
- recipient: relationship to Users
- relatedListing: polymorphic relationship (Location | Service | Event)
- message: text
- read: boolean
- createdAt

#### Favorites
- user: relationship to Users
- listing: polymorphic relationship (Location | Service | Event)
- createdAt

#### Cities (Taxonomies)
- name, slug
- county: string
- featured: boolean

#### LocationTypes (Taxonomies)
- name, slug
- category: string
- description: text

#### EventTypes (Taxonomies)
- name, slug
- category: string
- description: text

#### Facilities (Taxonomies)
- name, slug
- category: string (e.g., "Spațiu & Configurare", "Audio, Lumini & Video")

#### ServiceCategories (Taxonomies)
- name, slug
- category: string (e.g., "Organizare & Planificare", "Entertainment")

#### Subscriptions (Future)
- user: relationship to Users
- plan: "spotlight" | "headliner" | "mainstage"
- billing: "monthly" | "annual"
- price: number
- startDate, endDate
- status: "active" | "cancelled" | "suspended"
- stripeSubscriptionId: string

---

## 🎯 COMPONENT REQUIREMENTS

### Core Components to Build

**Layout Components:**
- `Header` - Fixed header with logo, navigation, dark/light toggle, login/profile menu
- `Footer` - 4-column footer with logo, contact, links, legal
- `MobileMenu` - Full-screen overlay menu (portal-based)
- `Breadcrumbs` - Dynamic breadcrumb navigation

**Search Components:**
- `HeroSearch` - Tab-based search form with all filter types
- `SearchTabs` - Tab switcher (Locații/Evenimente/Servicii)
- `LocationFilters` - Filters for location search
- `ServiceFilters` - Filters for service search
- `EventFilters` - Filters for event search
- `SearchableDropdown` - Reusable dropdown with search
- `RangeSlider` - Min-max range selector (capacity, price)
- `DatePicker` - Date selection for events

**Card Components:**
- `LocationCard` - Card for location listings
- `ServiceCard` - Card for service listings
- `EventCard` - Card for event listings
- `UserCard` - Card for user profiles in sidebars
- All cards need: image, title, description (truncated), badges, favorite icon, rating, CTA button

**Carousel Components:**
- `Carousel` - Reusable carousel wrapper
- `CarouselDots` - Dot indicators
- `CarouselButtons` - Navigation arrows

**Listing Detail Components:**
- `ListingHero` - Hero section with main image, title, badges, actions
- `ImageGallery` - Main image + thumbnail gallery with lightbox
- `YouTubeEmbed` - Embedded YouTube videos
- `FacilityTags` - Chip/tag display for facilities
- `ServiceTags` - Chip/tag display for services
- `EventDetails` - Date/time/participant display
- `HostSidebar` - Host/provider info card
- `ContactSection` - Contact information display
- `MapSection` - Google Maps embed with pin
- `ReviewsList` - List of reviews
- `AddReview` - Review submission form
- `RecommendedListings` - Similar listings carousel

**Form Components:**
- `TabForm` - Multi-step tabbed form container
- `ImageUpload` - Image upload with preview (single + gallery)
- `YouTubeLinkInput` - Input for YouTube URLs
- `TagSelector` - Multi-select tag picker
- `CitySelector` - City searchable dropdown
- `AddressInput` - Address with Google autocomplete
- `MapPicker` - Interactive map for pin placement
- `PhoneInput` - Phone number input (max 2)
- `SocialLinks` - Social media URL inputs with icons
- `PriceToggle` - Enable price + per hour/day selector

**User Dashboard Components:**
- `DashboardNav` - Tab navigation for dashboard sections
- `MyListingsTable` - Table/grid of user's listings with actions
- `ListingStatusBadge` - Visual status indicator
- `AddListingButton` - Opens modal for new listing
- `MessagingPanel` - Live chat interface
- `ConversationList` - List of message threads
- `FavoritesGrid` - Grid of favorited listings
- `ProfileEditor` - Profile information edit form
- `VerificationForm` - Document upload for verification

**Admin Components:**
- `AdminNav` - Tab navigation for admin sections
- `ListingsTable` - Admin view of all listings
- `ReviewsTable` - Admin view of all reviews
- `UsersTable` - Admin view of all users
- `ApprovalActions` - Approve/reject buttons with reason input
- `RecommendedToggle` - Toggle for featured/recommended status

**UI Components:**
- `Button` - Primary, secondary, ghost variants
- `Badge` - Status badges (verified, sponsored, status)
- `Icon` - Icon library wrapper (react-icons)
- `Modal` - Glassmorphic modal/dialog
- `Toast` - Notification toasts
- `Tooltip` - Hover tooltips
- `Loading` - Loading spinners/skeletons
- `EmptyState` - Empty state messages with CTA

**Utility Components:**
- `SEO` - Meta tags, OG tags, Schema.org markup
- `ThemeProvider` - Dark/light mode context
- `AuthGuard` - Protected route wrapper
- `RoleGuard` - Role-based access control

---

## 🌐 SEO REQUIREMENTS

### URL Structure (Programmatic SEO)

**City Hub Pages:**
- `/oras/{slug-oras}` - City overview
- `/oras/{slug-oras}/locatii` - All locations in city
- `/oras/{slug-oras}/locatii/{tip-eveniment}` - Locations for event type in city
- `/oras/{slug-oras}/servicii` - All services in city
- `/oras/{slug-oras}/servicii/{categorie}` - Service category in city
- `/oras/{slug-oras}/evenimente` - All events in city

**Listing Detail Pages:**
- `/oras/locatie/{slug}` or `/locatie/{slug}`
- `/oras/serviciu/{slug}` or `/serviciu/{slug}`
- `/oras/eveniment/{slug}` or `/eveniment/{slug}`

### Meta Templates

**Location Hub:**
- Title: "Locații {tip-eveniment} în {Oraș} — UN:EVENT"
- Description: "Vezi cele mai bune locații pentru {tip-eveniment} în {Oraș}: capacitate, preț, hartă, recenzii verificate."

**Service Hub:**
- Title: "{Categorie servicii} în {Oraș} — UN:EVENT"
- Description: "Găsește cei mai buni {categorie servicii} în {Oraș}. Compară prețuri, citește recenzii și contactează rapid."

**Event Hub:**
- Title: "Evenimente în {Oraș} — UN:EVENT"
- Description: "Descoperă evenimente în {Oraș}. Concerte, petreceri, workshop-uri și multe altele."

### Schema.org Markup

**Global:**
- WebSite with SearchAction
- Organization (logo, sameAs)

**Location Listing:**
- LocalBusiness / Place
- address, geo, image, aggregateRating, amenityFeature, priceRange, sameAs

**Service Listing:**
- Service / PerformingGroup / MusicGroup (depending on type)
- areaServed, offers, aggregateRating, sameAs

**Event Listing:**
- Event
- location, startDate, endDate, offers, organizer, aggregateRating

**List Pages:**
- ItemList with positions

**Review:**
- Review with author, reviewRating, reviewBody

**Breadcrumbs:**
- BreadcrumbList

### Indexing Rules
- Index: Clean URLs without query parameters
- Noindex: URLs with filters (?pretMin=..., ?data=...)
- Canonical: Self-canonical on all indexed pages
- Pagination: Page 2+ indexable with "(pagina 2)" in H1

---

## 📱 MOBILE CONSIDERATIONS

- Touch targets minimum 44x44px
- Swipeable carousels
- Collapsible filters
- Sticky "Arată hartă" button
- Bottom sheet for map view on mobile
- Tap-to-call on phone numbers
- Tap-to-open maps on addresses
- Mobile-optimized image sizes
- Reduced motion support

---

## ♿ ACCESSIBILITY CHECKLIST

- Semantic HTML5 (header, nav, main, article, section, footer)
- ARIA labels on icon-only buttons
- ARIA expanded states for accordions/dropdowns
- Keyboard navigation support
- Focus visible states (ring)
- Skip to main content link
- Alt text on all images
- WCAG AA color contrast
- Screen reader announcements for dynamic content
- Form labels and error messages
- Heading hierarchy (H1 → H2 → H3)

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Public Routes (no auth required)
- Homepage, search, listing details, user profiles, static pages

### Protected Routes (authentication required)
- `/cont/*` - User dashboard
- Message sending
- Add/edit listings
- Favorites
- Reviews (can read public, must auth to write)

### Role-Based Access
- **Client:** Can favorite, message, review
- **Service Provider:** Can create services
- **Event Organizer:** Can create events
- **Location Owner:** Can create locations
- **Admin:** Access to `/admin/*`

### Admin Routes (admin role only)
- `/admin/*` - All admin panel pages

---

## 📧 EMAIL NOTIFICATIONS (for context)

**User Emails:**
- Welcome + email confirmation
- Listing approved/rejected
- Message received
- Review received
- Event participant notification
- Verification approved/rejected
- Password reset

**Admin Emails:**
- New listing pending approval
- New review pending approval
- New user registered
- New report submitted
- New verification request

---

## 🎨 DESIGN PRINCIPLES SUMMARY

**Visual Hierarchy:**
1. Primary CTAs: White buttons, bold, large, pulsing glow
2. Secondary actions: Glassmorphism with border
3. Content cards: Subtle glassmorphism, hover lift
4. Background: Pure black with floating orbs
5. Text: White with opacity (100% → 90% → 80% → 70% → 60%)

**Brand Personality:**
- Modern, premium, trustworthy
- Minimal yet warm
- Technology-forward but human
- Romanian-centric (flag colors as accents)
- Clean, uncluttered interfaces
- Smooth, delightful interactions

---

## 📝 IMPORTANT NOTES FOR DEVELOPMENT

1. **Glassmorphism is CORE** - Every card, modal, and surface should have the glassmorphic treatment
2. **Romanian flag colors** - Use sparingly as accents, not dominant colors
3. **Floating orbs** - Background animations with Romanian flag colors, always present
4. **Responsive first** - Mobile-first development approach
5. **Performance** - ISR for listing pages, optimize images, lazy load
6. **SEO critical** - City + category pages are the traffic drivers
7. **User trust** - Verified badges, reviews, real photos are essential
8. **Free forever** - Basic listing must always be free and valuable
9. **Spam prevention** - Require verification for certain actions
10. **GDPR compliant** - Cookie consent, data privacy, right to delete

---

## 🚀 DEVELOPMENT PRIORITIES (for reference)

**Phase 1: Core Platform (MVP)**
1. Authentication & user roles
2. Homepage with search
3. Listing pages (locations, services, events)
4. User dashboard (create/edit listings)
5. Search & filtering
6. Map integration
7. Basic admin panel (approve/reject)

**Phase 2: Engagement**
1. Messaging system
2. Reviews & ratings
3. Favorites
4. User profiles (public)
5. Verification system
6. Email notifications

**Phase 3: Growth**
1. Subscription plans
2. Payment integration
3. Promoted listings
4. Analytics dashboard
5. Social media integration
6. Advanced admin features

**Phase 4: Future**
- AI recommendations
- Order forms for event planning
- Event planning guides
- Mobile apps (React Native)

---

## 🎯 SUCCESS METRICS (for context)

**For Users:**
- Ease of finding relevant listings (search → detail → contact in < 3 clicks)
- Trust signals (verified badges, reviews, real photos)
- Fast response from providers via messaging

**For Providers:**
- Free valuable listing
- Clear upgrade path to paid plans
- Lead generation (messages, calls)

**For Platform:**
- Listings growth (target: 1000+ locations, 2000+ services in first year)
- User engagement (messages sent, reviews written)
- Conversion to paid plans (target: 10% of active listings)
- SEO traffic (target: rank top 3 for "{service} {oraș}")

---

## 🛠️ ADDITIONAL CONTEXT

**Target Cities (Priority):**
Top 10 Romanian cities to launch with: București, Cluj-Napoca, Timișoara, Iași, Constanța, Brașov, Galați, Craiova, Ploiești, Oradea

**Content Sourcing:**
- Locations: Import from existing databases (279 facilities, 241 location types)
- Services: Invite existing providers (887 service types)
- Events: Partner with organizers (375 event types)
- Reviews: Encourage post-event reviews with incentives

**Competition:**
- Generic platforms: OLX, Facebook Events (no specialization)
- Vertical platforms: LaFurca.com (weddings only), Eventbook.ro (ticketing only)
- Advantage: Comprehensive, free, local, verified

**Revenue Streams:**
1. Subscription plans (primary)
2. Promoted listings (future)
3. Commission on bookings (future)
4. Premium features (priority support, analytics) (future)

---

## 📚 RESOURCES PROVIDED

**Taxonomy Files:**
- Location types: 241 items in 23 categories
- Facilities: 279 items in 18 categories
- Service types: 887 items in 40+ categories
- Event types: 375 items in 27 categories

**Design Assets:**
- Color palette with exact hex codes
- Typography specifications (Manrope font)
- Glassmorphism CSS specifications
- Animation timings and easing functions
- Component patterns and examples

**Technical Specs:**
- SEO blueprint with code examples
- Analytics implementation guide
- Email template content (20 user + 6 admin)
- Subscription plan details with pricing

---

## 🎬 READY TO START

This document provides comprehensive context for building UN:EVENT. Development will proceed step-by-step, with specific prompts for each feature/component while maintaining consistency with this overall vision.

**Key Takeaways for V0:**
- Glassmorphism design language is NON-NEGOTIABLE
- Dark mode is PRIMARY (light mode secondary)
- Romanian flag colors as accents only
- Mobile-first, accessible, SEO-optimized
- Free listings are core value proposition
- Trust & verification are critical for success

---

*Document Version: 1.0 - October 2025*  
*Project: UN:EVENT - Event Marketplace Platform for Romania*  
*Tech Stack: React + Next.js 15 + TypeScript + Tailwind CSS 4 → Payload CMS Integration*

