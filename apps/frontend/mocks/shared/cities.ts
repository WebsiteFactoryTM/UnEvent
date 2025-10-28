/**
 * Shared city options for all forms (locations, services, events)
 * These will be replaced with real City collection data from Payload
 */

export interface CityOption {
  value: string // slug
  label: string // display name
  county?: string
}

export const cities: CityOption[] = [
  { value: "bucuresti", label: "București", county: "București" },
  { value: "cluj-napoca", label: "Cluj-Napoca", county: "Cluj" },
  { value: "timisoara", label: "Timișoara", county: "Timiș" },
  { value: "iasi", label: "Iași", county: "Iași" },
  { value: "constanta", label: "Constanța", county: "Constanța" },
  { value: "craiova", label: "Craiova", county: "Dolj" },
  { value: "brasov", label: "Brașov", county: "Brașov" },
  { value: "galati", label: "Galați", county: "Galați" },
  { value: "ploiesti", label: "Ploiești", county: "Prahova" },
  { value: "oradea", label: "Oradea", county: "Bihor" },
  { value: "braila", label: "Brăila", county: "Brăila" },
  { value: "arad", label: "Arad", county: "Arad" },
  { value: "pitesti", label: "Pitești", county: "Argeș" },
  { value: "sibiu", label: "Sibiu", county: "Sibiu" },
  { value: "bacau", label: "Bacău", county: "Bacău" },
  { value: "targu-mures", label: "Târgu Mureș", county: "Mureș" },
  { value: "baia-mare", label: "Baia Mare", county: "Maramureș" },
  { value: "buzau", label: "Buzău", county: "Buzău" },
  { value: "satu-mare", label: "Satu Mare", county: "Satu Mare" },
  { value: "botosani", label: "Botoșani", county: "Botoșani" },
  { value: "piatra-neamt", label: "Piatra Neamț", county: "Neamț" },
  { value: "targoviste", label: "Târgoviște", county: "Dâmbovița" },
  { value: "drobeta-turnu-severin", label: "Drobeta-Turnu Severin", county: "Mehedinți" },
  { value: "suceava", label: "Suceava", county: "Suceava" },
  { value: "focsani", label: "Focșani", county: "Vrancea" },
]

