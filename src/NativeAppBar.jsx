/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Native App Bar (Swiggy-style 2-row)
   Row 1: Location pill + Notification bell
   Row 2: Full-width search bar (tappable → goes to SearchPage)
   ═══════════════════════════════════════════════════════════════════ */
import { useState, useEffect, useRef } from 'react'
import { useLocation } from './LocationContext'
import { lightTap } from './services/haptics'

// SVG Icons (no emoji, no Material Symbols dependency for app bar)
const LocationPinSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4CAF50"/>
    <circle cx="12" cy="9" r="2.5" fill="white"/>
  </svg>
)

const ChevronDownSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M7 10l5 5 5-5" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SearchSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2"/>
    <path d="M20 20l-3.5-3.5" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const BellSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#f0f0f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#f0f0f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function NativeAppBar({ onSearchClick }) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)
  const { address, setIsModalOpen } = useLocation()

  const locationCity = address?.city || 'Lajpat Nagar'
  const locationFull = address?.street
    ? address.street.length > 22 ? address.street.slice(0, 22) + '…' : address.street
    : (address?.city || 'Lajpat Nagar')

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      // Only hide after scrolling down 60px
      if (currentY > lastScrollY.current && currentY > 60) {
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
      {/* ── Row 1: Location + Bell ── */}
      <div className="nab-row1">
        <button
          type="button"
          className="nab-location-btn"
          onClick={handleLocationClick}
          aria-label="Change delivery location"
        >
          <div className="nab-location-label">Delivering to</div>
          <div className="nab-location-row">
            <LocationPinSVG />
            <span className="nab-location-name">{locationFull}</span>
            <ChevronDownSVG />
          </div>
        </button>

        <button
          type="button"
          className="nab-bell-btn"
          aria-label="Notifications"
        >
          <BellSVG />
        </button>
      </div>

      {/* ── Row 2: Search Bar ── */}
      <div
        className="nab-search"
        onClick={handleSearchTap}
        role="button"
        aria-label="Search for dishes"
        tabIndex={0}
      >
        <SearchSVG />
        <span className="nab-search-placeholder">Search for dishes, cuisines…</span>
      </div>
    </header>
  )
}
