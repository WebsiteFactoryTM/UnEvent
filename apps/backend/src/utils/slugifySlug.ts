import type { FieldHook } from 'payload'
import slugify from 'slugify'

type SlugifyFieldHook<T extends { id: number }> = FieldHook<T, string, Partial<T>>

export const createSlugField = <T extends { id: number }>(
  sourceField: keyof T,
): SlugifyFieldHook<T> => {
  return ({ siblingData, operation, previousSiblingDoc }) => {
    const previousValue = previousSiblingDoc?.[sourceField] as string
    const currentValue = siblingData?.[sourceField] as string
    if ((operation === 'create' || operation === 'update') && previousValue !== currentValue) {
      return slugify(currentValue || '', { lower: true, strict: true, trim: true })
    }
    return previousValue
  }
}
