import { useEffect, useState } from 'react'

// Floating button that doubles as a reading-progress indicator: a ring fills
// as the page scrolls, and clicking scrolls smoothly back to the top.
export default function BackToTop() {
  const [pct, setPct] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const p = max > 0 ? (el.scrollTop / max) * 100 : 0
      setPct(p)
      setVisible(el.scrollTop > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={`Back to top (${Math.round(pct)}% read)`}
      className={`fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full glass flex items-center justify-center text-content shadow-xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <svg className="absolute inset-0 -rotate-90" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(var(--line) / 0.15)" strokeWidth="2.5" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke="url(#btt-grad)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient id="btt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="relative">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z" />
      </svg>
    </button>
  )
}
