import { useState, useEffect, useRef, useCallback } from 'react'
import { useAdmin } from './AdminContext'
import { useCart } from './CartContext'
import { useAuth } from './AuthContext'
import {
  SearchIcon, FireIcon, ArrowRightIcon, VegBadge, PlusIcon,
  SparkleIcon, ShieldCheckIcon, TruckIcon, LeafIcon,
  getIconForCategory
} from './icons'
import { lightTap } from './services/haptics'

export default function NativeHomePage({ onNavigate }) {
  const { menuSections } = useAdmin()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerRef = useRef(null)
  const bannerTimerRef = useRef(null)

  const allItems = menuSections.flatMap(s => s.items || [])
  const popularItems = allItems.filter(i => i.featured && i.image).slice(0, 8)
  const specialItems = allItems.filter(i => i.image).slice(0, 6)
  const categories = menuSections.filter(s => s.items && s.items.length > 0)

  // Promo banners
  const banners = [
    { title: 'Free Delivery', subtitle: 'On orders above ₹300', cta: 'Order Now', theme: 'green' },
    { title: '100% Vegetarian', subtitle: 'Fresh organic ingredients daily', cta: 'Explore Menu', theme: 'orange' },
    { title: 'Value Combos', subtitle: 'Save up to 30% on meals', cta: 'View Combos', theme: 'purple' },
    { title: 'Chef\'s Specials', subtitle: 'Try our signature dishes', cta: 'Discover', theme: 'gold' },
  ]

  // Auto-scroll banners
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(bannerTimerRef.current)
  }, [banners.length])

  // Scroll banner into view
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

  const handleAddToCart = (item) => {
    addToCart(item)
    lightTap()
  }

  const goToMenu = () => {
    window.location.hash = '#/menu'
  }

  const goToSearch = () => {
    window.location.hash = '#/search'
  }

  const goToCategoryInMenu = (sectionId) => {
    lightTap()
    window.location.hash = '#/menu'
    // After navigation, scroll to section
    setTimeout(() => {
      const el = document.getElementById(`section-${sectionId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  return (
    <div className="native-home native-page">
      {/* ── Search Bar (tappable) ────────────────────────────── */}
      <div className="native-home__search" onClick={goToSearch}>
        <SearchIcon size={20} color="#555" />
        <span>Search for dishes, cuisines...</span>
      </div>

      {/* ── Promo Banners ────────────────────────────────────── */}
      <div
        className="native-home__banners"
        ref={bannerRef}
        onScroll={handleBannerScroll}
      >
        {banners.map((b, i) => (
          <div
            key={i}
            className={`native-home__banner-card native-home__banner-card--${b.theme} stagger-item`}
            onClick={goToMenu}
          >
            <div>
              <div className="native-home__banner-title">{b.title}</div>
              <div className="native-home__banner-subtitle">{b.subtitle}</div>
            </div>
            <div className="native-home__banner-cta">{b.cta}</div>
          </div>
        ))}
      </div>

      {/* Banner dots */}
      <div className="native-home__banner-dots">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`native-home__banner-dot${i === bannerIndex ? ' active' : ''}`}
            onClick={() => setBannerIndex(i)}
          />
        ))}
      </div>

      {/* ── Categories ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <>
          <div className="native-home__section-header">
            <h2 className="native-home__section-title">What's on your mind?</h2>
          </div>
          <div className="native-home__categories">
            {categories.map((cat) => {
              const { Icon, bg } = getIconForCategory(cat.id)
              return (
                <div
                  key={cat.id}
                  className="native-home__category-item stagger-item"
                  onClick={() => goToCategoryInMenu(cat.id)}
                >
                  <div className="native-home__category-icon" style={{ background: bg }}>
                    <Icon size={28} />
                  </div>
                  <span className="native-home__category-name">{cat.name}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Popular Items ────────────────────────────────────── */}
      {popularItems.length > 0 && (
        <>
          <div className="native-home__section-header">
            <h2 className="native-home__section-title">
              <FireIcon size={18} /> Popular Right Now
            </h2>
            <span className="native-home__section-link" onClick={goToMenu}>
              See All <ArrowRightIcon size={14} color="#4CAF50" />
            </span>
          </div>
          <div className="native-home__popular-scroll">
            {popularItems.map((item, idx) => (
              <div key={`pop-${idx}`} className="native-home__popular-card stagger-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="native-home__popular-img"
                  loading="lazy"
                />
                <div className="native-home__popular-body">
                  <div className="native-home__popular-name">{item.name}</div>
                  <div className="native-home__popular-row">
                    <span className="native-home__popular-price">₹{item.price}</span>
                    <button
                      className="native-home__add-btn"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                    >
                      <PlusIcon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Today's Specials ─────────────────────────────────── */}
      {specialItems.length > 0 && (
        <>
          <div className="native-home__section-header">
            <h2 className="native-home__section-title">
              <SparkleIcon size={18} /> Today's Specials
            </h2>
            <span className="native-home__section-link" onClick={goToMenu}>
              Full Menu <ArrowRightIcon size={14} color="#4CAF50" />
            </span>
          </div>
          <div className="native-home__specials">
            {specialItems.map((item, idx) => {
              const { Icon: CatIcon, bg } = getIconForCategory(
                menuSections.find(s => s.items?.includes(item))?.id || ''
              )
              return (
                <div key={`spec-${idx}`} className="native-home__special-card stagger-item">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="native-home__special-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="native-home__special-placeholder" style={{ background: bg }}>
                      <CatIcon size={32} />
                    </div>
                  )}
                  <div className="native-home__special-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <VegBadge size={12} />
                      <span className="native-home__special-name">{item.name}</span>
                    </div>
                    {item.description && (
                      <div className="native-home__special-desc">{item.description}</div>
                    )}
                    <div className="native-home__special-bottom">
                      <span className="native-home__popular-price">₹{item.price}</span>
                      <button
                        className="native-home__add-btn"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(item) }}
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Trust Badges ─────────────────────────────────────── */}
      <div className="native-home__trust stagger-item">
        <div className="native-home__trust-title">
          <VegBadge size={16} /> 100% Vegetarian
        </div>
        <div className="native-home__trust-grid">
          <div className="native-home__trust-item">
            <LeafIcon size={18} />
            <span>Fresh daily produce</span>
          </div>
          <div className="native-home__trust-item">
            <ShieldCheckIcon size={18} />
            <span>No preservatives</span>
          </div>
          <div className="native-home__trust-item">
            <SparkleIcon size={18} color="#4CAF50" />
            <span>Organic spices</span>
          </div>
          <div className="native-home__trust-item">
            <TruckIcon size={18} />
            <span>Swift delivery</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for floating cart bar */}
      <div style={{ height: 60 }} />
    </div>
  )
}
