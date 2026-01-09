import { Badge } from "../ui/badge";

export function TierBadge({
  tier,
}: {
  tier: "new" | "standard" | "sponsored" | "recommended" | "verified";
}) {
  switch (tier) {
    case "new":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          Nou
        </span>
      );

    case "sponsored":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Partener
        </span>
      );
    case "recommended":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Spotlight
        </span>
      );

    case "verified":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          Verificat
        </span>
      );
    default:
  }
}
