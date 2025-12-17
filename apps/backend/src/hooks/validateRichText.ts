import type { FieldHook } from 'payload'
import { ValidationError } from 'payload'

const ALLOWED_NODE_TYPES = [
  'root',
  'paragraph',
  'text',
  'link',
  'heading',
  'linebreak',
  'list',
  'listitem',
]
const ALLOWED_HEADING_TAGS = ['h3', 'h4']
const ALLOWED_LIST_TYPES = ['bullet', 'number'] // 'bullet' = unordered, 'number' = ordered

// Lexical TextNode format flags
// 1 = bold, 2 = italic, 4 = strikethrough, 8 = underline, 16 = code, 32 = subscript, 64 = superscript
const ALLOWED_FORMAT_FLAGS = 1 | 2 // Only bold and italic allowed (1 | 2 = 3)

/* eslint-disable @typescript-eslint/no-explicit-any */
const traverseNodes = (node: any, path: string = 'root') => {
  if (!node) return

  if (!ALLOWED_NODE_TYPES.includes(node.type)) {
    throw new ValidationError({
      errors: [
        {
          message: `Disallowed block type: ${node.type} at ${path}`,
          path,
        },
      ],
    })
  }

  if (node.type === 'heading') {
    if (!ALLOWED_HEADING_TAGS.includes(node.tag)) {
      throw new ValidationError({
        errors: [
          {
            message: `Disallowed heading tag: ${node.tag} at ${path}. Only h3 and h4 are allowed.`,
            path,
          },
        ],
      })
    }
  }

  if (node.type === 'list') {
    // Validate list type (bullet or number)
    if (node.listType && !ALLOWED_LIST_TYPES.includes(node.listType)) {
      throw new ValidationError({
        errors: [
          {
            message: `Disallowed list type: ${node.listType} at ${path}. Only bullet and number lists are allowed.`,
            path,
          },
        ],
      })
    }
  }

  if (node.type === 'text') {
    // Check formatting
    // node.format is a number (bitmask)
    if (typeof node.format === 'number') {
      // If node.format has bits set that are NOT in ALLOWED_FORMAT_FLAGS
      // (node.format & ~ALLOWED_FORMAT_FLAGS) should be 0
      if ((node.format & ~ALLOWED_FORMAT_FLAGS) !== 0) {
        throw new ValidationError({
          errors: [
            {
              message: `Disallowed text formatting at ${path}. Only bold and italic are allowed.`,
              path,
            },
          ],
        })
      }
    }
  }

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any, index: number) => {
      traverseNodes(child, `${path}.children[${index}]`)
    })
  }
}

export const validateRichText: FieldHook = ({ value }) => {
  if (!value) return value

  // Value is the Lexical JSON object
  if (value.root) {
    try {
      traverseNodes(value.root)
    } catch (e: any) {
      // Re-throw as ValidationError if it isn't one already
      if (e instanceof ValidationError) throw e
      throw new ValidationError({
        errors: [{ message: e.message || 'Invalid rich text content', path: 'root' }],
      })
    }
  }

  return value
}
