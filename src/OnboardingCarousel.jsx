import { useState, useEffect, useRef } from 'react'
import './OnboardingCarousel.css'
import { saveOnboardingSeen, hasSeenOnboarding } from './services/storage'

/* ── SVG Illustrations (replacing emojis) ─────────────────────── */
const FreshLeafIllustration = () => (
  <svg viewBox="0 0 240 240" width="220" height="220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="100" fill="rgba(76,175,80,0.08)"/>
    <circle cx="120" cy="120" r="70" fill="rgba(76,175,80,0.1)"/>
    {/* Plate */}
    <ellipse cx="120" cy="155" rx="65" ry="12" fill="rgba(0,0,0,0.15)"/>
    <circle cx="120" cy="130" r="55" fill="#1a2e1a"/>
    <circle cx="120" cy="130" r="50" fill="#1B5E20"/>
    {/* Leaf large */}
    <path d="M120 80 C90 95 75 115 95 145 C105 160 135 165 145 150 C165 125 155 90 120 80Z" fill="#4CAF50"/>
    <path d="M120 80 L125 145" stroke="#81C784" strokeWidth="2" strokeLinecap="round"/>
    <path d="M110 110 Q120 105 132 112" stroke="#81C784" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M106 125 Q120 118 135 127" stroke="#81C784" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Small leaves */}
    <path d="M85 100 C75 90 65 95 72 110 C76 118 88 116 85 100Z" fill="#388E3C"/>
    <path d="M155 108 C168 98 175 105 165 118 C160 124 150 120 155 108Z" fill="#388E3C"/>
    {/* Sparkles */}
    <circle cx="80" cy="70" r="3" fill="#A5D6A7" opacity="0.8"/>
    <circle cx="165" cy="68" r="2" fill="#A5D6A7" opacity="0.6"/>
    <circle cx="170" cy="90" r="4" fill="#81C784" opacity="0.5"/>
    <circle cx="75" cy="155" r="2.5" fill="#A5D6A7" opacity="0.7"/>
    {/* Stars */}
    <path d="M60 85 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#FFB300" opacity="0.7"/>
    <path d="M172 145 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5Z" fill="#FFB300" opacity="0.5"/>
  </svg>
)

const DeliveryIllustration = () => (
  <svg viewBox="0 0 240 240" width="220" height="220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="100" fill="rgba(76,175,80,0.08)"/>
    {/* Road */}
    <ellipse cx="120" cy="175" rx="90" ry="12" fill="rgba(0,0,0,0.15)"/>
    {/* Bike body */}
    <rect x="55" y="130" width="130" height="38" rx="10" fill="#1B5E20"/>
    {/* Wheels */}
    <circle cx="85" cy="170" r="18" fill="#222" stroke="#4CAF50" strokeWidth="3"/>
    <circle cx="85" cy="170" r="8" fill="#4CAF50"/>
    <circle cx="160" cy="170" r="18" fill="#222" stroke="#4CAF50" strokeWidth="3"/>
    <circle cx="160" cy="170" r="8" fill="#4CAF50"/>
    {/* Box / food container */}
    <rect x="90" y="110" width="60" height="40" rx="6" fill="#2E7D32" stroke="#4CAF50" strokeWidth="1.5"/>
    <path d="M90 122 h60" stroke="#4CAF50" strokeWidth="1" strokeDasharray="4 3"/>
    <path d="M120 110 v40" stroke="#4CAF50" strokeWidth="1" strokeDasharray="4 3"/>
    {/* Rider */}
    <circle cx="75" cy="118" r="14" fill="#388E3C"/>
    {/* Helmet */}
    <path d="M64 115 Q75 100 86 115 Q86 108 75 106 Q64 108 64 115Z" fill="#1B5E20"/>
    {/* Speed lines */}
    <path d="M30 135 h22" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M22 148 h18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <path d="M28 160 h14" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    {/* Clock */}
    <circle cx="185" cy="80" r="22" fill="#111" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M185 68 v14 l8 8" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="185" y="108" textAnchor="middle" fontSize="10" fill="#4CAF50" fontWeight="700">30min</text>
  </svg>
)

