import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { isNative } from './hooks/useCapacitor'
import { saveToken, getToken, removeToken, saveRefreshToken, getRefreshToken, removeRefreshToken, saveUser, getUser, removeUser, clearAll } from './services/storage'
import { API_BASE } from './config'

const AuthContext = createContext(null)

// ─── Token helpers ────────────────────────────────────────────────────────────
function parseJWT(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = parseJWT(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000 - 60_000 // 60s buffer
}

// ─── API helper ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = await getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options, headers })
  return res
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const refreshTimer = useRef(null)

  // ── Schedule automatic JWT refresh ─────────────────────────────────────────
  const scheduleRefresh = useCallback(async () => {
    if (!isNative) return
    const token = await getToken()
    if (!token) return
    const payload = parseJWT(token)
    if (!payload?.exp) return
    const msUntilExpiry = payload.exp * 1000 - Date.now() - 60_000
    if (msUntilExpiry <= 0) {
      await refreshJWT()
      return
    }
    clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(refreshJWT, Math.min(msUntilExpiry, 24 * 60 * 60 * 1000))
  }, [])

  // ── Refresh JWT ─────────────────────────────────────────────────────────────
  const refreshJWT = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken()
      if (!refreshToken) return false
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) {
        await clearAll()
        setUser(null)
        return false
      }
      const data = await res.json()
      await saveToken(data.token)
      if (data.refreshToken) await saveRefreshToken(data.refreshToken)
      scheduleRefresh()
      return true
    } catch {
      return false
    }
  }, [scheduleRefresh])

  // ── Restore session on app launch ───────────────────────────────────────────
  useEffect(() => {
    async function restore() {
      setLoading(true)
      try {
        if (isNative) {
          // Mobile: restore from stored JWT
          const token = await getToken()
          if (token) {
            if (isTokenExpired(token)) {
              const refreshed = await refreshJWT()
              if (!refreshed) { setLoading(false); return }
            }
            // Fetch fresh user from backend
            const res = await apiFetch('/api/auth/me')
            if (res.ok) {
              const data = await res.json()
              if (data.user) {
                setUser(data.user)
                await saveUser(data.user)
                scheduleRefresh()
              } else {
                // Token valid but user not found — use cached
                const cached = await getUser()
                if (cached) setUser(cached)
              }
            } else {
              // Use cached user if network fails
              const cached = await getUser()
              if (cached) setUser(cached)
            }
          }
        } else {
          // Web: use session cookie (existing behaviour)
          const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setUser(data.user || null)
          }
        }
      } catch (err) {
        console.error('Auth restore error:', err)
        // On network failure, use cached user so app works offline
        if (isNative) {
          const cached = await getUser()
          if (cached) setUser(cached)
        }
      } finally {
        setLoading(false)
      }
    }
    restore()
    return () => clearTimeout(refreshTimer.current)
  }, [refreshJWT, scheduleRefresh])

  // ── Google OAuth login (web) ────────────────────────────────────────────────
  const login = useCallback(() => {
    window.location.href = `${API_BASE}/auth/google?returnTo=${encodeURIComponent(window.location.hash || '#/')}`
  }, [])

  // ── Email + password login (mobile & web) ───────────────────────────────────
  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      if (isNative) {
        await saveToken(data.token)
        await saveRefreshToken(data.refreshToken)
        await saveUser(data.user)
        scheduleRefresh()
      }
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [scheduleRefresh])

  // ── Register with email + password ─────────────────────────────────────────
  const registerWithEmail = useCallback(async (name, email, password) => {
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      if (isNative) {
        await saveToken(data.token)
        await saveRefreshToken(data.refreshToken)
        await saveUser(data.user)
        scheduleRefresh()
      }
      setUser(data.user)
      return { success: true, user: data.user, isNewUser: true }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [scheduleRefresh])

  // ── Firebase Phone OTP verification ────────────────────────────────────────
  const loginWithOTP = useCallback(async (firebaseToken) => {
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'OTP verification failed')
      await saveToken(data.token)
      await saveRefreshToken(data.refreshToken)
      await saveUser(data.user)
      scheduleRefresh()
      setUser(data.user)
      return { success: true, user: data.user, isNewUser: data.isNewUser }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [scheduleRefresh])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      clearTimeout(refreshTimer.current)
      if (isNative) {
        // Remove FCM token from backend before clearing
        try {
          const { getItem } = await import('@capacitor/preferences').then(m => m.Preferences)
          const { value: fcmToken } = await getItem({ key: 'fcm_token' })
          if (fcmToken) {
            await apiFetch('/api/auth/fcm-token', {
              method: 'DELETE',
              body: JSON.stringify({ token: fcmToken }),
            })
          }
        } catch { /* silent */ }
        await clearAll()
      } else {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
      }
    } finally {
      setUser(null)
      setAuthError(null)
    }
  }, [])

  // ── Update user in state + storage ─────────────────────────────────────────
  const updateUser = useCallback(async (updates) => {
    try {
      const res = await apiFetch('/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Update failed')
      const data = await res.json()
      setUser(data.user)
      if (isNative) await saveUser(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  // ── Authenticated fetch helper (exposed to app) ─────────────────────────────
  const authFetch = useCallback(async (path, options = {}) => {
    return apiFetch(path, options)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      isAuthenticated: !!user,
      login,
      loginWithEmail,
      registerWithEmail,
      loginWithOTP,
      logout,
      updateUser,
      authFetch,
      setAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
