import { useState, useMemo, useEffect, useCallback } from 'react'
import { useCart } from './CartContext'
import { useLocation } from './LocationContext'
import { MENU_SECTIONS } from './menuData'
import { getRecommendations } from './recommendationEngine'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import { isNative } from './hooks/useCapacitor'
import { API_BASE } from './config'
import { isServiceable } from './serviceArea'
import './CheckoutPage.css'

function validatePhone(phone) {
  if (!phone) return false
  return String(phone).replace(/\D/g, '').length === 10
}
function validatePincode(pin) {
  return pin && /^\d{6}$/.test(String(pin))
}

export default function CheckoutPage() {
  const { cartItems, updateQuantity, removeFromCart, addToCart, clearCart, cartSubtotal, taxes, delivery, cartTotal, cartCount } = useCart()
  const { menuSections } = useAdmin()
  const { address, locationStatus } = useLocation()
  const { user } = useAuth()
  const { menuBackdrop } = useAdmin()

  const [deliveryForm, setDeliveryForm] = useState({ name:'', email:'', phone:'', street:'', city:'', state:'', pincode:'', instructions:'' })
  const updateField = (field, value) => setDeliveryForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    if (!deliveryForm.street && !deliveryForm.city && user?.addresses?.length > 0) {
      const primary = user.addresses.find(a => a.isDefault) || user.addresses[0]
      setDeliveryForm(prev => ({ ...prev, name: user.name||'', email: user.email||'', phone: primary.phone||prev.phone, street: primary.street||'', city: primary.city||'', state: primary.state||'', pincode: primary.pincode||'' }))
    }
  }, [user])

  useEffect(() => {
    if (locationStatus === 'detected' && address && address.street) {
      setDeliveryForm(prev => ({ ...prev, street: address.street, city: address.city, state: address.state, pincode: address.pincode }))
    }
  }, [locationStatus, address])

  const [deliveryTime, setDeliveryTime] = useState('standard')
  const [orderForOther, setOrderForOther] = useState(false)
  const [recipientForm, setRecipientForm] = useState({ name:'', email:'', phone:'', street:'', city:'', state:'', pincode:'', instructions:'' })
  const updateRecipient = (field, value) => setRecipientForm(prev => ({ ...prev, [field]: value }))

  const allMenuSections = menuSections || MENU_SECTIONS
  const recommendations = useMemo(() => getRecommendations(cartItems, allMenuSections, 8), [cartItems, allMenuSections])

  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrIdx, setSelectedAddrIdx] = useState(null)
  const [newAddrLabel, setNewAddrLabel] = useState('Home')
  const [addrPincodeError, setAddrPincodeError] = useState('')

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

  useEffect(() => {
    if (selectedAddrIdx !== null && savedAddresses[selectedAddrIdx]) {
      const a = savedAddresses[selectedAddrIdx]
      setDeliveryForm(prev => ({ ...prev, street: a.street||'', city: a.city||'', state: a.state||'', pincode: a.pincode||'', phone: a.phone||prev.phone, name: a.name||prev.name }))
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

  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isPlacing, setIsPlacing] = useState(false)
  const [showAddrSheet, setShowAddrSheet] = useState(false)
  const [addrSheetMode, setAddrSheetMode] = useState('list')
  const [detailTab, setDetailTab] = useState('delivery')
  const [tip, setTip] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showCouponSheet, setShowCouponSheet] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState('')
  const [cookingRequests, setCookingRequests] = useState('')
  const [showCookingInput, setShowCookingInput] = useState(false)
  const [cutlery, setCutlery] = useState(false)
  const [recTab, setRecTab] = useState('popular')

  const selectedAddr = selectedAddrIdx !== null ? savedAddresses[selectedAddrIdx] : null
  const DELIVERY_TIERS = [
    { id:'express', label:'Express', time:'20-25 min', fee:49, desc:'Fastest delivery, directly to you!' },
    { id:'standard', label:'Standard', time:'30-45 min', fee:29, desc:'Minimal order grouping' },
    { id:'eco', label:'Eco Saver', time:'45-60 min', fee:0, desc:'Lesser CO2 by order grouping' },
  ]
  const tierFee = DELIVERY_TIERS.find(t => t.id === deliveryTime)?.fee ?? 29
  const couponDiscount = couponApplied ? Math.round(cartSubtotal * 0.1) : 0
  const grandTotal = cartSubtotal + taxes + tierFee + tip - couponDiscount

  const REC_TABS = [
    { id:'popular', label:'Popular' },
    { id:'beverages', label:'Beverages' },
    { id:'sides', label:'Sides' },
    { id:'breads', label:'Breads' },
  ]
  const SECTION_TAB_MAP = { beverages:['soups'], sides:['raita-sides'], breads:['breads','kulcha-naan','parathas'] }
  const recItems = useMemo(() => {
    if (recTab === 'popular') return recommendations.slice(0, 8)
    const sectionIds = SECTION_TAB_MAP[recTab] || []
    const all = (allMenuSections || []).filter(s => sectionIds.includes(s.id)).flatMap(s => s.items)
    const inCartNames = new Set(cartItems.map(i => i.name))
    return all.filter(i => !inCartNames.has(i.name)).slice(0, 8)
  }, [recTab, recommendations, allMenuSections, cartItems])

  const handleSaveNewAddress = () => {
    if (!deliveryForm.pincode || !validatePincode(deliveryForm.pincode)) { setAddrPincodeError('Please enter a valid 6-digit PIN code'); return }
    if (!isServiceable(deliveryForm.pincode)) { setAddrPincodeError('Sorry, we do not deliver to this area yet. We serve South Delhi only.'); return }
    setAddrPincodeError('')
    const newAddr = { label: newAddrLabel, name: deliveryForm.name, phone: deliveryForm.phone, street: deliveryForm.street, city: deliveryForm.city, state: deliveryForm.state, pincode: deliveryForm.pincode }
    if (!newAddr.street || !newAddr.city || !newAddr.pincode) return
    const updated = [...savedAddresses, newAddr]
    setSavedAddresses(updated); persistAddresses(updated)
    setSelectedAddrIdx(updated.length - 1); setAddrSheetMode('list'); setShowAddrSheet(false)
  }

  const handleDeleteAddr = (idx) => {
    const updated = savedAddresses.filter((_, i) => i !== idx)
    setSavedAddresses(updated); persistAddresses(updated)
    if (selectedAddrIdx === idx) setSelectedAddrIdx(updated.length > 0 ? 0 : null)
    else if (selectedAddrIdx > idx) setSelectedAddrIdx(selectedAddrIdx - 1)
  }

  const handlePlaceOrder = async () => {
    if (!user) { sessionStorage.setItem('postLoginRedirect', '#/checkout'); window.location.hash = '#/login'; return }
    if (!isFormValid) return
    setIsPlacing(true)
    try {
      const orderPayload = { isGuest: !orderForOther, customerName: activeForm.name, customerEmail: activeForm.email, customerPhone: activeForm.phone, deliveryAddress: { street: activeForm.street, city: activeForm.city, state: activeForm.state, pincode: activeForm.pincode }, items: cartItems, subtotal: cartSubtotal, taxes, deliveryFee: tierFee, total: grandTotal, deliveryTime, instructions: activeForm.instructions, tip }
      const res = await fetch(API_BASE + '/api/orders', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify(orderPayload) })
      if (res.ok) {
        const orderData = await res.json()
        let msg = 'Hi Veggies Kitchen!\n\nNew order:\n\n'
        msg += '*Order ID:* #' + orderData._id.slice(-6).toUpperCase() + '\n'
        msg += '*Name:* ' + activeForm.name + '\n*Contact:* ' + activeForm.phone + '\n'
        msg += '*Address:* ' + activeForm.street + ', ' + activeForm.city + ' - ' + activeForm.pincode + '\n\n*Items:*\n'
        cartItems.forEach(item => { msg += item.quantity + 'x ' + item.name + ' - Rs.' + item.price + '\n' })
        msg += '\n*Total: Rs.' + grandTotal.toFixed(2) + '*\n\nPlease confirm!'
        const waUrl = 'https://api.whatsapp.com/send/?phone=919811797407&text=' + encodeURIComponent(msg) + '&type=phone_number&app_absent=0'
        setOrderPlaced(true); clearCart(); window.location.href = waUrl
      } else { alert('Failed to place order.') }
    } catch (err) { console.error(err); alert('Error connecting to server.') } finally { setIsPlacing(false) }
  }
  return (
    <div className="checkout-page" style={{position:'relative'}}>
      {!isNative && (
        <div className="page-bg" style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:-1}}>
          <BackgroundMedia media={menuBackdrop} />
          <div className="page-overlay" style={{position:'absolute',inset:0,background:'rgba(20,19,19,0.85)',backdropFilter:'blur(12px)'}} />
        </div>
      )}

      <div className="co-checkout-header">
        <button className="co-back-btn" onClick={() => window.history.back()} aria-label="Go back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="co-header-title">Checkout</h1>
      </div>

      <div className="co-grid"><div className="co-left">

        {/* ADDRESS SUMMARY */}
        <div className="co-addr-summary" onClick={() => { setAddrSheetMode('list'); setShowAddrSheet(true) }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M9 21V12h6v9" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="co-addr-summary__content">
            <span className="co-addr-summary__label">{selectedAddr?.label || 'Add delivery address'}</span>
            <span className="co-addr-summary__text">{selectedAddr ? selectedAddr.street + ', ' + selectedAddr.city + ' - ' + selectedAddr.pincode : 'Tap to select or add an address'}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
            <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* YOUR ORDER */}
        <div className="co-panel co-cart-panel">
          <h2 className="co-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
              <path d="M3 2v7c0 1.1.9 2 2 2h2v11h2V11h2c1.1 0 2-.9 2-2V2M7 2v7" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 2v5a3 3 0 003 3V2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 10v12" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Your Order
            {cartCount > 0 && <span className="co-item-count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>}
          </h2>

          {cartItems.length === 0 ? (
            <div className="co-empty-cart">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#555" strokeWidth="1.5"/><path d="M3 6h18" stroke="#555" strokeWidth="1.5"/><path d="M16 10a4 4 0 01-8 0" stroke="#555" strokeWidth="1.5"/></svg>
              <p>Your cart is empty.</p>
              <a href="#/menu" className="btn-primary glow-button" style={{marginTop:16}}>Explore Menu</a>
            </div>
          ) : (
            <div className="co-items-list">
              {cartItems.map((item, idx) => (
                <div key={item.name}>
                  <div className={'co-compact-row' + (idx > 0 ? ' co-compact-row--border' : '')}>
                    <svg width="14" height="14" viewBox="0 0 18 18" style={{flexShrink:0}}>
                      <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
                      <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
                    </svg>
                    <div className="co-compact-name-col">
                      <span className="co-compact-name">{item.name}</span>
                      {item.customizable && <span className="co-customize-link">Customize <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{verticalAlign:'middle'}}><path d="M6 9l6 6 6-6" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/></svg></span>}
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
                    <span className="co-compact-price">Rs.{(item.price * item.quantity).toFixed(0)}</span>
                    <button type="button" className="co-compact-remove" onClick={() => removeFromCart(item.name)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              <div className="co-utility-row">
                <button className="co-util-btn" onClick={() => window.location.hash = '#/menu'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Add Items
                </button>
                <button className="co-util-btn" onClick={() => setShowCookingInput(v => !v)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Cooking requests
                </button>
                <label className="co-util-btn co-cutlery-toggle">
                  <input type="checkbox" checked={cutlery} onChange={e => setCutlery(e.target.checked)} style={{display:'none'}}/>
                  <span className={'co-cutlery-box' + (cutlery ? ' checked' : '')}/>
                  Cutlery
                </label>
              </div>
              {showCookingInput && <textarea className="co-textarea" placeholder="e.g. Less spicy, extra gravy..." value={cookingRequests} onChange={e => setCookingRequests(e.target.value)} rows={2} style={{marginTop:8}}/>}
            </div>
          )}
        </div>

        {/* COMPLETE YOUR MEAL */}
        {cartItems.length > 0 && (
          <div className="co-panel co-rec-panel">
            <p className="co-section-label">COMPLETE YOUR MEAL</p>
            <div className="co-rec-tabs">
              {REC_TABS.map(t => <button key={t.id} className={'co-rec-tab' + (recTab===t.id?' active':'')} onClick={() => setRecTab(t.id)}>{t.label}</button>)}
            </div>
            <div className="co-rec-scroll">
              {recItems.length === 0
                ? <p style={{color:'#666',fontSize:13,padding:'12px 0'}}>No items in this category</p>
                : recItems.map(rec => {
                    const rq = cartItems.find(i => i.name === rec.name)?.quantity || 0
                    return (
                      <div key={rec.name} className="co-rec-card-h">
                        <div className="co-rec-img-wrap">
                          {rec.image ? <img src={rec.image} alt={rec.name} className="co-rec-img-h" loading="lazy"/> : <div className="co-rec-emoji-h">{rec.emoji || String.fromCodePoint(0x1F37D)}</div>}
                          {rq > 0
                            ? <div className="co-rec-stepper-overlay"><button onClick={() => updateQuantity(rec.name,-1)}>-</button><span>{rq}</span><button onClick={() => addToCart(rec)}>+</button></div>
                            : <button className="co-rec-add-circle" onClick={() => addToCart(rec)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg></button>
                          }
                        </div>
                        <div className="co-rec-info-h">
                          <div className="co-rec-veg-row">
                            <svg width="10" height="10" viewBox="0 0 18 18"><rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/><circle cx="9" cy="9" r="4" fill="#4CAF50"/></svg>
                            <span className="co-rec-name-h">{rec.name.length > 14 ? rec.name.slice(0,13)+'...' : rec.name}</span>
                          </div>
                          <span className="co-rec-price-h">Rs.{rec.price}</span>
                        </div>
                      </div>
                    )
                  })
              }
            </div>
          </div>
        )}

        {/* SAVINGS CORNER */}
        <div className="co-savings-corner" onClick={() => setShowCouponSheet(true)}>
          <p className="co-section-label">SAVINGS CORNER</p>
          <div className="co-coupon-row-new">
            <div className="co-coupon-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <span className="co-coupon-label">{couponApplied ? 'Coupon: ' + couponApplied : 'Apply Coupon'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:'auto'}}><path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* DELIVERY / TIP / INSTRUCTIONS TABS */}
        <div className="co-detail-tabs">
          <div className="co-tab-pills">
            {[['delivery','Delivery Type'],['tip','Tip'],['instructions','Instructions']].map(([id,label]) => (
              <button key={id} className={'co-tab-pill' + (detailTab===id?' co-tab-pill--active':'')} onClick={() => setDetailTab(id)}>{label}</button>
            ))}
          </div>
          <div className="co-tab-content">
            {detailTab === 'delivery' && (
              <div className="co-delivery-tiers">
                {DELIVERY_TIERS.map(tier => (
                  <label key={tier.id} className={'co-tier' + (deliveryTime===tier.id?' co-tier--active':'')}>
                    <input type="radio" name="deliveryTier" value={tier.id} checked={deliveryTime===tier.id} onChange={() => setDeliveryTime(tier.id)} style={{display:'none'}}/>
                    <div className={'co-tier-radio' + (deliveryTime===tier.id?' active':'')}/>
                    <div className="co-tier__info">
                      <span className={'co-tier__label' + (deliveryTime===tier.id?' active':'')}>{tier.label}</span>
                      <span className="co-tier__time-desc">{tier.desc}</span>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="co-tier__time">{tier.time}</div>
                      <div className="co-tier__fee">{tier.fee===0 ? 'Free' : 'Rs.'+tier.fee}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {detailTab === 'tip' && (
              <div className="co-tip-row">
                {[0,20,30,50].map(t => <button key={t} className={'co-tip-btn' + (tip===t?' co-tip-btn--active':'')} onClick={() => setTip(t)}>{t===0 ? 'No Tip' : 'Rs.'+t}</button>)}
              </div>
            )}
            {detailTab === 'instructions' && (
              <textarea className="co-textarea" placeholder="Ring bell, leave at door..." value={activeForm.instructions} onChange={e => updateField('instructions', e.target.value)} rows={3}/>
            )}
          </div>
        </div>

        {/* TO PAY */}
        <div className="co-to-pay-panel co-panel">
          <div className="co-to-pay-row" onClick={() => setShowBreakdown(v => !v)}>
            <div className="co-to-pay-left">
              <div className="co-to-pay-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 12h6M9 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="co-to-pay-label">
                  To Pay
                  {couponDiscount > 0 && <span className="co-to-pay-original"> Rs.{(grandTotal + couponDiscount).toFixed(0)}</span>}
                  <span className="co-to-pay-amount"> Rs.{grandTotal.toFixed(0)}</span>
                </div>
                {couponDiscount > 0 && <div className="co-to-pay-savings">Rs.{couponDiscount} saved on the total!</div>}
              </div>
            </div>
            <svg className={'co-to-pay-chevron' + (showBreakdown?' open':'')} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {showBreakdown && (
            <div className="co-summary-lines">
              <div className="co-summary-line"><span>Subtotal</span><span>Rs.{cartSubtotal.toFixed(0)}</span></div>
              <div className="co-summary-line"><span>GST (5%)</span><span>Rs.{taxes.toFixed(0)}</span></div>
              <div className="co-summary-line"><span>Delivery</span><span>{tierFee===0 ? 'Free' : 'Rs.'+tierFee}</span></div>
              {tip > 0 && <div className="co-summary-line"><span>Tip</span><span>Rs.{tip}</span></div>}
              {couponDiscount > 0 && <div className="co-summary-line" style={{color:'#4CAF50'}}><span>{'Coupon (' + couponApplied + ')'}</span><span>{'-Rs.' + couponDiscount}</span></div>}
              <div className="co-summary-line co-summary-total-line"><span>Grand Total</span><span>Rs.{grandTotal.toFixed(0)}</span></div>
            </div>
          )}
        </div>

        <div style={{height:24}}/>
      </div></div>

      {/* STICKY BOTTOM BAR */}
      <div className="co-sticky-bottom">
        <div className="co-sticky-bottom__payment">
          <svg width="20" height="14" viewBox="0 0 32 22" fill="none"><rect x="0.5" y="0.5" width="31" height="21" rx="3.5" fill="#1a1a1a" stroke="#555"/><rect y="5" width="32" height="5" fill="#555"/><rect x="4" y="14" width="8" height="3" rx="1" fill="#888"/></svg>
          <div>
            <div className="co-sticky-pay-label">PAY USING</div>
            <div className="co-sticky-pay-method">Cash on Delivery</div>
          </div>
        </div>
        <button className="co-sticky-bottom__cta" disabled={!isFormValid || isPlacing || !selectedAddr} onClick={handlePlaceOrder}>
          {isPlacing ? 'Placing...' : orderPlaced ? 'Order Placed!' : 'Place Order Rs.' + grandTotal.toFixed(0)}
        </button>
      </div>

      {/* ADDRESS SHEET */}
      {showAddrSheet && (
        <div className="co-addr-sheet-overlay" onClick={() => setShowAddrSheet(false)}>
          <div className="co-addr-sheet" onClick={e => e.stopPropagation()}>
            <div className="co-addr-sheet__header">
              <button className="co-addr-sheet__close" onClick={() => setShowAddrSheet(false)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round"/></svg></button>
              <span className="co-addr-sheet__title">Delivery Address</span>
            </div>
            {addrSheetMode === 'list' ? (
              <>
                {savedAddresses.map((addr, idx) => (
                  <div key={idx} className={'co-addr-sheet__item' + (selectedAddrIdx===idx?' co-addr-sheet__item--active':'')} onClick={() => { setSelectedAddrIdx(idx); setShowAddrSheet(false) }}>
                    <div className={'co-addr-sheet__radio' + (selectedAddrIdx===idx?' co-addr-sheet__radio--active':'')}/>
                    <div><span className="co-addr-sheet__label">{addr.label}</span><span className="co-addr-sheet__text">{addr.street}, {addr.city} - {addr.pincode}</span></div>
                    <button className="co-addr-sheet__delete" onClick={e => { e.stopPropagation(); handleDeleteAddr(idx) }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg></button>
                  </div>
                ))}
                <button className="co-addr-sheet__add-btn" onClick={() => setAddrSheetMode('form')}>+ Add New Address</button>
              </>
            ) : (
              <div>
                <p style={{color:'#888',fontSize:13,marginBottom:12}}>Enter your delivery address</p>
                {[{field:'name',label:'Full Name',placeholder:'Your name'},{field:'phone',label:'Phone',placeholder:'10-digit number'},{field:'street',label:'Street / Building',placeholder:'Flat, Building, Street'},{field:'city',label:'City',placeholder:'City'},{field:'state',label:'State',placeholder:'State'},{field:'pincode',label:'PIN Code',placeholder:'6-digit PIN'}].map(({field,label,placeholder}) => (
                  <div className="co-field" key={field}>
                    <label className="co-field-label">{label}</label>
                    <input className="co-input" placeholder={placeholder} value={deliveryForm[field]} onChange={e => updateField(field, e.target.value)}/>
                  </div>
                ))}
                {addrPincodeError && <p style={{color:'#ef5350',fontSize:12,marginTop:4}}>{addrPincodeError}</p>}
                <div className="co-field">
                  <label className="co-field-label">Save as</label>
                  <select className="co-addr-label-select" value={newAddrLabel} onChange={e => setNewAddrLabel(e.target.value)} style={{width:'100%',padding:'10px 12px'}}>
                    <option>Home</option><option>Work</option><option>Other</option>
                  </select>
                </div>
                <button className="co-addr-sheet__save-btn" onClick={handleSaveNewAddress}>Save Address</button>
                <button className="co-addr-sheet__add-btn" style={{marginTop:8}} onClick={() => setAddrSheetMode('list')}>Back</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COUPON SHEET */}
      {showCouponSheet && (
        <div className="co-sheet-overlay" onClick={() => setShowCouponSheet(false)}>
          <div className="co-sheet" onClick={e => e.stopPropagation()}>
            <div className="co-sheet__header">
              <h3 className="co-sheet__title">Apply Coupon</h3>
              <button className="co-sheet__close" onClick={() => setShowCouponSheet(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#f0f0f0" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
            <p style={{color:'#888',fontSize:13,marginBottom:16}}>Enter a coupon code to get a discount.</p>
            <div className="co-coupon-input-row">
              <input className="co-input" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} style={{flex:1}}/>
              <button className="co-coupon-apply-btn" onClick={() => { if(couponCode.trim()) { setCouponApplied(couponCode.trim()); setShowCouponSheet(false) } }}>Apply</button>
            </div>
            {couponApplied && <button style={{marginTop:12,background:'transparent',border:'none',color:'#ef5350',fontSize:13,cursor:'pointer'}} onClick={() => { setCouponApplied(''); setCouponCode('') }}>Remove coupon</button>}
          </div>
        </div>
      )}
    </div>
  )
}