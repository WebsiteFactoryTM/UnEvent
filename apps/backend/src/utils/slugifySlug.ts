import type { FieldHook } from 'payload'
import slugify from 'slugify'

type SlugifyFieldHook<T extends { id: number }> = FieldHook<T, string, Partial<T>>

export const createSlugField = <T extends { id: number }>(
  sourceField: keyof T,
): SlugifyFieldHook<T> => {
  return ({ siblingData }) => {
    const source = siblingData?.[sourceField] as string
    return slugify(source || '', { lower: true, strict: true, trim: true })
  }
}
