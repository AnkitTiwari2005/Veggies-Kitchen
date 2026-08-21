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

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function validatePhone(phone) {
  if (!phone) return false
  const digits = String(phone).replace(/\D/g, '')
  return digits.length === 10
}

function validatePincode(pin) {
  if (!pin) return false
  return /^\d{6}$/.test(String(pin))
}

/* â”€â”€ Checkout Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function CheckoutPage() {
  const {
    cartItems, updateQuantity, removeFromCart, addToCart, clearCart,
    cartSubtotal, taxes, delivery, cartTotal, cartCount
  } = useCart()

  const { menuSections, menuBackdrop } = useAdmin()

  const { address, locationStatus, detectLocation } = useLocation()

  /* â”€â”€ Delivery form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Delivery time â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const [deliveryTime, setDeliveryTime] = useState('standard')

  /* â”€â”€ Recipient mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Recommendations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const recommendations = useMemo(
    () => getRecommendations(cartItems, menuSections, 4),
    [cartItems, menuSections]
  )

  /* â”€â”€ Saved address book â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Place order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    // Auth gate â€” redirect to login if not signed in
    if (!user) {
      sessionStorage.setItem('postLoginRedirect', '#/checkout')
      window.location.hash = '#/login'
      return
    }
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
        
        let message = `Hi Veggie Kitchen! ðŸ¥¦\n\nI have just placed a new order from your website! Here are my details:\n\n`
        message += `*Order ID:* #${orderData._id.slice(-6).toUpperCase()}\n`
        message += `*Name:* ${activeForm.name}\n`
        if (activeForm.email) message += `*Email:* ${activeForm.email}\n`
        message += `*Contact Number:* ${activeForm.phone}\n`
        message += `*Delivery Address:* ${activeForm.street}, ${activeForm.city}, ${activeForm.state} - ${activeForm.pincode}\n`
        message += `*Delivery Time:* ${deliveryTime}\n\n`
        
        message += `*Order Summary:*\n`
        cartItems.forEach(item => {
          message += `${item.quantity}x ${item.name} - â‚¹${item.price}\n`
        })
        
        message += `\n*Total Amount:* â‚¹${cartTotal.toFixed(2)}\n\n`
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

  /* â”€â”€ New Swiggy-style states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const [showAddrSheet, setShowAddrSheet] = useState(false)
  const [addrSheetMode, setAddrSheetMode] = useState('list') // 'list' | 'form'
  const selectedAddr = selectedAddrIdx !== null ? savedAddresses[selectedAddrIdx] : null
  const [detailTab, setDetailTab] = useState('delivery')
  const [tip, setTip] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showCouponSheet, setShowCouponSheet] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState('')

  const DELIVERY_TIERS = [
    { id:'express', label:'Express', time:'20-25 min', fee:49 },
    { id:'standard', label:'Standard', time:'30-45 min', fee:29 },
    { id:'eco', label:'Eco Saver', time:'45-60 min', fee:0 },
  ]

  const handleSaveNewAddress = () => {
    const newAddr = {
      label: newAddrLabel,
      name: deliveryForm.name,
      phone: deliveryForm.phone,
      street: deliveryForm.street,
      city: deliveryForm.city,
      state: deliveryForm.state,
      pincode: deliveryForm.pincode,
    }
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) return
    const updated = [...savedAddresses, newAddr]
    setSavedAddresses(updated)
    persistAddresses(updated)
    setSelectedAddrIdx(updated.length - 1)
    setAddrSheetMode('list')
    setShowAddrSheet(false)
  }

  const handleDeleteAddr = (idx) => {
    const updated = savedAddresses.filter((_, i) => i !== idx)
    setSavedAddresses(updated)
    persistAddresses(updated)
    if (selectedAddrIdx === idx) setSelectedAddrIdx(updated.length > 0 ? 0 : null)
    else if (selectedAddrIdx > idx) setSelectedAddrIdx(selectedAddrIdx - 1)
  }

  const grandTotal = cartTotal + tip

  /* â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="checkout-page" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* â”€â”€ Fixed Video Background (web only) â”€â”€ */}
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

      {/* â”€â”€ Checkout Header â”€â”€ */}
      <div className="co-checkout-header">
        <button className="co-back-btn" onClick={() => window.history.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="co-header-title">Checkout</h1>
      </div>

      <div className="co-grid">
        <div className="co-left">

          {/* â•â•â• 15a. ADDRESS SUMMARY â•â•â• */}
          <div className="co-addr-summary" onClick={() => { setAddrSheetMode('list'); setShowAddrSheet(true) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="co-addr-summary__content">
              <span className="co-addr-summary__label">{selectedAddr?.label || 'Add delivery address'}</span>
              <span className="co-addr-summary__text">
                {selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city} â€” ${selectedAddr.pincode}` : 'Tap to select or add an address'}
              </span>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
              <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* â•â•â• CART ITEMS â•â•â• */}
          <div className="co-panel co-cart-panel">
            <h2 className="co-panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V11h2c1.1 0 2-.9 2-2V2M7 2v7" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 2v5a3 3 0 003 3h0V2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 10v12" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Your Order
              {cartCount > 0 && <span className="co-item-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>}
            </h2>

            {cartItems.length === 0 ? (
              <div className="co-empty-cart">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#555" strokeWidth="1.5"/><path d="M3 6h18" stroke="#555" strokeWidth="1.5"/><path d="M16 10a4 4 0 01-8 0" stroke="#555" strokeWidth="1.5"/></svg>
                <p>Your cart is empty.</p>
                <a href="#/menu" className="btn-primary glow-button" style={{ marginTop: 16 }}>Explore Menu</a>
              </div>
            ) : (
              <div className="co-items-list">
                {cartItems.map((item, idx) => (
                  <div key={item.name} className={`co-compact-row${idx > 0 ? ' co-compact-row--border' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 18 18" style={{flexShrink:0}}>
                      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
                      <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
                    </svg>
                    <div className="co-compact-name-col">
                      <span className="co-compact-name">{item.name}</span>
                      {item.spiceLevel && item.spiceLevel !== 'Medium' && <span className="co-compact-custom">{item.spiceLevel}</span>}
                      {item.cookingNote && <span className="co-compact-custom">{item.cookingNote}</span>}
                    </div>
                    <div className="co-compact-stepper">
                      <button type="button" className="co-compact-btn" onClick={() => updateQuantity(item.name, -1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </button>
                      <span className="co-compact-qty">{item.quantity}</span>
                      <button type="button" className="co-compact-btn" onClick={() => updateQuantity(item.name, 1)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                    <span className="co-compact-price">â‚¹{(item.price * item.quantity).toFixed(0)}</span>
                    <button type="button" className="co-compact-remove" onClick={() => removeFromCart(item.name)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* â•â•â• 15g. RECOMMENDATIONS WITH STEPPERS â•â•â• */}
          {cartItems.length > 0 && recommendations.length > 0 && (
            <div className="co-recommendations">
              <h3 className="co-rec-title">Complete Your Meal</h3>
              <div className="co-rec-grid">
                {recommendations.map((rec) => {
                  const recQty = cartItems.find(c => c.name === rec.name)?.quantity || 0
                  return (
                    <div key={rec.name} className="co-rec-card co-panel">
                      <div className="co-rec-img">
                        {rec.image ? (
                          <img src={rec.image} alt={rec.name} loading="lazy" />
                        ) : (
                          <span className="co-rec-emoji">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V11h2c1.1 0 2-.9 2-2V2" stroke="#555" strokeWidth="1.5"/></svg>
                          </span>
                        )}
                      </div>
                      <div className="co-rec-info">
                        <h4 className="co-rec-name">{rec.name}</h4>
                        <p className="co-rec-price">+â‚¹{rec.price}</p>
                      </div>
                      {recQty > 0 ? (
                        <div className="co-rec-stepper">
                          <button onClick={() => updateQuantity(rec.name, -1)}>âˆ’</button>
                          <span>{recQty}</span>
                          <button onClick={() => updateQuantity(rec.name, 1)}>+</button>
                        </div>
                      ) : (
                        <button className="co-rec-add-btn" onClick={() => addToCart(rec)} aria-label={`Add ${rec.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* â•â•â• 15c. DETAIL TABS (Delivery/Tip/Note) â•â•â• */}
          <div className="co-detail-tabs">
            <div className="co-tab-pills">
              {[{id:'delivery',label:'Delivery'},{id:'tip',label:'Tip'},{id:'instructions',label:'Note'}].map(t => (
                <button key={t.id} className={`co-tab-pill ${detailTab === t.id ? 'co-tab-pill--active' : ''}`} onClick={() => setDetailTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="co-tab-content">
              {/* 15b. DELIVERY TIERS */}
              {detailTab === 'delivery' && (
                <div className="co-delivery-tiers">
                  {DELIVERY_TIERS.map(tier => (
                    <label key={tier.id} className={`co-tier ${deliveryTime === tier.id ? 'co-tier--active' : ''}`}>
                      <input type="radio" name="deliveryTier" value={tier.id} checked={deliveryTime === tier.id} onChange={() => setDeliveryTime(tier.id)} />
                      <div className="co-tier__info">
                        <span className="co-tier__label">{tier.label}</span>
                        <span className="co-tier__time">{tier.time}</span>
                      </div>
                      <span className="co-tier__fee">{tier.fee === 0 ? 'FREE' : `â‚¹${tier.fee}`}</span>
                    </label>
                  ))}
                </div>
              )}
              {detailTab === 'tip' && (
                <div className="co-tip-row">
                  {[0, 20, 30, 50].map(t => (
                    <button key={t} className={`co-tip-btn ${tip === t ? 'co-tip-btn--active' : ''}`} onClick={() => setTip(t)}>
                      {t === 0 ? 'No Tip' : `â‚¹${t}`}
                    </button>
                  ))}
                </div>
              )}
              {detailTab === 'instructions' && (
                <textarea className="co-textarea" placeholder="Ring bell, leave at doorâ€¦" rows={3} style={{resize:'none'}}
                  value={deliveryForm.instructions} onChange={(e) => updateField('instructions', e.target.value)} />
              )}
            </div>
          </div>

          {/* â•â•â• 15f. COUPON ROW â•â•â• */}
          <div className="co-coupon-row" onClick={() => setShowCouponSheet(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2z" stroke="#4CAF50" strokeWidth="1.5"/>
              <path d="M7 5v14M17 5v14" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="2 2"/>
            </svg>
            <span>{couponApplied ? `Coupon: ${couponApplied}` : 'Apply Coupon'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:'auto'}}>
              <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* â•â•â• 15e. COLLAPSIBLE SUMMARY â•â•â• */}
          {showBreakdown && (
            <div className="co-panel co-summary-panel">
              <div className="co-summary-lines">
                <div className="co-summary-line"><span>Subtotal</span><span className="co-summary-value">â‚¹{cartSubtotal.toFixed(2)}</span></div>
                <div className="co-summary-line"><span>GST (5%)</span><span className="co-summary-value">â‚¹{taxes.toFixed(2)}</span></div>
                <div className="co-summary-line"><span>Delivery</span><span className="co-summary-value">â‚¹{delivery.toFixed(2)}</span></div>
                {tip > 0 && <div className="co-summary-line"><span>Tip</span><span className="co-summary-value">â‚¹{tip}</span></div>}
                {cartSubtotal < 300 && delivery > 0 && (
                  <div className="co-free-delivery-nudge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFB300"/></svg>
                    Add â‚¹{(300 - cartSubtotal).toFixed(0)} more for free delivery!
                  </div>
                )}
              </div>
              <div className="co-summary-total">
                <span>Grand Total</span>
                <span className="co-total-value">â‚¹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Spacer for sticky bottom bar */}
      <div style={{height: 80}} />

      {/* â•â•â• 15d. STICKY BOTTOM BAR â•â•â• */}
      <div className="co-sticky-bottom">
        <div className="co-sticky-bottom__left" onClick={() => setShowBreakdown(!showBreakdown)}>
          <span className="co-sticky-bottom__total">â‚¹{grandTotal.toFixed(0)}</span>
          <span className="co-sticky-bottom__detail">TOTAL {showBreakdown ? 'â–²' : 'â–¼'}</span>
        </div>
        <button className="co-sticky-bottom__cta" disabled={!isFormValid || isPlacing || !selectedAddr} onClick={handlePlaceOrder}>
          {isPlacing ? 'Placing...' : orderPlaced ? 'Order Placed!' : 'Place Order'}
        </button>
      </div>

      {/* â•â•â• 15a. ADDRESS SHEET OVERLAY â•â•â• */}
      {showAddrSheet && (
        <div className="co-addr-sheet-overlay">
          <div className="co-addr-sheet">
            <div className="co-addr-sheet__header">
              <button className="co-back-btn" onClick={() => { if (addrSheetMode === 'form') setAddrSheetMode('list'); else setShowAddrSheet(false) }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="co-addr-sheet__title">{addrSheetMode === 'form' ? 'Add New Address' : 'Select Address'}</span>
            </div>

            {addrSheetMode === 'list' ? (
              <>
                {savedAddresses.map((a, i) => (
                  <div key={i} className={`co-addr-sheet__item ${selectedAddrIdx === i ? 'co-addr-sheet__item--active' : ''}`}
                       onClick={() => { setSelectedAddrIdx(i); setShowAddrSheet(false) }}>
                    <div className={`co-addr-sheet__radio ${selectedAddrIdx === i ? 'co-addr-sheet__radio--active' : ''}`} />
                    <div style={{flex:1,minWidth:0}}>
                      <span className="co-addr-sheet__label">{a.label || `Address ${i+1}`}</span>
                      <span className="co-addr-sheet__text">{a.street}, {a.city} â€” {a.pincode}</span>
                    </div>
                    <button style={{background:'none',border:'none',padding:4,cursor:'pointer'}} onClick={(e) => { e.stopPropagation(); handleDeleteAddr(i) }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" stroke="#f44336" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                ))}
                <button className="co-addr-sheet__add-btn" onClick={() => { setAddrSheetMode('form'); setDeliveryForm(f => ({...f, street:'', city:'', state:'', pincode:''})) }}>
                  + Add New Address
                </button>
              </>
            ) : (
              /* â”€â”€ Address Form â”€â”€ */
              <div className="co-form" style={{marginTop:8}}>
                <div className="co-field">
                  <label className="co-field-label">Full Name <span className="co-required">*</span></label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="1.5"/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input className="co-input" type="text" placeholder="Full name" value={deliveryForm.name} onChange={(e) => updateField('name', e.target.value)} />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">Contact Number <span className="co-required">*</span></label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.66 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.3 1.53.52 2.35.66A2 2 0 0122 16.92z" stroke="#666" strokeWidth="1.5"/></svg>
                    <input className="co-input" type="tel" placeholder="10-digit mobile" maxLength={10} value={deliveryForm.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">House / Street / Area <span className="co-required">*</span></label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#666" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input className="co-input" type="text" placeholder="House no., Street, Area" value={deliveryForm.street} onChange={(e) => updateField('street', e.target.value)} />
                  </div>
                </div>
                <div className="co-field-row">
                  <div className="co-field co-field-half">
                    <label className="co-field-label">City <span className="co-required">*</span></label>
                    <input className="co-input co-input-plain" type="text" placeholder="City" value={deliveryForm.city} onChange={(e) => updateField('city', e.target.value)} />
                  </div>
                  <div className="co-field co-field-half">
                    <label className="co-field-label">PIN Code <span className="co-required">*</span></label>
                    <input className="co-input co-input-plain" type="text" placeholder="6-digit PIN" maxLength={6} value={deliveryForm.pincode} onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">Save as</label>
                  <select className="co-addr-label-select" value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)} style={{width:'100%',padding:'10px 12px'}}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <button className="co-addr-sheet__save-btn" onClick={handleSaveNewAddress}>
                  Save Address
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* â•â•â• 15f. COUPON SHEET â•â•â• */}
      {showCouponSheet && (
        <div className="co-sheet-overlay" onClick={() => setShowCouponSheet(false)}>
          <div className="co-sheet" onClick={e => e.stopPropagation()}>
            <h3>Apply Coupon</h3>
            <div className="co-coupon-input-row">
              <input className="co-input" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} />
              <button className="co-coupon-apply-btn" onClick={() => { setCouponApplied(couponCode); setShowCouponSheet(false) }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

