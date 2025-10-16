import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface TaxonomyCategory {
  name: string
  slug: string
  items: Array<{
    name: string
    slug: string
  }>
}

interface TaxonomyData {
  categories: TaxonomyCategory[]
}

// Helper function to create slugs
function createSlug(text: string): string {
  // Character mapping for Romanian and other special characters
  const charMap: Record<string, string> = {
    // Romanian characters
    ă: 'a',
    â: 'a',
    î: 'i',
    ș: 's',
    ț: 't',
    Ă: 'a',
    Â: 'a',
    Î: 'i',
    Ș: 's',
    Ț: 't',
    // Common European characters
    á: 'a',
    à: 'a',
    ä: 'a',
    ã: 'a',
    å: 'a',
    é: 'e',
    è: 'e',
    ë: 'e',
    ê: 'e',
    í: 'i',
    ì: 'i',
    ï: 'i',
    ó: 'o',
    ò: 'o',
    ö: 'o',
    ô: 'o',
    õ: 'o',
    ú: 'u',
    ù: 'u',
    ü: 'u',
    û: 'u',
    ý: 'y',
    ÿ: 'y',
    ñ: 'n',
    ç: 'c',
    ć: 'c',
    č: 'c',
    đ: 'd',
    ð: 'd',
    ł: 'l',
    ř: 'r',
    ś: 's',
    š: 's',
    ź: 'z',
    ż: 'z',
    ž: 'z',
    // Uppercase versions
    Á: 'a',
    À: 'a',
    Ä: 'a',
    Ã: 'a',
    Å: 'a',
    É: 'e',
    È: 'e',
    Ë: 'e',
    Ê: 'e',
    Í: 'i',
    Ì: 'i',
    Ï: 'i',
    Ó: 'o',
    Ò: 'o',
    Ö: 'o',
    Ô: 'o',
    Õ: 'o',
    Ú: 'u',
    Ù: 'u',
    Ü: 'u',
    Û: 'u',
    Ý: 'y',
    Ÿ: 'y',
    Ñ: 'n',
    Ç: 'c',
    Ć: 'c',
    Č: 'c',
    Đ: 'd',
    Ð: 'd',
    Ł: 'l',
    Ř: 'r',
    Ś: 's',
    Š: 's',
    Ź: 'z',
    Ż: 'z',
    Ž: 'z',
  }

  return (
    text
      .toLowerCase()
      .trim()
      // Replace special characters with Latin equivalents
      .split('')
      .map((char) => charMap[char] || char)
      .join('')
      // Remove any remaining special characters (keeping only letters, numbers, spaces, hyphens)
      .replace(/[^\w\s-]/g, '')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Replace multiple hyphens with single
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '')
  )
}

async function convertMarkdownToJson(
  inputPath: string,
  outputPath: string,
  type: 'events' | 'locations' | 'services',
): Promise<void> {
  const content = await fs.readFile(inputPath, 'utf-8')
  const lines = content.split('\n')

  const data: TaxonomyData = {
    categories: [],
  }

  let currentCategory: TaxonomyCategory | null = null
  let isInHeader = true

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) continue

    // Skip header lines
    if (isInHeader) {
      if (
        trimmed.includes('Versiune:') ||
        trimmed.includes('Structurat pe categorii') ||
        trimmed.includes('UN:EVENT')
      ) {
        continue
      }
      // End header when we find the first actual content
      isInHeader = false
    }

    // Check if it's a category header (doesn't start with dash or backslash-dash)
    if (!trimmed.startsWith('\\-') && !trimmed.startsWith('-')) {
      // Save previous category if exists
      if (currentCategory) {
        data.categories.push(currentCategory)
      }

      // Start new category
      currentCategory = {
        name: trimmed,
        slug: createSlug(trimmed),
        items: [],
      }
    }
    // Check if it's a taxonomy item (starts with backslash-dash or dash)
    else if ((trimmed.startsWith('\\-') || trimmed.startsWith('-')) && currentCategory) {
      // Handle both \- and - prefixes
      const prefixLength = trimmed.startsWith('\\-') ? 2 : 1
      const itemName = trimmed.substring(prefixLength).trim()
      if (itemName) {
        currentCategory.items.push({
          name: itemName,
          slug: `${type}-${currentCategory.slug}-${createSlug(itemName)}`,
        })
      }
    }
  }

  // Don't forget the last category
  if (currentCategory) {
    data.categories.push(currentCategory)
  }

  await fs.writeFile(outputPath, JSON.stringify(data, null, 2))
  console.log(`Converted ${inputPath} to ${outputPath}`)
}

async function main() {
  const docsPath = path.resolve(__dirname, '../../../../docs')
  const dataPath = path.resolve(__dirname, '../data/taxonomies')

  // Convert events taxonomy
  await convertMarkdownToJson(
    path.join(docsPath, 'Lista_Tipuri_evenimente_2025-10-12.docx.md'),
    path.join(dataPath, 'events.json'),
    'events',
  )

  // Convert locations taxonomy
  await convertMarkdownToJson(
    path.join(docsPath, 'Lista_Tipuri_locatii_2025-10-12.docx.md'),
    path.join(dataPath, 'locations.json'),
    'locations',
  )

  // Convert services taxonomy
  await convertMarkdownToJson(
    path.join(docsPath, 'Lista_Servicii_evenimente_2025-10-12.docx.md'),
    path.join(dataPath, 'services.json'),
    'services',
  )

  console.log('All taxonomy files converted to JSON!')
}

main().catch(console.error)
