export default function UrgencyBadge({ level, suffix = '' }) {
  return (
    <span className={`badge badge-${level.toLowerCase()}`}>
      <span className="dot" aria-hidden="true" />
      {suffix ? `${level} ${suffix}` : `Urgency: ${level}`}
    </span>
  )
}
