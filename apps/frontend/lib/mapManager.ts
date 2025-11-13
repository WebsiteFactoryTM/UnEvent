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

  private constructor() {}

  static getInstance(): GoogleMapsManager {
    if (!GoogleMapsManager.instance) {
      GoogleMapsManager.instance = new GoogleMapsManager();
    }
    return GoogleMapsManager.instance;
  }

  async loadGoogleMaps(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const apiKey =
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        "AIzaSyD9lLGCpqp3dRF9vCWe3sSH7VGPnZ-we0Y";

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        this.isLoading = false;
        console.log("Google Maps loaded successfully");
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
        const content = `
            <div class="p-3  bg-background">
              ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" class="w-full h-24 object-cover rounded mb-2" />` : ""}
              <h3 class="font-semibold text-sm mb-1">${item.title}</h3>
              ${item.subtitle ? `<p class="text-xs text-gray-600 mb-2">${item.subtitle}</p>` : ""}
              <button 
                onclick="window.location.href='${item.detailPath}'" 
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Vezi detalii
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
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

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.setMap(null));
    this.markers = [];
  }

  cleanup(): void {
    this.clearMarkers();

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
