import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface TaxonomyCategory {
  name: string
  items: Array<{
    name: string
  }>
}

interface TaxonomyData {
  categories: TaxonomyCategory[]
}

async function convertMarkdownToJson(
  inputPath: string,
  outputPath: string,
  type: 'events' | 'locations' | 'services' | 'facilities',
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

  // Convert facilities taxonomy
  await convertMarkdownToJson(
    path.join(docsPath, 'Lista_Facilitati_locatii_2025-10-12.docx.md'),
    path.join(dataPath, 'facilities.json'),
    'facilities',
  )

  console.log('All taxonomy files converted to JSON!')
}

main().catch(console.error)
