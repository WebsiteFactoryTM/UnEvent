"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface ExpandableTextProps {
  text: string;
  maxWords?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

// Utility function to trim text to specified number of words
function trimToWords(text: string, maxWords: number = 100): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(" ") + "...";
}

export function ExpandableText({
  text,
  maxWords = 100,
  className = "",
  showMoreText = "Arată mai mult",
  showLessText = "Arată mai puțin",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wordCount = text.split(/\s+/).length;
  const shouldShowToggle = wordCount > maxWords;

  if (!shouldShowToggle) {
    return (
      <p
        className={`text-muted-foreground leading-relaxed break-all max-w-full ${className}`}
      >
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-3 max-w-full">
      <div className="relative overflow-hidden">
        <p
          className={`text-muted-foreground leading-relaxed break-all max-w-full ${className}`}
        >
          {isExpanded ? text : trimToWords(text, maxWords)}
        </p>
        <div className="mt-2">
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
    </div>
  );
}
