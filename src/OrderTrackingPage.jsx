import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { lightTap, successVibration } from './services/haptics'
import { format } from 'date-fns'
import './OrderTrackingPage.css'

const STATUS_STEPS = [
  { key: 'Pending',          label: 'Order Placed',      icon: '📋', desc: 'We received your order' },
  { key: 'Preparing',        label: 'Being Prepared',    icon: '👨‍🍳', desc: 'Our chefs are cooking your meal' },
  { key: 'Out for Delivery', label: 'Out for Delivery',  icon: '🛵', desc: 'Your order is on its way!' },
  { key: 'Delivered',        label: 'Delivered',          icon: '🎉', desc: 'Enjoy your meal!' },
]

const CANCELLED_STEP = { key: 'Cancelled', label: 'Cancelled', icon: '❌', desc: 'This order was cancelled' }

function getStepIndex(status) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status)
  return idx === -1 ? (status === 'Cancelled' ? -1 : 0) : idx
}

function EstimatedTime({ order }) {
  const created = new Date(order.createdAt)
  const eta = order.estimatedDelivery
    ? new Date(order.estimatedDelivery)
    : new Date(created.getTime() + 35 * 60_000)
  const now = new Date()
  const minsLeft = Math.max(0, Math.round((eta - now) / 60_000))
  const isDelivered = order.status === 'Delivered'
  if (isDelivered) return <div className="eta-chip delivered">✅ Delivered {format(created, 'h:mm a')}</div>
  if (order.status === 'Cancelled') return null
  return (
    <div className="eta-chip">
      ⏱ {minsLeft > 0 ? `~${minsLeft} mins away` : 'Arriving soon'}
    </div>
  )
}

export default function OrderTrackingPage({ orderId }) {
  const id = orderId
  const navigate = () => window.history.back()
  const { authFetch } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reordering, setReordering] = useState(false)

  // ── Fetch order ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function fetchOrder() {
      try {
        setLoading(true)
        const res = await authFetch(`/api/orders/${id}`)
        if (!res.ok) throw new Error(res.status === 404 ? 'Order not found' : 'Failed to load order')
        const data = await res.json()
        if (!cancelled) {
          const wasDelivered = order?.status !== 'Delivered' && data.status === 'Delivered'
          if (wasDelivered) successVibration()
          setOrder(data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrder()
    // Poll every 30s for live updates
    const poll = setInterval(fetchOrder, 30_000)
    return () => { cancelled = true; clearInterval(poll) }
  }, [id])

  async function handleReorder() {
    lightTap()
    setReordering(true)
    try {
      const res = await authFetch(`/api/orders/${id}/reorder`, { method: 'POST' })
      if (!res.ok) throw new Error('Reorder failed')
      const { items } = await res.json()
      // Store items and navigate to cart
      navigate('/#cart', { state: { reorderItems: items } })
    } catch {
      alert('Could not reorder. Please try again.')
    } finally {
      setReordering(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="otp-page tracking-page">
      <div className="tracking-header">
        <button className="tracking-back" onClick={() => navigate(-1)} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1>Order Status</h1>
      </div>
      <div className="tracking-loading">
        <div className="tracking-spinner" />
        <span>Loading order...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="tracking-page">
      <div className="tracking-header">
        <button className="tracking-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1>Order Status</h1>
      </div>
      <div className="tracking-error">
        <span>😕</span>
        <h3>{error}</h3>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  )

  const isCancelled = order.status === 'Cancelled'
  const stepIndex = getStepIndex(order.status)
  const steps = isCancelled ? STATUS_STEPS : STATUS_STEPS
  const shortId = order._id?.slice(-6).toUpperCase()

  return (
    <div className="tracking-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="tracking-header">
        <button className="tracking-back" onClick={() => { lightTap(); navigate(-1) }} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div className="tracking-header-info">
          <h1>Order #{shortId}</h1>
          <span className="tracking-date">{format(new Date(order.createdAt), 'd MMM, h:mm a')}</span>
        </div>
        <div className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {order.status}
        </div>
      </div>

      <div className="tracking-body">
        {/* ── ETA ─────────────────────────────────────────────────────── */}
        <EstimatedTime order={order} />

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <div className="timeline-card">
          <h2 className="card-title">Order Timeline</h2>
          {isCancelled ? (
            <div className="timeline">
              {[STATUS_STEPS[0], CANCELLED_STEP].map((step, i) => (
                <div key={step.key} className={`timeline-step ${i === 1 ? 'cancelled' : 'completed'}`}>
                  <div className="step-indicator">
                    <div className="step-icon">{step.icon}</div>
                    {i < 1 && <div className="step-line completed-line" />}
                  </div>
                  <div className="step-content">
                    <span className="step-label">{step.label}</span>
                    <span className="step-desc">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="timeline">
              {steps.map((step, i) => {
                const completed = i <= stepIndex
                const active = i === stepIndex
                return (
                  <div key={step.key} className={`timeline-step ${completed ? 'completed' : ''} ${active ? 'active' : ''}`}>
                    <div className="step-indicator">
                      <div className={`step-icon ${active ? 'pulse' : ''}`}>
                        {completed && !active ? '✅' : step.icon}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`step-line ${completed ? 'completed-line' : ''}`} />
                      )}
                    </div>
                    <div className="step-content">
                      <span className="step-label">{step.label}</span>
                      <span className="step-desc">{active ? step.desc : (completed ? 'Done' : 'Coming up')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Order Items ─────────────────────────────────────────────── */}
        <div className="order-items-card">
          <h2 className="card-title">Items Ordered</h2>
          <div className="order-items">
            {order.items?.map((item, i) => (
              <div key={i} className="order-item">
                {item.image && <img src={item.image} alt={item.name} className="order-item-img" loading="lazy" />}
                <div className="order-item-info">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-qty">× {item.quantity}</span>
                </div>
                <span className="order-item-price">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toFixed(0)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount</span>
                <span>−₹{order.discount?.toFixed(0)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Taxes (5%)</span>
              <span>₹{order.taxes?.toFixed(0)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE'}</span>
            </div>
            <div className="summary-row total-row">
              <span>Total Paid</span>
              <span>₹{order.total?.toFixed(0)}</span>
            </div>
            <div className="payment-badge">
              {order.paymentMethod === 'razorpay' ? '💳 Paid Online' : '💵 Cash on Delivery'}
            </div>
          </div>
        </div>

        {/* ── Delivery Address ────────────────────────────────────────── */}
        {order.deliveryAddress && (
          <div className="delivery-card">
            <h2 className="card-title">Delivery Address</h2>
            <div className="address-row">
              <span className="addr-icon">📍</span>
              <div className="addr-text">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="tracking-actions">
          {(order.status === 'Delivered' || order.status === 'Cancelled') && (
            <button className="reorder-btn" onClick={handleReorder} disabled={reordering}>
              {reordering ? 'Loading...' : '🔄 Reorder'}
            </button>
          )}
          <a href="tel:+917977234416" className="call-btn">
            📞 Call Restaurant
          </a>
        </div>
      </div>
    </div>
  )
}
