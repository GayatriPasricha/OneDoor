// Live check once GEMINI_API_KEY is set:  npm run smoke
// Uses made-up sample messages only.

import { geminiTriage, isConfigured } from './gemini.js'
import { CATEGORY_IDS, URGENCY } from '../src/lib/services.js'

if (!isConfigured()) {
  console.error('GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.')
  process.exit(1)
}

const SAMPLES = [
  ["I'm so stressed and overwhelmed, I can't sleep and I'm behind on my assignments", []],
  ["I can't pay my fees this term", []],
  ["My hostel room has mould and the landlord won't respond", []],
  ['', ['money']],
  ['not sure who to talk to', []],
]

// Same rules the browser applies in normalizeResult(), so a pass here means the app will use the AI result.
function check(r) {
  const p = []
  if (!CATEGORY_IDS.includes(r.category)) p.push('bad category')
  if (!CATEGORY_IDS.includes(r.recommendedService)) p.push('bad recommendedService')
  if (r.recommendedService !== r.category) p.push('recommendedService differs from category')
  if (!URGENCY.includes(r.urgency)) p.push('bad urgency')
  if (!Array.isArray(r.reason) || !r.reason.length || r.reason.some((x) => typeof x !== 'string' || !x.trim())) p.push('bad reason')
  if (typeof r.summary !== 'string' || !r.summary.trim()) p.push('bad summary')
  if (!Array.isArray(r.alsoMentioned) || r.alsoMentioned.includes(r.category) || r.alsoMentioned.some((x) => !CATEGORY_IDS.includes(x))) p.push('bad alsoMentioned')
  if (typeof r.confidence !== 'number' || r.confidence < 0 || r.confidence > 1) p.push('confidence not in 0-1')
  if ('crisis' in r) p.push('unexpected crisis field')
  return p
}

let failed = 0
for (const [text, hints] of SAMPLES) {
  const started = Date.now()
  try {
    const raw = await geminiTriage(text, hints, { timeoutMs: 8000 })
    const problems = check(raw)
    if (problems.length) failed++
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${Date.now() - started}ms  ${JSON.stringify(text || hints)}`)
    console.log(`     ${raw.category}/${raw.urgency} → ${raw.recommendedService} (conf ${raw.confidence}) also=${JSON.stringify(raw.alsoMentioned)}`)
    console.log(`     summary: ${raw.summary}`)
    console.log(`     reason:  ${JSON.stringify(raw.reason)}`)
    problems.forEach((p) => console.log(`     PROBLEM: ${p}`))
  } catch (e) {
    failed++
    console.log(`FAIL ${JSON.stringify(text || hints)} → ${e.message}`)
  }
}
console.log(failed ? `\n${failed} of ${SAMPLES.length} failed` : `\nAll ${SAMPLES.length} samples returned valid structured output`)
process.exit(failed ? 1 : 0)
