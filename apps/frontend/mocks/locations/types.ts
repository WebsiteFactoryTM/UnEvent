/**
 * Mock listing types for locations
 * Will be replaced with real ListingType collection from Payload
 */

export interface ListingTypeOption {
  value: string // slug
  label: string
  category: string
}

// Type of location (what it is)
export const locationTypes: ListingTypeOption[] = [
  { value: "sala-evenimente", label: "Sală de evenimente", category: "LOCAȚII" },
  { value: "restaurant", label: "Restaurant", category: "LOCAȚII" },
  { value: "terasa", label: "Terasă", category: "LOCAȚII" },
  { value: "gradina", label: "Grădină evenimente", category: "LOCAȚII" },
  { value: "castel", label: "Castel", category: "LOCAȚII" },
  { value: "conac", label: "Conac", category: "LOCAȚII" },
  { value: "pensiune", label: "Pensiune", category: "LOCAȚII" },
  { value: "hotel", label: "Hotel", category: "LOCAȚII" },
  { value: "loft", label: "Loft", category: "LOCAȚII" },
  { value: "hangar", label: "Hangar industrial", category: "LOCAȚII" },
  { value: "centru-conferinte", label: "Centru conferințe", category: "LOCAȚII" },
  { value: "spatiu-outdoor", label: "Spațiu outdoor", category: "LOCAȚII" },
]

// Event types suitable for this location
export const eventTypes: ListingTypeOption[] = [
  { value: "nunta", label: "Nuntă", category: "NUNȚI & CEREMONII" },
  { value: "logodna", label: "Logodnă", category: "NUNȚI & CEREMONII" },
  { value: "botez", label: "Botez", category: "NUNȚI & CEREMONII" },
  { value: "cununie", label: "Cununie civilă", category: "NUNȚI & CEREMONII" },
  { value: "aniversare", label: "Aniversare", category: "PETRECERI PRIVATE" },
  { value: "petrecere-privata", label: "Petrecere privată", category: "PETRECERI PRIVATE" },
  { value: "majorat", label: "Majorat", category: "PETRECERI PRIVATE" },
  { value: "corporate", label: "Eveniment corporate", category: "BUSINESS & CORPORATE" },
  { value: "team-building", label: "Team building", category: "BUSINESS & CORPORATE" },
  { value: "conferinta", label: "Conferință", category: "BUSINESS & CORPORATE" },
  { value: "lansare-produs", label: "Lansare produs", category: "BUSINESS & CORPORATE" },
  { value: "gala", label: "Gală", category: "BUSINESS & CORPORATE" },
  { value: "concert", label: "Concert", category: "EVENIMENTE PUBLICE" },
  { value: "festival", label: "Festival", category: "EVENIMENTE PUBLICE" },
  { value: "targ", label: "Târg", category: "EVENIMENTE PUBLICE" },
  { value: "workshop", label: "Workshop", category: "EDUCAȚIE & WORKSHOP" },
  { value: "seminar", label: "Seminar", category: "EDUCAȚIE & WORKSHOP" },
  { value: "training", label: "Training", category: "EDUCAȚIE & WORKSHOP" },
]

