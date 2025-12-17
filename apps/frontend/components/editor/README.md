# Restricted Rich Text Editor

This directory contains the components for the UnEvent restricted rich text editor and renderer.

## Purpose

To provide a consistent, safe, and branded text editing experience for users (Bio, Listing Descriptions). It replaces standard textareas with a Lexical-based editor that enforces strict formatting rules.

## Components

### `<RestrictedRichTextEditor />`

A wrapper around Lexical's `LexicalComposer`.

- **Props**:
  - `initialValue`: The Lexical JSON object stored in Payload.
  - `legacyValue`: A string fallback. If `initialValue` is empty, this string is converted to a paragraph node.
  - `onChange`: Callback returning the full Lexical JSON state.

### `<RichTextRenderer />`

A lightweight React renderer for Lexical JSON.

- **Props**:
  - `content`: The Lexical JSON object.
  - `fallback`: Legacy string content.
- **Logic**:
  - If `content` exists, it renders using the `Theme` classes.
  - If not, it renders `fallback` as `whitespace-pre-wrap` text.

### `Theme.ts`

Defines the Tailwind CSS classes used by both the Editor and the Renderer to ensure "What You See Is What You Get".

**Allowed Formats:**
- **Paragraphs**: Standard text.
- **Bold / Italic**: Standard formatting.
- **Headings**: Only `h3` and `h4`.
- **Links**: Standard anchor tags.

## Usage

```tsx
import { RestrictedRichTextEditor } from '@/components/editor/RestrictedRichTextEditor'

// In a form
<RestrictedRichTextEditor
  initialValue={profile.bio_rich}
  legacyValue={profile.bio}
  onChange={(json) => form.setValue('bio_rich', json)}
/>
```

```tsx
import { RichTextRenderer } from '@/components/editor/RichTextRenderer'

// In a view
<RichTextRenderer
  content={profile.bio_rich}
  fallback={profile.bio}
/>
```

## Backend Compatibility

The backend (Payload) has a matching configuration (`restrictedRichText` field) and a validation hook (`validateRichText`) that rejects any content violating the allowed schema (e.g., H1 tags, arbitrary colors).
