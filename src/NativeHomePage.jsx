import { useState, useEffect, useRef, useCallback } from 'react'
import { useAdmin } from './AdminContext'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { lightTap } from './services/haptics'
import DishDetailSheet from './DishDetailSheet'

/* ── Inline SVGs — zero emojis ─────────────────────────────────── */
const FireSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 23c-3.87 0-7-3.13-7-7 0-2.38 1.19-4.47 3-5.74C8 10.26 8.5 9 9 8c.38 1.38 1.5 2.5 3 3 0-3 1.5-5.5 4-8 0 3.5 2 6 2 9.5 0 3.87-2.13 7-6 10.5z" fill="#FF5722"/>
    <path d="M12 23c-2.21 0-4-1.79-4-4 0-1.5.8-2.8 2-3.46.5-.28 1-.8 1.5-1.54.5.75 1 1.26 1.5 1.54 1.2.67 2 1.96 2 3.46 0 2.21-1.29 4-3 4z" fill="#FF9800"/>
  </svg>
)
const StarSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB300">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const VegDotSVG = () => (
  <svg width="14" height="14" viewBox="0 0 18 18">
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
  </svg>
)
const LeafSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.99a.5.5 0 0 0 .7.65c.96-.51 2.57-1.39 4.21-1.39C15 19.25 19 13 19 9c0-5-5-7-5-7s2 1 3 6z" fill="#4CAF50"/>
  </svg>
)
const DeliverySVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 17h6m4 0h2M13 17v-4a2 2 0 012-2h3l3 4v2" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7.5" cy="17.5" r="1.5" fill="#4CAF50"/>
    <circle cx="17.5" cy="17.5" r="1.5" fill="#4CAF50"/>
  </svg>
)
const ShieldSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const TandoorSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="17" rx="8" ry="4" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" strokeWidth="1.5"/>
    <path d="M8 17V9a4 4 0 018 0v8" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 9c0-2 4-4 4-7" stroke="#81C784" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M13 10c0-1.5 2-2.5 2-5" stroke="#81C784" strokeWidth="1" strokeLinecap="round"/>
  </svg>
)

// Banner SVG icons (replace emojis)
const RocketSVG = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 2 6 6 6 13l3 1 .5 3h5l.5-3 3-1c0-7-6-11-6-11z" fill="rgba(255,255,255,0.9)"/>
    <path d="M9 14c-1 .5-2 2-2 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 14c1 .5 2 2 2 4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="10" r="2" fill="rgba(255,255,255,0.5)"/>
  </svg>
)
const OrganicSVG = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    <path d="M17 8C8 10 5.9 16.17 3.82 19.99a.5.5 0 00.7.65c.96-.51 2.57-1.39 4.21-1.39C15 19.25 19 13 19 9c0-5-5-7-5-7s2 1 3 6z" fill="rgba(255,255,255,0.9)"/>
  </svg>
)
const DealSVG = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="rgba(255,255,255,0.9)"/>
  </svg>
)

const BANNERS = [
  { title: 'Free Delivery', subtitle: 'On orders above ₹300', cta: 'Order Now', gradient: 'linear-gradient(135deg, #1B5E20, #388E3C)', Icon: RocketSVG },
  { title: 'Fresh & Organic', subtitle: 'Farm-fresh veggies daily', cta: 'Explore Menu', gradient: 'linear-gradient(135deg, #E65100, #F57C00)', Icon: OrganicSVG },
  { title: 'Value Combos', subtitle: 'Save up to 30% on combos', cta: 'View Deals', gradient: 'linear-gradient(135deg, #4A148C, #7B1FA2)', Icon: DealSVG },
]

