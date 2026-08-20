/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Dish Detail Bottom Sheet
   Slides up from bottom when user taps a menu card.
   Shows: full image, name, description, customization, Add to Cart CTA
   ═══════════════════════════════════════════════════════════════════ */
import './DishDetailSheet.css'
import { useState, useEffect, useRef } from 'react'
import { useCart } from './CartContext'
import { lightTap, mediumTap } from './services/haptics'

// SVG: veg indicator dot
const VegDotSVG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
  </svg>
)

// SVG: star / chef's pick
const StarSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB300">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

// SVG: close / X
const CloseSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// SVG: fire / spicy
const SpiceSVG = ({ level }) => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path
      d="M12 2C8 6 6 10 8 14c1 2 3 3 4 5 1-2 3-3 4-5 2-4 0-8-4-12z"
      fill={level > 0 ? '#FF5722' : '#333'}
    />
  </svg>
)

const SPICE_LEVELS = [
  { value: 'mild',   label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'spicy',  label: 'Spicy' },
]

export default function DishDetailSheet({ item, onClose }) {
  const { addToCart, cartItems, updateQuantity } = useCart()
  const [spiceLevel, setSpiceLevel] = useState('medium')
  const [cookingNote, setCookingNote] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [visible, setVisible] = useState(false)
  const sheetRef = useRef(null)
  const startYRef = useRef(null)

  const cartItem = cartItems?.find(i => i.name === item?.name)
  const inCart = cartItem ? cartItem.quantity : 0

  // Animate in on mount
  useEffect(() => {
    if (item) {
      requestAnimationFrame(() => setVisible(true))
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [item])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  // Swipe-down to close
  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY
  }
  const handleTouchMove = (e) => {
    const diff = e.touches[0].clientY - startYRef.current
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${Math.min(diff, 200)}px)`
    }
  }
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientY - startYRef.current
    if (diff > 80) {
      handleClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = ''
    }
  }

  const handleAddToCart = () => {
    mediumTap()
    const enrichedItem = {
      ...item,
      spiceLevel,
      cookingNote: cookingNote.trim() || undefined,
    }
    for (let i = 0; i < quantity; i++) addToCart(enrichedItem)
    handleClose()
  }

  const handleQtyChange = (delta) => {
    lightTap()
    setQuantity(q => Math.max(1, Math.min(10, q + delta)))
  }

  if (!item) return null

  return (
    <div
      className={`dish-sheet-backdrop${visible ? ' visible' : ''}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={sheetRef}
        className={`dish-sheet${visible ? ' visible' : ''}`}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="dish-sheet__handle" />

        {/* Close button */}
        <button className="dish-sheet__close" onClick={handleClose} aria-label="Close">
          <CloseSVG />
        </button>

        {/* Food image */}
        <div className="dish-sheet__img-wrap">
          {item.image ? (
            <img src={item.image} alt={item.name} className="dish-sheet__img" />
          ) : (
            <div className="dish-sheet__img-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="#333"/>
              </svg>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="dish-sheet__content">
          {/* Header row */}
          <div className="dish-sheet__header">
            <VegDotSVG />
            <h2 className="dish-sheet__name">{item.name}</h2>
          </div>

          {/* Badges */}
          <div className="dish-sheet__badges">
            {item.featured && (
              <span className="dish-sheet__badge dish-sheet__badge--star">
                <StarSVG /> Chef's Pick
              </span>
            )}
          </div>

          {/* Price */}
          <div className="dish-sheet__price">₹{item.price}</div>

          {/* Description */}
          {item.description && (
            <p className="dish-sheet__desc">{item.description}</p>
          )}

          {/* Divider */}
          <div className="dish-sheet__divider" />

          {/* Spice level */}
          <div className="dish-sheet__section">
            <div className="dish-sheet__section-title">
              <SpiceSVG level={1} />
              Spice Level
            </div>
            <div className="dish-sheet__spice-row">
              {SPICE_LEVELS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`dish-sheet__spice-btn${spiceLevel === value ? ' active' : ''}`}
                  onClick={() => { lightTap(); setSpiceLevel(value) }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking note */}
          <div className="dish-sheet__section">
            <div className="dish-sheet__section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#888" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Cooking Instructions (optional)
            </div>
            <textarea
              className="dish-sheet__note"
              placeholder="e.g., less oil, extra crispy, no onion…"
              value={cookingNote}
              onChange={e => setCookingNote(e.target.value)}
              rows={2}
              maxLength={120}
            />
          </div>

          {/* Bottom spacer for CTA */}
          <div style={{ height: 100 }} />
        </div>

        {/* Sticky CTA footer */}
        <div className="dish-sheet__footer">
          {/* Quantity stepper */}
          <div className="dish-sheet__qty">
            <button
              type="button"
              className="dish-sheet__qty-btn"
              onClick={() => handleQtyChange(-1)}
              aria-label="Decrease"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <span className="dish-sheet__qty-count">{quantity}</span>
            <button
              type="button"
              className="dish-sheet__qty-btn"
              onClick={() => handleQtyChange(1)}
              aria-label="Increase"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Add to cart */}
          <button
            type="button"
            className="dish-sheet__add-btn"
            onClick={handleAddToCart}
          >
            Add {quantity > 1 ? `${quantity} items` : 'to Cart'} · ₹{item.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}
