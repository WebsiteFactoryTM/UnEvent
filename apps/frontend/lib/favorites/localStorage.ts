const STORAGE_KEY = "unevent_anonymous_favorites";
const MAX_ANONYMOUS_FAVORITES = 100;

export interface AnonymousFavorite {
  targetKey: string;
  entity: "locations" | "events" | "services";
  id: number;
  addedAt: number;
}

// SSR-safe getter
export function getAnonymousFavorites(): AnonymousFavorite[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to read anonymous favorites:", error);
    return [];
  }
}

// Debounced save to prevent excessive writes
let saveTimeout: NodeJS.Timeout | null = null;
function saveFavorites(favorites: AnonymousFavorite[]) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
      // Handle quota exceeded gracefully
    }
  }, 100);
}

// Check if exists
export function isAnonymousFavorite(
  entity: "locations" | "events" | "services",
  id: number,
): boolean {
  const favorites = getAnonymousFavorites();
  return favorites.some((f) => f.entity === entity && f.id === id);
}

// Add with limit check
export function addAnonymousFavorite(
  entity: "locations" | "events" | "services",
  id: number,
): void {
  const favorites = getAnonymousFavorites();

  // Check limit
  if (favorites.length >= MAX_ANONYMOUS_FAVORITES) {
    throw new Error("Maximum anonymous favorites reached. Please log in.");
  }

  // Don't add duplicates
  if (!favorites.some((f) => f.entity === entity && f.id === id)) {
    favorites.push({
      targetKey: `${entity}:${id}`,
      entity,
      id,
      addedAt: Date.now(),
    });
    saveFavorites(favorites);
  }
}

// Remove
export function removeAnonymousFavorite(
  entity: "locations" | "events" | "services",
  id: number,
): void {
  const favorites = getAnonymousFavorites();
  const filtered = favorites.filter(
    (f) => !(f.entity === entity && f.id === id),
  );
  saveFavorites(filtered);
}

// Clear all (after sync)
export function clearAnonymousFavorites(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear favorites:", error);
  }
}
