"use client";
import React, { useState } from "react";
import theme from "./Theme";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExpandableText } from "../ui/expandable-text";
import { Button } from "../ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface RichTextRendererProps {
  content: any; // JSON from Payload
  fallback?: string;
  className?: string;
  maxWords?: number; // Approximate word count limit for initial view
}

// Helper to escape HTML if we were using it, but here we build React nodes
const IS_BOLD = 1;
const IS_ITALIC = 2;

const RenderText = ({ node }: { node: any }) => {
  let className = "";
  if (node.format & IS_BOLD) className = cn(className, theme.text.bold);
  if (node.format & IS_ITALIC) className = cn(className, theme.text.italic);

  return <span className={className}>{node.text}</span>;
};

const RenderNode = ({ node }: { node: any }) => {
  if (!node) return null;

  switch (node.type) {
    case "text":
      return <RenderText node={node} />;

    case "link":
      return (
        <Link
          href={node.fields?.url || "#"}
          target={node.fields?.newTab ? "_blank" : undefined}
          rel={node.fields?.newTab ? "noopener noreferrer" : undefined}
          className={theme.link}
        >
          {node.children?.map((child: any, i: number) => (
            <RenderNode key={i} node={child} />
          ))}
        </Link>
      );

    case "paragraph":
      return (
        <p className={theme.paragraph}>
          {node.children?.map((child: any, i: number) => (
            <RenderNode key={i} node={child} />
          ))}
        </p>
      );

    case "heading":
      const Tag = node.tag as "h3" | "h4";
      // @ts-ignore
      const className = theme.heading[Tag] || theme.heading.h3;
      return (
        <Tag className={className}>
          {node.children?.map((child: any, i: number) => (
            <RenderNode key={i} node={child} />
          ))}
        </Tag>
      );

    default:
      // Fallback for unknown nodes: just render children
      if (node.children) {
        return (
          <>
            {node.children.map((child: any, i: number) => (
              <RenderNode key={i} node={child} />
            ))}
          </>
        );
      }
      return null;
  }
};

// Helper to calculate approximate word count from Lexical JSON
const getWordCount = (node: any): number => {
  if (!node) return 0;
  if (node.type === "text") {
    return node.text.trim().split(/\s+/).length;
  }
  if (node.children) {
    return node.children.reduce(
      (count: number, child: any) => count + getWordCount(child),
      0,
    );
  }
  return 0;
};

export const RichTextRenderer = ({
  content,
  fallback,
  className,
  maxWords = 100,
}: RichTextRendererProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. If we have rich text content (Lexical JSON)
  if (
    content &&
    content.root &&
    content.root.children &&
    content.root.children.length > 0
  ) {
    const totalWords = getWordCount(content.root);
    const shouldShowToggle = totalWords > maxWords;

    return (
      <div className={cn("rich-text-content space-y-3", className)}>
        <div
          className={cn(
            "relative",
            !isExpanded &&
              shouldShowToggle &&
              (maxWords > 50
                ? "max-h-[200px] overflow-hidden"
                : "max-h-[100px] overflow-hidden"), // Limit height when collapsed
          )}
        >
          {content.root.children.map((child: any, i: number) => (
            <RenderNode key={i} node={child} />
          ))}
          {!isExpanded && shouldShowToggle && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background/40 to-transparent" />
          )}
        </div>

        {shouldShowToggle && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-primary hover:text-primary/80 transition-colors"
            >
              <span className="text-sm font-medium mr-2">
                {isExpanded ? "Arată mai puțin" : "Arată mai mult"}
              </span>
              {isExpanded ? (
                <FaChevronUp className="h-4 w-4" />
              ) : (
                <FaChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 2. Fallback to legacy string content
  if (fallback) {
    return (
      <div
        className={cn(
          "whitespace-pre-wrap text-sm text-foreground/90",
          className,
        )}
      >
        <ExpandableText
          text={fallback}
          maxWords={maxWords}
          showMoreText="Arată mai mult"
          showLessText="Arată mai puțin"
        />
      </div>
    );
  }

  return null;
};
