import { useState, useEffect, useRef, useCallback } from 'react'
import MenuPage from './MenuPage'
import './App.css'
import './mobile.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { addBodyClass, isNative } from './hooks/useCapacitor'
import { hasSeenOnboarding } from './services/storage'
import { initDeepLinks } from './services/deepLinking'
import SplashHandler from './SplashHandler'
import NativeAppBar from './NativeAppBar'
import NativeHomePage from './NativeHomePage'
import FloatingCartBar from './FloatingCartBar'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ══════════════════════════════════════════════
   DATA — Images, Menu, Carousel
   ══════════════════════════════════════════════ */

import { MENU_SECTIONS as DEFAULT_MENU_SECTIONS } from './menuData'

const allItems = DEFAULT_MENU_SECTIONS.flatMap(s => s.items)
const getMenuImg = (name) => {
  const item = allItems.find(i => i.name.toLowerCase().includes(name.toLowerCase()) && i.image);
  return item ? item.image : '/images/hero_food_spread.png';
}

const IMG = {
  kadhaiPaneer: getMenuImg('Kadhai Paneer'),
  dalMakhani: getMenuImg('Dal Makhani'),
  spices: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK7oNTeLZ1Fe3xtoP3NVYUUQurVVNpRE6HPP5AZX50WV9F4bSvK8lqOpGP6xdtl5MwHSpe8fSN5TL63kY7O1OtwWqYDvgd_lPR9b_q-6BpXzEkdvCXcL-WL3_rpUbfRo0vq_hKPHCVM-0FR3tYxGWlV4XpFlNlxjKOmyg_wG-Qr8Nvffjmu8IZ8_i6mXJpk_GsB7L223arFlWcpEv-KHwFIzhTQb_-MS4GjCmZFNqUWLEWCr-675L-86yQuKgSwHRjV6dXXpGM-kQ7',
}

const CAROUSEL_DURATION = 4000

/* ══════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════ */

/* ── Header ─────────────────────────────────── */
function Header({ currentPage, setCurrentPage }) {
  const { cartCount } = useCart()
  const { user, login, logout } = useAuth()

  const goHome = (e) => {
    if (e) e.preventDefault()
    window.location.hash = '#/'
    setCurrentPage('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goMenu = (e) => {
    if (e) e.preventDefault()
    window.location.hash = '#/menu'
    setCurrentPage('menu')
    window.scrollTo({ top: 0 })
  }

  const goCheckout = (e) => {
    if (e) e.preventDefault()
    window.location.hash = '#/checkout'
    setCurrentPage('checkout')
    window.scrollTo({ top: 0 })
  }

  const goAccount = (e) => {
    if (e) e.preventDefault()
    window.location.hash = '#/account'
    setCurrentPage('account')
    window.scrollTo({ top: 0 })
  }

  const goOrders = (e) => {
    if (e) e.preventDefault()
    window.location.hash = '#/orders'
    setCurrentPage('orders')
    window.scrollTo({ top: 0 })
  }

  return (
    <>
    <header className="site-header" id="site-header">
      <a href="#/" className="site-logo" onClick={goHome} style={{ cursor: 'pointer' }}>Veggies Kitchen</a>
      
      <nav className="site-nav">
        <a href="#/menu" className={currentPage === 'menu' ? 'active' : ''} onClick={goMenu}>Menu</a>
        <a href="#/orders" className={currentPage === 'orders' ? 'active' : ''} onClick={goOrders}>Orders</a>
        <a href="#/blogs" className={currentPage === 'blogs' ? 'active' : ''} onClick={(e) => { e.preventDefault(); window.location.hash = '#/blogs'; setCurrentPage('blogs'); window.scrollTo({ top: 0 }) }}>Blogs</a>
        {user?.role === 'admin' && (
          <a href="#/admin" className={currentPage === 'admin' ? 'active' : ''} onClick={(e) => { e.preventDefault(); window.location.hash = '#/admin'; setCurrentPage('admin'); window.scrollTo({ top: 0 }) }}>Admin</a>
        )}
        <a href="#/checkout" className={currentPage === 'checkout' ? 'active' : ''} onClick={goCheckout} style={{ position: 'relative' }}>
          Cart
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--secondary)', color: 'var(--on-secondary)', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {cartCount}
            </span>
          )}
        </a>
        <a href="#/account" className={currentPage === 'account' ? 'active' : ''} onClick={goAccount}>Account</a>
      </nav>

      <div className="header-actions">
        {currentPage === 'home' && (
          <button className="icon-btn" aria-label="Search" onClick={goMenu}>
            <span className="material-symbols-outlined">search</span>
          </button>
        )}
        
        {user ? (
          <div className="user-profile-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', background: 'var(--surface-container)', padding: '6px 12px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>account_circle</span>
            <span style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
            <button onClick={logout} className="btn-ghost-sm" style={{ padding: '4px', minWidth: 0, border: 'none', color: 'var(--error)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
            </button>
          </div>
        ) : (
          <button onClick={login} className="btn-primary-sm" style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span> Login
          </button>
        )}
      </div>
    </header>
    <nav className="mobile-bottom-nav">
      <a href="#/" className={currentPage === 'home' ? 'active' : ''} onClick={goHome}>
        <span className="material-symbols-outlined">home</span>
        <span>Home</span>
      </a>
      <a href="#/menu" className={currentPage === 'menu' ? 'active' : ''} onClick={goMenu}>
        <span className="material-symbols-outlined">restaurant_menu</span>
        <span>Menu</span>
      </a>
      <a href="#/checkout" className={currentPage === 'checkout' ? 'active' : ''} onClick={goCheckout} style={{ position: 'relative' }}>
        <span className="material-symbols-outlined">shopping_cart</span>
        <span>Cart</span>
        {cartCount > 0 && (
          <span className="mobile-cart-badge">{cartCount}</span>
        )}
      </a>
      <a href="#/orders" className={currentPage === 'orders' ? 'active' : ''} onClick={goOrders}>
        <span className="material-symbols-outlined">receipt_long</span>
        <span>Orders</span>
      </a>
      <a href="#/account" className={currentPage === 'account' ? 'active' : ''} onClick={goAccount}>
        <span className="material-symbols-outlined">account_circle</span>
        <span>Account</span>
      </a>
    </nav>
    </>
  )
}

