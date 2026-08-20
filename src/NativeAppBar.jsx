import { useState, useEffect, useRef } from 'react'
import { LocationIcon, ChevronDownIcon, BellIcon } from './icons'
import { SearchIcon } from './icons'

export default function NativeAppBar({ onSearchClick, onNotificationClick }) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true) // scrolling down → hide
      } else {
        setHidden(false) // scrolling up → show
      }
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`native-app-bar${hidden ? ' hidden' : ''}`}>
      <div className="native-app-bar__left">
        <span className="native-app-bar__brand">Veggies Kitchen</span>
        <div className="native-app-bar__location">
          <LocationIcon size={14} />
          <span>Lajpat Nagar</span>
          <ChevronDownIcon size={10} color="#888" />
        </div>
      </div>

      <div className="native-app-bar__actions">
        <button
          className="native-app-bar__icon-btn"
          onClick={onSearchClick}
          aria-label="Search"
        >
          <SearchIcon size={22} />
        </button>
        <button
          className="native-app-bar__icon-btn"
          onClick={onNotificationClick}
          aria-label="Notifications"
        >
          <BellIcon size={22} />
        </button>
      </div>
    </header>
  )
}
