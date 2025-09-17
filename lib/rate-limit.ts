type Key = string

const BUCKET: Record<Key, { tokens: number; updatedAt: number }> = {}

export function rateLimit(key: Key, maxPerHour: number): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const entry = BUCKET[key] || { tokens: 0, updatedAt: now }
  if (now - entry.updatedAt > hour) {
    entry.tokens = 0
    entry.updatedAt = now
  }
  if (entry.tokens >= maxPerHour) return false
  entry.tokens++
  entry.updatedAt = now
  BUCKET[key] = entry
  return true
}

