const STAGES = ['Request received', 'Sent to support team', 'Response / appointment', 'Resolved']

export default function StatusTracker({ reached = 2 }) {
  return (
    <ol className="tracker">
      {STAGES.map((s, i) => (
        <li key={s} className={i < reached ? 'is-done' : ''}>
          <span className="tracker-dot" aria-hidden="true" />
          <span>{s}</span>
          <span className="sr-only">{i < reached ? ' (done)' : ' (pending)'}</span>
        </li>
      ))}
    </ol>
  )
}
