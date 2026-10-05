const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const Check = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)

export const Arrow = () => <span className="arrow" aria-hidden="true">→</span>

export const Lock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...base}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
)

export const Door = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...base} strokeWidth="2.2"><path d="M7 21V4.5A1.5 1.5 0 0 1 8.5 3h7A1.5 1.5 0 0 1 17 4.5V21M4 21h16" /><circle cx="14" cy="12.5" r=".6" fill="currentColor" /></svg>
)

export const Heart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" {...base}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
)

export const Phone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...base}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
)

export const Back = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...base}><path d="M15 6l-6 6 6 6" /></svg>
)
