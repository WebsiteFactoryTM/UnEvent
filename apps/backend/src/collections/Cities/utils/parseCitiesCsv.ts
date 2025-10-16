import { parse } from 'csv-parse/sync'
import type { CityInput } from './findOrCreateCity'

type ParsedCity = {
  name: string
  country?: string
  latitude?: string
  longitude?: string
}

export const parseCitiesCsv = (csvContent: string): CityInput[] => {
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as ParsedCity[]

    return records.map((record): CityInput => {
      const city: CityInput = {
        name: record.name,
        country: record.country || 'Romania',
        source: 'seeded',
      }

      // Only add geo if both lat and lng are present and valid numbers
      const lat = parseFloat(record.latitude || '')
      const lng = parseFloat(record.longitude || '')
      if (!isNaN(lat) && !isNaN(lng)) {
        city.geo = { lat, lng }
      }

      return city
    })
  } catch (error) {
    console.error('Error parsing CSV:', error)
    throw new Error(
      'Invalid CSV format. Please ensure your CSV has the correct headers: name, country (optional), latitude (optional), longitude (optional)',
    )
  }
}
