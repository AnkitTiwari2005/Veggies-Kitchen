import { useState, useMemo, useEffect, useCallback } from 'react'
import { useCart } from './CartContext'
import { useLocation } from './LocationContext'
import { SECTION_EMOJI } from './menuData'
import { getRecommendations } from './recommendationEngine'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import { isNative } from './hooks/useCapacitor'
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

  /* ── Saved address book ──────────────── */
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null) // null = new address
  const [saveAddress, setSaveAddress] = useState(false)
  const [newAddrLabel, setNewAddrLabel] = useState('Home')

  // Load saved addresses on mount
  useEffect(() => {
    const load = async () => {
      try {
        if (isNative) {
          const { Preferences } = await import('@capacitor/preferences')
          const { value } = await Preferences.get({ key: 'vk_saved_addresses' })
          if (value) setSavedAddresses(JSON.parse(value))
        } else {
          const raw = localStorage.getItem('vk_saved_addresses')
          if (raw) setSavedAddresses(JSON.parse(raw))
        }
      } catch {}
    }
    load()
  }, [])

  // When user picks a saved address, fill in the form
  useEffect(() => {
    if (selectedAddrIdx !== null && savedAddresses[selectedAddrIdx]) {
      const a = savedAddresses[selectedAddrIdx]
      setDeliveryForm(prev => ({
        ...prev,
        street: a.street || '',
        city: a.city || '',
        state: a.state || '',
        pincode: a.pincode || '',
        phone: a.phone || prev.phone,
        name: a.name || prev.name,
      }))
    }
  }, [selectedAddrIdx])

  const persistAddresses = useCallback(async (list) => {
    try {
      const json = JSON.stringify(list)
      if (isNative) {
        const { Preferences } = await import('@capacitor/preferences')
        await Preferences.set({ key: 'vk_saved_addresses', value: json })
      } else {
        localStorage.setItem('vk_saved_addresses', json)
      }
    } catch {}
  }, [])

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
        isGuest: !orderForOther,
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

        // Save address if requested
        if (saveAddress && !orderForOther && selectedAddrIdx === null) {
          const newAddr = {
            label: newAddrLabel,
            name: deliveryForm.name,
            phone: deliveryForm.phone,
            street: deliveryForm.street,
            city: deliveryForm.city,
            state: deliveryForm.state,
            pincode: deliveryForm.pincode,
          }
          const updated = [...savedAddresses, newAddr]
          setSavedAddresses(updated)
          await persistAddresses(updated)
        }
        
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
      {/* ── Fixed Video Background (web only) ── */}
      {!isNative && (
        <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <BackgroundMedia media={menuBackdrop} /> 
          <div className="page-overlay" style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(20, 19, 19, 0.85)', 
            backdropFilter: 'blur(12px)' 
          }} />
        </div>
      )}

      {/* ── Page Title ── */}
      {/* Checkout header — replaces app bar which is hidden on this page */}
      <div className="co-checkout-header">
        <button className="co-back-btn" onClick={() => window.history.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="co-header-title">Checkout</h1>
      </div>

      <div className="co-grid">
        {/* ═══ LEFT COLUMN: Cart + Recommendations ═══ */}
        <div className="co-left">

          {/* ── Cart Items — compact Zomato-style ── */}
          <div className="co-panel co-cart-panel">
            <h2 className="co-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V11h2c1.1 0 2-.9 2-2V2M7 2v7" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 2v5a3 3 0 003 3h0V2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 10v12" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Your Order
              {cartCount > 0 && <span className="co-item-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>}
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
                  <div key={item.name} className={`co-compact-row${idx > 0 ? ' co-compact-row--border' : ''}`}>
                    {/* Veg dot */}
                    <svg width="14" height="14" viewBox="0 0 18 18" style={{flexShrink:0}}>
                      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
                      <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
                    </svg>

                    {/* Name + customization note */}
                    <div className="co-compact-name-col">
                      <span className="co-compact-name">{item.name}</span>
                      {item.spiceLevel && item.spiceLevel !== 'Medium' && (
                        <span className="co-compact-custom">{item.spiceLevel}</span>
                      )}
                      {item.cookingNote && (
                        <span className="co-compact-custom">{item.cookingNote}</span>
                      )}
                    </div>

                    {/* Inline stepper */}
                    <div className="co-compact-stepper">
                      <button
                        type="button"
                        className="co-compact-btn"
                        onClick={() => updateQuantity(item.name, -1)}
                        aria-label="Decrease"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <span className="co-compact-qty">{item.quantity}</span>
                      <button
                        type="button"
                        className="co-compact-btn"
                        onClick={() => updateQuantity(item.name, 1)}
                        aria-label="Increase"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* Price */}
                    <span className="co-compact-price">₹{(item.price * item.quantity).toFixed(0)}</span>

                    {/* Remove */}
                    <button
                      type="button"
                      className="co-compact-remove"
                      onClick={() => removeFromCart(item.name)}
                      aria-label="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4CAF50"/>
                </svg>
                Delivery Address
              </h2>

              {/* ── Saved address pills ── */}
              {!orderForOther && savedAddresses.length > 0 && (
                <div className="co-addr-pills">
                  {savedAddresses.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`co-addr-pill${selectedAddrIdx === i ? ' co-addr-pill--active' : ''}`}
                      onClick={() => setSelectedAddrIdx(selectedAddrIdx === i ? null : i)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={selectedAddrIdx === i ? 'white' : '#4CAF50'}/>
                      </svg>
                      {a.label || `Address ${i + 1}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`co-addr-pill${selectedAddrIdx === null ? ' co-addr-pill--active' : ''}`}
                    onClick={() => { setSelectedAddrIdx(null); setDeliveryForm(f => ({...f, street:'', city:'', state:'', pincode:''})) }}
                  >
                    + New Address
                  </button>
                </div>
              )}

              {/* Selected address summary */}
              {selectedAddrIdx !== null && savedAddresses[selectedAddrIdx] && (
                <div className="co-addr-selected">
                  <span className="co-addr-selected-text">
                    {savedAddresses[selectedAddrIdx].street}, {savedAddresses[selectedAddrIdx].city} — {savedAddresses[selectedAddrIdx].pincode}
                  </span>
                  <button type="button" className="co-addr-edit-btn" onClick={() => setSelectedAddrIdx(null)}>
                    Change
                  </button>
                </div>
              )}

              {/* COD badge */}
              <div className="co-cod-row">
                {/* banknote icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#4CAF50" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="#4CAF50" strokeWidth="1.5"/>
                  <path d="M6 9v.01M18 15v.01" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Cash on Delivery</span>
              </div>

              {/* Delivery time */}
              <div className="co-time-row">
                <button
                  className={`co-time-btn ${deliveryTime === 'now' ? 'co-time-active' : ''}`}
                  onClick={() => setDeliveryTime('now')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Now (30-45m)
                </button>
                <button
                  className={`co-time-btn ${deliveryTime === 'schedule' ? 'co-time-active' : ''}`}
                  onClick={() => setDeliveryTime('schedule')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Schedule
                </button>
              </div>

              {/* Order for other toggle */}
              <label className="co-toggle-row">
                <input type="checkbox" checked={orderForOther} onChange={(e) => setOrderForOther(e.target.checked)} />
                <span className="co-toggle-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 21c0-4 4-7 9-7s9 3 9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Order for someone else
                </span>
              </label>

              {/* Delivery form — shown when no saved address selected OR ordering for other */}
              {(selectedAddrIdx === null || orderForOther) && (
                <div className="co-form">
                  {/* Name */}
                  <div className="co-field">
                    <label className="co-field-label">{orderForOther ? 'Recipient Name' : 'Your Name'} <span className="co-required">*</span></label>
                    <div className="co-input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="1.5"/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <input className="co-input" type="text" placeholder="Full name"
                        value={orderForOther ? recipientForm.name : deliveryForm.name}
                        onChange={(e) => orderForOther ? updateRecipient('name', e.target.value) : updateField('name', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="co-field">
                    <label className="co-field-label">Email Address</label>
                    <div className="co-input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#666" strokeWidth="1.5"/><path d="M22 7l-10 7L2 7" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <input className="co-input" type="email" placeholder="For order confirmation"
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
                    <label className="co-field-label">{orderForOther ? 'Recipient Phone' : 'Contact Number'} <span className="co-required">*</span></label>
                    <div className="co-input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.66 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.3 1.53.52 2.35.66A2 2 0 0122 16.92z" stroke="#666" strokeWidth="1.5"/></svg>
                      <input className="co-input" type="tel" placeholder="10-digit mobile" maxLength={10}
                        value={orderForOther ? recipientForm.phone : deliveryForm.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          orderForOther ? updateRecipient('phone', val) : updateField('phone', val)
                        }}
                      />
                    </div>
                    {(orderForOther ? recipientForm.phone : deliveryForm.phone).length > 0 &&
                      !validatePhone(orderForOther ? recipientForm.phone : deliveryForm.phone) && (
                      <span className="co-field-error">Enter a valid 10-digit number</span>
                    )}
                  </div>

                  {/* Street */}
                  <div className="co-field">
                    <label className="co-field-label">House / Street / Area <span className="co-required">*</span></label>
                    <div className="co-input-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#666" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      <input className="co-input" type="text" placeholder="House no., Street, Area"
                        value={orderForOther ? recipientForm.street : deliveryForm.street}
                        onChange={(e) => orderForOther ? updateRecipient('street', e.target.value) : updateField('street', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* City + State + PIN in one row */}
                  <div className="co-field-row">
                    <div className="co-field co-field-half">
                      <label className="co-field-label">City <span className="co-required">*</span></label>
                      <input className="co-input co-input-plain" type="text" placeholder="City"
                        value={orderForOther ? recipientForm.city : deliveryForm.city}
                        onChange={(e) => orderForOther ? updateRecipient('city', e.target.value) : updateField('city', e.target.value)}
                      />
                    </div>
                    <div className="co-field co-field-half">
                      <label className="co-field-label">PIN Code <span className="co-required">*</span></label>
                      <input className="co-input co-input-plain" type="text" placeholder="6-digit PIN" maxLength={6}
                        value={orderForOther ? recipientForm.pincode : deliveryForm.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          orderForOther ? updateRecipient('pincode', val) : updateField('pincode', val)
                        }}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="co-field">
                    <label className="co-field-label">Delivery Note (optional)</label>
                    <textarea className="co-textarea" placeholder="Ring bell, leave at door…" rows={2} style={{resize:'none'}}
                      value={orderForOther ? recipientForm.instructions : deliveryForm.instructions}
                      onChange={(e) => orderForOther ? updateRecipient('instructions', e.target.value) : updateField('instructions', e.target.value)}
                    />
                  </div>

                  {/* Save address checkbox */}
                  {!orderForOther && (
                    <label className="co-save-addr-row">
                      <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                      <span className="co-toggle-label">Save this address</span>
                      {saveAddress && (
                        <select className="co-addr-label-select" value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)}>
                          <option>Home</option>
                          <option>Work</option>
                          <option>Other</option>
                        </select>
                      )}
                    </label>
                  )}

                  {/* Re-detect location */}
                  {!orderForOther && locationStatus !== 'detecting' && (
                    <button className="co-detect-btn" onClick={detectLocation}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" fill="#4CAF50"/>
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      Use my location
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Bill Summary ── */}
            <div className="co-panel co-summary-panel">
              <h2 className="co-panel-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M9 5H7a2 2 0 00-2 2v12l3-2 3 2 3-2 3 2V7a2 2 0 00-2-2h-2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#4CAF50" strokeWidth="1.5"/></svg>
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
                {cartSubtotal < 300 && delivery > 0 && (
                  <div className="co-free-delivery-nudge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFB300"/>
                    </svg>
                    Add ₹{(300 - cartSubtotal).toFixed(0)} more for free delivery!
                  </div>
                )}
              </div>
              <div className="co-summary-total">
                <span>Total</span>
                <span className="co-total-value">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="co-delivery-eta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="1.5"/>
                  <path d="M12 7v5l3 3" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Estimated delivery: {deliveryTime === 'now' ? '30-45 minutes' : 'Scheduled'}
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#4CAF50"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Order Placed!
                  </>
                ) : (
                  <>
                    Place Order
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </>
                )}
              </button>

              {!isFormValid && cartItems.length > 0 && (
                <p className="co-validation-hint">
                  {(() => {
                    const f = orderForOther ? recipientForm : deliveryForm;
                    const missing = [];
                    if (!f.name.trim()) missing.push('Name');
                    if (!validatePhone(f.phone)) missing.push('Phone');
                    if (!f.street.trim()) missing.push('Address');
                    if (!f.city.trim()) missing.push('City');
                    if (!f.pincode.trim() || !validatePincode(f.pincode)) missing.push('PIN');
                    return missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'Fill in delivery details';
                  })()}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
