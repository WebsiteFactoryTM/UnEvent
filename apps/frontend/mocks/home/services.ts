export interface ServiceMock {
  id: number
  name: string
  type: string
  avatar: string
  city: string
  verified: boolean
  rating?: {
    average: number
    count: number
  }
}

export const mockServices: ServiceMock[] = [
  {
    id: 1,
    name: "DJ Marian - Muzică pentru orice eveniment",
    type: "DJ",
    avatar: "/professional-dj.png",
    city: "București",
    verified: true,
    rating: {
      average: 4.9,
      count: 127,
    },
  },
  {
    id: 2,
    name: "Trupa Harmony - Formație live evenimente",
    type: "Formație muzicală",
    avatar: "/live-band-musicians.jpg",
    city: "Cluj-Napoca",
    verified: true,
    rating: {
      average: 4.8,
      count: 89,
    },
  },
  {
    id: 3,
    name: "Catering Deluxe - Meniu personalizat",
    type: "Catering",
    avatar: "/catering-service-food.jpg",
    city: "Timișoara",
    verified: true,
    rating: {
      average: 4.7,
      count: 156,
    },
  },
  {
    id: 4,
    name: "Foto & Video Dreams - Capturăm momentele tale",
    type: "Foto-Video",
    avatar: "/photographer-videographer.jpg",
    city: "Brașov",
    verified: false,
    rating: {
      average: 4.6,
      count: 67,
    },
  },
  {
    id: 5,
    name: "Events Planner Pro - Organizare completă",
    type: "Organizator evenimente",
    avatar: "/event-planner-professional.jpg",
    city: "București",
    verified: true,
    rating: {
      average: 4.9,
      count: 203,
    },
  },
]
