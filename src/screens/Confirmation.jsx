import UrgencyBadge from '../components/UrgencyBadge'
import StatusTracker from '../components/StatusTracker'
import { Check } from '../components/Icons'

export default function Confirmation({ request, onViewRequests, headingRef }) {
  const shared = request.consent === 'yes'

  return (
    <section className="screen confirm">
      <div className="success-check" aria-hidden="true"><Check size={36} /></div>
      <h1 ref={headingRef} tabIndex={-1}>You're all set.</h1>

      <div className="card confirm-card">
        <div className="confirm-meta">
          <p className="req-id">Request #{request.id}</p>
          <p className="h3">{request.service}</p>
          <UrgencyBadge level={request.urgency} suffix="priority" />
        </div>
        <hr />
        <StatusTracker reached={2} />
      </div>

      <div className="reassure">
        {shared ? (
          <>
            <p className="reassure-main">You don't need to repeat your story.</p>
            <p className="muted">Your summary was shared with the support team with your permission.</p>
          </>
        ) : (
          <>
            <p className="reassure-main">The team will be in touch.</p>
            <p className="muted">Your summary wasn't shared — you can explain things in your own words when they contact you.</p>
          </>
        )}
      </div>

      <button className="btn btn-link" onClick={onViewRequests}>View my requests</button>
    </section>
  )
}
