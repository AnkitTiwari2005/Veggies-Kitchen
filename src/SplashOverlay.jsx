/* ═══════════════════════════════════════════════════════════════
   SPLASH OVERLAY — Animated JS splash that bridges native splash
   and app load. Shows VK logo + leaf animation for ~1.5s.
   ═══════════════════════════════════════════════════════════════ */
import './SplashOverlay.css'
import { useState, useEffect } from 'react'
import { isNative } from './hooks/useCapacitor'

export default function SplashOverlay({ onDone }) {
  const [phase, setPhase] = useState('in') // 'in' | 'hold' | 'out'

  useEffect(() => {
    if (!isNative) {
      onDone()
      return
    }

    // Hide the NATIVE Capacitor splash screen immediately so our JS splash shows
    import('@capacitor/splash-screen').then(({ SplashScreen }) => {
      SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
    })

    // in → hold → out
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 1400)
    const t3 = setTimeout(() => onDone(), 1700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  if (!isNative) return null

  return (
    <div className={`splash-overlay splash-overlay--${phase}`} aria-hidden="true">
      <div className="splash-logo">
        {/* Leaf SVG */}
        <svg
          className="splash-leaf"
          width="72" height="72" viewBox="0 0 72 72" fill="none"
        >
          <circle cx="36" cy="36" r="34" fill="rgba(76,175,80,0.12)" stroke="rgba(76,175,80,0.3)" strokeWidth="1.5"/>
          <path
            className="splash-leaf-path"
            d="M36 12C22 20 17 32 23 48C27 58 41 64 47 58C61 46 57 26 36 12Z"
            fill="#4CAF50"
          />
          <path
            d="M36 12 L40 54"
            stroke="#81C784" strokeWidth="2" strokeLinecap="round"
          />
          <path d="M26 36 Q36 30 46 37" stroke="#81C784" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M24 46 Q36 40 48 47" stroke="#81C784" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

        {/* Brand name */}
        <div className="splash-brand">
          <span className="splash-brand-main">Veggies</span>
          <span className="splash-brand-sub">Kitchen</span>
        </div>

        {/* Tagline */}
        <div className="splash-tagline">Fresh · Pure · Vegetarian</div>
      </div>

      {/* Loading dots */}
      <div className="splash-dots">
        <span className="splash-dot" style={{ animationDelay: '0ms' }} />
        <span className="splash-dot" style={{ animationDelay: '160ms' }} />
        <span className="splash-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}
