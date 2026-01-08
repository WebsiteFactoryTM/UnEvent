import { z } from "zod";

// Utilities for converting Lexical rich text JSON into plain text

// Minimal Lexical JSON types we care about
interface LexicalTextNode {
  type: "text";
  text: string;
  [key: string]: any;
}

interface LexicalNode {
  type: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: any;
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[];
  };
  [key: string]: any;
}

/**
 * Traverse Lexical JSON and extract concatenated plain text.
 * This is intentionally tolerant and will ignore unknown node types.
 */
export function richTextToPlainText(
  content: unknown,
  maxLength?: number,
): string {
  if (!content || typeof content !== "object") return "";

  const root = (content as LexicalRoot).root;
  if (!root || !Array.isArray(root.children)) return "";

  const pieces: string[] = [];

  const traverse = (node: LexicalNode): void => {
    if (!node) return;

    if (node.type === "text" && typeof node.text === "string") {
      pieces.push(node.text);
      return;
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  };

  root.children.forEach(traverse);

  let text = pieces.join(" ");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (maxLength && maxLength > 0 && text.length > maxLength) {
    return text.slice(0, maxLength).trimEnd() + " …";
  }

  return text;
}

/**
 * Convenience helper for listings that may have both legacy description and rich text.
 * Prefers rich text when available; falls back to legacy plain description.
 */
export function getListingPlainDescription(
  listing: { description?: string | null; description_rich?: unknown },
  maxLength?: number,
): string {
  const fromRich = listing.description_rich
    ? richTextToPlainText(listing.description_rich, maxLength)
    : "";

  if (fromRich) return fromRich;

  const legacy = listing.description || "";
  if (!maxLength || maxLength <= 0) return legacy;

  if (legacy.length > maxLength) {
    return legacy.slice(0, maxLength).trimEnd() + " …";
  }

  return legacy;
}


// Bitmasks for Lexical TextFormatType
// Based on lexical/packages/lexical/src/LexicalConstants.ts
const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
// We only allow Bold (1) and Italic (2) -> 1 | 2 = 3
const ALLOWED_FORMAT = IS_BOLD | IS_ITALIC;

/**
 * Sanitizes a Lexical JSON object to comply with backend restrictions.
 * - Allowlist node types: root, paragraph, text, heading, list, listitem, link, autolink, linebreak.
 * - Downgrade headings: h1, h2, h5, h6 -> h3.
 * - Strip styles: Remove all style properties.
 * - Restrict text formatting: Only Bold and Italic allowed.
 * - Transform invalid nodes: quote, code -> paragraph (preserve children).
 */
export const sanitizeRichText = (value: unknown): any => {
  if (!value || typeof value !== "object") return value;

  // Deep clone to avoid mutating original
  const newData = JSON.parse(JSON.stringify(value));

  const sanitizeNode = (node: any) => {
    if (!node) return;

    // 1. Strip 'style' attribute from all nodes
    if ("style" in node) {
      delete node.style;
    }

    // 2. Handle specific node types
    switch (node.type) {
      case "root":
      case "list":
      case "listitem":
      case "linebreak":
        // Pass through, but sanitize children (handled at end)
        break;

      case "text":
        // Sanitize formatting
        if (typeof node.format === "number") {
          node.format = node.format & ALLOWED_FORMAT;
        }
        // Reset detail
        if ("detail" in node) {
          node.detail = 0;
        }
        break;

      case "heading":
        // Enforce h3/h4 in a robust way
        if (["h1", "h2", "h5", "h6"].includes(node.tag)) {
          node.tag = "h3";
        }
        break;

      case "autolink":
        // Backend only accepts 'link', not 'autolink'
        // Convert autolink to link
        node.type = "link";
        break;

      case "link":
        // Allow links
        break;

      // Transform disallowed block types to paragraph
      case "quote":
      case "code":
      case "code-highlight":
        // Transform to paragraph
        node.type = "paragraph";
        // Remove node-specific props
        delete node.language;
        delete node.tag;
        break;

      case "paragraph":
        // Safe
        break;

      default:
        // Unknown type.
        // If it looks like a block (has children), make it a paragraph.
        // If not, we still default to paragraph or text depending on context,
        // but converting to paragraph is safer to preserve content.
        if (Array.isArray(node.children)) {
            node.type = "paragraph";
        } else {
            // For unknown inline nodes, simplistic fallback: leave as is or make text?
            // Lexical might fail if type is unknown.
            // Let's assume paragraph for safety so text is preserved.
            node.type = "paragraph";
        }
        break;
    }

    // 3. Recursively sanitize children
    if (Array.isArray(node.children)) {
      node.children.forEach(sanitizeNode);
    }
  };

  if ((newData as any).root) {
    sanitizeNode((newData as any).root);
  }

  return newData;
};

/**
 * Zod schema for validated and sanitized rich text.
 * Uses z.any() to avoid input/output type mismatch with transforms.
 * The transform applies sanitization while maintaining type compatibility.
 */
export const richTextSchema = z
  .any()
  .optional()
  .transform(sanitizeRichText);
