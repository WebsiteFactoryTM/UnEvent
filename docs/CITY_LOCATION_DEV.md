# City Collection & UI Strategy (UnEvent)

## 1. Objective
We need a canonical `Cities` collection to centralize city data across the UnEvent platform. This ensures consistency in location references for listings, profiles, and events, enabling efficient filtering, SEO-friendly city pages, and accurate geolocation features. The collection acts as a single source of truth for city metadata, improving data integrity and user experience.

## 2. Backend Implementation Plan
- Create a `cities` collection in Payload with fields: `name`, `slug`, `country`, `geo` (point), `source`, `usageCount`.
- Implement a `beforeChange` hook to auto-generate the `slug` from the city name.
- Develop a utility or hook `findOrCreateCity()` to be used when listings or profiles submit city data, ensuring cities are created or retrieved dynamically.
- Allow dynamic creation of cities from Google Places input with `source: "google"`.
- Include a `geo` point field to store latitude and longitude coordinates.
- Add admin UI features to search and sort cities by name, usage count, and country.
- Optionally, schedule a daily merge or cleanup job to handle duplicate city names and maintain data quality.

## 3. Seeding and Sync
- Create a script `/scripts/seedCities.ts` to prefill the collection with Romanian and major EU cities.
- Use `source: "seeded"` to mark seeded city data.
- Ensure consistent slug normalization for reliable lookups and to prevent duplicates.

## 4. Frontend Integration (UI)

### 4.1 City Selection
- Implement Google Places Autocomplete for city selection or manual input.
- On city selection:
  - Extract city name, country, and latitude/longitude from the Google Places API.
  - Send this data to the backend endpoint `/api/cities/find-or-create`.
  - Receive the city ID from the backend to associate with listings or profiles.

### 4.2 Filtering
- Populate city dropdown filters from the cached `/api/cities` endpoint.
- Support text-based search with fallback to Google Places Autocomplete if the city is not found locally.
- Store the selected city in the filter context to enable URL-driven search pages like `/oras/{slug}`.

### 4.3 City Pages
- Generate SEO-friendly hub pages for each city at `/oras/{slug}`.
- Display featured listings (locations, events, services) relevant to the city.
- Show a map view using the `geo` coordinates.
- Display the count of listings associated with the city.

## 5. Data Sync and Validation
- When new listings include an unrecognized city:
  - Use Google Places API to validate and retrieve city data.
  - Send the data to Payload to create a new city entry if it does not exist.
- Prevent duplicates by checking for existing slugs before creation.
- Optionally, include an admin moderation flag `verified` to mark trusted city entries.

## 6. Example Schema (Summary)
```ts
export const Cities = {
  slug: 'cities',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'country', type: 'text', defaultValue: 'Romania' },
    { name: 'source', type: 'select', options: ['seeded', 'google', 'user'], defaultValue: 'seeded' },
    { name: 'geo', type: 'point' },
    { name: 'usageCount', type: 'number' },
    { name: 'verified', type: 'checkbox', defaultValue: false },
  ],
}
```

## 7. UI Flow Diagram
```
User selects city → Google Places → Next.js API → Payload findOrCreateCity → returns ID → listing form
```

## 8. Reference Implementation (Current Logic)

The current city and address handling logic is implemented across three main example files located in `unevent/docs/cityHandleCodeExamples`:

- `geocoding.ts` manages Google Maps API calls and the extraction of geographic coordinates. It encapsulates the logic for querying the Google Places API and parsing location data.

- `AddressInput.tsx` provides the user-facing address input component. It handles user input, triggers auto-geocoding on address changes, and uses callbacks to pass extracted city, latitude, and longitude data up to the parent form component.

- `LocationForm.tsx` integrates the geocoded data with Supabase for backend storage. It supports manual selection of city and county fields, synchronizes geolocation data to listings, and manages form state related to location.

### Alignment Plan

These components will be adapted to connect with Payload’s `/api/cities/find-or-create` endpoint in future iterations. The geocoding logic is expected to remain primarily frontend-side, while Payload will ensure data normalization and centralized slug-based city storage.

Planned refactors include deduplicating the `extractLocationInfo` utility, normalizing city names through slugification, and implementing auto-selection of cities when matches exist in the Payload database to improve user experience and data consistency.
