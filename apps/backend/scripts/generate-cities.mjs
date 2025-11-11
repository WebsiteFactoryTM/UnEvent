import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const seedDir = path.resolve(__dirname, '../src/data/seed')
const sourceFile = path.join(seedDir, 'orase - RO - complet.json')
const targetFile = path.join(seedDir, 'cities.json')

function normalizeKey(name, county) {
  return `${String(name).trim().toLowerCase()}|${String(county).trim().toLowerCase()}`
}

async function readJsonArray(filePath) {
  const raw = await readFile(filePath, 'utf8')
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) {
    throw new Error(`Expected array in ${filePath}`)
  }
  return data
}

async function main() {
  const [existingCities, orase] = await Promise.all([
    readJsonArray(targetFile),
    readJsonArray(sourceFile),
  ])

  // Index existing cities by name+county; keep them as source of truth if duplicates appear
  const cityMap = new Map()
  for (const c of existingCities) {
    if (!c?.name || !c?.county || !Array.isArray(c?.geo)) continue
    cityMap.set(normalizeKey(c.name, c.county), c)
  }

  // Transform orase entries into target schema
  for (const o of orase) {
    const name = o?.nume
    const county = o?.judet
    const x = o?.x
    const y = o?.y
    if (typeof name !== 'string' || typeof county !== 'string') continue
    if (typeof x !== 'number' || typeof y !== 'number') continue

    const key = normalizeKey(name, county)
    if (cityMap.has(key)) {
      // Keep existing entry; do not override
      continue
    }
    cityMap.set(key, {
      name,
      country: 'Romania',
      county,
      source: 'seeded',
      geo: [y, x], // [lat, lon]
      usageCount: 0,
      verified: true,
    })
  }

  // Sort by county, then name
  const merged = Array.from(cityMap.values()).sort((a, b) => {
    const ac = String(a.county).localeCompare(String(b.county), 'ro', { sensitivity: 'base' })
    if (ac !== 0) return ac
    return String(a.name).localeCompare(String(b.name), 'ro', { sensitivity: 'base' })
  })

  await writeFile(targetFile, JSON.stringify(merged, null, 2) + '\n', 'utf8')

  const added = merged.length - existingCities.length

  console.log(
    `Updated ${path.relative(process.cwd(), targetFile)}: total=${merged.length}, added≈${Math.max(0, added)}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
