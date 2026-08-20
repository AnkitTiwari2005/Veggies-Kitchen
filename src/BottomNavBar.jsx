/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — 3-Tab Bottom Navigation
   Tabs: Home | Menu | Profile
   Cart → via FloatingCartBar only
   Orders → inside Profile/Account page
   ═══════════════════════════════════════════════════════════════════ */
import { lightTap } from './services/haptics'

// Inline SVG icons — no emojis, no Material Symbols dependency
const HomeSVG = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
      stroke={active ? '#4CAF50' : '#666'}
      strokeWidth="1.8"
      fill={active ? 'rgba(76,175,80,0.12)' : 'none'}
      strokeLinejoin="round"
    />
    <path
      d="M9 21V12h6v9"
      stroke={active ? '#4CAF50' : '#666'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const MenuSVG = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="2" rx="1" fill={active ? '#4CAF50' : '#666'}/>
    <rect x="3" y="11" width="14" height="2" rx="1" fill={active ? '#4CAF50' : '#666'}/>
    <rect x="3" y="17" width="11" height="2" rx="1" fill={active ? '#4CAF50' : '#666'}/>
    {active && <circle cx="20" cy="17" r="3" fill="#4CAF50" opacity="0.7"/>}
  </svg>
)

const ProfileSVG = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle
      cx="12" cy="8" r="4"
      stroke={active ? '#4CAF50' : '#666'}
      strokeWidth="1.8"
      fill={active ? 'rgba(76,175,80,0.12)' : 'none'}
    />
    <path
      d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
      stroke={active ? '#4CAF50' : '#666'}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

const TABS = [
  { id: 'home',    hash: '#/',        label: 'Home',   Icon: HomeSVG },
  { id: 'menu',    hash: '#/menu',    label: 'Menu',   Icon: MenuSVG },
  { id: 'account', hash: '#/account', label: 'Profile', Icon: ProfileSVG },
]

export default function BottomNavBar({ currentPage }) {
  const handleNav = (hash) => {
    lightTap()
    window.location.hash = hash
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {TABS.map(({ id, hash, label, Icon }) => {
        const active = currentPage === id || (id === 'home' && currentPage === '')
        return (
          <button
            key={id}
            type="button"
            className={`nav-tab-btn${active ? ' active' : ''}`}
            onClick={() => handleNav(hash)}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
          >
            {active && <span className="nav-tab-pill" aria-hidden="true" />}
            <Icon active={active} />
            <span className="nav-tab-label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
