// Backend utility to convert Lexical rich text JSON into plain text.
// This mirrors the logic used on the frontend in `apps/frontend/lib/richText.ts`.

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
  [key: string]: any
}

interface LexicalRoot {
  root?: {
    children?: LexicalNode[]
  }
  [key: string]: any
}

export function richTextToPlainTextBackend(content: unknown, maxLength?: number): string {
  if (!content || typeof content !== 'object') return ''

  const root = (content as LexicalRoot).root
  if (!root || !Array.isArray(root.children)) return ''

  const pieces: string[] = []

  const traverse = (node: LexicalNode): void => {
    if (!node) return

    if (node.type === 'text' && typeof node.text === 'string') {
      pieces.push(node.text)
      return
    }

    if (Array.isArray(node.children)) {
      node.children.forEach(traverse)
    }
  }

  root.children.forEach(traverse)

  let text = pieces.join(' ')

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()

  if (maxLength && maxLength > 0 && text.length > maxLength) {
    return text.slice(0, maxLength).trimEnd() + ' …'
  }

  return text
}
