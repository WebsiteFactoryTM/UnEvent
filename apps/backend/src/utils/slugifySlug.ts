import type { FieldHook } from 'payload'
import slugify from 'slugify'

type SlugifyFieldHook<T extends { id: number }> = FieldHook<T, string, Partial<T>>

export const createSlugField = <T extends { id: number }>(
  sourceField: keyof T,
): SlugifyFieldHook<T> => {
  return ({ siblingData, operation, previousSiblingDoc, value }) => {
    const previousValue = previousSiblingDoc?.[sourceField] as string
    const currentValue = siblingData?.[sourceField] as string

    const slug = slugify(currentValue || '', { lower: true, strict: true, trim: true })

    if (
      (operation === 'create' || operation === 'update') &&
      previousValue !== currentValue &&
      currentValue !== undefined
    ) {
      return slug
    }

    return value as string
  }
}
