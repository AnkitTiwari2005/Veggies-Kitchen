/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Native Bottom Navigation Bar
   Always visible on mobile across primary screens.
   ═══════════════════════════════════════════════════════════════════ */
import { useCart } from './CartContext'
import { lightTap } from './services/haptics'

export default function BottomNavBar({ currentPage }) {
  const { cartCount } = useCart()

  const handleNav = (targetHash) => {
    lightTap()
    window.location.hash = targetHash
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={`nav-tab-btn ${currentPage === 'home' ? 'active' : ''}`}
        onClick={() => handleNav('#/')}
      >
        <span className="material-symbols-outlined">home</span>
        <span className="nav-tab-label">Home</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${currentPage === 'menu' ? 'active' : ''}`}
        onClick={() => handleNav('#/menu')}
      >
        <span className="material-symbols-outlined">restaurant_menu</span>
        <span className="nav-tab-label">Menu</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${currentPage === 'checkout' ? 'active' : ''}`}
        onClick={() => handleNav('#/checkout')}
        style={{ position: 'relative' }}
      >
        <span className="material-symbols-outlined">shopping_bag</span>
        <span className="nav-tab-label">Cart</span>
        {cartCount > 0 && (
          <span className="mobile-cart-badge">{cartCount}</span>
        )}
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${currentPage === 'orders' ? 'active' : ''}`}
        onClick={() => handleNav('#/orders')}
      >
        <span className="material-symbols-outlined">receipt_long</span>
        <span className="nav-tab-label">Orders</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${currentPage === 'account' ? 'active' : ''}`}
        onClick={() => handleNav('#/account')}
      >
        <span className="material-symbols-outlined">person</span>
        <span className="nav-tab-label">Account</span>
      </button>
    </nav>
  )
}
