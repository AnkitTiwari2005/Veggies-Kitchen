import re

jsx_path = r'c:\Users\ankit\OneDrive\Desktop\Veggies Kitchen\src\CheckoutPage.jsx'
css_path = r'c:\Users\ankit\OneDrive\Desktop\Veggies Kitchen\src\CheckoutPage.css'

with open(jsx_path, 'r', encoding='utf-8') as f:
    jsx = f.read()

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. State Additions
jsx = jsx.replace(
    "const [deliveryTime, setDeliveryTime] = useState('now')",
    """const [deliveryTime, setDeliveryTime] = useState('standard')
  const [showAddrSheet, setShowAddrSheet] = useState(false)
  const [addrSheetMode, setAddrSheetMode] = useState('list')
  const [detailTab, setDetailTab] = useState('delivery')
  const [tip, setTip] = useState(0)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showCouponSheet, setShowCouponSheet] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState('')"""
)

jsx = jsx.replace(
    "const [newAddrLabel, setNewAddrLabel] = useState('Home')",
    """const [newAddrLabel, setNewAddrLabel] = useState('Home')
  const selectedAddr = selectedAddrIdx !== null ? savedAddresses[selectedAddrIdx] : null"""
)

# 2. Recommendations Stepper
rec_orig = """{recommendations.map((rec) => (
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
                ))}"""

rec_new = """{recommendations.map((rec) => {
                  const recQty = cartItems.find(c => c.name === rec.name)?.quantity || 0;
                  return (
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
                    {recQty > 0 ? (
                      <div className="co-rec-stepper">
                        <button onClick={() => updateQuantity(rec.name, -1)}>−</button>
                        <span>{recQty}</span>
                        <button onClick={() => updateQuantity(rec.name, 1)}>+</button>
                      </div>
                    ) : (
                      <button
                        className="co-rec-add-btn"
                        onClick={() => addToCart(rec)}
                        aria-label={`Add ${rec.name}`}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                )})}"""
jsx = jsx.replace(rec_orig, rec_new)

# 3. Validation fix (since email is hidden in the new simple form, let's just make it pass)
val_orig = "if (!f.email.trim() || !f.email.includes('@')) return false"
val_new = "// if (!f.email.trim() || !f.email.includes('@')) return false"
jsx = jsx.replace(val_orig, val_new)

# Update the payload tip logic
tip_orig = "total: cartTotal,"
tip_new = "total: cartTotal + tip,"
jsx = jsx.replace(tip_orig, tip_new)

# 4. Delivery Panel Replace
del_panel_regex = re.compile(r'{/\* ── Delivery Details ── \*/}.*?{/\* ── Bill Summary ── \*/}', re.DOTALL)

del_panel_new = """{/* ── Delivery Details ── */}
            <div className="co-panel co-delivery-panel" style={{ padding: 0, background: 'transparent', border: 'none' }}>
              <div className="co-addr-summary" onClick={() => setShowAddrSheet(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 21V12h6v9" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="co-addr-summary__content">
                  <span className="co-addr-summary__label">{selectedAddr?.label || 'Add delivery address'}</span>
                  <span className="co-addr-summary__text">
                    {selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city} — ${selectedAddr.pincode}` : 'Tap to select or add an address'}
                  </span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                  <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="co-detail-tabs" style={{ marginTop: '16px' }}>
                <div className="co-tab-pills">
                  {['delivery','tip','instructions'].map(t => (
                    <button key={t} className={`co-tab-pill ${detailTab === t ? 'co-tab-pill--active' : ''}`} onClick={() => setDetailTab(t)}>
                      {t === 'delivery' ? 'Delivery' : t === 'tip' ? 'Tip' : 'Note'}
                    </button>
                  ))}
                </div>
                <div className="co-tab-content">
                  {detailTab === 'delivery' && (
                    <div className="co-delivery-tiers">
                      {[{ id:'express', label:'Express', time:'20-25 min', fee:49 },
                        { id:'standard', label:'Standard', time:'30-45 min', fee:29 },
                        { id:'eco', label:'Eco Saver', time:'45-60 min', fee:0 }].map(tier => (
                        <label key={tier.id} className={`co-tier ${deliveryTime === tier.id ? 'co-tier--active' : ''}`}>
                          <input type="radio" name="deliveryTier" value={tier.id} checked={deliveryTime === tier.id} onChange={() => setDeliveryTime(tier.id)} />
                          <div className="co-tier__info">
                            <span className="co-tier__label">{tier.label}</span>
                            <span className="co-tier__time">{tier.time}</span>
                          </div>
                          <span className="co-tier__fee">{tier.fee === 0 ? 'FREE' : `₹${tier.fee}`}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {detailTab === 'tip' && (
                    <div className="co-tip-row">
                      {[0, 20, 30, 50].map(t => (
                        <button key={t} className={`co-tip-btn ${tip === t ? 'co-tip-btn--active' : ''}`} onClick={() => setTip(t)}>
                          {t === 0 ? 'No Tip' : `₹${t}`}
                        </button>
                      ))}
                    </div>
                  )}
                  {detailTab === 'instructions' && (
                    <textarea className="co-textarea" placeholder="Ring bell, leave at door…" rows={3} style={{resize:'none'}} value={deliveryForm.instructions} onChange={(e) => updateField('instructions', e.target.value)} />
                  )}
                </div>
              </div>
            </div>

            {/* ── Coupon Row ── */}
            <div className="co-coupon-row" onClick={() => setShowCouponSheet(true)} style={{ marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 5H3a2 2 0 00-2 2v10a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2z" stroke="#4CAF50" strokeWidth="1.5"/>
                <path d="M7 5v14M17 5v14" stroke="#4CAF50" strokeWidth="1.5" strokeDasharray="2 2"/>
              </svg>
              <span>{couponApplied ? `Coupon Applied: ${couponApplied}` : 'Apply Coupon'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:'auto'}}>
                <path d="M9 18l6-6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* ── Bill Summary ── */}
"""
jsx = del_panel_regex.sub(del_panel_new, jsx)

