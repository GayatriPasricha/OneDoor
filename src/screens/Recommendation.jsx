import { useState } from 'react'
import { SERVICES, urgencyNote } from '../lib/services'
import UrgencyBadge from '../components/UrgencyBadge'
import { Arrow, Heart, Check } from '../components/Icons'

export default function Recommendation({ result, serviceId, setServiceId, onContinue, headingRef }) {
  const [choosing, setChoosing] = useState(false)
  const service = SERVICES[serviceId]
  const own = serviceId !== result.recommendedService

  const reasons = own
    ? ['You chose this service yourself — that’s absolutely fine.', `Your summary will go to ${service.name} instead.`]
    : result.reason

  return (
    <section className="screen rec wide">
      <div className="screen-head">
        <h1 ref={headingRef} tabIndex={-1}>We found a good place to start.</h1>
      </div>

      <article className="card rec-card">
        <div className="rec-top">
          <span className="service-icon"><Heart /></span>
          <div>
            <p className="eyebrow">{own ? 'Your choice' : 'Recommended for you'}</p>
            <h2 className="h3">{service.name}</h2>
          </div>
        </div>
        <p className="rec-blurb">Based on what you shared, {service.blurb}</p>
        <div className="rec-meta">
          <UrgencyBadge level={result.urgency} />
          <span className="muted small">{urgencyNote(result.urgency)}</span>
        </div>
      </article>

      <div className="card why-card">
        <h2 className="h4">Why we're recommending this</h2>
        <ul className="why-list">
          {reasons.map((r) => (
            <li key={r}><span className="tick"><Check size={12} /></span>{r}</li>
          ))}
        </ul>
      </div>

      {choosing && (
        <div className="card choose-card">
          <h2 className="h4">Choose a different service</h2>
          <div className="choose-list" role="radiogroup" aria-label="Services">
            {Object.values(SERVICES).map((s) => (
              <button
                key={s.id}
                role="radio"
                aria-checked={s.id === serviceId}
                className="choose-item"
                onClick={() => { setServiceId(s.id); setChoosing(false) }}
              >
                <span className="radio" aria-hidden="true" />
                <span>
                  <strong>{s.name}</strong>
                  <span className="muted small">{s.need}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="actions actions-stack">
        <button className="btn btn-primary" onClick={onContinue}>Continue <Arrow /></button>
        {!choosing && (
          <button className="btn btn-ghost" onClick={() => setChoosing(true)}>Choose a different service</button>
        )}
      </div>
    </section>
  )
}
