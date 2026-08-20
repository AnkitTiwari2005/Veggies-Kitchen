import { useCart } from './CartContext'
import { CartIcon, ArrowRightIcon } from './icons'
import { mediumTap } from './services/haptics'

export default function FloatingCartBar() {
  const { cartCount, cartTotal } = useCart()

  if (cartCount <= 0) return null

  const handleClick = () => {
    mediumTap()
    window.location.hash = '#/checkout'
  }

  return (
    <div className="floating-cart-bar" onClick={handleClick}>
      <div className="floating-cart-bar__info">
        <CartIcon size={20} color="white" />
        <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
        <span className="floating-cart-bar__count">· ₹{cartTotal}</span>
      </div>
      <div className="floating-cart-bar__action">
        <span>View Cart</span>
        <ArrowRightIcon size={16} color="white" />
      </div>
    </div>
  )
}
