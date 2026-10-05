// Tiny API server: POST /api/triage → Gemini. Run with `npm run dev:api`.
// It never logs student text — only status codes and timings.

import http from 'node:http'
import { pathToFileURL } from 'node:url'
import { detectCrisis } from '../src/lib/keywordTriage.js'
import { CATEGORY_IDS } from '../src/lib/services.js'
import { geminiTriage, isConfigured } from './gemini.js'

const MAX_BODY = 8 * 1024
const MAX_TEXT = 2000
const RATE_LIMIT = 30 // requests per minute per IP
const GEMINI_TIMEOUT_MS = 5000

const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...(status === 413 && { Connection: 'close' }) })
  res.end(JSON.stringify(body))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > MAX_BODY) {
        if (size - c.length <= MAX_BODY) reject(Object.assign(new Error('too large'), { status: 413 }))
      } else chunks.push(c)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(Object.assign(new Error('bad json'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

export function createApp({ triage = geminiTriage, configured = isConfigured } = {}) {
  return http.createServer(async (req, res) => {
    const started = Date.now()
    const done = (status, body) => {
      console.log(`[triage] ${status} ${Date.now() - started}ms`)
      send(res, status, body)
    }

    if (req.url !== '/api/triage') return send(res, 404, { error: 'not_found' })
    if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
    if (rateLimited(req.socket.remoteAddress ?? 'unknown')) return done(429, { error: 'rate_limited' })

    let body
    try {
      body = await readJson(req)
    } catch (e) {
      if (e.status === 413) res.on('finish', () => req.destroy()) // stop reading the oversized upload once we have replied
      return done(e.status ?? 400, { error: e.status === 413 ? 'too_large' : 'bad_request' })
    }

    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_TEXT) : ''
    const hints = Array.isArray(body?.hints) ? [...new Set(body.hints)].filter((h) => CATEGORY_IDS.includes(h)).slice(0, 5) : []
    if (!text && !hints.length) return done(400, { error: 'bad_request' })

    // Defence in depth: a crisis message is never sent to the AI, even if a client skips its own check.
    if (detectCrisis(text)) return done(422, { error: 'safety' })
    if (!configured()) return done(503, { error: 'not_configured' })

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)
    try {
      const result = await triage(text, hints, { signal: controller.signal, timeoutMs: GEMINI_TIMEOUT_MS })
      return done(200, result)
    } catch {
      return done(502, { error: 'upstream' })
    } finally {
      clearTimeout(timer)
    }
  })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT) || 8787
  createApp().listen(port, '127.0.0.1', () => {
    console.log(`[triage] API on http://127.0.0.1:${port} — Gemini ${isConfigured() ? 'configured' : 'NOT configured (keyword fallback will be used)'}`)
  })
}
