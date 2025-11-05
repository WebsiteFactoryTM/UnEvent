// apps/backend/scripts/backfill-listing-type-slugs.ts
import { Payload } from 'payload'
import path from 'path'
import dotenv from 'dotenv'
import slugify from 'slugify'

dotenv.config({ path: path.resolve(process.cwd(), '.env') }) // adjust if needed

function roSlugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove combining marks
    .replace(/ș|ş/g, 's')
    .replace(/ț|ţ/g, 't')
    .replace(/ă/g, 'a')
    .replace(/î/g, 'i')
    .replace(/â/g, 'a')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function updateListingTypesSlugs(payload: Payload) {
  const coll = 'listing-types'
  const DRY = process.env.DRY_RUN === '1'

  // 1) Preload existing slugs to ensure uniqueness
  const existingSlugs = new Set<string>()
  const existingCategorySlugs = new Set<string>()
  {
    let page = 1
    for (;;) {
      const res = await payload.find({
        collection: coll,
        page,
        limit: 200,
        depth: 0,
        select: { slug: true },
      })
      res.docs.forEach((d: any) => d.slug && existingSlugs.add(String(d.slug)))
      res.docs.forEach(
        (d: any) => d.categorySlug && existingCategorySlugs.add(String(d.categorySlug)),
      )
      if (!res.hasNextPage) break
      page++
    }
  }

  let page = 1
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (;;) {
    const res = await payload.find({
      collection: coll,
      page,
      limit: 10000,
      depth: 0,
      //   where: {
      //     or: [{ slug: { exists: false } }, { slug: { equals: '' } }, { slug: { like: ' ' } }],
      //   },
    })

    if (res.docs.length === 0 && !res.hasNextPage) break

    for (const doc of res.docs as any[]) {
      const base = doc.title || doc.category || `type-${doc.id}`
      if (!base) {
        skipped++
        continue
      }

      const s =
        slugify(base, { lower: true, strict: true, trim: true }) ||
        `type-${slugify(doc.title, { lower: true, strict: true, trim: true })}`

      // ensure uniqueness in-memory
      let unique = s
      let i = 2
      while (existingSlugs.has(unique)) unique = `${s}-${i++}`

      const categorySlug =
        slugify(doc.category, { lower: true, strict: true, trim: true }) ||
        `category-${slugify(doc.category, { lower: true, strict: true, trim: true })}`
      try {
        if (DRY) {
          console.log(`[dry-run] would set slug for ${doc.id} -> ${unique}`)
        } else {
          console.log(
            `Setting slug for ${doc.id} -> ${unique} and category slug for ${doc.id} -> ${categorySlug}`,
          )
          await payload.update({
            collection: coll,
            id: doc.id,
            data: { slug: unique, categorySlug: categorySlug },
            depth: 0,
            overrideAccess: true,
          })
        }
        existingSlugs.add(unique)
        existingCategorySlugs.add(categorySlug)
        updated++
      } catch (e: any) {
        errors.push(`${doc.id}: ${e?.message || e}`)
      }
    }

    if (!res.hasNextPage) break
    page++
  }

  console.log({ updated, skipped, errorsCount: errors.length })
  if (errors.length) console.error(errors.join('\n'))
}
