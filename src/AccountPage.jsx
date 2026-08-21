import { useState, useEffect } from 'react'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import { isNative } from './hooks/useCapacitor'
import { lightTap, mediumTap, successVibration, errorVibration } from './services/haptics'
import { initNotifications } from './services/notifications'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import './AccountPage.css'

// ── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Delivered: { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#4CAF50"/><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>, color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
  Cancelled: { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#f44336"/><path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>, color: '#f44336', bg: 'rgba(244,67,54,0.1)' },
  'Out for Delivery': { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11v10" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 17h2m4 0h2M14 13h3l3 4" stroke="#42a5f5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="17.5" r="1.5" fill="#42a5f5"/><circle cx="17.5" cy="17.5" r="1.5" fill="#42a5f5"/></svg>, color: '#42a5f5', bg: 'rgba(66,165,245,0.1)' },
  Preparing: { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6v-7.13z" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><line x1="9" y1="21" x2="9" y2="18" stroke="#FFA500" strokeWidth="1.5"/></svg>, color: '#FFA500', bg: 'rgba(255,165,0,0.1)' },
  Pending: { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#FFA500" strokeWidth="1.5"/><path d="M12 7v5l3 3" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round"/></svg>, color: '#FFA500', bg: 'rgba(255,165,0,0.1)' },
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Profile Photo ────────────────────────────────────────────────────────────
function ProfileAvatar({ user, onPhotoChange }) {
  const [uploading, setUploading] = useState(false)

  const avatarUrl = user.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1a2332&color=4CAF50&size=128&bold=true`

  async function pickPhoto() {
    if (!isNative) return
    lightTap()
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        width: 400,
        height: 400,
      })
      setUploading(true)
      const dataUrl = `data:image/jpeg;base64,${image.base64String}`
      await onPhotoChange(dataUrl)
      successVibration()
    } catch (err) {
      if (!err.message?.includes('cancelled')) {
        errorVibration()
        alert('Failed to update photo. Try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="profile-avatar-wrap">
      <div className="profile-avatar">
        <img src={avatarUrl} alt={user.name} />
        {uploading && <div className="avatar-uploading"><div className="mini-spinner" /></div>}
      </div>
      {isNative && (
        <button className="avatar-edit-btn" onClick={pickPhoto} aria-label="Change photo" disabled={uploading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="1.5"/><circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5"/></svg>
        </button>
      )}
    </div>
  )
}

// ── Delete Account Modal ─────────────────────────────────────────────────────
function DeleteAccountModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="#f44336" opacity="0.15" stroke="#f44336" strokeWidth="1.5"/><path d="M12 9v4M12 17h.01" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/></svg></div>
        <h2>Delete Account?</h2>
        <p>This will permanently delete your account and all your data. This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="modal-cancel-btn" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="modal-delete-btn" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="mini-spinner" /> : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notification Settings ────────────────────────────────────────────────────
function NotificationSettings({ authFetch }) {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isNative) return
    import('@capacitor/push-notifications').then(({ PushNotifications }) => {
      PushNotifications.checkPermissions().then(({ receive }) => {
        setEnabled(receive === 'granted')
      })
    })
  }, [])

  async function toggle() {
    if (!isNative) return
    lightTap()
    setLoading(true)
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')
      if (!enabled) {
        const { receive } = await PushNotifications.requestPermissions()
        if (receive === 'granted') {
          await initNotifications(authFetch)
          setEnabled(true)
          successVibration()
        }
      } else {
        // Can only guide user to settings to turn off — Android doesn't allow programmatic disable
        alert('To disable notifications, go to your device Settings → Apps → Veggies Kitchen → Notifications')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isNative) return null

  return (
    <div className="settings-item" onClick={toggle} style={{ cursor: 'pointer' }}>
      <div className="settings-item-label">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight:6}}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Order Notifications
      </div>
      <div className={`toggle-switch ${enabled ? 'on' : ''} ${loading ? 'loading' : ''}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AccountPage({ onNavigate }) {
  const { menuBackdrop } = useAdmin()
  const { user, login, logout, updateUser, authFetch } = useAuth()

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Load orders
  useEffect(() => {
    if (!user) return
    setLoadingOrders(true)
    authFetch('/api/orders/me')
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoadingOrders(false))
  }, [user])

  // ── Profile photo update
  async function handlePhotoChange(dataUrl) {
    const result = await updateUser({ profilePhoto: dataUrl })
    if (!result.success) throw new Error(result.error)
  }

  // ── Name edit
  function startEditName() {
    lightTap()
    setNameInput(user.name)
    setEditingName(true)
  }

  async function saveName() {
    if (!nameInput.trim() || nameInput === user.name) { setEditingName(false); return }
    setSavingName(true)
    const result = await updateUser({ name: nameInput.trim() })
    setSavingName(false)
    if (result.success) { successVibration(); setEditingName(false) }
    else { errorVibration(); alert(result.error || 'Failed to update name') }
  }

  // ── Delete account (Play Store compliance)
  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await authFetch('/api/users/me', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      successVibration()
      setShowDeleteModal(false)
      await logout()
    } catch (err) {
      errorVibration()
      alert(err.message || 'Could not delete account. Try again.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="account-page account-login-wall">
        {!isNative && (
          <div className="page-bg">
            <BackgroundMedia media={menuBackdrop} />
            <div className="page-overlay" />
          </div>
        )}
        <div className="login-wall-content" style={{marginTop:'-15vh'}}>
          <div className="login-wall-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M17 8C8 10 5.9 16.17 3.82 19.99a.5.5 0 00.7.65c.96-.51 2.57-1.39 4.21-1.39C15 19.25 19 13 19 9c0-5-5-7-5-7s2 1 3 6z" fill="#4CAF50"/>
              <path d="M12 3c0 0-2 3-2 6s1 5 2 6" stroke="#81C784" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to view your orders, track deliveries, and manage your account.</p>
          <button className="otp-primary-btn" onClick={() => { mediumTap(); onNavigate?.('login') || login() }}>
            {isNative ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight:6,verticalAlign:'middle'}}><rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>Sign In</>
            ) : 'Login with Google'}
          </button>
        </div>
      </div>
    )
  }

  // ── Logged in ─────────────────────────────────────────────────────────────
  return (
    <div className={`account-page ${isNative ? 'native' : ''}`}>
      {!isNative && (
        <div className="page-bg">
          <BackgroundMedia media={menuBackdrop} />
          <div className="page-overlay" />
        </div>
      )}

      {/* ── Profile Header ─────────────────────────────────────────── */}
      <section className="account-header">
        <ProfileAvatar user={user} onPhotoChange={handlePhotoChange} />
        <div className="account-profile-info">
          {editingName ? (
            <div className="name-edit-row">
              <input
                className="name-edit-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                autoFocus
                maxLength={60}
              />
              <button className="name-save-btn" onClick={saveName} disabled={savingName}>
                {savingName ? '...' : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <button className="name-cancel-btn" onClick={() => setEditingName(false)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#e6edf3" strokeWidth="2" strokeLinecap="round"/></svg></button>
            </div>
          ) : (
            <div className="name-row">
              <h1 className="account-name">{user.name}</h1>
              {isNative && (
                <button className="name-edit-btn" onClick={startEditName} aria-label="Edit name"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              )}
            </div>
          )}
          <div className="account-contact">
            {user.email && (
              <span className="account-contact-item">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><rect x="2" y="4" width="20" height="16" rx="2" stroke="#8b949e" strokeWidth="1.5"/><path d="M22 7l-10 7L2 7" stroke="#8b949e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span> {user.email}
              </span>
            )}
            {user.phone && (
              <span className="account-contact-item">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.66 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.74.3 1.53.52 2.35.66A2 2 0 0122 16.92z" stroke="#8b949e" strokeWidth="1.5"/></svg></span> {user.phone}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="account-body">
        {/* ── Recent Orders ───────────────────────────────────────────── */}
        <section className="account-card">
          <div className="account-card-header">
            <h2>Recent Orders</h2>
          </div>
          {loadingOrders ? (
            <div className="card-loading"><div className="mini-spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="card-empty">
              <span><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11v10" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 17h2m4 0h2M14 13h3l3 4" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="17.5" r="1.5" fill="#555"/><circle cx="17.5" cy="17.5" r="1.5" fill="#555"/></svg></span>
              <p>No orders yet. Place your first order!</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 5).map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending
                const title = order.items?.length > 0
                  ? `${order.items[0].name}${order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}`
                  : 'Order'
                return (
                  <div
                    key={order._id}
                    className="order-card"
                    onClick={() => { lightTap(); onNavigate?.('track', order._id) }}
                  >
                    <div className="order-card-main">
                      <div className="order-card-info">
                        <span className="order-card-title">{title}</span>
                        <span className="order-card-meta">{fmtDate(order.createdAt)} · {order.items?.length || 0} items</span>
                      </div>
                      <div className="order-card-right">
                        <span className="order-card-price">₹{Number(order.total).toFixed(0)}</span>
                        <span className={`order-status-badge ${cfg.cls}`}>{cfg.icon} {order.status}</span>
                      </div>
                    </div>
                    {isNative && (
                      <div className="order-card-track-hint">
                        Track order →
                      </div>
                    )}
                  </div>
                )
              })}
              {orders.length > 5 && (
                <button className="view-all-btn" onClick={() => { lightTap(); onNavigate?.('orders') }}>
                  View all {orders.length} orders →
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── Saved Addresses ─────────────────────────────────────────── */}
        {user.addresses && user.addresses.length > 0 && (
          <section className="account-card">
            <div className="account-card-header">
              <h2>Saved Addresses</h2>
            </div>
            <div className="address-list">
              {user.addresses.map((addr, idx) => (
                <div key={idx} className="address-item">
                  <span className="addr-idx-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4CAF50"/></svg></span>
                  <div className="addr-text">
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Settings ────────────────────────────────────────────────── */}
        <section className="account-card">
          <div className="account-card-header"><h2>Settings</h2></div>
          <div className="settings-list">
            <NotificationSettings authFetch={authFetch} />
            <div className="settings-item" onClick={() => { lightTap(); window.open('https://api.whatsapp.com/send/?phone=919811797407&text=Hi+Veggies+Kitchen!+I+need+help.', '_blank') }}>
              <div className="settings-item-label"><span className="settings-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span> Help & Support</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="account-chevron"><path d="M9 18l6-6-6-6" stroke="#484f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <a className="settings-item" href="#/privacy" onClick={() => lightTap()}>
              <div className="settings-item-label"><span className="settings-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span> Privacy Policy</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="account-chevron"><path d="M9 18l6-6-6-6" stroke="#484f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            {isNative && (
              <div
                className="settings-item danger-item"
                onClick={() => { lightTap(); setShowDeleteModal(true) }}
              >
                <div className="settings-item-label"><span className="settings-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" stroke="#f44336" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span> Delete Account</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="account-chevron"><path d="M9 18l6-6-6-6" stroke="#484f58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </div>
        </section>

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <button
          className="logout-btn"
          onClick={async () => { mediumTap(); await logout() }}
        >
          Sign Out
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDelete}
          onCancel={() => { lightTap(); setShowDeleteModal(false) }}
          loading={deleting}
        />
      )}
    </div>
  )
}
