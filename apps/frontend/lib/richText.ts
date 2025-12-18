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
