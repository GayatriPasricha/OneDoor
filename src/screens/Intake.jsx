import { useState } from 'react'
import { QUICK_OPTIONS } from '../lib/services'
import { Arrow, Lock } from '../components/Icons'

export default function Intake({ text, setText, hints, setHints, onSubmit, headingRef }) {
  const [touched, setTouched] = useState(false)
  const ready = text.trim().length > 0 || hints.length > 0

  const toggle = (service) =>
    setHints(hints.includes(service) ? hints.filter((h) => h !== service) : [...hints, service])

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (ready) onSubmit()
  }

  return (
    <form className="screen intake wide" onSubmit={submit} noValidate>
      <div className="hero">
        <h1 ref={headingRef} tabIndex={-1}>One front door to student support.</h1>
        <p className="lead">You don't need to know who to contact. Just tell us what's going on.</p>
      </div>

      <div className="card intake-card">
        <label htmlFor="story" className="field-label">What's happening?</label>
        <textarea
          id="story"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell us in your own words..."
          aria-describedby="story-help"
        />
        <p id="story-help" className="helper">
          You can explain it in your own words. You don't need to know which service you need.
        </p>

        <fieldset className="chips">
          <legend className="chips-legend">Or start with one of these</legend>
          {QUICK_OPTIONS.map((o) => (
            <button
              type="button"
              key={o.service}
              className="chip"
              aria-pressed={hints.includes(o.service)}
              onClick={() => toggle(o.service)}
            >
              {o.label}
            </button>
          ))}
        </fieldset>

        <div className="actions">
          <button type="submit" className="btn btn-primary btn-block-sm" aria-disabled={!ready}>
            Find my support <Arrow />
          </button>
          {touched && !ready && (
            <p className="hint" role="status">Write a few words or pick an option to continue.</p>
          )}
        </div>
      </div>

      <p className="privacy"><Lock /> Your information is only shared with your consent.</p>
    </form>
  )
}