# 5. Bill Summary Changes
bill_summary_orig = """{/* ── Bill Summary ── */}
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
            </div>"""

bill_summary_new = """{/* ── Bill Summary ── */}
            <div className="co-panel co-summary-panel">
              <h2 className="co-panel-title" onClick={() => setShowBreakdown(!showBreakdown)} style={{ cursor: 'pointer', marginBottom: showBreakdown ? '20px' : '0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M9 5H7a2 2 0 00-2 2v12l3-2 3 2 3-2 3 2V7a2 2 0 00-2-2h-2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="#4CAF50" strokeWidth="1.5"/></svg>
                Bill Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:'auto', transform: showBreakdown ? 'rotate(180deg)' : 'none'}}>
                  <path d="M18 9l-6 6-6-6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </h2>
              
              {showBreakdown && (
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
                    <span>Delivery Fee</span>
                    <span className="co-summary-value">
                      {deliveryTime === 'express' ? '₹49' : deliveryTime === 'standard' ? '₹29' : 'FREE'}
                    </span>
                  </div>
                  {tip > 0 && (
                    <div className="co-summary-line">
                      <span>Delivery Tip</span>
                      <span className="co-summary-value">₹{tip}</span>
                    </div>
                  )}
                  {couponApplied && (
                    <div className="co-summary-line" style={{ color: '#4CAF50' }}>
                      <span>Coupon Discount</span>
                      <span className="co-summary-value">-₹0</span>
                    </div>
                  )}
                </div>
              )}
            </div>"""

jsx = jsx.replace(bill_summary_orig, bill_summary_new)

