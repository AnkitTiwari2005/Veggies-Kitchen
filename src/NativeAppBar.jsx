import { useState, useEffect, useRef } from 'react'
import { useLocation } from './LocationContext'
import { lightTap } from './services/haptics'

export default function NativeAppBar({ onSearchClick }) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const { address, setIsModalOpen } = useLocation()
  
  const locationLabel = address?.street || address?.city || 'Lajpat Nagar 4'

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLocationClick = () => {
    lightTap()
    setIsModalOpen(true)
  }

  const handleSearchTap = () => {
    lightTap()
    if (onSearchClick) onSearchClick()
    else window.location.hash = '#/search'
  }

  return (
    <header className={`native-app-bar${hidden ? ' hidden' : ''}`}>
      <div className="native-app-bar__left">
        <a href="#/" className="native-app-bar__brand" style={{ textDecoration: 'none' }}>
          Veggies Kitchen
        </a>
        <button 
          type="button" 
          className="native-app-bar__location"
          onClick={handleLocationClick}
          aria-label="Change location"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#4CAF50' }}>location_on</span>
          <span className="location-text">{locationLabel}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#888' }}>expand_more</span>
        </button>
      </div>

      <div className="native-app-bar__actions">
        <button 
          className="native-app-bar__icon-btn" 
          onClick={handleSearchTap} 
          aria-label="Search dishes"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </div>
    </header>
  )
}
