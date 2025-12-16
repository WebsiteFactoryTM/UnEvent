"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface ExpandableListProps {
  items: ReactNode[];
  maxItems?: number;
  showMoreText?: string;
  showLessText?: string;
  className?: string;
}

export function ExpandableList({
  items,
  maxItems = 6,
  showMoreText = "Arată mai mult",
  showLessText = "Arată mai puțin",
  className = "",
}: ExpandableListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowToggle = items.length > maxItems;

  if (!shouldShowToggle) {
    return <div className={className}>{items}</div>;
  }

  const displayedItems = isExpanded ? items : items.slice(0, maxItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {displayedItems}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-auto p-0 text-primary hover:text-primary/80 transition-colors"
        >
          <span className="text-sm font-medium mr-2">
            {isExpanded ? showLessText : showMoreText}
          </span>
          {isExpanded ? (
            <FaChevronUp className="h-4 w-4" />
          ) : (
            <FaChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
