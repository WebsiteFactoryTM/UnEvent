// scoring.ts - Core ranking algorithm utilities

export type Tier = 'new' | 'standard' | 'recommended' | 'sponsored'

export interface ListingSignals {
  avgRating: number // 1..5
  reviewsCount: number
  views7d: number
  views30d: number
  favoritesCount: number
  bookings7d: number
  bookings30d: number
  ageDays: number
  tier: Tier
}

export interface NormBounds {
  ratingMin: number
  ratingMax: number
  revMin: number
  revMax: number
  vwMin: number
  vwMax: number
  favMin: number
  favMax: number
  bkMin: number
  bkMax: number
  globalMeanRating: number // C - global average rating
  bayesM: number // m - Bayesian prior weight
}

export interface Weights {
  wRating: number
  wReviews: number
  wViews: number
  wFavorites: number
  wBookings: number
}

export const defaultWeights: Weights = {
  wRating: 0.35,
  wReviews: 0.15,
  wViews: 0.1,
  wFavorites: 0.15,
  wBookings: 0.25,
}

/**
 * Clamp value to [0, 1] range
 */
export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x))
}

/**
 * Normalize value to [0, 1] based on min/max bounds
 */
export function norm(x: number, min: number, max: number): number {
  if (max <= min) return 0.5 // Avoid division by zero; return neutral midpoint
  return clamp01((x - min) / (max - min))
}

/**
 * Bayesian rating to dampen small sample sizes
 * Formula: (v/(v+m))*R + (m/(v+m))*C
 * where v = number of votes, m = prior weight, R = average rating, C = global mean
 */
export function bayesianRating(avg: number, n: number, C: number, m: number): number {
  const v = Math.max(0, n)
  return (v / (v + m)) * avg + (m / (v + m)) * C
}

/**
 * Tier multiplier based on business logic
 */
export function tierMultiplier(tier: Tier, ageDays: number): number {
  const newBoost = 1 + 0.25 * Math.exp(-ageDays / 7) // Half-life ~7 days
  switch (tier) {
    case 'sponsored':
      return 1.4
    case 'recommended':
      return 1.2
    case 'new':
      return newBoost
    default:
      return 1.0
  }
}

/**
 * Recency boost - soft freshness decay
 * Max +5% on day 0, fades over ~2 weeks
 */
export function recencyBoost(ageDays: number): number {
  return 1 + 0.05 * Math.exp(-ageDays / 14)
}

/**
 * Compute popularity score (0..1) from all signals
 */
export function computePopularity(
  s: ListingSignals,
  n: NormBounds,
  w: Weights = defaultWeights,
): number {
  // Apply transforms
  const br = bayesianRating(s.avgRating, s.reviewsCount, n.globalMeanRating, n.bayesM)
  const rev = Math.log1p(s.reviewsCount)
  const vw = Math.log1p(0.7 * s.views7d + 0.3 * s.views30d)
  const fav = Math.sqrt(Math.max(0, s.favoritesCount))
  const bk = Math.log1p(0.7 * s.bookings7d + 0.3 * s.bookings30d)

  // Normalize to [0, 1]
  const rN = norm(br, n.ratingMin, n.ratingMax)
  const revN = norm(rev, n.revMin, n.revMax)
  const vwN = norm(vw, n.vwMin, n.vwMax)
  const favN = norm(fav, n.favMin, n.favMax)
  const bkN = norm(bk, n.bkMin, n.bkMax)

  // Weighted sum in [0..1]
  return clamp01(
    w.wRating * rN + w.wReviews * revN + w.wViews * vwN + w.wFavorites * favN + w.wBookings * bkN,
  )
}

/**
 * Deterministic daily jitter for rotation within a day
 * Returns value in range ~[-0.01, +0.01] (±1%)
 */
export function dailyJitter(listingId: string, dateIso: string): number {
  // Simple FNV-1a hash
  const seed = `${listingId}|${dateIso}`
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  }
  const u = (h >>> 0) / 0xffffffff // 0..1
  return (u - 0.5) * 0.02 // ±1%
}

/**
 * Compute final score for a listing
 * Returns score in 0..100+ range for readability
 */
export function computeScore(
  s: ListingSignals,
  n: NormBounds,
  {
    weights = defaultWeights,
    dateIso = new Date().toISOString().slice(0, 10),
    localBoost = 1.0,
  }: {
    weights?: Weights
    dateIso?: string
    localBoost?: number
  } = {},
): number {
  try {
    const pop = computePopularity(s, n, weights) // 0..1
    const tierMult = tierMultiplier(s.tier, s.ageDays) // ~1.0..1.4
    const rec = recencyBoost(s.ageDays) // ~1.0..1.05
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jit = 1 + dailyJitter(String((s as any).id ?? ''), dateIso) // ±1%

    // Scale to 0..100 for readability
    return 100 * pop * tierMult * rec * localBoost * jit
  } catch {
    // Fail-safe: neutral score if anything goes wrong
    return 50
  }
}
