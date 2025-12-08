"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface ExpandableTagsListProps {
  items: string[];
  label?: string;
  limit?: number;
  className?: string;
  emptyText?: string;
}

export function ExpandableTagsList({
  items,
  label,
  limit = 5,
  className,
  emptyText,
}: ExpandableTagsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const validItems = items.filter(Boolean);

  if (validItems.length === 0) {
    if (emptyText) {
      return (
        <div className={cn("text-sm text-muted-foreground", className)}>
          {emptyText}
        </div>
      );
    }
    return null;
  }

  const displayedItems = isExpanded ? validItems : validItems.slice(0, limit);
  const hasMore = validItems.length > limit;

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <div className="text-sm">
        {label && <span className="text-foreground mr-1">{label}</span>}
        <span className="font-medium text-muted-foreground">
          {displayedItems.join(", ")}
        </span>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-0 py-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground transition-colors mt-1"
        >
          {isExpanded ? (
            <>
              Arată mai puțin <FaChevronUp className="ml-1 h-3 w-3" />
            </>
          ) : (
            <>
              Arată mai mult <FaChevronDown className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
