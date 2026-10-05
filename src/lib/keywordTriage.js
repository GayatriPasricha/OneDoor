// Keyword triage: the local safety gate plus the offline fallback for routing.
// Each step is its own function so an AI result can replace steps 2–6
// without touching step 1.

import { QUICK_OPTIONS, SERVICES, serviceForCategory } from './services.js'

const KEYWORDS = {
  wellbeing: ['stress', 'stressed', 'anxious', 'anxiety', 'overwhelmed', 'lonely', 'alone', 'sad', 'depressed', 'panic', "can't sleep", 'cant sleep', 'crying', 'homesick', 'burnt out', 'burned out', 'exhausted', 'worried', 'low', 'struggling'],
  academic: ['behind', 'deadline', 'deadlines', 'assignment', 'assignments', 'exam', 'exams', 'grades', 'fail', 'failing', 'lecture', 'lectures', 'coursework', 'extension', 'study', 'studying', 'module', 'dissertation', 'attendance'],
  money: ['money', 'fees', 'fee', 'afford', 'loan', 'bursary', 'debt', 'broke', 'scholarship', 'pay', 'payment', 'funding', 'rent'],
  housing: ['housing', 'hostel', 'landlord', 'flatmate', 'roommate', 'accommodation', 'mould', 'mold', 'evicted', 'eviction', 'homeless', 'nowhere to stay', 'noisy', 'flat'],
}

const CRISIS = ['suicide', 'suicidal', 'kill myself', 'end my life', 'end it all', 'want to die', "don't want to be here", 'dont want to be here', "don't want to live", 'hurt myself', 'harm myself', 'self-harm', 'self harm', 'self-harming', 'self harming', 'harming myself', 'hurting myself', 'killing myself', 'ending my life', "can't go on like this", "can't go on anymore", "can't go on any more", 'no point in anything', 'no point in living', 'better off without me', 'want it all to stop', 'want to disappear', 'not safe', 'unsafe at home', 'overdose']

// Urgency policy. High = serious AND imminent. Medium = serious but not imminent, imminent but
// recoverable, or ongoing distress. Low = questions, mild/early concerns, matters weeks away.
const IMMINENT = ['today', 'tonight', 'tomorrow', 'this week', 'right now', 'asap', 'immediately', 'urgent', 'emergency']
const SERIOUS = ['evicted', 'eviction', 'homeless', 'nowhere to stay', 'deregistered', 'deregistration', "can't pay", 'cant pay', 'cannot pay', "can't afford", 'cant afford', 'cannot afford', 'unable to pay', 'no food', 'run out of money', 'ran out of money']
const ALWAYS_HIGH = ['urgent', 'emergency', 'evicted', 'homeless', 'nowhere to stay']
const DISRUPTIVE = ["can't sleep", 'cant sleep', 'panic attack', 'panic', 'exhausted', 'overwhelmed', 'burnt out', 'burned out', 'depressed', 'crying', "can't cope", 'cant cope', "can't concentrate", 'struggling']
const MILD = ['lonely', 'homesick', 'sad', 'low', 'worried', 'alone']
const FAR = ['next month', 'next term', 'next semester', 'next year', 'in a few weeks', 'in weeks']
const ENQUIRY = /\b(when is|when's|when do|how do i|how can i|how to|where (do|can) i|what is|what's|want to ask|like to ask|wondering)\b/
const MINIMISER = /\b(a bit|a little|slightly|somewhat)\b/

const ORDER = ['wellbeing', 'housing', 'money', 'academic']