# 6. Bottom Overlays
overlays = """
      </div>

      <div className="co-sticky-bottom">
        <div className="co-sticky-bottom__left" onClick={() => setShowBreakdown(!showBreakdown)}>
          <span className="co-sticky-bottom__total">₹{(cartTotal + tip).toFixed(0)}</span>
          <span className="co-sticky-bottom__detail">TOTAL {showBreakdown ? '▲' : '▼'}</span>
        </div>
        <button className="co-sticky-bottom__cta" disabled={!isFormValid || isPlacing || !selectedAddr} onClick={handlePlaceOrder}>
          {isPlacing ? 'Placing...' : 'Place Order'}
        </button>
      </div>

      {/* Address Sheet */}
      {showAddrSheet && (
        <div className="co-addr-sheet-overlay" onClick={() => setShowAddrSheet(false)}>
          <div className="co-addr-sheet" onClick={e => e.stopPropagation()}>
            <div className="co-addr-sheet__header">
              <h3 className="co-addr-sheet__title">Select Address</h3>
            </div>
            
            {addrSheetMode === 'list' ? (
              <>
                {savedAddresses.map((a, i) => (
                  <div key={i} className={`co-addr-sheet__item ${selectedAddrIdx === i ? 'co-addr-sheet__item--active' : ''}`} onClick={() => { setSelectedAddrIdx(i); setShowAddrSheet(false); }}>
                    <div className={`co-addr-sheet__radio ${selectedAddrIdx === i ? 'co-addr-sheet__radio--active' : ''}`} />
                    <div style={{ flex: 1 }}>
                      <div className="co-addr-sheet__label">{a.label || 'Home'}</div>
                      <div className="co-addr-sheet__text">{a.street}, {a.city}</div>
                    </div>
                  </div>
                ))}
                <button className="co-addr-sheet__add-btn" onClick={() => setAddrSheetMode('form')}>
                  + Add new address
                </button>
              </>
            ) : (
              <div className="co-form">
                <div className="co-field">
                  <label className="co-field-label">Your Name *</label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="1.5"/><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input className="co-input" type="text" placeholder="Full name" value={deliveryForm.name} onChange={(e) => updateField('name', e.target.value)} />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">Contact Number *</label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.66 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.3 1.53.52 2.35.66A2 2 0 0122 16.92z" stroke="#666" strokeWidth="1.5"/></svg>
                    <input className="co-input" type="tel" placeholder="10-digit mobile" maxLength={10} value={deliveryForm.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                <div className="co-field">
                  <label className="co-field-label">House / Street / Area *</label>
                  <div className="co-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="co-input-icon"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="#666" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    <input className="co-input" type="text" placeholder="House no., Street, Area" value={deliveryForm.street} onChange={(e) => updateField('street', e.target.value)} />
                  </div>
                </div>
                <div className="co-field-row">
                  <div className="co-field co-field-half">
                    <label className="co-field-label">City *</label>
                    <input className="co-input co-input-plain" type="text" placeholder="City" value={deliveryForm.city} onChange={(e) => updateField('city', e.target.value)} />
                  </div>
                  <div className="co-field co-field-half">
                    <label className="co-field-label">PIN Code *</label>
                    <input className="co-input co-input-plain" type="text" placeholder="6-digit PIN" maxLength={6} value={deliveryForm.pincode} onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, ''))} />
                  </div>
                </div>
                
                <button className="co-place-order-btn" style={{ marginTop: '20px' }} onClick={() => {
                  if(deliveryForm.name && deliveryForm.phone && deliveryForm.street && deliveryForm.city && deliveryForm.pincode) {
                    const newAddr = {
                      label: 'Home',
                      name: deliveryForm.name,
                      phone: deliveryForm.phone,
                      street: deliveryForm.street,
                      city: deliveryForm.city,
                      state: deliveryForm.state,
                      pincode: deliveryForm.pincode,
                    };
                    const updated = [...savedAddresses, newAddr];
                    setSavedAddresses(updated);
                    persistAddresses(updated);
                    setSelectedAddrIdx(updated.length - 1);
                    setAddrSheetMode('list');
                    setShowAddrSheet(false);
                  } else {
                    alert('Please fill all required fields');
                  }
                }}>Save & Proceed</button>
                <button className="co-addr-sheet__add-btn" style={{ border: 'none', color: '#888' }} onClick={() => setAddrSheetMode('list')}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupon Sheet */}
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
"""
jsx = jsx.replace("    </div>\n  )\n}", overlays)

with open(jsx_path, 'w', encoding='utf-8') as f:
    f.write(jsx)

