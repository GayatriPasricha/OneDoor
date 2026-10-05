// AI triage client. Calls our own server (server/index.js), which holds the
// Gemini API key — the browser never sees it. Any failure throws, and
// analyse() falls back to the keyword system.

const ENDPOINT = '/api/triage'

export async function aiTriage(text, hints, { signal } = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, hints }),
    signal,
  })
  if (!res.ok) throw new Error(`AI triage failed: ${res.status}`)
  return res.json()
}