// Neutral third-person phrases for the fallback summary, keyed by keyword.
const PHRASES = {
  stress: 'feeling stressed', stressed: 'feeling stressed', anxious: 'feeling anxious', anxiety: 'feeling anxious',
  overwhelmed: 'feeling overwhelmed', lonely: 'feeling lonely', alone: 'feeling alone', sad: 'feeling sad',
  depressed: 'feeling depressed', panic: 'experiencing panic', "can't sleep": 'having difficulty sleeping',
  'cant sleep': 'having difficulty sleeping', crying: 'feeling tearful', homesick: 'feeling homesick',
  'burnt out': 'feeling burnt out', 'burned out': 'feeling burnt out', exhausted: 'feeling exhausted',
  worried: 'feeling worried', low: 'feeling low', struggling: 'struggling',

  behind: 'falling behind', deadline: 'worrying about deadlines', deadlines: 'worrying about deadlines',
  assignment: 'struggling with assignments', assignments: 'struggling with assignments',
  exam: 'worrying about exams', exams: 'worrying about exams', grades: 'worrying about grades',
  fail: 'worrying about failing', failing: 'worrying about failing',
  lecture: 'struggling to keep up with lectures', lectures: 'struggling to keep up with lectures',
  coursework: 'struggling with coursework', extension: 'asking about an extension',
  study: 'having difficulty studying', studying: 'having difficulty studying',
  module: 'struggling with a module', dissertation: 'struggling with their dissertation',
  attendance: 'having attendance concerns',

  money: 'having money worries', fees: 'having concerns about fees', fee: 'having concerns about fees',
  afford: 'struggling to afford costs', loan: 'having concerns about a loan', bursary: 'having questions about funding',
  debt: 'being in debt', broke: 'being short of money', scholarship: 'having questions about funding',
  pay: 'having difficulty with payments', payment: 'having difficulty with payments',
  funding: 'having questions about funding', rent: 'having concerns about rent',

  housing: 'having a housing issue', hostel: 'having an issue with their hostel',
  landlord: 'having problems with their landlord', flatmate: 'having issues with a flatmate',
  roommate: 'having issues with a roommate', accommodation: 'having an accommodation issue',
  mould: 'dealing with mould in their accommodation', mold: 'dealing with mould in their accommodation',
  evicted: 'facing eviction', eviction: 'facing eviction', homeless: 'being at risk of homelessness',
  'nowhere to stay': 'having nowhere to stay', noisy: 'dealing with noise', flat: 'having an issue with their flat',
}

// Two keywords that read better as one phrase.
const COMBINED = [
  [['pay', 'fees'], 'having difficulty paying fees'], [['pay', 'fee'], 'having difficulty paying fees'],
  [['pay', 'rent'], 'having difficulty paying rent'], [['afford', 'rent'], 'struggling to afford rent'],
  [['afford', 'fees'], 'struggling to afford fees'],
]

// Consecutive phrases with the same lead-in are merged: "feeling anxious and lonely".
const LEADS = ['feeling ', 'worrying about ', 'having concerns about ', 'struggling with ']

function mergeLeads(phrases) {
  const out = []
  for (const p of phrases) {
    const lead = LEADS.find((l) => p.startsWith(l))
    const prev = out.at(-1)
    if (lead && prev?.lead === lead) prev.items.push(p.slice(lead.length))
    else out.push(lead ? { lead, items: [p.slice(lead.length)] } : { text: p })
  }
  return out.map((o) => o.text ?? o.lead + joinList(o.items).replace(', and ', ' and '))
}

// "behind" + one of these reads as "falling behind on <thing>".
const BEHIND_ON = { assignment: 'assignments', assignments: 'assignments', coursework: 'coursework', lecture: 'lectures', lectures: 'lectures', module: 'a module', dissertation: 'their dissertation', study: 'their studies', studying: 'their studies' }

function pattern(word) {
  return new RegExp(`(^|[^a-z])${word.replace(/[-']/g, '[-\' ]?')}([^a-z]|$)`)
}

function matches(text, words) {
  return words.filter((w) => pattern(w).test(text))
}

function quoteList(words) {
  const q = words.slice(0, 3).map((w) => `“${w}”`)
  return q.length > 1 ? `${q.slice(0, -1).join(', ')} and ${q.at(-1)}` : q[0]
}

