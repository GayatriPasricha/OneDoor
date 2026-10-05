import { useState } from 'react'
import { Phone } from '../components/Icons'

export default function Crisis({ headingRef }) {
  const [connecting, setConnecting] = useState(false)

  return (
    <section className="screen crisis">
      <div className="card crisis-card">
        <p className="crisis-label"><span className="dot" aria-hidden="true" /> Immediate support</p>
        <h1 ref={headingRef} tabIndex={-1} className="h2">
          It looks like you may need urgent support.
        </h1>
        <p className="lead">We're connecting you with a human support person now.</p>

        {connecting ? (
          <div className="connecting" role="status">
            <span className="spinner spinner-red" aria-hidden="true" />
            <div>
              <strong>Connecting you now…</strong>
              <p className="muted small">A support person will be with you in a moment. Please stay on this page.</p>
            </div>
          </div>
        ) : (
          <button className="btn btn-danger btn-block" onClick={() => setConnecting(true)}>
            <Phone /> Get immediate help
          </button>
        )}

        <p className="crisis-note">You don't need to wait for normal routing.</p>
      </div>
      <p className="muted small center">If you're in immediate danger, call your local emergency number.</p>
    </section>
  )
}
