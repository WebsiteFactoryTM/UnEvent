/**
 * Mock facilities taxonomy for locations
 * Grouped by category for better UX in multi-select
 * Will be replaced with real Facility collection from Payload
 */

export interface FacilityOption {
  value: string // slug
  label: string
  category: string
  categorySlug: string
}

export const facilities: FacilityOption[] = [
  // CATERING & BAR
  {
    value: "bar-echipat",
    label: "Bar echipat",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
  },
  {
    value: "bucatarie-profesionala",
    label: "Bucătărie profesională",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
  },
  {
    value: "cuptoare-plite",
    label: "Cuptoare / plite",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
  },
  {
    value: "frigidere-industriale",
    label: "Frigidere industriale",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
  },
  {
    value: "catering-inclus",
    label: "Catering inclus",
    category: "CATERING & BAR",
    categorySlug: "catering-bar",
  },

  // SPAȚIU & CONFIGURARE
  {
    value: "sala-principala",
    label: "Sală principală",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "terasa-acoperita",
    label: "Terasă acoperită",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "gradina-exterioara",
    label: "Grădină exterioară",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "zona-fumatori",
    label: "Zonă fumători",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "sala-conferinte",
    label: "Sală conferințe",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "camera-mireasa",
    label: "Cameră mireasă",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },
  {
    value: "spatiu-copii",
    label: "Spațiu copii",
    category: "SPAȚIU & CONFIGURARE",
    categorySlug: "spatiu-configurare",
  },

  // ACCES & FACILITĂȚI
  {
    value: "parcare-privata",
    label: "Parcare privată",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },
  {
    value: "parcare-supravegheat",
    label: "Parcare supravegheată",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },
  {
    value: "acces-handicap",
    label: "Acces persoane cu dizabilități",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },
  {
    value: "lift",
    label: "Lift",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },
  {
    value: "vestiare",
    label: "Vestiare",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },
  {
    value: "toalete-moderne",
    label: "Toalete moderne",
    category: "ACCES & FACILITĂȚI",
    categorySlug: "acces-facilitati",
  },

  // CONFORT
  {
    value: "aer-conditionat",
    label: "Aer condiționat",
    category: "CONFORT",
    categorySlug: "confort",
  },
  {
    value: "incalzire-centrala",
    label: "Încălzire centrală",
    category: "CONFORT",
    categorySlug: "confort",
  },
  {
    value: "incalzire-terasa",
    label: "Încălzire terasă",
    category: "CONFORT",
    categorySlug: "confort",
  },
  {
    value: "mobilier-inclus",
    label: "Mobilier inclus",
    category: "CONFORT",
    categorySlug: "confort",
  },
  {
    value: "mese-scaune",
    label: "Mese și scaune",
    category: "CONFORT",
    categorySlug: "confort",
  },

  // TEHNIC & MULTIMEDIA
  {
    value: "wifi-gratuit",
    label: "WiFi gratuit",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "sistem-sonorizare",
    label: "Sistem sonorizare",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "sistem-iluminat",
    label: "Sistem iluminat profesional",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "proiector-ecran",
    label: "Proiector și ecran",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "sistem-video",
    label: "Sistem video",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "microfoane",
    label: "Microfoane",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },
  {
    value: "generator-curent",
    label: "Generator curent",
    category: "TEHNIC & MULTIMEDIA",
    categorySlug: "tehnic-multimedia",
  },

  // DECORAȚIUNI & AMBIANȚĂ
  {
    value: "decoratiuni-incluse",
    label: "Decorațiuni incluse",
    category: "DECORAȚIUNI & AMBIANȚĂ",
    categorySlug: "decoratiuni-ambianta",
  },
  {
    value: "flori-aranjamente",
    label: "Flori și aranjamente",
    category: "DECORAȚIUNI & AMBIANȚĂ",
    categorySlug: "decoratiuni-ambianta",
  },
  {
    value: "lumini-ambientale",
    label: "Lumini ambientale",
    category: "DECORAȚIUNI & AMBIANȚĂ",
    categorySlug: "decoratiuni-ambianta",
  },
  {
    value: "foisor-nunta",
    label: "Foisor pentru nuntă",
    category: "DECORAȚIUNI & AMBIANȚĂ",
    categorySlug: "decoratiuni-ambianta",
  },
]

// Helper to group facilities by category for rendering
export const facilitiesByCategory = facilities.reduce(
  (acc, facility) => {
    if (!acc[facility.category]) {
      acc[facility.category] = []
    }
    acc[facility.category].push(facility)
    return acc
  },
  {} as Record<string, FacilityOption[]>
)

export const facilityCategories = Object.keys(facilitiesByCategory)