function joinList(items) {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

// 1. Safety gate — authoritative. Runs before any AI call.
export function detectCrisis(rawText) {
  return matches(rawText.toLowerCase(), CRISIS).length > 0
}

// 2. Category: most keyword hits wins; a quick option counts as one hit.
export function detectCategories(text, hints) {
  const hits = {}
  for (const id of ORDER) {
    hits[id] = matches(text, KEYWORDS[id])
    if (hints.includes(id)) hits[id] = [...hits[id], null]
  }
  const ranked = ORDER.filter((id) => hits[id].length).sort((a, b) => hits[b].length - hits[a].length)
  const category = ranked[0] ?? 'general'
  return { category, alsoMentioned: ranked.slice(1), matchedWords: (hits[category] ?? []).filter(Boolean) }
}

// 3. Urgency
export function determineUrgency(text, { crisis, category, alsoMentioned }) {
  if (crisis) return 'High'
  const imminent = matches(text, IMMINENT).length > 0
  const serious = matches(text, SERIOUS).length > 0 || (category === 'housing' && /\b(leave|out of my|kicked out|thrown out)\b/.test(text))
  if ((serious && imminent) || matches(text, ALWAYS_HIGH).length) return 'High'
  if (serious || imminent || matches(text, DISRUPTIVE).length) return 'Medium'
  if (matches(text, FAR).length || ENQUIRY.test(text)) return 'Low'
  if (category === 'wellbeing') {
    const words = matches(text, KEYWORDS.wellbeing)
    return MINIMISER.test(text) || (words.length && words.every((w) => MILD.includes(w))) ? 'Low' : 'Medium'
  }
  if (alsoMentioned.length || /deadline|exam/.test(text)) return 'Medium'
  return 'Low'
}

// 4. Service
export const recommendService = serviceForCategory

// 5. Reasons shown under "Why we're recommending this"
export function buildReasons({ category, matchedWords, hints, alsoMentioned }) {
  const reasons = []
  if (matchedWords.length) reasons.push(`You mentioned ${quoteList(matchedWords)}.`)
  const chip = QUICK_OPTIONS.find((o) => o.service === category && hints.includes(category))
  if (chip) reasons.push(`You selected “${chip.label}”.`)
  if (category === 'general') {
    if (!reasons.length) reasons.push("You didn't point to one specific area — that's completely fine.")
    reasons.push('The Advice Centre is the best place to start when things overlap or aren’t clear yet.')
  } else {
    reasons.push(`These are things the ${SERVICES[category].name} team supports students with every day.`)
  }
  if (alsoMentioned.length) {
    const other = SERVICES[alsoMentioned[0]]
    reasons.push(`You also mentioned ${other.short} — they can link you with ${other.name} too.`)
  }
  return reasons.slice(0, 3)
}

// 6. Neutral third-person summary for the support team
export function buildSummary(text, { hints }) {
  const found = []
  for (const words of Object.values(KEYWORDS)) {
    for (const w of matches(text, words)) found.push({ w, at: text.search(pattern(w)) })
  }
  found.sort((a, b) => a.at - b.at)

  let words = found.map((f) => f.w)
  const combined = []
  for (const [pair, phrase] of COMBINED) {
    if (pair.every((w) => words.includes(w))) {
      combined.push({ at: Math.min(...pair.map((w) => words.indexOf(w))), phrase })
      words = words.filter((w) => !pair.includes(w))
    }
  }
  const behindOn = words.includes('behind') && words.find((w) => BEHIND_ON[w])
  const phrases = []
  for (const w of words) {
    if (behindOn && w === behindOn) continue
    const p = w === 'behind' && behindOn ? `falling behind on ${BEHIND_ON[behindOn]}` : PHRASES[w]
    if (p && !phrases.includes(p)) phrases.push(p)
  }
  for (const c of combined) if (!phrases.includes(c.phrase)) phrases.splice(Math.min(c.at, phrases.length), 0, c.phrase)

  if (phrases.length) {
    const urgent = matches(text, IMMINENT).length ? ' They indicate it is time-sensitive.' : ''
    const merged = mergeLeads(phrases.slice(0, 4))
    const list = merged.length === 2 && merged[0].includes(' and ') ? `${merged[0]}, and ${merged[1]}` : joinList(merged)
    return `Student reports ${list}.${urgent}`
  }
  const chips = QUICK_OPTIONS.filter((o) => hints.includes(o.service)).map((o) => `“${o.label}”`)
  if (!text.trim() && chips.length) return `Student selected ${joinList(chips)} and has not added further details yet.`
  return 'Student would like support but has not pointed to one specific area yet.'
}

// Steps 1–6 together: the fallback result, in the same shape the AI returns.
export function keywordTriage(rawText, hints = []) {
  const text = rawText.toLowerCase()
  const crisis = detectCrisis(rawText)
  const { category, alsoMentioned, matchedWords } = detectCategories(text, hints)
  return {
    category,
    urgency: determineUrgency(text, { crisis, category, alsoMentioned }),
    recommendedService: recommendService(category),
    reason: buildReasons({ category, matchedWords, hints, alsoMentioned }),
    summary: crisis ? 'Student’s message suggests they may need immediate support.' : buildSummary(text, { hints }),
    alsoMentioned,
    confidence: null,
    crisis,
    source: 'keywords',
  }
}
