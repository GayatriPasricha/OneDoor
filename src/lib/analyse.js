// Orchestrates triage. Safety screening happens before AI triage:
// AI assists with routing; it does not decide whether someone is safe.

import { aiTriage } from './aiTriage.js'
import { detectCrisis, keywordTriage } from './keywordTriage.js'
import { CATEGORY_IDS, SERVICES, URGENCY, serviceForCategory } from './services.js'

const AI_TIMEOUT_MS = 6000 // above the server's 5s Gemini timeout
const MAX_SUMMARY = 400

export async function analyse(text, hints = []) {
  // 1. Local safety gate. A crisis never reaches the AI.
  if (detectCrisis(text)) return keywordTriage(text, hints)

  // 2. AI routing, with the keyword system as the fallback.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const result = normalizeResult(await aiTriage(text, hints, { signal: controller.signal }))
    if (result) return result
  } catch {
    // Not configured, network error, timeout or bad JSON — fall through.
  } finally {
    clearTimeout(timer)
  }
  return keywordTriage(text, hints)
}

// Validate an AI response into the result shape, or return null to fall back.
export function normalizeResult(raw) {
  if (!raw || typeof raw !== 'object') return null

  const category = CATEGORY_IDS.includes(raw.category) ? raw.category : null
  const recommendedService = SERVICES[raw.recommendedService] ? raw.recommendedService : category && serviceForCategory(category)
  if (!category || !recommendedService) return null

  const urgency = URGENCY.includes(raw.urgency) ? raw.urgency : 'Medium'
  const reason = (Array.isArray(raw.reason) ? raw.reason : [raw.reason])
    .filter((r) => typeof r === 'string' && r.trim())
    .map((r) => r.trim())
    .slice(0, 3)
  const summary = typeof raw.summary === 'string' ? raw.summary.trim().slice(0, MAX_SUMMARY) : ''
  if (!reason.length || !summary) return null

  const alsoMentioned = [...new Set(Array.isArray(raw.alsoMentioned) ? raw.alsoMentioned : [])]
    .filter((id) => CATEGORY_IDS.includes(id) && id !== category)
  const confidence = typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
    ? Math.min(1, Math.max(0, raw.confidence))
    : null

  if (raw.crisis === true) {
    // Logged for validation only — routing follows the local safety gate.
    console.warn('[OneDoor] AI flagged a possible crisis the local safety gate did not. Not used for routing.')
  }

  return { category, urgency, recommendedService, reason, summary, alsoMentioned, confidence, crisis: false, source: 'ai' }
}
