import { useState, useEffect, useRef } from 'react'
import { useAdmin, BackgroundMedia } from './AdminContext'
import { useAuth } from './AuthContext'
import { API_BASE } from './config'
import { isNative } from './hooks/useCapacitor'
import { lightTap, mediumTap, successVibration, errorVibration } from './services/haptics'
import { initNotifications } from './services/notifications'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import './AccountPage.css'

// ── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Delivered:        { icon: '✅', cls: 'status-delivered' },
  Cancelled:        { icon: '❌', cls: 'status-cancelled' },
  'Out for Delivery':{ icon: '🛵', cls: 'status-progress' },
  Preparing:        { icon: '👨‍🍳', cls: 'status-progress' },
  Pending:          { icon: '⏳', cls: 'status-progress' },
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
          📷
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
        <div className="modal-icon">⚠️</div>
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
        <span className="settings-icon">🔔</span>
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
        <div className="login-wall-content">
          <span className="login-wall-icon">🥗</span>
          <h1>Welcome Back</h1>
          <p>Sign in to view your orders, track deliveries, and manage your account.</p>
          <button className="otp-primary-btn" onClick={() => { mediumTap(); onNavigate?.('login') || login() }}>
            {isNative ? '📱 Sign In' : 'Login with Google'}
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
                {savingName ? '...' : '✓'}
              </button>
              <button className="name-cancel-btn" onClick={() => setEditingName(false)}>✕</button>
            </div>
          ) : (
            <div className="name-row">
              <h1 className="account-name">{user.name}</h1>
              {isNative && (
                <button className="name-edit-btn" onClick={startEditName} aria-label="Edit name">✏️</button>
              )}
            </div>
          )}
          <div className="account-contact">
            {user.email && (
              <span className="account-contact-item">
                <span>✉️</span> {user.email}
              </span>
            )}
            {user.phone && (
              <span className="account-contact-item">
                <span>📱</span> {user.phone}
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
              <span>🛵</span>
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
                  <span className="addr-idx-icon">📍</span>
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
              <div className="settings-item-label"><span className="settings-icon">💬</span> Help & Support</div>
              <span className="settings-chevron">›</span>
            </div>
            <a className="settings-item" href="#/privacy" onClick={() => lightTap()}>
              <div className="settings-item-label"><span className="settings-icon">🛡️</span> Privacy Policy</div>
              <span className="settings-chevron">›</span>
            </a>
            {isNative && (
              <div
                className="settings-item danger-item"
                onClick={() => { lightTap(); setShowDeleteModal(true) }}
              >
                <div className="settings-item-label"><span className="settings-icon">🗑️</span> Delete Account</div>
                <span className="settings-chevron">›</span>
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
