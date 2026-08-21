import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { lightTap, successVibration, errorVibration } from './services/haptics'
import './OTPLoginPage.css'

// Firebase Phone Auth (only on native or if Firebase is configured)
async function getFirebaseAuth() {
  try {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    const firebaseConfig = {
      apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    }
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    return getAuth(app)
  } catch {
    return null
  }
}

const TABS = ['phone', 'email']

export default function OTPLoginPage({ onSuccess }) {
  const { loginWithOTP, loginWithEmail, registerWithEmail, authError, setAuthError } = useAuth()

  const [tab, setTab] = useState('phone')         // 'phone' | 'email'
  const [mode, setMode] = useState('login')        // 'login' | 'register'
  const [step, setStep] = useState('input')        // 'input' | 'otp'

  // Phone flow
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [confirmationResult, setConfirmationResult] = useState(null)
  const recaptchaRef = useRef(null)
  const recaptchaVerifier = useRef(null)
  const otpRefs = useRef([])

  // Email flow
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  // Clear errors on tab/mode switch
  useEffect(() => { setError(''); setAuthError?.('') }, [tab, mode])

  // OTP resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(n => n - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  // ── Phone: send OTP ─────────────────────────────────────────────────────────
  async function sendOTP() {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) { setError('Enter a valid 10-digit phone number'); errorVibration(); return }
    setLoading(true); setError('')
    try {
      const auth = await getFirebaseAuth()
      if (!auth) throw new Error('Firebase not configured. Please use email login.')

      const { RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth')

      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
          size: 'invisible',
          callback: () => {},
        })
      }

      const formattedPhone = `+91${cleaned.slice(-10)}`
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier.current)
      setConfirmationResult(result)
      setStep('otp')
      setResendCountdown(30)
      lightTap()
    } catch (err) {
      errorVibration()
      setError(err.message?.replace('Firebase: ', '') || 'Failed to send OTP. Try again.')
      recaptchaVerifier.current?.clear?.()
      recaptchaVerifier.current = null
    } finally {
      setLoading(false)
    }
  }

  // ── Phone: verify OTP ───────────────────────────────────────────────────────
  async function verifyOTP() {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); errorVibration(); return }
    setLoading(true); setError('')
    try {
      const credential = await confirmationResult.confirm(code)
      const firebaseToken = await credential.user.getIdToken()
      const result = await loginWithOTP(firebaseToken)
      if (result.success) {
        successVibration()
        onSuccess?.(result)
      } else {
        throw new Error(result.error || 'Verification failed')
      }
    } catch (err) {
      errorVibration()
      setError(err.message?.replace('Firebase: ', '') || 'Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Email: login / register ─────────────────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill all fields'); return }
    if (mode === 'register' && !name.trim()) { setError('Please enter your name'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const result = mode === 'login'
        ? await loginWithEmail(email, password)
        : await registerWithEmail(name, email, password)
      if (result.success) {
        successVibration()
        onSuccess?.(result)
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (err) {
      errorVibration()
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input handlers ──────────────────────────────────────────────────────
  function handleOtpInput(value, idx) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const updated = [...otp]
    updated[idx] = digit
    setOtp(updated)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (updated.every(d => d) && updated.join('').length === 6) {
      // Auto-verify when all digits entered
      setTimeout(verifyOTP, 100)
    }
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  return (
    <div className="otp-page">
      <div className="otp-inner">
        {/* ── Logo / Header ─────────────────────────────────────────── */}
        <div className="otp-logo">
          <span className="otp-logo-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M17 8C8 10 5.9 16.17 3.82 19.99a.5.5 0 00.7.65c.96-.51 2.57-1.39 4.21-1.39C15 19.25 19 13 19 9c0-5-5-7-5-7s2 1 3 6z" fill="#4CAF50"/><path d="M12 3c0 0-2 3-2 6s1 5 2 6" stroke="#81C784" strokeWidth="1" strokeLinecap="round"/></svg></span>
          <h1 className="otp-logo-name">Veggies Kitchen</h1>
          <p className="otp-tagline">Fresh, healthy food — delivered fast</p>
        </div>

        {step === 'input' && (
          <>
            {/* ── Tab selector ──────────────────────────────────────── */}
            <div className="otp-tabs">
              {TABS.map(t => (
                <button
                  key={t}
                  className={`otp-tab ${tab === t ? 'active' : ''}`}
                  onClick={() => { lightTap(); setTab(t); setStep('input') }}
                >
                  {t === 'phone' ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight:4,verticalAlign:'middle'}}><rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>Phone</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight:4,verticalAlign:'middle'}}><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Email</>}
                </button>
              ))}
            </div>

            {tab === 'phone' ? (
              /* ── Phone input ─────────────────────────────────────── */
              <div className="otp-form">
                <p className="otp-hint">We'll send you a one-time password</p>
                <div className="phone-input-wrap">
                  <div className="country-code">+91</div>
                  <input
                    type="tel"
                    className="phone-input"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel-national"
                    onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  />
                </div>
                {error && <div className="otp-error">{error}</div>}
                <button className="otp-primary-btn" onClick={sendOTP} disabled={loading || phone.replace(/\D/g,'').length < 10}>
                  {loading ? <span className="btn-spinner" /> : 'Send OTP'}
                </button>
                <div ref={recaptchaRef} />
              </div>
            ) : (
              /* ── Email form ──────────────────────────────────────── */
              <form className="otp-form" onSubmit={handleEmailSubmit}>
                <div className="otp-mode-switch">
                  <button type="button" className={`mode-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { lightTap(); setMode('login') }}>Sign In</button>
                  <button type="button" className={`mode-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => { lightTap(); setMode('register') }}>Create Account</button>
                </div>
                {mode === 'register' && (
                  <input
                    type="text"
                    className="otp-text-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                )}
                <input
                  type="email"
                  className="otp-text-input"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <div className="password-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="otp-text-input"
                    placeholder="Password (min. 8 chars)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    minLength={8}
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                    {showPass ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="#888" strokeWidth="1.5"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#888" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="#888" strokeWidth="1.5"/></svg>
                    )}
                  </button>
                </div>
                {(error || authError) && <div className="otp-error">{error || authError}</div>}
                <button type="submit" className="otp-primary-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
            )}
          </>
        )}

        {step === 'otp' && (
          /* ── OTP verification ───────────────────────────────────── */
          <div className="otp-verify">
            <button className="otp-back" onClick={() => { lightTap(); setStep('input'); setOtp(['','','','','','']) }}>
              ← Back
            </button>
            <h2>Enter OTP</h2>
            <p>Sent to +91 {phone.replace(/\D/g,'').slice(-10)}</p>
            <div className="otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => otpRefs.current[idx] = el}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-box ${digit ? 'filled' : ''}`}
                  value={digit}
                  onChange={e => handleOtpInput(e.target.value, idx)}
                  onKeyDown={e => handleOtpKeyDown(e, idx)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            {error && <div className="otp-error">{error}</div>}
            <button className="otp-primary-btn" onClick={verifyOTP} disabled={loading || otp.some(d => !d)}>
              {loading ? <span className="btn-spinner" /> : 'Verify & Login'}
            </button>
            <div className="resend-row">
              {resendCountdown > 0 ? (
                <span className="resend-timer">Resend in {resendCountdown}s</span>
              ) : (
                <button className="resend-btn" onClick={() => { setStep('input'); setOtp(['','','','','','']) }}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        <p className="otp-terms">
          By continuing, you agree to our{' '}
          <a href="https://veggieskitchen.in/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
