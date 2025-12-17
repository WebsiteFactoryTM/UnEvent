import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  lexicalEditor,
  HeadingFeature,
} from '@payloadcms/richtext-lexical'
import { Field } from 'payload'
import { validateRichText } from '../hooks/validateRichText'

export const restrictedRichTextField = (name: string, label?: string): Field => {
  return {
    name,
    label,
    type: 'richText',
    editor: lexicalEditor({
      features: () => [
        ParagraphFeature(),
        BoldFeature(),
        ItalicFeature(),
        LinkFeature({}), // Defaults are usually safe, restricts to http/https/mailto/tel usually
        HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
      ],
    }),
    hooks: {
      beforeValidate: [validateRichText],
    },
    admin: {
      description: 'Restricted rich text editor. Allowed: Bold, Italic, H3, H4, Link.',
    },
  }
}
