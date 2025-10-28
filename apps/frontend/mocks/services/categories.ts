// Service categories grouped by type
// Matches ListingType structure from payload-types.ts

export interface ServiceCategory {
  value: string
  label: string
  category: string
}

export const serviceCategories: ServiceCategory[] = [
  // DJ & Sonorizare
  { value: "dj-profesional", label: "DJ Profesional", category: "DJ & Sonorizare" },
  { value: "sonorizare-evenimente", label: "Sonorizare Evenimente", category: "DJ & Sonorizare" },
  { value: "mixaj-live", label: "Mixaj Live", category: "DJ & Sonorizare" },
  
  // Lumini & Efecte
  { value: "lumini-arhitecturale", label: "Lumini Arhitecturale", category: "Lumini & Efecte" },
  { value: "efecte-speciale", label: "Efecte Speciale", category: "Lumini & Efecte" },
  { value: "fum-greu", label: "Fum Greu", category: "Lumini & Efecte" },
  { value: "artificii", label: "Artificii", category: "Lumini & Efecte" },
  
  // Foto-Video
  { value: "fotografie-profesionala", label: "Fotografie Profesională", category: "Foto-Video" },
  { value: "videografie-4k", label: "Videografie 4K", category: "Foto-Video" },
  { value: "drona-aeriene", label: "Filmări cu Dronă", category: "Foto-Video" },
  { value: "photoboot", label: "Photobooth", category: "Foto-Video" },
  { value: "album-foto", label: "Album Foto", category: "Foto-Video" },
  
  // MC/Host & Divertisment
  { value: "mc-host", label: "MC/Host Profesional", category: "MC/Host & Divertisment" },
  { value: "tambal", label: "Tambal", category: "MC/Host & Divertisment" },
  { value: "formatii-muzicale", label: "Formații Muzicale", category: "MC/Host & Divertisment" },
  { value: "animatori-copii", label: "Animatori pentru Copii", category: "MC/Host & Divertisment" },
  { value: "magician", label: "Magician", category: "MC/Host & Divertisment" },
  
  // Catering & Bar
  { value: "catering-complet", label: "Catering Complet", category: "Catering & Bar" },
  { value: "candy-bar", label: "Candy Bar", category: "Catering & Bar" },
  { value: "tort-nunta", label: "Tort de Nuntă", category: "Catering & Bar" },
  { value: "barista-mobil", label: "Barista Mobil", category: "Catering & Bar" },
  { value: "cocktail-bar", label: "Cocktail Bar", category: "Catering & Bar" },
  
  // Decorațiuni
  { value: "decoratiuni-florale", label: "Decorațiuni Florale", category: "Decorațiuni" },
  { value: "aranjamente-masa", label: "Aranjamente de Masă", category: "Decorațiuni" },
  { value: "backdrop", label: "Backdrop Personalizat", category: "Decorațiuni" },
  { value: "baloane-decorative", label: "Baloane Decorative", category: "Decorațiuni" },
  
  // Transport & Logistică
  { value: "limuzina", label: "Limuzină", category: "Transport & Logistică" },
  { value: "masini-lux", label: "Mașini de Lux", category: "Transport & Logistică" },
  { value: "caleasca", label: "Caleașcă", category: "Transport & Logistică" },
  { value: "shuttle-invitati", label: "Shuttle Invitați", category: "Transport & Logistică" },
  
  // Beauty & Wellness
  { value: "makeup-artist", label: "Makeup Artist", category: "Beauty & Wellness" },
  { value: "hair-stylist", label: "Hair Stylist", category: "Beauty & Wellness" },
  { value: "manichiura-pedichiura", label: "Manichiură & Pedichiură", category: "Beauty & Wellness" },
  { value: "masaj-relaxare", label: "Masaj & Relaxare", category: "Beauty & Wellness" },
  
  // Rochii & Costume
  { value: "rochii-mireasa", label: "Rochii de Mireasă", category: "Rochii & Costume" },
  { value: "costume-mire", label: "Costume de Mire", category: "Rochii & Costume" },
  { value: "accesorii-nunta", label: "Accesorii Nuntă", category: "Rochii & Costume" },
  
  // Invitații & Papetărie
  { value: "invitatii-personalizate", label: "Invitații Personalizate", category: "Invitații & Papetărie" },
  { value: "meniu-nunta", label: "Meniu Nuntă", category: "Invitații & Papetărie" },
  { value: "place-card", label: "Place Card-uri", category: "Invitații & Papetărie" },
  
  // Altele
  { value: "wedding-planner", label: "Wedding Planner", category: "Altele" },
  { value: "ofițer-stare-civila", label: "Ofițer Stare Civilă", category: "Altele" },
  { value: "preot", label: "Preot", category: "Altele" },
]

// Group categories by their category field
export const groupedServiceCategories = serviceCategories.reduce((acc, cat) => {
  if (!acc[cat.category]) {
    acc[cat.category] = []
  }
  acc[cat.category].push(cat)
  return acc
}, {} as Record<string, ServiceCategory[]>)