/* ── Hero ────────────────────────────────────── */
function Hero() {
  const { heroBackdrop, menuSections } = useAdmin()
  const allItems = menuSections.flatMap(s => s.items)
  const featuredItemsFromData = allItems.filter(i => i.featured && i.image).slice(0, 3)
  const FEATURED_DISHES = featuredItemsFromData.length > 0 ? featuredItemsFromData.map(i => ({
    title: i.name,
    desc: i.description,
    img: i.image,
  })) : [
    { title: 'Dal Makhani', desc: 'Slow cooked', img: IMG.dalMakhani }
  ]

  const [chefChoiceIndex, setChefChoiceIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setChefChoiceIndex(prev => (prev + 1) % FEATURED_DISHES.length)
        setFading(false)
      }, 500)
    }, 4000)
    return () => clearInterval(timer)
  }, [FEATURED_DISHES.length])

  const currentChoice = FEATURED_DISHES[chefChoiceIndex] || FEATURED_DISHES[0]

  return (
    <section className="hero" id="home" style={{ position: 'relative' }}>
      <div className="hero-bg">
        <BackgroundMedia media={heroBackdrop} />
        <div className="hero-overlay" />
      </div>

      <div className="hero-signature">
        <div className="hero-signature-card glass-panel" style={{ transition: 'opacity 0.5s ease', opacity: fading ? 0 : 1, textAlign: 'right' }}>
          <p className="hero-signature-label">Signature Chef Choice</p>
          <h3 className="hero-signature-title">{currentChoice.title}</h3>
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="material-symbols-outlined icon-filled">eco</span>
            100% Vegetarian &amp; Authentic
          </div>

          <h1 className="text-display-lg">
            Artisanal Flavors, <br />
            <span className="accent">Delivered.</span>
          </h1>

          <p className="hero-subtitle text-body-lg">
            Experience the soul of North Indian cuisine with our signature
            slow-cooked classics, prepared with ancestral secrets and modern
            precision.
          </p>

          <div className="hero-actions">
            <a href="#menu" className="btn-primary-lg glow-button">
              Explore Menu{' '}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Cinematic Showcase ─────────────────────── */
function CinematicShowcase() {
  const card1Ref = useRef(null)
  const card2Ref = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      ;[card1Ref, card2Ref].forEach((ref) => {
        if (!ref.current) return
        const img = ref.current.querySelector('img')
        if (!img) return
        const speed = parseFloat(img.dataset.parallaxSpeed) || 0.05
        const rect = ref.current.getBoundingClientRect()
        const offset = rect.top + scrolled
        const visible =
          scrolled + window.innerHeight > offset &&
          scrolled < offset + rect.height
        if (visible) {
          const yPos = -((scrolled - offset) * speed)
          img.style.transform = `translateY(${yPos}px) scale(1.15)`
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="showcase-section scroll-reveal" id="story">
      <div className="section-header">
        <h2 className="text-headline-lg">Cinematic Kitchen</h2>
        <div className="section-divider" />
      </div>

      <div className="showcase-grid">
        <div className="showcase-card fluid-card" ref={card1Ref}>
          <img
            src={IMG.kadhaiPaneer}
            alt="Shahi Kadhai Paneer"
            data-parallax-speed="0.05"
          />
          <div className="showcase-card-overlay">
            <div className="showcase-card-info">
              <span className="showcase-card-label">Heritage Recipe</span>
              <h3 className="showcase-card-title">Shahi Kadhai Paneer</h3>
              <p className="showcase-card-desc">
                Wok-tossed cottage cheese with bell peppers and house-ground
                spices.
              </p>
            </div>
          </div>
        </div>

        <div
          className="showcase-card showcase-card-offset fluid-card"
          ref={card2Ref}
        >
          <img
            src={IMG.dalMakhani}
            alt="Dal Makhani"
            data-parallax-speed="0.08"
          />
          <div className="showcase-card-overlay">
            <div className="showcase-card-info">
              <span className="showcase-card-label">Slow Cooked</span>
              <h3 className="showcase-card-title">Dal Makhani</h3>
              <p className="showcase-card-desc">
                Simmered for 24 hours on charcoal for that deep, smoky essence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Featured Carousel ──────────────────────── */
function FeaturedCarousel() {
  const { menuSections } = useAdmin()
  const allItems = menuSections.flatMap(s => s.items)
  const featuredItemsFromData = allItems.filter(i => i.featured && i.image).slice(0, 3)
  const FEATURED_DISHES = featuredItemsFromData.length > 0 ? featuredItemsFromData.map(i => ({
    title: i.name,
    desc: i.description,
    img: i.image,
  })) : [
    { title: 'Dal Makhani', desc: 'Slow cooked', img: IMG.dalMakhani }
  ]

  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const progressRef = useRef(null)
  const timerRef = useRef(null)

  const dish = FEATURED_DISHES[index] || FEATURED_DISHES[0]

  const resetProgress = useCallback(() => {
    const bar = progressRef.current
    if (!bar) return
    bar.style.transition = 'none'
    bar.style.width = '0%'
    // Force reflow
    void bar.offsetWidth
    bar.style.transition = `width ${CAROUSEL_DURATION}ms linear`
    bar.style.width = '100%'
  }, [])

  const advance = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % FEATURED_DISHES.length)
      setFading(false)
    }, 400)
  }, [])

  useEffect(() => {
    if (FEATURED_DISHES.length <= 1) return
    resetProgress()
    timerRef.current = setInterval(advance, CAROUSEL_DURATION)
    return () => clearInterval(timerRef.current)
  }, [advance, resetProgress, FEATURED_DISHES.length])

  // Reset progress bar when index changes
  useEffect(() => {
    resetProgress()
  }, [index, resetProgress])

  return (
    <section className="featured-section scroll-reveal" id="featured">
      <div className="featured-layout">
        <div className="featured-image-wrap">
          <div className="featured-image-card fluid-card">
            <img
              src={dish.img}
              alt={dish.title}
              style={{ opacity: fading ? 0 : 1 }}
            />
            {FEATURED_DISHES.length > 1 && (
              <div className="progress-bar-track">
                <div className="progress-bar-fill" ref={progressRef} />
              </div>
            )}
          </div>
        </div>

        <div className="featured-content">
          <div className="featured-label">
            <span className="material-symbols-outlined icon-filled">stars</span>
            <span className="featured-label-text">
              Chef&apos;s Signature Selection
            </span>
          </div>

          <div
            className="featured-text"
            style={{ opacity: fading ? 0 : 1 }}
          >
            <h2 className="featured-title text-headline-lg">{dish.title}</h2>
            <p className="featured-desc text-body-lg">{dish.desc}</p>
          </div>

          <div className="featured-stats">
            <div>
              <p className="featured-stat-value text-headline-md">100%</p>
              <p className="featured-stat-label">Natural Ingredients</p>
            </div>
            <div className="featured-stat-divider" />
            <div>
              <p className="featured-stat-value text-headline-md">Zero</p>
              <p className="featured-stat-label">Preservatives</p>
            </div>
          </div>

          <div className="featured-footer">
            <a
              href="#/menu"
              className="btn-primary glow-button"
              style={{ padding: '16px 40px', fontSize: '14px' }}
            >
              Menu
            </a>
            {FEATURED_DISHES.length > 1 && (
              <div className="carousel-dots">
                {FEATURED_DISHES.map((_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === index ? 'active' : ''}`}
                    onClick={() => {
                      clearInterval(timerRef.current)
                      setFading(true)
                      setTimeout(() => {
                        setIndex(i)
                        setFading(false)
                        timerRef.current = setInterval(advance, CAROUSEL_DURATION)
                      }, 400)
                    }}
                    aria-label={`View ${FEATURED_DISHES[i].title}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Menu Highlights ────────────────────────── */
function MenuHighlights({ onViewFullMenu }) {
  const { menuSections } = useAdmin()
  return (
    <section className="menu-section scroll-reveal" id="menu">
      <div className="menu-header">
        <div className="menu-header-text">
          <h2 className="text-headline-lg">Our Menu</h2>
          <p className="text-body-lg">
            From smoky tandoori specials to creamy curries — every dish is
            crafted with organic ingredients and generations of culinary wisdom.
          </p>
        </div>
        <button
          onClick={onViewFullMenu}
          className="btn-primary glow-button"
          style={{ padding: '14px 32px', fontSize: '13px' }}
        >
          View Full Menu
        </button>
      </div>

      <div className="menu-categories">
        {menuSections
          .filter(cat => cat.items && cat.items.length > 0)
          .slice(0, 4)
          .map((cat) => (
          <div key={cat.name} className="menu-category-card glass-panel fluid-card">
            <div className="menu-category-header">
              <div className="menu-category-icon">
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <h3 className="menu-category-title">{cat.name}</h3>
            </div>
            <div className="menu-items-list">
              {cat.items.slice(0, 10).map((item) => (
                <div key={item.name} className="menu-item">
                  <span className="menu-item-name">{item.name}</span>
                  <span className="menu-item-price">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Combos */}
      {menuSections.find(s => s.id === 'combos') && (
        <div className="combos-banner" id="combos">
          <div className="section-header" style={{ marginBottom: '32px' }}>
            <h2 className="text-headline-lg" style={{ fontSize: '32px' }}>
              Value Combos
            </h2>
            <div className="section-divider" />
          </div>
          <div className="combos-inner">
            {menuSections.find(s => s.id === 'combos').items.slice(0, 6).map((combo) => (
              <div key={combo.name} className="combo-chip">
                <div>
                  <div className="combo-chip-name">{combo.name}</div>
                  {combo.description && (
                    <div className="combo-chip-desc">{combo.description}</div>
                  )}
                </div>
                <span className="combo-chip-price">₹{combo.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/* ── Farm to Tandoor ────────────────────────── */
function FarmToTandoor() {
  return (
    <section className="features-section scroll-reveal">
      <div className="features-header">
        <h2 className="text-headline-lg">Farm to Tandoor</h2>
        <p className="text-body-lg">
          At Veggies Kitchen, we believe luxury starts at the source. We partner
          exclusively with sustainable organic farms that respect the earth.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card glass-panel fluid-card">
          <div className="feature-icon">
            <span className="material-symbols-outlined">local_shipping</span>
          </div>
          <h4>Daily Sourcing</h4>
          <p>
            Vegetables arrive at our kitchen before sunrise, ensuring peak
            nutrient density and flavor.
          </p>
        </div>

        <div className="feature-card glass-panel fluid-card">
          <div className="feature-icon">
            <span className="material-symbols-outlined">
              temp_preferences_custom
            </span>
          </div>
          <h4>Authentic Clay Tandoors</h4>
          <p>
            Traditional wood-fired clay ovens provide that unmistakable smoky
            essence in every bite.
          </p>
        </div>

        <div className="feature-image-card fluid-card">
          <img
            src={IMG.spices}
            alt="Authentic stone grinding of spices"
          />
          <div className="feature-image-label">
            <p>Ancient Techniques</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA Banner ─────────────────────────────── */
function CTABanner() {
  return (
    <section className="cta-section scroll-reveal">
      <div className="cta-card fluid-card">
        <div className="cta-decor" />
        <div className="cta-content">
          <h2>Ready for a Culinary Voyage?</h2>
          <p>
            Join us in redefining plant-based dining. From our kitchen to your
            table, experience cinematic flavors that stay with you.
          </p>
          <div className="cta-badges">
            <div className="cta-badge">
              <span className="material-symbols-outlined">verified</span>
              <span>Hygienic Kitchen</span>
            </div>
            <div className="cta-badge">
              <span className="material-symbols-outlined">bolt</span>
              <span>Swift Delivery</span>
            </div>
          </div>
        </div>
        <div className="cta-action">
          <a
            href="#/menu"
            className="btn-cta"
          >
            Explore Menu
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────── */
function Footer() {
  return (
    <footer className="global-contact-footer" id="contact">
      <div className="footer-contact-details">
        <a href="mailto:shivskukreja@gmail.com" className="footer-contact-item">
          <span className="material-symbols-outlined">mail</span>
          shivskukreja@gmail.com
        </a>
        <a href="tel:+919811797407" className="footer-contact-item">
          <span className="material-symbols-outlined">call</span>
          +91 98117 97407
        </a>
        <div className="footer-contact-item address-item">
          <span className="material-symbols-outlined">location_on</span>
          <span>
            Gurunank Market, Lajpat Nagar 4,<br />
            Near Moolchand Metro, New Delhi
          </span>
        </div>
      </div>
    </footer>
  )
}


/* ══════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════ */
import { CartProvider, useCart } from './CartContext'
import { LocationProvider } from './LocationContext'
import { BlogProvider } from './BlogContext'
import { AdminProvider, useAdmin, BackgroundMedia } from './AdminContext'
import { AuthProvider, useAuth } from './AuthContext'
import CheckoutPage from './CheckoutPage'
import AccountPage from './AccountPage'
import PrivacyPolicy from './PrivacyPolicy'
import BlogsPage from './BlogsPage'
import WriteBlogPage from './WriteBlogPage'
import AdminDashboard from './AdminDashboard'
import OrdersPage from './OrdersPage'
import SearchPage from './SearchPage'
import OrderTrackingPage from './OrderTrackingPage'
import OTPLoginPage from './OTPLoginPage'
import OnboardingCarousel from './OnboardingCarousel'

export default function App() {
  /* ── Routing state ──────────────────────────────────────────────────────── */
  const [currentPage, setCurrentPage] = useState('home')
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  /* ── Native startup: body classes, onboarding check ────────────────────── */
  useEffect(() => {
    // Add is-native / is-android CSS classes for conditional styling
    addBodyClass()

    // Check if first launch (native only)
    if (isNative) {
      hasSeenOnboarding().then(seen => {
        if (!seen) setShowOnboarding(true)
      })
    }
  }, [])

  /* ── Hash-based routing ─────────────────────────────────────────────────── */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#/menu') { setCurrentPage('menu'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/orders') { setCurrentPage('orders'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/checkout') { setCurrentPage('checkout'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/account') { setCurrentPage('account'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/privacy') { setCurrentPage('privacy'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/blogs') { setCurrentPage('blogs'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/write-blog') { setCurrentPage('write-blog'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/admin') { setCurrentPage('admin'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/search') { setCurrentPage('search'); window.scrollTo({ top: 0 }) }
      else if (hash === '#/login') { setCurrentPage('login'); window.scrollTo({ top: 0 }) }
      else if (hash.startsWith('#/orders/')) {
        const id = hash.replace('#/orders/', '')
        setTrackingOrderId(id)
        setCurrentPage('track')
        window.scrollTo({ top: 0 })
      }
      else if (hash === '#/' || hash === '') { setCurrentPage('home'); window.scrollTo({ top: 0 }) }
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  /* ── Android hardware back button ───────────────────────────────────────── */
  useEffect(() => {
    if (!isNative) return
    let cleanup = () => {}
    import('@capacitor/app').then(({ App: CapApp }) => {
      const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (currentPage !== 'home') {
          // Navigate back one level
          window.history.back()
        } else {
          // On home screen — minimize app instead of exiting
          CapApp.minimizeApp()
        }
      })
      cleanup = () => listener.then(l => l.remove())
    })
    return () => cleanup()
  }, [currentPage])

  /* ── Deep link routing (native) ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isNative) return
    const navigate = (page, id) => {
      if (id) {
        setTrackingOrderId(id)
        setCurrentPage('track')
      } else {
        window.location.hash = `#/${page}`
      }
    }
    initDeepLinks(navigate)
  }, [])

  /* ── Smooth Scroll & GSAP ───────────────────────────────────────────────── */
  useEffect(() => {
    // Disable Lenis on native — Capacitor WebView handles momentum scrolling natively
    if (isNative) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    })
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  useGSAP(() => {
    if (currentPage !== 'home') return
    const elements = gsap.utils.toArray('.scroll-reveal')
    elements.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('revealed'),
        onLeaveBack: () => el.classList.remove('revealed')
      })
    })
    gsap.utils.toArray('.showcase-card img, .feature-image-card img').forEach((img) => {
      gsap.to(img, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      })
    })
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh(true))
    return () => {
      cancelAnimationFrame(rafId)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [currentPage])

  /* ── Navigation helpers ─────────────────────────────────────────────────── */
  const goMenu    = (e) => { if (e) e.preventDefault(); window.location.hash = '#/menu' }
  const goAccount = (e) => { if (e) e.preventDefault(); window.location.hash = '#/account' }

  const handleNavigate = (page, id) => {
    if (page === 'track' && id) {
      setTrackingOrderId(id)
      window.location.hash = `#/orders/${id}`
    } else if (page === 'login') {
      window.location.hash = '#/login'
    } else if (page === 'orders') {
      window.location.hash = '#/orders'
    } else if (page === 'search') {
      window.location.hash = '#/search'
    }
  }

  /* ── Onboarding overlay ─────────────────────────────────────────────────── */
  if (showOnboarding) {
    return <OnboardingCarousel onComplete={() => setShowOnboarding(false)} />
  }

  const noHeader = currentPage === 'admin' || currentPage === 'search' ||
                   currentPage === 'track' || currentPage === 'login'
  const noFooter = currentPage === 'admin' || currentPage === 'search' ||
                   currentPage === 'track' || currentPage === 'login'

  // Pages where floating cart bar should NOT show
  const noCartBar = currentPage === 'checkout' || currentPage === 'search' ||
                    currentPage === 'track' || currentPage === 'login' || currentPage === 'admin'

  return (
    <AuthProvider>
      <AdminProvider>
        <BlogProvider>
          <CartProvider>
            <LocationProvider>
              {/* Splash screen manager (native only) */}
              <SplashHandler />

              {/* ── Header: Native App Bar vs Web Header ─── */}
              {isNative ? (
                <NativeAppBar
                  onSearchClick={() => { window.location.hash = '#/search' }}
                  onNotificationClick={() => {}}
                />
              ) : (
                !noHeader && <Header currentPage={currentPage} setCurrentPage={setCurrentPage} onAccountClick={goAccount} />
              )}

              {/* ── Page Content ────────────────────────── */}
              {currentPage === 'home' ? (
                isNative ? (
                  <main><NativeHomePage onNavigate={handleNavigate} /></main>
                ) : (
                  <main>
                    <Hero />
                    <CinematicShowcase />
                    <FeaturedCarousel />
                    <MenuHighlights onViewFullMenu={goMenu} />
                    <FarmToTandoor />
                    <CTABanner />
                  </main>
                )
              ) : currentPage === 'menu' ? (
                <main><MenuPage /></main>
              ) : currentPage === 'account' ? (
                <main><AccountPage onNavigate={handleNavigate} /></main>
              ) : currentPage === 'privacy' ? (
                <main><PrivacyPolicy /></main>
              ) : currentPage === 'blogs' ? (
                <main><BlogsPage /></main>
              ) : currentPage === 'write-blog' ? (
                <main><WriteBlogPage /></main>
              ) : currentPage === 'admin' ? (
                <main><AdminDashboard /></main>
              ) : currentPage === 'orders' ? (
                <main><OrdersPage onTrack={(id) => handleNavigate('track', id)} /></main>
              ) : currentPage === 'checkout' ? (
                <main><CheckoutPage /></main>
              ) : currentPage === 'search' ? (
                <SearchPage />
              ) : currentPage === 'track' ? (
                <OrderTrackingPage orderId={trackingOrderId} />
              ) : currentPage === 'login' ? (
                <OTPLoginPage onSuccess={() => { window.location.hash = '#/' }} />
              ) : (
                isNative ? (
                  <main><NativeHomePage onNavigate={handleNavigate} /></main>
                ) : (
                  <main><Hero /></main>
                )
              )}

              {/* ── Floating Cart Bar (native only, above tab bar) ── */}
              {isNative && !noCartBar && <FloatingCartBar />}

              {/* ── Footer (web only) ──────────────────── */}
              {!isNative && !noFooter && <Footer />}
            </LocationProvider>
          </CartProvider>
        </BlogProvider>
      </AdminProvider>
    </AuthProvider>
  )
}
