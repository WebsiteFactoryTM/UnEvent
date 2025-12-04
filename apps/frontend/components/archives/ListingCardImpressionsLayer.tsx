"use client";
import { useImpression } from "../metrics/useImpression";

export default function ListingCardImpressionsLayer({
  listingId,
  kind,
}: {
  listingId: number;
  kind: "locations" | "events" | "services";
}) {
  const elementRef = useImpression({ listingId, kind });
  return <div ref={elementRef} className="h-full" />;
}
