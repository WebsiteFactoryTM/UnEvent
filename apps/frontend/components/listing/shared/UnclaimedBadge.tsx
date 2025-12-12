import { Badge } from "@/components/ui/badge";

interface UnclaimedBadgeProps {
  className?: string;
}

export function UnclaimedBadge({ className }: UnclaimedBadgeProps) {
  return (
    <Badge
      className={`bg-orange-500/90 backdrop-blur-sm text-white ${className || ""}`}
      variant="secondary"
    >
      Nerevindicat
    </Badge>
  );
}
