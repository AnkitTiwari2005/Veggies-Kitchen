import { useState, useEffect, useRef, useCallback } from 'react'
import { useAdmin } from './AdminContext'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import { VegBadge, PlusIcon } from './icons'
import { lightTap } from './services/haptics'

export default function NativeHomePage({ onNavigate }) {
  const { menuSections } = useAdmin()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerRef = useRef(null)
  const bannerTimerRef = useRef(null)

  const allItems = menuSections.flatMap(s => s.items || [])
  const popularItems = allItems.filter(i => i.featured && i.image).slice(0, 10)
  const specialItems = allItems.filter(i => i.image).slice(0, 8)
  const categories = menuSections.filter(s => s.items && s.items.length > 0)

  // Get a representative image for each category
  const getCategoryImage = (section) => {
    const withImage = section.items.find(i => i.image)
    return withImage ? withImage.image : null
  }

  // Promo banners
  const banners = [
    {
      title: 'Free Delivery',
      subtitle: 'On orders above ₹300',
      cta: 'Order Now',
      gradient: 'linear-gradient(135deg, #1B5E20 0%, #388E3C 50%, #2E7D32 100%)',
      icon: '🚀'
    },
    {
      title: 'Fresh & Organic',
      subtitle: 'Farm-fresh veggies every morning',
      cta: 'Explore Menu',
      gradient: 'linear-gradient(135deg, #E65100 0%, #F57C00 50%, #FF9800 100%)',
      icon: '🌿'
    },
    {
      title: 'Value Combos',
      subtitle: 'Save up to 30% on meal combos',
      cta: 'View Deals',
      gradient: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #9C27B0 100%)',
      icon: '💰'
    },
  ]

  // Auto-scroll banners
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(bannerTimerRef.current)
  }, [banners.length])

  useEffect(() => {
    if (bannerRef.current) {
      const cards = bannerRef.current.children
      if (cards[bannerIndex]) {
        cards[bannerIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [bannerIndex])

  const handleBannerScroll = useCallback(() => {
    if (!bannerRef.current) return
    const scrollLeft = bannerRef.current.scrollLeft
    const cardWidth = bannerRef.current.children[0]?.offsetWidth || 300
    const newIndex = Math.round(scrollLeft / (cardWidth + 12))
    if (newIndex !== bannerIndex && newIndex >= 0 && newIndex < banners.length) {
      setBannerIndex(newIndex)
      clearInterval(bannerTimerRef.current)
      bannerTimerRef.current = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % banners.length)
      }, 4000)
    }
  }, [bannerIndex, banners.length])

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation()
    addToCart(item)
    lightTap()
  }

  const goToMenu = () => { window.location.hash = '#/menu' }
  const goToSearch = () => { window.location.hash = '#/search' }

  const goToCategoryInMenu = (sectionId) => {
    lightTap()
    window.location.hash = '#/menu'
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  return (
    <div className="nh">
      {/* ── Search Bar ───────────────────────────────── */}
      <div className="nh-search" onClick={goToSearch}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="20" y1="20" x2="15.8" y2="15.8"/>
        </svg>
        <span>Search for dishes, cuisines...</span>
      </div>

      {/* ── Promo Banners ────────────────────────────── */}
      <div className="nh-banners" ref={bannerRef} onScroll={handleBannerScroll}>
        {banners.map((b, i) => (
          <div key={i} className="nh-banner" style={{ background: b.gradient }} onClick={goToMenu}>
            <div className="nh-banner__content">
              <span className="nh-banner__icon">{b.icon}</span>
              <h3 className="nh-banner__title">{b.title}</h3>
              <p className="nh-banner__sub">{b.subtitle}</p>
            </div>
            <button className="nh-banner__cta">{b.cta} →</button>
          </div>
        ))}
      </div>

      {/* Banner dots */}
      <div className="nh-dots">
        {banners.map((_, i) => (
          <span key={i} className={`nh-dot${i === bannerIndex ? ' active' : ''}`} onClick={() => setBannerIndex(i)} />
        ))}
      </div>

      {/* ── Categories (real food images in circles) ── */}
      {categories.length > 0 && (
        <div className="nh-section">
          <h2 className="nh-section__title">What's on your mind?</h2>
          <div className="nh-cats">
            {categories.map((cat) => {
              const img = getCategoryImage(cat)
              return (
                <div key={cat.id} className="nh-cat" onClick={() => goToCategoryInMenu(cat.id)}>
                  <div className="nh-cat__circle">
                    {img ? (
                      <img src={img} alt={cat.name} loading="lazy" />
                    ) : (
                      <span className="nh-cat__emoji">
                        <span className="material-symbols-outlined">{cat.icon}</span>
                      </span>
                    )}
                  </div>
                  <span className="nh-cat__name">{cat.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Popular Right Now ────────────────────────── */}
      {popularItems.length > 0 && (
        <div className="nh-section">
          <div className="nh-section__header">
            <h2 className="nh-section__title">🔥 Popular Right Now</h2>
            <span className="nh-section__link" onClick={goToMenu}>See All ›</span>
          </div>
          <div className="nh-hscroll">
            {popularItems.map((item, idx) => (
              <div key={`pop-${idx}`} className="nh-pcard">
                <div className="nh-pcard__imgwrap">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  {item.featured && <span className="nh-pcard__badge">⭐ Chef's Pick</span>}
                </div>
                <div className="nh-pcard__body">
                  <span className="nh-pcard__name">{item.name}</span>
                  <div className="nh-pcard__row">
                    <span className="nh-pcard__price">₹{item.price}</span>
                    <button className="nh-addbtn" onClick={(e) => handleAddToCart(item, e)}>
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Today's Specials (vertical cards) ────────── */}
      {specialItems.length > 0 && (
        <div className="nh-section">
          <div className="nh-section__header">
            <h2 className="nh-section__title">⭐ Today's Specials</h2>
            <span className="nh-section__link" onClick={goToMenu}>Full Menu ›</span>
          </div>
          <div className="nh-specials">
            {specialItems.map((item, idx) => (
              <div key={`spec-${idx}`} className="nh-scard">
                <img src={item.image} alt={item.name} className="nh-scard__img" loading="lazy" />
                <div className="nh-scard__info">
                  <div className="nh-scard__top">
                    <VegBadge size={14} />
                    <span className="nh-scard__name">{item.name}</span>
                  </div>
                  {item.description && (
                    <p className="nh-scard__desc">{item.description}</p>
                  )}
                  <div className="nh-scard__bottom">
                    <span className="nh-scard__price">₹{item.price}</span>
                    <button className="nh-addbtn" onClick={(e) => handleAddToCart(item, e)}>
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trust / About ────────────────────────────── */}
      <div className="nh-trust">
        <div className="nh-trust__header">
          <VegBadge size={18} />
          <span>100% Pure Vegetarian</span>
        </div>
        <div className="nh-trust__grid">
          <div className="nh-trust__item">
            <span className="material-symbols-outlined" style={{ color: '#4CAF50', fontSize: 20 }}>eco</span>
            <span>Farm Fresh Daily</span>
          </div>
          <div className="nh-trust__item">
            <span className="material-symbols-outlined" style={{ color: '#4CAF50', fontSize: 20 }}>verified</span>
            <span>No Preservatives</span>
          </div>
          <div className="nh-trust__item">
            <span className="material-symbols-outlined" style={{ color: '#4CAF50', fontSize: 20 }}>local_fire_department</span>
            <span>Clay Tandoor</span>
          </div>
          <div className="nh-trust__item">
            <span className="material-symbols-outlined" style={{ color: '#4CAF50', fontSize: 20 }}>delivery_dining</span>
            <span>Swift Delivery</span>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}
