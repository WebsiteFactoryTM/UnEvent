import { ListingCard } from "@/components/archives/ListingCard";

interface EventRecommendationsProps {
  cityName: string;
  similarEvents?: any[]; // UI-only: not used, kept for compatibility
}

export default function EventRecommendations({
  cityName,
}: EventRecommendationsProps) {
  const mockEvents = [
    {
      id: 101,
      name: "Festival de Jazz în Parc",
      slug: "festival-jazz-parc-bucuresti",
      description:
        "Bucură-te de cele mai bune trupe de jazz într-un cadru natural relaxant",
      image: "/jazz-festival-outdoor.jpg",
      city: cityName,
      type: "Festival",
      verified: true,
      rating: { average: 4.7, count: 89 },
      views: 3200,
      listingType: "evenimente" as const,
      date: "2024-07-15",
      participants: 450,
      priceRange: "50 RON",
    },
    {
      id: 102,
      name: "Târg de Artă și Meșteșuguri",
      slug: "targ-arta-mestesuguri",
      description:
        "Descoperă creații unice de la artiști și meșteșugari locali",
      image: "/art-craft-fair.jpg",
      city: cityName,
      type: "Târg",
      verified: true,
      rating: { average: 4.5, count: 67 },
      views: 2100,
      listingType: "evenimente" as const,
      date: "2024-06-20",
      participants: 320,
      priceRange: "Gratuit",
    },
    {
      id: 103,
      name: "Concert Rock Sub Stele",
      slug: "concert-rock-sub-stele",
      description:
        "O seară de rock autentic cu cele mai tari trupe din România",
      image: "/rock-concert-outdoor-night.jpg",
      city: cityName,
      type: "Concert",
      verified: false,
      rating: { average: 4.9, count: 124 },
      views: 5400,
      listingType: "evenimente" as const,
      date: "2024-08-10",
      participants: 780,
      priceRange: "75 RON",
    },
  ];

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold">Evenimente similare în {cityName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <ListingCard
            key={event.id}
            id={event.id}
            name={event.name}
            slug={event.slug}
            description={event.description}
            image={{
              url: event.image,
              alt: event.name,
            }}
            city={event.city}
            type={event.type}
            verified={event.verified}
            rating={event.rating}
            views={event.views}
            listingType={event.listingType}
            date={event.date}
            participants={event.participants}
            priceRange={event.priceRange}
          />
        ))}
      </div>
    </div>
  );
}
