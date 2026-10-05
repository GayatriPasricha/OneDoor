import { useEffect, useState } from 'react'
import { Check } from '../components/Icons'

const STEPS = ['Checking urgency', 'Understanding your need', 'Finding the right service']
const STEP_MS = 700

export default function Analysis({ crisis, ready, onDone, headingRef }) {
  const [done, setDone] = useState(0)

  useEffect(() => {
    // A crisis is caught by the first check — skip straight to immediate support.
    const total = crisis ? 1 : STEPS.length
    if (done >= total) {
      if (!ready && !crisis) return // routing result still pending; a crisis never waits
      const t = setTimeout(onDone, crisis ? 300 : 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDone((d) => d + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [done, crisis, ready, onDone])

  return (
    <section className="screen analysis" aria-live="polite">
      <div className="card analysis-card">
        <div className="pulse" aria-hidden="true"><span /></div>
        <h1 ref={headingRef} tabIndex={-1} className="h2">Understanding</h1>
        <p className="muted">We're looking at what you shared and finding the right place to start.</p>
        <ul className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i < done ? 'is-done' : i === done ? 'is-active' : ''}>
              <span className="step-icon">{i < done ? <Check size={14} /> : <span className="spinner" />}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
