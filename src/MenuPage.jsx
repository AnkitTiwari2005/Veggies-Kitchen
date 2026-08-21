import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useCart } from './CartContext'
import { isNative } from './hooks/useCapacitor'
import { lightTap } from './services/haptics'
import DishDetailSheet from './DishDetailSheet'
import './MenuPage.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ── Inline SVGs (no emojis) ─────────────────────────────────────── */
const VegDotSVG = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" style={{flexShrink:0}}>
    <rect x="1" y="1" width="16" height="16" rx="3" stroke="#4CAF50" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="9" r="4" fill="#4CAF50"/>
  </svg>
)

const StarSVG = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="#FFB300">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const SearchNoResultSVG = () => (
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" style={{opacity:0.3}}>
    <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="1.5"/>
    <path d="M20 20l-3.5-3.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8.5 8.5l5 5M13.5 8.5l-5 5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

/* ══════════════════════════════════════════════
   PRODUCT CARD — Swiggy-style
   Text LEFT, Image RIGHT, ADD overlaps image
   ══════════════════════════════════════════════ */
function ProductCard({ item, sectionId, onTap }) {
  const { addToCart, updateQuantity, cartItems } = useCart()
  const cartItem = cartItems?.find(i => i.name === item.name)
  const qty = cartItem ? cartItem.quantity : 0
  const addBtnRef = useRef(null)

  const handleAdd = (e) => {
    e.stopPropagation()
    lightTap()

    // Customizable items → open detail sheet for options
    if (item.customizable) {
      onTap(item)
      return
    }

    // Fly-to-cart animation
    if (addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect()
      const floatingBar = document.querySelector('.floating-cart-bar')
      if (floatingBar) {
        const barRect = floatingBar.getBoundingClientRect()
        const dot = document.createElement('div')
        dot.style.cssText = `
          position:fixed; z-index:9999; width:12px; height:12px;
          background:#4CAF50; border-radius:50%;
          top:${rect.top + rect.height/2}px; left:${rect.left + rect.width/2}px;
          pointer-events:none; transition:all 600ms cubic-bezier(0.4,0,0.2,1);
        `
        document.body.appendChild(dot)
        requestAnimationFrame(() => {
          dot.style.top = `${barRect.top + barRect.height/2}px`
          dot.style.left = `${barRect.left + barRect.width/2}px`
          dot.style.opacity = '0'
          dot.style.transform = 'scale(0.3)'
        })
        setTimeout(() => dot.remove(), 650)
      }
    }
    addToCart(item)
  }

  const handleInc = (e) => { e.stopPropagation(); lightTap(); updateQuantity(item.name, 1) }
  const handleDec = (e) => { e.stopPropagation(); lightTap(); updateQuantity(item.name, -1) }

  return (
    <div className="swiggy-card press-effect" onClick={() => onTap(item)}>
      {/* Left: text content */}
      <div className="swiggy-card__left">
        <div className="swiggy-card__veg-row">
          <VegDotSVG />
          {item.featured && (
            <span className="swiggy-card__chefs-pick">
              <StarSVG /> Chef's Pick
            </span>
          )}
        </div>
        <h3 className="swiggy-card__name">{item.name}</h3>
        <div className="swiggy-card__price">₹{item.price}</div>
        {item.description && (
          <p className="swiggy-card__desc">{item.description}</p>
        )}
        {item.customizable && (
          <span className="swiggy-card__customisable">customisable</span>
        )}
      </div>

      {/* Right: image + ADD button */}
      <div className="swiggy-card__right">
        <div className="swiggy-card__img-wrap">
          {item.image ? (
            <img src={item.image} alt={item.name} loading="lazy" className="swiggy-card__img" />
          ) : (
            <div className="swiggy-card__img-placeholder">
              <VegDotSVG />
            </div>
          )}
        </div>

        {/* ADD / Stepper — sits at bottom of image */}
        <div className="swiggy-card__action" ref={addBtnRef} onClick={e => e.stopPropagation()}>
          {qty > 0 ? (
            <div className="swiggy-card__stepper">
              <button type="button" onClick={handleDec} aria-label="Decrease">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
              <span>{qty}</span>
              <button type="button" onClick={handleInc} aria-label="Increase">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ) : (
            <button type="button" className="swiggy-card__add-btn" onClick={handleAdd}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MENU SECTION BLOCK
   ══════════════════════════════════════════════ */
function MenuSectionBlock({ section, onTap }) {
  return (
    <div className="menu-section-block" id={`section-${section.id}`}>
      <div className="menu-section-header">
        <div className="menu-section-icon">
          <span className="material-symbols-outlined">{section.icon}</span>
        </div>
        <div className="menu-section-title-wrap">
          <h2 className="menu-section-title">{section.name}</h2>
          <p className="menu-section-desc">{section.description}</p>
        </div>
        <span className="menu-section-count">{section.items.length} items</span>
      </div>
      <div className="product-grid">
        {section.items.map((item, index) => (
          <ProductCard
            key={`${section.id}-${item.id || index}`}
            item={item}
            sectionId={section.id}
            onTap={onTap}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   SEARCH RESULTS VIEW
   ══════════════════════════════════════════════ */
function SearchResults({ results, query, onTap }) {
  if (results.length === 0) {
    return (
      <div className="menu-empty-state">
        <SearchNoResultSVG />
        <h3 className="menu-empty-title">No dishes found</h3>
        <p className="menu-empty-desc">
          Nothing matching "{query}". Try a different word.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="search-results-header">
        <h2 className="search-results-title">Results</h2>
        <span className="search-results-count">{results.length} dish{results.length !== 1 ? 'es' : ''}</span>
      </div>
      <div className="product-grid">
        {results.map((item, index) => (
          <ProductCard
            key={`search-${item.sectionId}-${item.id || index}`}
            item={item}
            sectionId={item.sectionId}
            onTap={onTap}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN MENU PAGE
   ══════════════════════════════════════════════ */
export default function MenuPage() {
  const { cartCount, cartTotal } = useCart()
  const { menuSections, menuBackdrop } = useAdmin()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState(menuSections[0]?.id || '')
  const [showBackTop, setShowBackTop] = useState(false)
  const [selectedDish, setSelectedDish] = useState(null)
  const navRef = useRef(null)
  const isScrollingRef = useRef(false)

  const totalProducts = useMemo(() => menuSections.reduce((sum, s) => sum + s.items.length, 0), [menuSections])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    return menuSections.flatMap(s =>
      s.items
        .filter(item =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
        .map(item => ({ ...item, sectionId: s.id, sectionName: s.name }))
    )
  }, [searchQuery, menuSections])

  const isSearching = searchResults !== null

  // Scroll-spy
  useEffect(() => {
    if (isSearching) return
    const handleScroll = () => {
      if (isScrollingRef.current) return
      const scrollY = window.scrollY + 160
      let current = menuSections[0]?.id || ''
      for (const section of menuSections) {
        const el = document.getElementById(`section-${section.id}`)
        if (el && el.offsetTop <= scrollY) current = section.id
      }
      setActiveSection(current)
      setShowBackTop(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSearching, menuSections])

  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId)
    setSearchQuery('')
    const el = document.getElementById(`section-${sectionId}`)
    if (el) {
      isScrollingRef.current = true
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setTimeout(() => { isScrollingRef.current = false }, 800)
    }
  }, [])

  useEffect(() => {
    if (!navRef.current) return
    const activePill = navRef.current.querySelector('.menu-category-pill.active')
    if (activePill) activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeSection])

  useGSAP(() => {
    if (isNative) return // Skip heavy GSAP animations on native
    gsap.utils.toArray('.menu-section-block').forEach((section) => {
      gsap.fromTo(section, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%' }
      })
    })
  }, [isSearching])

  const handleBackTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [])

  const visibleSections = useMemo(
    () => menuSections.filter(s => !isNative || s.items.length > 0),
    [menuSections]
  )

  return (
    <div className="menu-page">
      {/* Web-only background */}
      {!isNative && (
        <div className="page-bg" style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:-1 }}>
          <BackgroundMedia media={menuBackdrop} />
          <div className="page-overlay" style={{ position:'absolute', inset:0, background:'rgba(20,19,19,0.85)', backdropFilter:'blur(12px)' }} />
        </div>
      )}

      {/* Web-only hero */}
      {!isNative && (
        <section className="menu-hero" style={{ background: 'transparent' }}>
          <div className="menu-hero-content">
            <div className="menu-hero-badge">
              <span className="material-symbols-outlined icon-filled">eco</span>
              100% Vegetarian
            </div>
            <h1>Our Complete <span className="accent">Menu</span></h1>
            <p className="menu-hero-subtitle">
              {totalProducts}+ handcrafted dishes across {menuSections.length} categories.
            </p>
            <div className="menu-hero-stats">
              <div className="menu-hero-stat"><div className="menu-hero-stat-value">{totalProducts}+</div><div className="menu-hero-stat-label">Dishes</div></div>
              <div className="menu-hero-stat"><div className="menu-hero-stat-value">{menuSections.length}</div><div className="menu-hero-stat-label">Categories</div></div>
              <div className="menu-hero-stat"><div className="menu-hero-stat-value">100%</div><div className="menu-hero-stat-label">Vegetarian</div></div>
            </div>
            <div className="menu-search-wrap">
              <span className="material-symbols-outlined menu-search-icon">search</span>
              <input
                type="text"
                className="menu-search-input"
                placeholder="Search paneer, noodles, biryani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="menu-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Category pills */}
      {!isSearching && (
        <nav className="menu-category-nav" aria-label="Menu categories">
          <div className="menu-category-nav-inner" ref={navRef}>
            {visibleSections.map((section) => (
              <button
                key={section.id}
                className={`menu-category-pill ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
                aria-label={section.name}
              >
                <span className="material-symbols-outlined">{section.icon}</span>
                {section.name}
                <span className="menu-category-pill-count">{section.items.length}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Content */}
      <div className="menu-content">
        {isSearching ? (
          <SearchResults results={searchResults} query={searchQuery} onTap={setSelectedDish} />
        ) : (
          visibleSections.map((section) => (
            <MenuSectionBlock key={section.id} section={section} onTap={setSelectedDish} />
          ))
        )}
      </div>

      {/* Web-only floating CTA */}
      {!isNative && cartCount > 0 && (
        <div className="menu-floating-cta">
          <button onClick={() => { window.location.hash = '#/checkout' }}>
            <span className="material-symbols-outlined">shopping_bag</span>
            Checkout · ₹{cartTotal.toFixed(2)}
          </button>
        </div>
      )}

      <button
        className={`menu-back-top ${showBackTop ? 'visible' : ''}`}
        onClick={handleBackTop}
        aria-label="Back to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dish Detail Bottom Sheet */}
      {selectedDish && (
        <DishDetailSheet item={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </div>
  )
}
