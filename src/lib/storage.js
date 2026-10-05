import { SERVICES } from './services'

const KEY = 'onedoor.requests'

export function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? []
  } catch {
    return []
  }
}

export function saveRequests(requests) {
  try {
    localStorage.setItem(KEY, JSON.stringify(requests))
  } catch {
    // Storage unavailable (private mode etc.) — the session still works in memory.
  }
}

export function nextRequestId(requests) {
  const last = requests.reduce((max, r) => Math.max(max, Number(r.id.split('-')[1])), 1041)
  return `OD-${last + 1}`
}

// Builds the stored request. Consent is enforced here: the summary is only
// kept when the student said yes.
export function createRequest({ result, serviceId, consent, requests }) {
  return {
    id: nextRequestId(requests),
    service: SERVICES[serviceId].name,
    urgency: result.urgency,
    consent,
    createdAt: new Date().toISOString(),
    category: result.category,
    source: result.source,
    ...(consent === 'yes' && { summary: result.summary }),
  }
}
