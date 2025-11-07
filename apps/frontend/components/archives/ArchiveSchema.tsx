import Script from "next/script";

export function ArchiveSchema({
  listings,
  cityLabel,
  listingLabel,
}: {
  listings: any[];
  cityLabel: string;
  listingLabel: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top ${listingLabel} ${cityLabel}`,
    itemListElement: listings.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://unevent.ro/${item.entity}/oras/${item.cityLabel.toLowerCase()}/${item.slug}`,
      name: item.title,
      image: item.imageUrl || "/placeholder.svg",
      description: item.description || "",
    })),
  };

  return (
    <Script
      id="archive-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
