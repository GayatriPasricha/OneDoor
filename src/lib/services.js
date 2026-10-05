// Static catalogue: the five services, the intake quick options and the
// allowed values a triage result may use. No logic lives here.

export const SERVICES = {
  wellbeing: {
    id: 'wellbeing',
    name: 'Student Wellbeing',
    blurb: 'this team can help with stress, wellbeing and feeling overwhelmed.',
    need: 'Emotional wellbeing support',
    short: 'wellbeing',
  },
  academic: {
    id: 'academic',
    name: 'Academic Support',
    blurb: 'this team can help with falling behind, deadlines, extensions and study skills.',
    need: 'Help catching up with studies',
    short: 'academic worries',
  },
  money: {
    id: 'money',
    name: 'Student Money Advice',
    blurb: 'this team can help with fees, funding, hardship support and budgeting.',
    need: 'Advice on money or fees',
    short: 'money worries',
  },
  housing: {
    id: 'housing',
    name: 'Accommodation Services',
    blurb: 'this team can help with hostel issues, housing problems and finding somewhere safe to live.',
    need: 'Help with housing or hostel',
    short: 'housing',
  },
  general: {
    id: 'general',
    name: 'Student Advice Centre',
    blurb: 'this team can listen, help you work out next steps and connect you with the right people.',
    need: 'Help working out next steps',
    short: 'general advice',
  },
}

export const QUICK_OPTIONS = [
  { label: "I'm struggling emotionally", service: 'wellbeing' },
  { label: "I'm falling behind academically", service: 'academic' },
  { label: 'Money or fees', service: 'money' },
  { label: 'Housing / hostel', service: 'housing' },
  { label: 'Something else', service: 'general' },
]

export const CATEGORY_IDS = Object.keys(SERVICES)
export const URGENCY = ['Low', 'Medium', 'High']

// Five-service prototype: each category has exactly one service.
export const serviceForCategory = (category) => (SERVICES[category] ? category : 'general')

export function urgencyNote(urgency) {
  if (urgency === 'High') return 'It sounds time-sensitive, so this will be picked up as a priority.'
  if (urgency === 'Medium') return 'This sounds like it’s affecting you now, so it’s marked medium priority.'
  return 'This doesn’t look time-critical, so it joins the normal queue.'
}
