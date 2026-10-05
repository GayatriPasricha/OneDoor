import UrgencyBadge from '../components/UrgencyBadge'
import StatusTracker from '../components/StatusTracker'
import { Arrow } from '../components/Icons'

const fmt = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Requests({ requests, onStart, headingRef }) {
  return (
    <section className="screen requests wide">
      <div className="screen-head">
        <h1 ref={headingRef} tabIndex={-1}>My requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="card empty">
          <p className="h4">No requests yet</p>
          <p className="muted">When you reach out for support, you'll be able to follow it here.</p>
          <button className="btn btn-primary" onClick={onStart}>Find my support <Arrow /></button>
        </div>
      ) : (
        <div className="request-list">
          {[...requests].reverse().map((r) => (
            <article key={r.id} className="card request-item">
              <div className="request-head">
                <div>
                  <p className="req-id">#{r.id} · {fmt(r.createdAt)}</p>
                  <h2 className="h4">{r.service}</h2>
                </div>
                <UrgencyBadge level={r.urgency} suffix="priority" />
              </div>
              <StatusTracker reached={2} />
              <p className="muted small">{r.consent === 'yes' ? 'Summary shared with your permission.' : 'Summary not shared.'}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
