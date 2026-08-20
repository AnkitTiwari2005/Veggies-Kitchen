import { useState, useEffect, useRef } from 'react'
import { useLocation } from './LocationContext'

export default function NativeAppBar({ onSearchClick }) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  let locationCtx = null
  try { locationCtx = useLocation() } catch(e) {}
  const locationName = locationCtx?.address?.split(',')[0] || 'Lajpat Nagar'

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 100) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`native-app-bar${hidden ? ' hidden' : ''}`}>
      <div className="native-app-bar__left">
        <a href="#/" className="native-app-bar__brand" style={{ textDecoration: 'none' }}>
          Veggies Kitchen
        </a>
        <div className="native-app-bar__location">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#4CAF50' }}>location_on</span>
          <span>{locationName}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 10, color: '#888' }}>expand_more</span>
        </div>
      </div>

      <div className="native-app-bar__actions">
        <button className="native-app-bar__icon-btn" onClick={onSearchClick} aria-label="Search">
          <span className="material-symbols-outlined">search</span>
        </button>
        <button className="native-app-bar__icon-btn" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  )
}
