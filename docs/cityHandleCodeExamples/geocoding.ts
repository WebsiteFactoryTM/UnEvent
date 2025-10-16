// Google Geocoding API integration
// This service handles address-to-coordinates conversion and reverse geocoding

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id?: string;
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

export interface GeocodingError {
  error: string;
  message: string;
}

// Get Google Maps API key from environment
const getGoogleMapsApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn(
      "Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables."
    );
    return "";
  }
  return apiKey;
};

// Geocode an address to get coordinates
export const geocodeAddress = async (
  address: string
): Promise<GeocodingResult | GeocodingError> => {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return {
      error: "NO_API_KEY",
      message: "Google Maps API key not configured",
    };
  }

  if (!address || address.trim().length < 5) {
    return {
      error: "INVALID_ADDRESS",
      message: "Address must be at least 5 characters long",
    };
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}&region=ro&language=ro`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        address_components: result.address_components,
      };
    } else if (data.status === "ZERO_RESULTS") {
      return {
        error: "NO_RESULTS",
        message: "No results found for this address",
      };
    } else if (data.status === "OVER_QUERY_LIMIT") {
      return {
        error: "QUOTA_EXCEEDED",
        message: "Google Maps API quota exceeded",
      };
    } else {
      return {
        error: "API_ERROR",
        message: `Google Maps API error: ${data.status}`,
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      error: "NETWORK_ERROR",
      message: "Network error while geocoding address",
    };
  }
};

// Reverse geocode coordinates to get address
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<GeocodingResult | GeocodingError> => {
  const apiKey = getGoogleMapsApiKey();

  if (!apiKey) {
    return {
      error: "NO_API_KEY",
      message: "Google Maps API key not configured",
    };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&region=ro&language=ro`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: lat,
        lng: lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
        address_components: result.address_components,
      };
    } else {
      return {
        error: "NO_RESULTS",
        message: "No address found for these coordinates",
      };
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      error: "NETWORK_ERROR",
      message: "Network error while reverse geocoding",
    };
  }
};

// Validate if coordinates are in Romania
export const isInRomania = (lat: number, lng: number): boolean => {
  // Romania bounding box (approximate)
  const minLat = 43.6884;
  const maxLat = 48.2209;
  const minLng = 20.2202;
  const maxLng = 29.7151;

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

// Extract city and county from address components
export const extractLocationInfo = (addressComponents: any[]): { city: string; county: string } => {
  let city = "";
  let county = "";

  for (const component of addressComponents) {
    if (component.types.includes("locality")) {
      city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      county = component.long_name;
    }
  }

  return { city, county };
};

// Debounce utility for address input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
