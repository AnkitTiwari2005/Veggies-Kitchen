import { useState, useMemo, useEffect } from 'react'
import { useCart } from './CartContext'
import { useLocation } from './LocationContext'
import { SECTION_EMOJI } from './menuData'
import { getRecommendations } from './recommendationEngine'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import { API_BASE } from './config'
import './CheckoutPage.css'

/* ── Helpers ──────────────────────────────── */
function validatePhone(phone) {
  if (!phone) return false
  const digits = String(phone).replace(/\D/g, '')
  return digits.length === 10
}

function validatePincode(pin) {
  if (!pin) return false
  return /^\d{6}$/.test(String(pin))
}

/* ── Checkout Page ────────────────────────── */
export default function CheckoutPage() {
  const {
    cartItems, updateQuantity, removeFromCart, addToCart, clearCart,
    cartSubtotal, taxes, delivery, cartTotal, cartCount
  } = useCart()

  const { menuSections, menuBackdrop } = useAdmin()

  const { address, locationStatus, detectLocation } = useLocation()

  /* ── Delivery form state ────────────── */
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    instructions: '',
  })

  const { user } = useAuth()

  // Sync location context and user profile into form when they become available
  // Sync user profile into form on mount if empty
  useEffect(() => {
    if (!deliveryForm.street && !deliveryForm.city && !deliveryForm.state) {
      if (user?.addresses?.length > 0) {
        const primary = user.addresses.find(a => a.isDefault) || user.addresses[0]
        setDeliveryForm(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: primary.phone || prev.phone,
          street: primary.street || '',
          city: primary.city || '',
          state: primary.state || '',
          pincode: primary.pincode || ''
        }))
      }
    }
  }, [user])

  // Sync auto-detected location into form when detection succeeds
  useEffect(() => {
    if (locationStatus === 'detected' && address && address.street) {
      setDeliveryForm(prev => ({
        ...prev,
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode
      }))
    }
  }, [locationStatus, address])

  const updateField = (field, value) => {
    setDeliveryForm(prev => ({ ...prev, [field]: value }))
  }

  /* ── Delivery time ──────────────────── */
  const [deliveryTime, setDeliveryTime] = useState('now')

  /* ── Recipient mode ─────────────────── */
  const [orderForOther, setOrderForOther] = useState(false)
  const [recipientForm, setRecipientForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    instructions: '',
  })

  const updateRecipient = (field, value) => {
    setRecipientForm(prev => ({ ...prev, [field]: value }))
  }

  /* ── Recommendations ────────────────── */
  const recommendations = useMemo(
    () => getRecommendations(cartItems, menuSections, 4),
    [cartItems, menuSections]
  )

  /* ── Validation ─────────────────────── */
  const activeForm = orderForOther ? recipientForm : deliveryForm
  const isFormValid = useMemo(() => {
    const f = activeForm
    if (!f.name.trim()) return false
    if (!f.email.trim() || !f.email.includes('@')) return false
    if (!validatePhone(f.phone)) return false
    if (!f.street.trim()) return false
    if (!f.city.trim()) return false
    if (!f.pincode.trim() || !validatePincode(f.pincode)) return false
    return cartItems.length > 0
  }, [activeForm, cartItems])

  /* ── Place order ────────────────────── */
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    if (!isFormValid) return
    setIsPlacing(true)
    
    try {
      const orderPayload = {
        isGuest: !orderForOther, // If orderForOther is false and we have no user context, we rely on the backend to set user if authenticated
        customerName: activeForm.name,
        customerEmail: activeForm.email,
        customerPhone: activeForm.phone,
        deliveryAddress: {
          street: activeForm.street,
          city: activeForm.city,
          state: activeForm.state,
          pincode: activeForm.pincode
        },
        items: cartItems,
        subtotal: cartSubtotal,
        taxes: taxes,
        deliveryFee: delivery,
        total: cartTotal,
        deliveryTime: deliveryTime,
        instructions: activeForm.instructions
      }

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      if (res.ok) {
        const orderData = await res.json()
        
        let message = `Hi Veggie Kitchen! 🥦\n\nI have just placed a new order from your website! Here are my details:\n\n`
        message += `*Order ID:* #${orderData._id.slice(-6).toUpperCase()}\n`
        message += `*Name:* ${activeForm.name}\n`
        if (activeForm.email) message += `*Email:* ${activeForm.email}\n`
        message += `*Contact Number:* ${activeForm.phone}\n`
        message += `*Delivery Address:* ${activeForm.street}, ${activeForm.city}, ${activeForm.state} - ${activeForm.pincode}\n`
        message += `*Delivery Time:* ${deliveryTime}\n\n`
        
        message += `*Order Summary:*\n`
        cartItems.forEach(item => {
          message += `${item.quantity}x ${item.name} - ₹${item.price}\n`
        })
        
        message += `\n*Total Amount:* ₹${cartTotal.toFixed(2)}\n\n`
        message += `Please confirm my order!`

        const whatsappUrl = `https://api.whatsapp.com/send/?phone=919811797407&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`
        
        setOrderPlaced(true)
        clearCart()
        window.location.href = whatsappUrl
      } else {
        alert("Failed to place order.")
      }
    } catch (err) {
      console.error(err)
      alert("Error connecting to server.")
    } finally {
      setIsPlacing(false)
    }
  }

  /* ── Render ─────────────────────────── */
  return (
    <div className="checkout-page" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* ── Fixed Video Background ── */}
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} /> 
        <div className="page-overlay" style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'rgba(20, 19, 19, 0.85)', 
          backdropFilter: 'blur(12px)' 
        }} />
      </div>
      {/* ── Page Title ── */}
      <div className="co-title-wrap">
        <h1 className="co-title text-headline-lg">Checkout</h1>
        <p className="co-subtitle text-body-lg">Review your cinematic dining experience.</p>
      </div>

      <div className="co-grid">
        {/* ═══ LEFT COLUMN: Cart + Recommendations ═══ */}
        <div className="co-left">

          {/* ── Cart Items ── */}
          <div className="co-panel co-cart-panel">
            <h2 className="co-panel-title">
              <span className="material-symbols-outlined co-icon-accent">restaurant</span>
              Your Selection
              {cartCount > 0 && <span className="co-item-count">{cartCount} items</span>}
            </h2>

            {cartItems.length === 0 ? (
              <div className="co-empty-cart">
                <span className="material-symbols-outlined" style={{ fontSize: 48 }}>shopping_cart</span>
                <p>Your cart is empty.</p>
                <a href="#/menu" className="btn-primary glow-button" style={{ marginTop: 16 }}>Explore Menu</a>
              </div>
            ) : (
              <div className="co-items-list">
                {cartItems.map((item, idx) => (
                  <div key={item.name} className={`co-cart-item ${idx > 0 ? 'co-cart-item-border' : ''}`}>
                    <div className="co-cart-item-img">
                      {item.image ? (
                        <img src={item.image} alt={item.name} loading="lazy" />
                      ) : (
                        <div className="co-cart-item-emoji">
                          {SECTION_EMOJI[item.sectionId] || '🍽️'}
                        </div>
                      )}
                    </div>
                    <div className="co-cart-item-info">
                      <h3 className="co-cart-item-name">{item.name}</h3>
                      {item.description && (
                        <p className="co-cart-item-desc">
                          {item.description.length > 60
                            ? item.description.substring(0, 60) + '…'
                            : item.description}
                        </p>
                      )}
                      <div className="co-cart-item-price">₹{item.price}</div>
                    </div>
                    <div className="co-cart-item-actions">
                      <div className="co-qty-controls">
                        <button className="co-qty-btn" onClick={() => updateQuantity(item.name, -1)} aria-label="Decrease quantity">
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="co-qty-value">{item.quantity}</span>
                        <button className="co-qty-btn co-qty-btn-add" onClick={() => updateQuantity(item.name, 1)} aria-label="Increase quantity">
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                      <button className="co-remove-btn" onClick={() => removeFromCart(item.name)} aria-label="Remove item">
                        <span className="material-symbols-outlined">delete_outline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recommendations ── */}
          {cartItems.length > 0 && recommendations.length > 0 && (
            <div className="co-recommendations">
              <h3 className="co-rec-title">Complete Your Meal</h3>
              <div className="co-rec-grid">
                {recommendations.map((rec) => (
                  <div key={rec.name} className="co-rec-card co-panel">
                    <div className="co-rec-img">
                      {rec.image ? (
                        <img src={rec.image} alt={rec.name} loading="lazy" />
                      ) : (
                        <span className="co-rec-emoji">{SECTION_EMOJI[rec.sectionId] || '🍽️'}</span>
                      )}
                    </div>
                    <div className="co-rec-info">
                      <h4 className="co-rec-name">{rec.name}</h4>
                      <p className="co-rec-price">+₹{rec.price}</p>
                    </div>
                    <button
                      className="co-rec-add-btn"
                      onClick={() => addToCart(rec)}
                      aria-label={`Add ${rec.name}`}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN: Delivery + Summary ═══ */}
        <div className="co-right">
          <div className="co-sticky">

            {/* ── Delivery Details ── */}
            <div className="co-panel co-delivery-panel">
              <h2 className="co-panel-title">
                <span className="material-symbols-outlined co-icon-accent">location_on</span>
                Delivery Details
                {locationStatus === 'detected' && (
                  <span className="co-location-badge co-badge-detected">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>my_location</span>
                    Auto-detected
                  </span>
                )}
                {locationStatus === 'detecting' && (
                  <span className="co-location-badge co-badge-detecting">Detecting…</span>
                )}
              </h2>

              <div className="payment-method-container" style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <h3 className="text-body-lg text-primary font-semibold">Payment Method</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">Cash on Delivery (COD) is selected by default.</p>
              </div>

              {/* Delivery time */}
              <div className="co-time-row">
                <button
                  className={`co-time-btn ${deliveryTime === 'now' ? 'co-time-active' : ''}`}
                  onClick={() => setDeliveryTime('now')}
                >
                  <span className="material-symbols-outlined">schedule</span> Now (30-45m)
                </button>
                <button
                  className={`co-time-btn ${deliveryTime === 'schedule' ? 'co-time-active' : ''}`}
                  onClick={() => setDeliveryTime('schedule')}
                >
                  <span className="material-symbols-outlined">calendar_month</span> Schedule
                </button>
              </div>

              {/* Order for toggle */}
              <label className="co-toggle-row">
                <input
                  type="checkbox"
                  checked={orderForOther}
                  onChange={(e) => setOrderForOther(e.target.checked)}
                />
                <span className="co-toggle-label">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                  Order for someone else
                </span>
              </label>

              {/* Delivery form */}
              <div className="co-form">
                {orderForOther && (
                  <div className="co-form-section">
                    <div className="co-form-section-label">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                      Delivery Recipient
                    </div>
                  </div>
                )}

                {/* Name */}
                <div className="co-field">
                  <label className="co-field-label">{orderForOther ? 'Recipient Name' : 'Your Name'}</label>
                  <div className="co-input-wrap">
                    <span className="material-symbols-outlined co-input-icon">person</span>
                    <input
                      className="co-input"
                      type="text"
                      placeholder="Full name"
                      value={orderForOther ? recipientForm.name : deliveryForm.name}
                      onChange={(e) => orderForOther ? updateRecipient('name', e.target.value) : updateField('name', e.target.value)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="co-field">
                  <label className="co-field-label">Email Address</label>
                  <div className="co-input-wrap">
                    <span className="material-symbols-outlined co-input-icon">mail</span>
                    <input
                      className="co-input"
                      type="email"
                      placeholder="For order confirmation"
                      value={orderForOther ? recipientForm.email : deliveryForm.email}
                      onChange={(e) => orderForOther ? updateRecipient('email', e.target.value) : updateField('email', e.target.value)}
                    />
                  </div>
                  {(orderForOther ? recipientForm.email : deliveryForm.email).length > 0 &&
                    !(orderForOther ? recipientForm.email : deliveryForm.email).includes('@') && (
                    <span className="co-field-error">Enter a valid email address</span>
                  )}
                </div>

                {/* Phone */}
                <div className="co-field">
                  <label className="co-field-label">{orderForOther ? 'Recipient Phone' : 'Contact Number'}</label>
                  <div className="co-input-wrap">
                    <span className="material-symbols-outlined co-input-icon">phone</span>
                    <input
                      className="co-input"
                      type="tel"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={orderForOther ? recipientForm.phone : deliveryForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        if (orderForOther) { updateRecipient('phone', val) } else { updateField('phone', val) }
                      }}
                    />
                  </div>
                  {(orderForOther ? recipientForm.phone : deliveryForm.phone).length > 0 &&
                    !validatePhone(orderForOther ? recipientForm.phone : deliveryForm.phone) && (
                    <span className="co-field-error">Enter a valid 10-digit number</span>
                  )}
                </div>

                {/* Street / Address */}
                <div className="co-field">
                  <label className="co-field-label">Address (House/Street/Area)</label>
                  <div className="co-input-wrap">
                    <span className="material-symbols-outlined co-input-icon">home</span>
                    <input
                      className="co-input"
                      type="text"
                      placeholder="House no., Street, Area"
                      value={orderForOther ? recipientForm.street : deliveryForm.street}
                      onChange={(e) => orderForOther ? updateRecipient('street', e.target.value) : updateField('street', e.target.value)}
                    />
                  </div>
                </div>

                {/* City + State row */}
                <div className="co-field-row">
                  <div className="co-field co-field-half">
                    <label className="co-field-label">City</label>
                    <input
                      className="co-input co-input-plain"
                      type="text"
                      placeholder="City"
                      value={orderForOther ? recipientForm.city : deliveryForm.city}
                      onChange={(e) => orderForOther ? updateRecipient('city', e.target.value) : updateField('city', e.target.value)}
                    />
                  </div>
                  <div className="co-field co-field-half">
                    <label className="co-field-label">State</label>
                    <input
                      className="co-input co-input-plain"
                      type="text"
                      placeholder="State"
                      value={orderForOther ? recipientForm.state : deliveryForm.state}
                      onChange={(e) => orderForOther ? updateRecipient('state', e.target.value) : updateField('state', e.target.value)}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="co-field">
                  <label className="co-field-label">PIN Code</label>
                  <input
                    className="co-input co-input-plain"
                    type="text"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={orderForOther ? recipientForm.pincode : deliveryForm.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (orderForOther) { updateRecipient('pincode', val) } else { updateField('pincode', val) }
                    }}
                  />
                  {(orderForOther ? recipientForm.pincode : deliveryForm.pincode).length > 0 &&
                    !validatePincode(orderForOther ? recipientForm.pincode : deliveryForm.pincode) && (
                    <span className="co-field-error">Enter a valid 6-digit PIN</span>
                  )}
                </div>

                {/* Delivery instructions */}
                <div className="co-field">
                  <label className="co-field-label">Delivery Instructions (optional)</label>
                  <textarea
                    className="co-textarea"
                    placeholder="Ring the bell, leave at door, etc."
                    rows={2}
                    value={orderForOther ? recipientForm.instructions : deliveryForm.instructions}
                    onChange={(e) => orderForOther ? updateRecipient('instructions', e.target.value) : updateField('instructions', e.target.value)}
                  />
                </div>

                {/* Re-detect location */}
                {!orderForOther && locationStatus !== 'detecting' && (
                  <button className="co-detect-btn" onClick={detectLocation}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>my_location</span>
                    Re-detect my location
                  </button>
                )}
              </div>
            </div>

            {/* ── Bill Summary ── */}
            <div className="co-panel co-summary-panel">
              <h2 className="co-panel-title">
                <span className="material-symbols-outlined co-icon-accent">receipt_long</span>
                Summary
              </h2>
              <div className="co-summary-lines">
                <div className="co-summary-line">
                  <span>Subtotal</span>
                  <span className="co-summary-value">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="co-summary-line">
                  <span>GST (5%)</span>
                  <span className="co-summary-value">₹{taxes.toFixed(2)}</span>
                </div>
                <div className="co-summary-line">
                  <span>Delivery</span>
                  <span className="co-summary-value">₹{delivery.toFixed(2)}</span>
                </div>
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span className="co-total-value">₹{cartTotal.toFixed(2)}</span>
              </div>

              <button
                className={`co-place-order-btn glow-button ${orderPlaced ? 'co-order-success' : ''}`}
                disabled={!isFormValid || isPlacing}
                onClick={handlePlaceOrder}
              >
                {isPlacing ? (
                  "Placing Order..."
                ) : orderPlaced ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Order Placed!
                  </>
                ) : (
                  <>
                    Place Order
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              {!isFormValid && cartItems.length > 0 && (
                <p className="co-validation-hint">Fill in all required delivery details to place your order.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