export default function NativeHomePage({ onNavigate }) {
  const { menuSections } = useAdmin()
  const { addToCart, cartItems, updateQuantity } = useCart()
  const [bannerIndex, setBannerIndex] = useState(0)
  const [selectedDish, setSelectedDish] = useState(null)
  const bannerTimerRef = useRef(null)
  const containerRef = useRef(null)
  // Scroll memory — restore position when returning to home
  const SCROLL_KEY = 'nh_scroll_y'

  const allItems = menuSections.flatMap(s => s.items || [])
  const popularItems = allItems.filter(i => i.featured && i.image).slice(0, 10)
  const specialItems = allItems.filter(i => i.image).slice(0, 8)
  const categories = menuSections.filter(s => s.items && s.items.length > 0)

  const getCategoryImage = (section) => section.items.find(i => i.image)?.image || null

  // Restore scroll position
  useEffect(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY)
    if (saved) {
      requestAnimationFrame(() => window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' }))
    }
    return () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    }
  }, [])

  // Auto-advance banner using CSS transform (no scrollIntoView)
  const startTimer = useCallback(() => {
    clearInterval(bannerTimerRef.current)
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % BANNERS.length)
    }, 4000)
  }, [])

  useEffect(() => {
    startTimer()
    return () => clearInterval(bannerTimerRef.current)
  }, [startTimer])

  // Touch-swipe on banner
  const touchStartX = useRef(0)
  const handleBannerTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleBannerTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setBannerIndex(prev =>
        diff > 0
          ? (prev + 1) % BANNERS.length
          : (prev - 1 + BANNERS.length) % BANNERS.length
      )
      startTimer()
    }
  }

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation()
    lightTap()
    addToCart(item)
  }

  const inCart = (item) => cartItems?.find(i => i.name === item.name)?.quantity || 0

  const goToMenu = () => { lightTap(); window.location.hash = '#/menu' }

  const goToCategoryInMenu = (sectionId) => {
    lightTap()
    window.location.hash = '#/menu'
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350)
  }

  return (
    <div className="nh" ref={containerRef}>

      {/* ── Promo Banners — CSS transform based (no scrollIntoView bug) ── */}
      <div
        className="nh-banners"
        onTouchStart={handleBannerTouchStart}
        onTouchEnd={handleBannerTouchEnd}
      >
        <div
          className="nh-banners__track"
          style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
        >
          {BANNERS.map((b, i) => (
            <div key={i} className="nh-banner" style={{ background: b.gradient }} onClick={goToMenu}>
              <div className="nh-banner__content">
                <b.Icon />
                <div>
                  <h3 className="nh-banner__title">{b.title}</h3>
                  <p className="nh-banner__sub">{b.subtitle}</p>
                </div>
              </div>
              <button className="nh-banner__cta">{b.cta} →</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Categories ─────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="nh-section">
          <h2 className="nh-section__title">What's on your mind?</h2>
          <div className="nh-cats">
            {categories.map((cat) => {
              const img = getCategoryImage(cat)
              return (
                <div key={cat.id} className="nh-cat" onClick={() => goToCategoryInMenu(cat.id)}>
                  <div className="nh-cat__circle">
                    {img
                      ? <img src={img} alt={cat.name} loading="lazy" />
                      : <span className="material-symbols-outlined" style={{color:'#4CAF50'}}>{cat.icon}</span>
                    }
                  </div>
                  <span className="nh-cat__name">{cat.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Popular Right Now ───────────────────────────── */}
      {popularItems.length > 0 && (
        <div className="nh-section">
          <div className="nh-section__header">
            <h2 className="nh-section__title">
              <FireSVG />
              Popular Right Now
            </h2>
            <span className="nh-section__link" onClick={goToMenu}>See All ›</span>
          </div>
          <div className="nh-hscroll">
            {popularItems.map((item, idx) => {
              const qty = inCart(item)
              return (
                <div key={`pop-${idx}`} className="nh-pcard" onClick={() => setSelectedDish(item)}>
                  <div className="nh-pcard__imgwrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="nh-pcard__body">
                    <span className="nh-pcard__name">{item.name}</span>
                    <div className="nh-pcard__row">
                      <span className="nh-pcard__price">₹{item.price}</span>
                      {qty > 0 ? (
                        <div className="nh-mini-stepper" onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => { lightTap(); updateQuantity(item.name, -1) }}>−</button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => { lightTap(); updateQuantity(item.name, 1) }}>+</button>
                        </div>
                      ) : (
                        <button className="nh-addbtn" onClick={(e) => handleAddToCart(item, e)}>ADD</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Today's Specials ─────────────────────────────── */}
      {specialItems.length > 0 && (
        <div className="nh-section">
          <div className="nh-section__header">
            <h2 className="nh-section__title">
              <StarSVG />
              Today's Specials
            </h2>
            <span className="nh-section__link" onClick={goToMenu}>Full Menu ›</span>
          </div>
          <div className="nh-specials">
            {specialItems.map((item, idx) => {
              const qty = inCart(item)
              return (
                <div key={`spec-${idx}`} className="nh-scard" onClick={() => setSelectedDish(item)}>
                  <img src={item.image} alt={item.name} className="nh-scard__img" loading="lazy" />
                  <div className="nh-scard__info">
                    <div className="nh-scard__top">
                      <VegDotSVG />
                      <span className="nh-scard__name">{item.name}</span>
                      <span className="nh-scard__price">₹{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="nh-scard__desc">{item.description}</p>
                    )}
                    {item.featured && (
                      <span className="nh-scard__chefs">
                        <StarSVG /> Chef's Pick
                      </span>
                    )}
                    <div className="nh-scard__bottom">
                      {qty > 0 ? (
                        <div className="nh-mini-stepper" onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => { lightTap(); updateQuantity(item.name, -1) }}>−</button>
                          <span>{qty}</span>
                          <button type="button" onClick={() => { lightTap(); updateQuantity(item.name, 1) }}>+</button>
                        </div>
                      ) : (
                        <button className="nh-addbtn" onClick={(e) => handleAddToCart(item, e)}>ADD</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Trust Badges ─────────────────────────────────── */}
      <div className="nh-trust">
        <div className="nh-trust__header">
          <LeafSVG />
          <span>100% Pure Vegetarian</span>
        </div>
        <div className="nh-trust__grid">
          <div className="nh-trust__item"><LeafSVG /><span>Farm Fresh Daily</span></div>
          <div className="nh-trust__item"><ShieldSVG /><span>No Preservatives</span></div>
          <div className="nh-trust__item"><TandoorSVG /><span>Clay Tandoor</span></div>
          <div className="nh-trust__item"><DeliverySVG /><span>Swift Delivery</span></div>
        </div>
      </div>

      <div style={{ height: 120 }} />

      {/* Dish Detail Sheet */}
      {selectedDish && (
        <DishDetailSheet item={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </div>
  )
}
