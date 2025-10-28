/**
 * Normalize a slug to lowercase kebab-case without diacritics
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with dash
    .replace(/-+/g, "-") // Replace multiple dashes with single
    .replace(/^-|-$/g, "") // Remove leading/trailing dashes
}

/**
 * Prettify a slug for display (replace dashes with spaces, capitalize)
 */
export function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