# CSS Update
new_css = """
/* Address summary */
.co-addr-summary { display:flex; align-items:center; gap:12px; padding:14px 16px; background:var(--native-surface,#161b22); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:12px; cursor:pointer; }
.co-addr-summary__content { flex:1; min-width:0; }
.co-addr-summary__label { font-size:14px; font-weight:700; color:var(--native-text,#f0f0f0); display:block; }
.co-addr-summary__text { font-size:12px; color:var(--native-text-secondary,#888); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px; }

/* Address sheet overlay */
.co-addr-sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:200; display:flex; flex-direction:column; }
.co-addr-sheet { flex:1; background:var(--native-bg,#0a0a0a); padding:16px; overflow-y:auto; padding-top:calc(env(safe-area-inset-top,0px)+16px); }
.co-addr-sheet__header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.co-addr-sheet__title { font-size:18px; font-weight:700; color:var(--native-text,#f0f0f0); }
.co-addr-sheet__item { display:flex; align-items:flex-start; gap:12px; padding:14px; background:var(--native-surface,#161b22); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:12px; margin-bottom:10px; cursor:pointer; }
.co-addr-sheet__item--active { border-color:#4CAF50; background:rgba(76,175,80,0.06); }
.co-addr-sheet__radio { width:20px; height:20px; border-radius:50%; border:2px solid #555; flex-shrink:0; display:flex; align-items:center; justify-content:center; margin-top:2px; }
.co-addr-sheet__radio--active { border-color:#4CAF50; }
.co-addr-sheet__radio--active::after { content:''; width:10px; height:10px; border-radius:50%; background:#4CAF50; }
.co-addr-sheet__label { font-size:13px; font-weight:700; color:var(--native-text,#f0f0f0); }
.co-addr-sheet__text { font-size:12px; color:var(--native-text-secondary,#888); margin-top:2px; }
.co-addr-sheet__add-btn { width:100%; padding:14px; background:transparent; border:1.5px dashed var(--native-green,#4CAF50); border-radius:12px; color:#4CAF50; font-size:14px; font-weight:600; cursor:pointer; margin-top:8px; }

/* Delivery tiers */
.co-delivery-tiers { display:flex; flex-direction:column; gap:8px; }
.co-tier { display:flex; align-items:center; gap:12px; padding:12px 14px; background:var(--native-surface,#161b22); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:10px; cursor:pointer; }
.co-tier--active { border-color:#4CAF50; background:rgba(76,175,80,0.06); }
.co-tier input[type="radio"] { display:none; }
.co-tier__info { flex:1; }
.co-tier__label { font-size:14px; font-weight:600; color:var(--native-text,#f0f0f0); display:block; }
.co-tier__time { font-size:12px; color:var(--native-text-secondary,#888); }
.co-tier__fee { font-size:13px; font-weight:700; color:#4CAF50; }

/* Detail tabs */
.co-detail-tabs { background:var(--native-surface,#161b22); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:14px; overflow:hidden; }
.co-tab-pills { display:flex; gap:4px; padding:8px 8px 0; }
.co-tab-pill { flex:1; padding:8px 0; font-size:13px; font-weight:600; background:transparent; border:none; color:var(--native-text-secondary,#888); border-radius:8px; cursor:pointer; }
.co-tab-pill--active { background:rgba(76,175,80,0.12); color:#4CAF50; }
.co-tab-content { padding:12px; }

/* Tip row */
.co-tip-row { display:flex; gap:8px; }
.co-tip-btn { flex:1; padding:10px; background:var(--native-surface-2,#1c1c1c); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:8px; color:var(--native-text-secondary,#888); font-size:13px; font-weight:600; cursor:pointer; }
.co-tip-btn--active { border-color:#4CAF50; background:rgba(76,175,80,0.1); color:#4CAF50; }

/* Sticky bottom bar */
.co-sticky-bottom { position:fixed; bottom:0; left:0; right:0; display:flex; align-items:center; gap:12px; padding:12px 16px calc(env(safe-area-inset-bottom,0px)+12px); background:var(--native-surface,#161b22); border-top:1px solid var(--native-border,rgba(255,255,255,0.08)); z-index:100; }
.co-sticky-bottom__left { cursor:pointer; }
.co-sticky-bottom__total { font-size:20px; font-weight:800; color:var(--native-text,#f0f0f0); display:block; }
.co-sticky-bottom__detail { font-size:11px; color:var(--native-text-secondary,#888); letter-spacing:0.5px; }
.co-sticky-bottom__cta { flex:1; height:48px; background:#4CAF50; border:none; border-radius:12px; color:white; font-size:16px; font-weight:700; cursor:pointer; }
.co-sticky-bottom__cta:disabled { opacity:0.4; }
.co-sticky-bottom__cta:active { background:#388E3C; }

/* Coupon row */
.co-coupon-row { display:flex; align-items:center; gap:10px; padding:14px 16px; background:var(--native-surface,#161b22); border:1px solid var(--native-border,rgba(255,255,255,0.08)); border-radius:12px; cursor:pointer; font-size:14px; color:var(--native-text,#f0f0f0); }

/* Coupon/Address sheet overlay */
.co-sheet-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; display:flex; align-items:flex-end; justify-content:center; }
.co-sheet { width:100%; max-width:480px; background:var(--native-surface,#161b22); border-radius:16px 16px 0 0; padding:20px 16px calc(env(safe-area-inset-bottom,0px)+20px); }
.co-sheet h3 { font-size:16px; font-weight:700; color:var(--native-text,#f0f0f0); margin-bottom:16px; }
.co-coupon-input-row { display:flex; gap:8px; }
.co-coupon-input-row .co-input { flex:1; }
.co-coupon-apply-btn { padding:10px 20px; background:#4CAF50; border:none; border-radius:10px; color:white; font-weight:700; cursor:pointer; }

/* Rec stepper */
.co-rec-stepper { display:flex; align-items:center; background:#4CAF50; border-radius:6px; overflow:hidden; }
.co-rec-stepper button { width:26px; height:26px; border:none; background:transparent; color:white; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.co-rec-stepper span { min-width:20px; text-align:center; color:white; font-size:12px; font-weight:700; }
"""
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('\n' + new_css)

print("Done")
