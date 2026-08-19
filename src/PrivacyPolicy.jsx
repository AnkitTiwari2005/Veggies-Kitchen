import React from 'react';
import { useAdmin, BackgroundMedia } from './AdminContext';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const { menuBackdrop } = useAdmin();
  
  return (
    <div className="privacy-page" style={{ position: 'relative', minHeight: '100vh', paddingTop: '100px', paddingBottom: '64px' }}>
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} />
        <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
      </div>

      <div className="privacy-container glass-panel">
        <h1 className="text-display-md text-primary" style={{ marginBottom: '32px', textAlign: 'center' }}>Privacy Policy</h1>
        
        <div className="privacy-content text-body-lg text-on-surface-variant">
          <section className="privacy-section">
            <h2 className="text-headline-sm text-secondary">1. Information We Collect</h2>
            <p>At Veggies Kitchen, we collect information to provide better services to all our users. This includes your Name, Email Address, Contact Number, and Delivery Location/Addresses.</p>
          </section>

          <section className="privacy-section">
            <h2 className="text-headline-sm text-secondary">2. Use of Email and Phone Number</h2>
            <p>We use your email address and phone number exclusively for order tracking, confirmation, and critical updates regarding your delivery. We respect your inbox and will not send promotional spam without your explicit consent.</p>
          </section>

          <section className="privacy-section">
            <h2 className="text-headline-sm text-secondary">3. Location Data</h2>
            <p>Your location data (street address, city, state, pincode) is strictly utilized to process your delivery orders accurately and efficiently. We may also use generalized location data to recommend nearby specialties or optimize delivery routes.</p>
          </section>

          <section className="privacy-section">
            <h2 className="text-headline-sm text-secondary">4. Data for AI &amp; Training</h2>
            <p>We do not use your personal identifiable information (PII) to train machine learning models or AI algorithms. Any data utilized for improving our recommendation engine is fully anonymized and aggregated to protect your identity.</p>
          </section>
          
          <section className="privacy-section">
            <h2 className="text-headline-sm text-secondary">5. Data Protection</h2>
            <p>Your data is secured using industry-standard encryption protocols. We do not sell or share your personal data with third-party marketers.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
