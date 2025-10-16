import type { PayloadHandler } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { parseCitiesCsv } from '../utils/parseCitiesCsv'
import { findOrCreateCity } from '../utils/findOrCreateCity'

export const importCitiesFromCsv: PayloadHandler = async (req) => {
  try {
    await addDataAndFileToRequest(req)
    if (!req.file) {
      return new Response('No CSV file provided', { status: 400 as const })
    }
    const file = req.file

    const csvContent = file?.data.toString('utf-8')
    const cities = parseCitiesCsv(csvContent || '')

    const results = {
      total: cities.length,
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    // Process cities in batches to avoid overwhelming the database
    const batchSize = 50
    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize)
      const promises = batch.map(async (cityData) => {
        try {
          const city = await findOrCreateCity(req.payload, cityData)
          if (city.createdAt === city.updatedAt) {
            results.created++
          } else {
            results.updated++
          }
        } catch (error) {
          results.errors.push(`Failed to import ${cityData.name}: ${(error as Error).message}`)
        }
      })

      await Promise.all(promises)
    }

    return new Response(JSON.stringify(results), { status: 200 as const })
  } catch (error) {
    console.error('Error importing cities:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to import cities' }),
      { status: 500 as const },
    )
  }
}