const TrackingIllustration = () => (
  <svg viewBox="0 0 240 240" width="220" height="220" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="120" r="100" fill="rgba(76,175,80,0.08)"/>
    {/* Map card */}
    <rect x="35" y="60" width="170" height="130" rx="16" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5"/>
    {/* Map lines */}
    <path d="M55 100 Q90 80 120 100 Q150 120 185 100" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M55 120 Q90 140 120 120 Q150 100 185 120" stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round"/>
    <path d="M90 70 v120" stroke="#2a2a2a" strokeWidth="1.5"/>
    <path d="M150 70 v120" stroke="#2a2a2a" strokeWidth="1.5"/>
    {/* Route */}
    <path d="M70 165 Q100 140 120 150 Q140 160 170 130" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4"/>
    {/* Start dot */}
    <circle cx="70" cy="165" r="7" fill="#4CAF50"/>
    <circle cx="70" cy="165" r="3" fill="white"/>
    {/* Pin destination */}
    <path d="M170 130 C170 120 158 108 158 108 C158 108 146 120 146 130 C146 137 152 142 158 142 C164 142 170 137 170 130Z" fill="#FF5722"/>
    <circle cx="158" cy="130" r="5" fill="white"/>
    {/* Pulsing ring */}
    <circle cx="158" cy="130" r="16" stroke="#FF5722" strokeWidth="2" opacity="0.4"/>
    <circle cx="158" cy="130" r="24" stroke="#FF5722" strokeWidth="1" opacity="0.2"/>
    {/* Phone */}
    <rect x="95" y="85" width="50" height="36" rx="5" fill="#111" stroke="#333" strokeWidth="1"/>
    <text x="120" y="100" textAnchor="middle" fontSize="8" fill="#4CAF50" fontWeight="700">LIVE</text>
    <text x="120" y="112" textAnchor="middle" fontSize="7" fill="#888">On the way...</text>
  </svg>
)

const SLIDES = [
  {
    id: 1,
    Illustration: FreshLeafIllustration,
    title: 'Fresh & Pure',
    subtitle: 'Restaurant-quality vegetarian food made with farm-fresh ingredients, delivered to your door.',
    accent: '#4CAF50',
  },
  {
    id: 2,
    Illustration: DeliveryIllustration,
    title: '30-Min Delivery',
    subtitle: 'Hot, fresh food delivered in 30 minutes — or your next order is on us.',
    accent: '#FF9800',
  },
  {
    id: 3,
    Illustration: TrackingIllustration,
    title: 'Live Tracking',
    subtitle: 'Track your order in real-time from kitchen to your doorstep.',
    accent: '#FF5722',
  },
]

export default function OnboardingCarousel({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    const checkSeen = async () => {
      const seen = await hasSeenOnboarding()
      if (seen) {
        onComplete()
      } else {
        requestAnimationFrame(() => setIsVisible(true))
      }
    }
    checkSeen()
  }, [onComplete])

  if (!isVisible) return null

  const goTo = (index) => {
    if (animating || index < 0 || index >= SLIDES.length) return
    setAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setAnimating(false), 400)
  }

  const handleNext = async () => {
    if (currentSlide === SLIDES.length - 1) {
      setIsVisible(false)
      await saveOnboardingSeen()
      setTimeout(onComplete, 300)
    } else {
      goTo(currentSlide + 1)
    }
  }

  const handleSkip = async () => {
    setIsVisible(false)
    await saveOnboardingSeen()
    setTimeout(onComplete, 200)
  }

  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX }
  const handleTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX }
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50 && currentSlide < SLIDES.length - 1) goTo(currentSlide + 1)
    if (diff < -50 && currentSlide > 0) goTo(currentSlide - 1)
  }

  const slide = SLIDES[currentSlide]
  const isLast = currentSlide === SLIDES.length - 1

  return (
    <div
      className={`ob-container${isVisible ? ' ob-visible' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      {!isLast && (
        <button className="ob-skip" onClick={handleSkip}>Skip</button>
      )}

      {/* Slide track */}
      <div className="ob-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div key={s.id} className="ob-slide" aria-hidden={i !== currentSlide}>
            <div className="ob-illustration">
              <s.Illustration />
            </div>
          </div>
        ))}
      </div>

      {/* Text area */}
      <div className="ob-text-area">
        <h2
          className="ob-title"
          key={`title-${currentSlide}`}
          style={{ '--accent': slide.accent }}
        >
          {slide.title}
        </h2>
        <p className="ob-subtitle" key={`sub-${currentSlide}`}>
          {slide.subtitle}
        </p>
      </div>

      {/* Footer */}
      <div className="ob-footer">
        {/* Dots */}
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`ob-dot${i === currentSlide ? ' active' : ''}`}
              style={i === currentSlide ? { background: slide.accent } : {}}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA button */}
        <button
          className="ob-cta"
          onClick={handleNext}
          style={{ background: slide.accent }}
        >
          {isLast ? 'Get Started' : 'Next'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
