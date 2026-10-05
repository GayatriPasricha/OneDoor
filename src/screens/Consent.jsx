import { SERVICES } from '../lib/services'
import { Arrow, Lock } from '../components/Icons'

export default function Consent({ result, serviceId, consent, setConsent, onContinue, headingRef }) {
  const service = SERVICES[serviceId]
  const also = result.alsoMentioned.filter((id) => id !== serviceId).map((id) => SERVICES[id].name)

  return (
    <section className="screen consent wide">
      <div className="screen-head">
        <h1 ref={headingRef} tabIndex={-1}>Tell us once. We'll carry the context forward.</h1>
        <p className="lead">Here's a short summary we can share with the support team.</p>
      </div>

      <div className="card summary-card">
        <p className="eyebrow">Summary for {service.name}</p>
        <dl className="summary">
          <div>
            <dt>What's going on</dt>
            <dd className="quote">{result.summary}</dd>
          </div>
          <div>
            <dt>Main need</dt>
            <dd>{service.need}</dd>
          </div>
          {also.length > 0 && (
            <div>
              <dt>Also mentioned</dt>
              <dd>{also.join(', ')}</dd>
            </div>
          )}
          <div>
            <dt>Priority</dt>
            <dd>{result.urgency}</dd>
          </div>
        </dl>
      </div>

      <fieldset className="card consent-card">
        <legend className="h4">Share this summary with the support team?</legend>
        <label className={`option ${consent === 'yes' ? 'is-selected' : ''}`}>
          <input type="radio" name="consent" checked={consent === 'yes'} onChange={() => setConsent('yes')} />
          <span className="radio" aria-hidden="true" />
          <span>
            <strong>Yes, share my summary</strong>
            <span className="muted small">The team will read it before they contact you.</span>
          </span>
        </label>
        <label className={`option ${consent === 'no' ? 'is-selected' : ''}`}>
          <input type="radio" name="consent" checked={consent === 'no'} onChange={() => setConsent('no')} />
          <span className="radio" aria-hidden="true" />
          <span>
            <strong>No, I'll explain it myself</strong>
            <span className="muted small">Only your request and chosen service are sent.</span>
          </span>
        </label>
        <p className="privacy left"><Lock /> Nothing is shared until you choose.</p>
      </fieldset>

      <div className="actions">
        <button className="btn btn-primary btn-block-sm" disabled={!consent} onClick={onContinue}>
          Continue <Arrow />
        </button>
      </div>
    </section>
  )
}
