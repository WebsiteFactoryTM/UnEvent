/**
 * Google Maps Manager - Singleton pattern for managing map instances
 * Prevents multiple map instances and handles proper cleanup
 */

interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
  mapId?: string;
}

interface MapItem {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  subtitle?: string;
  detailPath: string;
}

class GoogleMapsManager {
  private static instance: GoogleMapsManager;
  private mapInstance: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private infoWindow: google.maps.InfoWindow | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private currentContainer: HTMLElement | null = null;
  private clickListener: google.maps.MapsEventListener | null = null;
  private boundsChangedListener: google.maps.MapsEventListener | null = null;

  private constructor() {}

  static getInstance(): GoogleMapsManager {
    if (!GoogleMapsManager.instance) {
      GoogleMapsManager.instance = new GoogleMapsManager();
    }
    return GoogleMapsManager.instance;
  }

  async loadGoogleMaps(): Promise<void> {
    // Check if Google Maps is already loaded
    if (
      this.isLoaded ||
      (typeof window !== "undefined" && window.google?.maps)
    ) {
      this.isLoaded = true;
      return Promise.resolve();
    }

    // Check if script is already loading
    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    // Check if script tag already exists in DOM (check for any Google Maps API script)
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyD9lLGCpqp3dRF9vCWe3sSH7VGPnZ-we0Y";
    const scriptSrc = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

    // Check for any existing Google Maps script (might have slightly different URL)
    const existingScript = Array.from(document.querySelectorAll("script")).find(
      (script) =>
        script.src.includes("maps.googleapis.com/maps/api/js") &&
        script.src.includes(apiKey),
    ) as HTMLScriptElement | undefined;

    if (existingScript) {
      // Script exists - check if already loaded or wait for it
      this.isLoading = true;
      this.loadPromise = new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.google?.maps) {
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
          return;
        }

        // Wait for script to load using addEventListener
        const handleLoad = () => {
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
        };

        const handleError = () => {
          this.isLoading = false;
          reject(new Error("Failed to load Google Maps."));
        };

        // Use addEventListener instead of onload to avoid overwriting
        existingScript.addEventListener("load", handleLoad);
        existingScript.addEventListener("error", handleError);
      });
      return this.loadPromise;
    }

    // No existing script - create new one
    this.isLoading = true;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        this.isLoading = false;
        resolve();
      };

      script.onerror = (error) => {
        this.isLoading = false;
        console.error("Failed to load Google Maps:", error);
        reject(
          new Error("Failed to load Google Maps. Please check your API key."),
        );
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  async initializeMap(
    container: HTMLElement,
    config: MapConfig,
  ): Promise<google.maps.Map> {
    // If map is already initialized in the same container, return existing instance
    if (this.mapInstance && this.currentContainer === container) {
      return this.mapInstance;
    }

    // If map exists but in different container, clean it up first
    if (this.mapInstance && this.currentContainer !== container) {
      this.cleanup();
    }

    await this.loadGoogleMaps();

    this.mapInstance = new google.maps.Map(container, {
      center: config.center,
      zoom: config.zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    this.currentContainer = container;
    return this.mapInstance;
  }

  updateMarkers(items: MapItem[]): void {
    if (!this.mapInstance) return;

    // Clear existing markers
    this.clearMarkers();

    items.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: item.latitude, lng: item.longitude },
        map: this.mapInstance!,
        title: item.title,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2C10.48 2 6 6.48 6 12c0 8.25 10 18 10 18s10-9.75 10-18c0-5.52-4.48-10-10-10zm0 13.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="hsl(var(--primary))" stroke="white" stroke-width="1"/>
              </svg>
            `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32),
        },
      });

      marker.addListener("click", () => {
        // Get computed CSS variable values from the document (InfoWindow can't access CSS variables)
        const getComputedCSSVar = (varName: string): string => {
          const root = document.documentElement;
          const computed = getComputedStyle(root)
            .getPropertyValue(varName)
            .trim();
          return computed || "";
        };

        const backgroundColor = getComputedCSSVar("--background");
        const foregroundColor = getComputedCSSVar("--foreground");
        const mutedForegroundColor = getComputedCSSVar("--muted-foreground");
        const borderColor = getComputedCSSVar("--border");
        const primaryColor = getComputedCSSVar("--primary");
        const primaryForegroundColor = getComputedCSSVar(
          "--primary-foreground",
        );

        // Build Google Maps directions URL
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

        // Use computed CSS variable values for theming to match UI
        // Inject CSS to override Google Maps InfoWindow default white background
        const content = `
            <style>
              .gm-style .gm-style-iw-c {
                background: ${backgroundColor} !important;
                padding: 0 !important;
                border-radius: 0.5rem !important;
              }
              .gm-style .gm-style-iw-d {
                background: ${backgroundColor} !important;
                overflow: hidden !important;
              }
              .gm-style .gm-style-iw-t::after {
                background: ${backgroundColor} !important;
              }
            </style>
            <div style="padding: 0.75rem; background: ${backgroundColor}; border-radius: 0.5rem; min-width: 200px; max-width: 280px;">
              ${
                item.thumbnail
                  ? `
                <img 
                  src="${item.thumbnail}" 
                  alt="${item.title}" 
                  style="width: 100%; height: 120px; object-fit: cover; border-radius: 0.375rem; margin-bottom: 0.5rem; border: 1px solid ${borderColor};"
                />
              `
                  : ""
              }
              <h3 style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem; color: ${foregroundColor}; line-height: 1.25rem;">
                ${item.title}
              </h3>
              ${
                item.subtitle
                  ? `
                <p style="font-size: 0.75rem; color: ${mutedForegroundColor}; margin-bottom: 0.5rem; line-height: 1rem;">
                  ${item.subtitle}
                </p>
              `
                  : ""
              }
              <button 
                onclick="window.location.href='${item.detailPath}'" 
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.25rem;
                  padding: 0.5rem 0.75rem;
                  background: ${primaryColor};
                  color: ${primaryForegroundColor};
                  font-size: 0.75rem;
                  font-weight: 500;
                  border-radius: 0.375rem;
                  border: none;
                  cursor: pointer;
                  transition: all 0.2s;
                  width: 100%;
                  margin-top: 0.5rem;
                "
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
              >
                Vezi detalii
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </button>
              <button 
                onclick="window.open('${directionsUrl}', '_blank')" 
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 0.25rem;
                  padding: 0.5rem 0.75rem;
                  background: transparent;
                  color: ${primaryColor};
                  font-size: 0.75rem;
                  font-weight: 500;
                  border-radius: 0.375rem;
                  border: 1px solid ${borderColor};
                  cursor: pointer;
                  transition: all 0.2s;
                  width: 100%;
                  margin-top: 0.5rem;
                "
                onmouseover="this.style.opacity='0.9'; this.style.borderColor='${primaryColor}'"
                onmouseout="this.style.opacity='1'; this.style.borderColor='${borderColor}'"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Obține direcții
              </button>
            </div>
          `;

        if (this.infoWindow) {
          this.infoWindow.close();
        }

        this.infoWindow = new google.maps.InfoWindow({
          content,
          maxWidth: 250,
        });

        this.infoWindow.open(this.mapInstance!, marker);
      });

      this.markers.push(marker);
    });
  }

  updateCenter(center: { lat: number; lng: number }, zoom?: number): void {
    if (!this.mapInstance) return;

    this.mapInstance.setCenter(center);
    if (zoom) {
      this.mapInstance.setZoom(zoom);
    }
  }

  fitBounds(items: MapItem[]): void {
    if (!this.mapInstance || items.length === 0) return;

    const validItems = items.filter((item) => item.latitude && item.longitude);
    if (validItems.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    validItems.forEach((item) => {
      bounds.extend({ lat: item.latitude!, lng: item.longitude! });
    });

    this.mapInstance.fitBounds(bounds);
  }

  onMapClick(callback: (lat: number, lng: number) => void): void {
    if (!this.mapInstance) return;

    // Remove existing click listener if any
    if (this.clickListener) {
      google.maps.event.removeListener(this.clickListener);
    }

    this.clickListener = this.mapInstance.addListener(
      "click",
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          callback(e.latLng.lat(), e.latLng.lng());
        }
      },
    );
  }

  onBoundsChanged(callback: (bounds: google.maps.LatLngBounds) => void): void {
    if (!this.mapInstance) return;

    // Remove existing bounds changed listener if any
    if (this.boundsChangedListener) {
      google.maps.event.removeListener(this.boundsChangedListener);
    }

    this.boundsChangedListener = this.mapInstance.addListener(
      "bounds_changed",
      () => {
        const bounds = this.mapInstance!.getBounds();
        if (bounds) {
          callback(bounds);
        }
      },
    );
  }

  removeEventListeners(): void {
    if (this.clickListener) {
      google.maps.event.removeListener(this.clickListener);
      this.clickListener = null;
    }

    if (this.boundsChangedListener) {
      google.maps.event.removeListener(this.boundsChangedListener);
      this.boundsChangedListener = null;
    }
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  cleanup(): void {
    this.clearMarkers();
    this.removeEventListeners();

    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = null;
    }

    if (this.mapInstance) {
      // Clear all event listeners
      google.maps.event.clearInstanceListeners(this.mapInstance);
      this.mapInstance = null;
    }

    this.currentContainer = null;
  }

  getMapInstance(): google.maps.Map | null {
    return this.mapInstance;
  }

  isMapLoaded(): boolean {
    return this.isLoaded;
  }
}

export const mapManager = GoogleMapsManager.getInstance();
