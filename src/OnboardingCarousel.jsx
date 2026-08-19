import React, { useState, useRef, useEffect } from 'react';
import './OnboardingCarousel.css';
import { saveOnboardingSeen, hasSeenOnboarding } from './services/storage';

const slides = [
  {
    id: 1,
    icon: '🥗',
    title: 'Fresh & Healthy',
    subtitle: 'Restaurant-quality vegetarian food delivered to your door',
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Fast Delivery',
    subtitle: 'Hot food delivered in 30 minutes or your next order is free',
  },
  {
    id: 3,
    icon: '📍',
    title: 'Real-Time Tracking',
    subtitle: 'Track your order from kitchen to doorstep',
  },
];

export default function OnboardingCarousel({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const checkSeen = async () => {
      const seen = await hasSeenOnboarding();
      if (seen) {
        onComplete();
      } else {
        setIsVisible(true);
      }
    };
    checkSeen();
  }, [onComplete]);

  if (!isVisible) return null;

  const handleNext = async () => {
    if (currentSlide === slides.length - 1) {
      await saveOnboardingSeen();
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    await saveOnboardingSeen();
    onComplete();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      // Swipe left
      if (currentSlide < slides.length - 1) setCurrentSlide((prev) => prev + 1);
    }
    if (touchStartX.current - touchEndX.current < -50) {
      // Swipe right
      if (currentSlide > 0) setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="onboarding-container" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <button className="skip-button" onClick={handleSkip}>Skip</button>
      
      <div className="slides-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="slide">
            <div className="slide-icon">{slide.icon}</div>
            <h2 className="slide-title">{slide.title}</h2>
            <p className="slide-subtitle">{slide.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="onboarding-footer">
        <div className="dots-container">
          {slides.map((_, index) => (
            <div key={index} className={`dot ${index === currentSlide ? 'active' : ''}`} />
          ))}
        </div>
        <button className="next-button" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
