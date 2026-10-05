import { Door } from './Icons'

export default function Header({ onHome, onRequests, count }) {
  return (
    <header className="header">
      <div className="header-inner">
        <button className="logo" onClick={onHome} aria-label="OneDoor home">
          <span className="logo-mark"><Door /></span>
          OneDoor
        </button>
        <button className="nav-link" onClick={onRequests}>
          My requests
          {count > 0 && <span className="count" aria-label={`${count} requests`}>{count}</span>}
        </button>
      </div>
    </header>
  )
}
