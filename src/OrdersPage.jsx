import React, { useState, useEffect } from 'react';
import { useAdmin, BackgroundMedia } from './AdminContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { SECTION_EMOJI } from './menuData';
import { API_BASE } from './config';
import './OrdersPage.css';

export default function OrdersPage() {
  const { menuBackdrop, menuSections } = useAdmin();
  const { user, login } = useAuth();
  const { replaceCart } = useCart();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = () => {
    if (user) {
      setIsLoading(true);
      fetch(`${API_BASE}/api/orders/me`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => setOrders(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const cancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/cancel`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        const orderData = await res.json();
        fetchOrders();
        
        let message = `Hi Veggie Kitchen! ❌\n\nI want to CANCEL my order that was just placed.\n\n`;
        message += `*Order ID:* #${orderData._id.slice(-6).toUpperCase()}\n`;
        message += `*Name:* ${orderData.customerName}\n`;
        message += `*Total Amount:* ₹${orderData.total.toFixed(2)}\n\n`;
        message += `Please confirm the cancellation.`;

        const whatsappUrl = `https://api.whatsapp.com/send/?phone=919811797407&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
        window.open(whatsappUrl, '_blank');
      } else {
        let errorMsg = 'Failed to cancel order';
        try {
          const err = await res.json();
          if (err.error) errorMsg = err.error;
        } catch (parseError) {
          console.error("Non-JSON error response from server");
        }
        alert(errorMsg);
      }
    } catch (e) {
      console.error(e);
      alert('Error cancelling order');
    }
  };

  const handleReorder = (items) => {
    replaceCart(items);
    window.location.hash = '#/checkout';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="orders-page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', position: 'relative' }}>
        <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <BackgroundMedia media={menuBackdrop} />
          <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '16px' }}>receipt_long</span>
        <h1 className="text-headline-lg">Your Orders</h1>
        <p className="text-body-lg" style={{ marginBottom: '24px', opacity: 0.8 }}>Please login to view your orders.</p>
        <button className="btn-primary glow-button" onClick={login} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined">login</span>
          Login with Google
        </button>
      </div>
    );
  }

  const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Out for Delivery'].includes(o.status));
  const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const getProgress = (status) => {
    if (status === 'Pending') return 25;
    if (status === 'Preparing') return 50;
    if (status === 'Out for Delivery') return 75;
    return 0;
  };

  return (
    <div className="orders-page-wrapper" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} />
        <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
      </div>

      <main className="orders-main">
        {/* Active Orders Section */}
        <section className="orders-section">
          <div className="orders-header-text">
            <h1 className="text-display-lg text-primary" style={{ fontSize: '48px' }}>Active Orders</h1>
            <p className="text-body-lg text-on-surface-variant">Your feast is being prepared with care.</p>
          </div>
          
          {activeOrders.length === 0 ? (
             <div className="active-order-card glass-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
               <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5, marginBottom: 16 }}>restaurant</span>
               <p className="text-headline-md text-on-surface-variant">No active orders</p>
               <a href="#/menu" className="btn-primary glow-button" style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px' }}>Explore Menu</a>
             </div>
          ) : (
            activeOrders.map(order => (
              <div key={order._id} className="active-order-card glass-panel" style={{ marginBottom: 24 }}>
                <div className="active-order-glow"></div>
                <div className="active-order-content">
                  <div>
                    <div className="status-label">
                      <span className="status-dot animate-pulse"></span>
                      <span className="text-label-sm uppercase">{order.status}</span>
                    </div>
                    <h2 className="text-headline-md text-primary" style={{ marginTop: '4px' }}>Order #{order._id.slice(-6).toUpperCase()}</h2>
                    <p className="text-body-md text-on-surface-variant" style={{ marginTop: '4px' }}>Expected delivery: {order.deliveryTime === 'now' ? 'In 30-45 mins' : order.deliveryTime}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {(order.status === 'Pending' || order.status === 'Preparing') && (
                      Date.now() - new Date(order.createdAt).getTime() <= 10 * 60 * 1000 ? (
                        <button className="track-order-btn" onClick={() => cancelOrder(order._id)} style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
                          Cancel
                        </button>
                      ) : (
                        <button className="track-order-btn" onClick={() => {
                          const message = `Hi Veggie Kitchen! ❌\n\nI want to CANCEL my order #${order._id.slice(-6).toUpperCase()} but it has been more than 10 minutes since I placed it. Can you please help?`;
                          const whatsappUrl = `https://api.whatsapp.com/send/?phone=919811797407&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
                          window.open(whatsappUrl, '_blank');
                        }} style={{ background: 'transparent', border: '1px solid var(--on-surface-variant)', color: 'var(--on-surface-variant)' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
                          Request Cancel
                        </button>
                      )
                    )}
                    <button className="track-order-btn glow-button">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>my_location</span>
                      Track Order
                    </button>
                  </div>
                </div>
                
                <div className="progress-container">
                  <div className="progress-labels text-label-sm">
                    <span style={{ color: order.status === 'Pending' ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>Pending</span>
                    <span style={{ color: order.status === 'Preparing' ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>Preparing</span>
                    <span style={{ color: order.status === 'Out for Delivery' ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>On the way</span>
                    <span>Delivered</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${getProgress(order.status)}%` }}></div>
                  </div>
                </div>
                
                <div className="order-items-list">
                  <p className="text-label-sm text-on-surface-variant uppercase" style={{ marginBottom: '16px', letterSpacing: '0.05em' }}>Items in Order</p>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item" style={{ marginBottom: '12px' }}>
                      <div className="order-item-img">
                        {item.image ? (
                          <img alt={item.name} src={item.image} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🍽️</div>
                        )}
                      </div>
                      <div>
                        <p className="text-headline-md text-primary" style={{ fontSize: '16px' }}>{item.name}</p>
                        <p className="text-body-md text-on-surface-variant" style={{ fontSize: '14px' }}>{item.quantity}x • ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <div className="orders-grid">
          {/* Order History */}
          <section className="past-orders-section">
            <h2 className="text-headline-md text-primary" style={{ marginBottom: '24px' }}>Past Orders</h2>
            <div className="past-orders-list">
              {pastOrders.length === 0 ? (
                <p className="text-on-surface-variant">No past orders yet.</p>
              ) : (
                pastOrders.map(order => (
                  <div key={order._id} className="past-order-card glass-panel">
                    <div className="past-order-info">
                      <div className="past-order-img">
                        {order.items[0]?.image ? (
                          <img alt={order.items[0]?.name} src={order.items[0]?.image} />
                        ) : (
                          <div className="icon-placeholder">
                            <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="past-order-status">
                          <span className={`material-symbols-outlined text-${order.status === 'Delivered' ? 'secondary' : 'error'}`} style={{ fontSize: '16px', color: order.status === 'Delivered' ? 'var(--secondary)' : 'var(--error)' }}>
                            {order.status === 'Delivered' ? 'check_circle' : 'cancel'}
                          </span>
                          <span className="text-label-sm text-on-surface-variant">{order.status} • {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-body-md text-primary font-semibold" style={{ fontWeight: 600 }}>{order.items[0]?.name} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</p>
                        <p className="text-body-md text-on-surface-variant" style={{ fontSize: '14px', marginTop: '4px' }}>₹{Number(order.total).toFixed(2)} • {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items</p>
                      </div>
                    </div>
                    <button onClick={() => handleReorder(order.items)} className="reorder-btn btn-primary glow-button" style={{ padding: '8px 24px', fontSize: '14px' }}>
                      Reorder
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Support Sidebar */}
          <aside className="support-sidebar">
            <h2 className="text-headline-md text-primary" style={{ marginBottom: '24px' }}>Support</h2>
            <div className="support-panel glass-panel">
              <div className="support-item" style={{cursor: 'pointer'}} onClick={() => window.open('https://api.whatsapp.com/send/?phone=919811797407&text=' + encodeURIComponent('Hi Veggie Kitchen! I need help with an order.') + '&type=phone_number&app_absent=0', '_blank')}>
                <div className="support-icon">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div className="support-text">
                  <p className="text-body-md text-primary font-semibold" style={{ fontWeight: 600 }}>Contact Concierge</p>
                  <p className="text-label-sm text-on-surface-variant" style={{ fontWeight: 400 }}>24/7 premium support</p>
                </div>
                <span className="material-symbols-outlined support-arrow text-on-surface-variant">chevron_right</span>
              </div>
              <div className="support-divider"></div>
              <div className="support-item" style={{cursor: 'pointer'}} onClick={() => window.open('https://api.whatsapp.com/send/?phone=919811797407&text=' + encodeURIComponent('Hi Veggie Kitchen! I want to track an ongoing issue.') + '&type=phone_number&app_absent=0', '_blank')}>
                <div className="support-icon">
                  <span className="material-symbols-outlined">troubleshoot</span>
                </div>
                <div className="support-text">
                  <p className="text-body-md text-primary font-semibold" style={{ fontWeight: 600 }}>Track Issue</p>
                  <p className="text-label-sm text-on-surface-variant" style={{ fontWeight: 400 }}>Check ongoing tickets</p>
                </div>
                <span className="material-symbols-outlined support-arrow text-on-surface-variant">chevron_right</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
