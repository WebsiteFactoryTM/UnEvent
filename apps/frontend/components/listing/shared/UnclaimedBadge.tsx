import { Badge } from "@/components/ui/badge";

interface UnclaimedBadgeProps {
  className?: string;
}

export function UnclaimedBadge({ className }: UnclaimedBadgeProps) {
  return (
    <Badge
      className={`bg-foreground backdrop-blur-sm text-background ${className || ""}`}
      variant="secondary"
    >
      Nerevindicat
    </Badge>
  );
}
