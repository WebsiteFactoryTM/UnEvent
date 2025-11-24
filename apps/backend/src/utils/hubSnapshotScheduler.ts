import type { Payload } from 'payload'

import { buildHubSnapshot } from '@/schedulers/buildHubSnapshot'

type HubCollection = 'locations' | 'services' | 'events'

type HubSnapshotSchedulerState = {
  timers: Partial<Record<HubCollection, NodeJS.Timeout | null>>
  lastBuildAt: Partial<Record<HubCollection, number>>
}

const HUB_TIERS = new Set(['recommended', 'sponsored'])
const DEFAULT_DEBOUNCE_MS = Number(process.env.HUB_SNAPSHOT_DEBOUNCE_MS ?? 30_000)
const MIN_INTERVAL_MS = Number(process.env.HUB_SNAPSHOT_MIN_INTERVAL_MS ?? 120_000)

const globalKey = Symbol.for('__UNEVENT_HUB_SCHEDULER__')

function getSchedulerState(): HubSnapshotSchedulerState {
  const globalObj = globalThis as typeof globalThis & {
    [globalKey]?: HubSnapshotSchedulerState
  }
  if (!globalObj[globalKey]) {
    globalObj[globalKey] = {
      timers: {},
      lastBuildAt: {},
    }
  }
  return globalObj[globalKey]!
}

export function isHubSnapshotCandidate(doc?: any): boolean {
  if (!doc) return false
  const tier = (doc.tier ?? '').toString().toLowerCase()
  const status = (doc.moderationStatus ?? '').toString().toLowerCase()
  return HUB_TIERS.has(tier) && status === 'approved'
}

export function queueHubSnapshotBuild(
  payload: Payload,
  collection: HubCollection,
  reason = 'change',
): void {
  const state = getSchedulerState()

  if (state.timers[collection]) {
    payload.logger?.debug?.(
      `[HubSnapshotScheduler] Build for "${collection}" already scheduled, skipping (${reason})`,
    )
    return
  }

  const now = Date.now()
  const lastRun = state.lastBuildAt[collection] ?? 0
  const sinceLastRun = now - lastRun

  const delay =
    sinceLastRun >= MIN_INTERVAL_MS
      ? DEFAULT_DEBOUNCE_MS
      : Math.max(DEFAULT_DEBOUNCE_MS, MIN_INTERVAL_MS - sinceLastRun)

  payload.logger?.info?.(
    `[HubSnapshotScheduler] Scheduling hub rebuild for "${collection}" in ${Math.round(
      delay / 1000,
    )}s (${reason})`,
  )

  state.timers[collection] = setTimeout(async () => {
    state.timers[collection] = null
    try {
      await buildHubSnapshot(payload, collection)
      state.lastBuildAt[collection] = Date.now()
    } catch (error) {
      payload.logger?.error?.(
        `[HubSnapshotScheduler] Failed to build hub snapshot for "${collection}"`,
        error,
      )
    }
  }, delay)
}
