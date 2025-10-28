export interface EventMock {
  id: number
  title: string
  description: string
  image: string
  day: string
  date: string
  time: string
  city: string
  verified: boolean
  rating?: {
    average: number
    count: number
  }
}

export const mockEvents: EventMock[] = [
  {
    id: 1,
    title: "Festival de Jazz în Parcul Central - Ediția de Primăvară",
    description:
      "Trei zile de muzică jazz live cu artiști români și internaționali. Intrare liberă, food trucks și zonă de relaxare. Vino să te bucuri de cele mai frumoase melodii jazz!",
    image: "/jazz-festival-outdoor.jpg",
    day: "Vineri",
    date: "15 Mai 2025",
    time: "18:00",
    city: "București",
    verified: true,
    rating: {
      average: 4.8,
      count: 234,
    },
  },
  {
    id: 2,
    title: "Workshop Fotografie Profesională - De la Amator la Pro",
    description:
      "Învață tehnicile profesionale de fotografie de la experți în domeniu. Include sesiune practică outdoor și analiză portofoliu. Locuri limitate!",
    image: "/photography-workshop.png",
    day: "Sâmbătă",
    date: "20 Mai 2025",
    time: "10:00",
    city: "Cluj-Napoca",
    verified: true,
    rating: {
      average: 4.9,
      count: 45,
    },
  },
  {
    id: 3,
    title: "Târg de Artă și Meșteșuguri Tradiționale",
    description:
      "Descoperă produse handmade de la artizani locali: ceramică, textile, bijuterii și decorațiuni. Demonstrații live și ateliere pentru copii.",
    image: "/craft-fair-traditional-art.jpg",
    day: "Duminică",
    date: "21 Mai 2025",
    time: "09:00",
    city: "Sibiu",
    verified: false,
    rating: {
      average: 4.7,
      count: 89,
    },
  },
  {
    id: 4,
    title: "Conferință Tech Innovation 2025 - Viitorul Tehnologiei",
    description:
      "Cei mai importanți speakeri din industria tech discută despre AI, blockchain și viitorul digitalizării. Networking session și demo zone.",
    image: "/tech-conference-innovation.jpg",
    day: "Miercuri",
    date: "24 Mai 2025",
    time: "09:30",
    city: "Timișoara",
    verified: true,
    rating: {
      average: 4.8,
      count: 167,
    },
  },
  {
    id: 5,
    title: "Petrecere Tematică Gatsby - Noaptea Anilor '20",
    description:
      "Îmbracă-te în stil anii '20 și bucură-te de o seară de neuitat cu muzică live, cocktail-uri speciale și atmosferă vintage. Dress code obligatoriu!",
    image: "/gatsby-party-1920s-theme.jpg",
    day: "Sâmbătă",
    date: "27 Mai 2025",
    time: "20:00",
    city: "București",
    verified: true,
    rating: {
      average: 4.9,
      count: 312,
    },
  },
]
