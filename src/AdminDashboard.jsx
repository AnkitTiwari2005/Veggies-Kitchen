import { useState, useEffect, useRef } from 'react'
import { useAdmin } from './AdminContext'
import { useBlogs } from './BlogContext'
import { useAuth } from './AuthContext'
import { API_BASE } from './config'
import './AdminDashboard.css'

/* ── Toast Notification Helper ───────────────── */
function showToast(message, type = 'success') {
  const el = document.createElement('div')
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'
  const color = type === 'success' ? 'var(--secondary, #4caf50)' : type === 'error' ? 'var(--error, #cf6679)' : 'var(--primary)'
  el.innerHTML = `<span class="material-symbols-outlined" style="color: ${color}">${icon}</span> ${message}`
  el.style = 'position: fixed; top: 20px; right: 20px; background: var(--surface-container); padding: 12px 24px; border-radius: 8px; z-index: 9999; display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid var(--glass-border); animation: fadeInUp 0.3s ease forwards; color: white;'
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.animation = 'fadeInUp 0.3s ease reverse forwards'
    setTimeout(() => el.remove(), 300)
  }, 2500)
}

/* ── Confirm Modal ───────────────────────────── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal glass-panel" onClick={e => e.stopPropagation()}>
        <p style={{ fontSize: '16px', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn-ghost-sm" onClick={onCancel}>Cancel</button>
          <button className="btn-primary-sm" style={{ width: 'auto', background: 'var(--error, #cf6679)' }} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const {
    heroBackdrop, setHeroBackdrop,
    menuBackdrop, setMenuBackdrop,
    menuSections, setMenuSections,
    addCategory, deleteCategory, updateCategory,
    addItemToCategory, deleteItemFromCategory, updateItemInCategory,
    pushChanges
  } = useAdmin()

  const { blogs, deleteBlog } = useBlogs()

  const [activeTab, setActiveTab] = useState('settings')
  const [pushing, setPushing] = useState(false)
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{padding: '100px', textAlign: 'center'}}>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{padding: '100px', textAlign: 'center'}}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  const handlePushChanges = async () => {
    setPushing(true)
    const success = await pushChanges()
    setPushing(false)
    
    if (success) {
      showToast('Changes Pushed Successfully!')
    } else {
      showToast('Failed to push changes. Make sure the backend server is running.', 'error')
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar glass-panel">
        <h2 className="admin-sidebar-title">Admin Control</h2>
        <button 
          className="btn-primary glow-button" 
          style={{ width: '100%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
          onClick={handlePushChanges}
          disabled={pushing}
        >
          <span className="material-symbols-outlined">cloud_upload</span>
          {pushing ? 'Pushing...' : 'Push Changes'}
        </button>
        <nav className="admin-nav">
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <span className="material-symbols-outlined">settings</span> Site Settings
          </button>
          <button className={activeTab === 'menu' ? 'active' : ''} onClick={() => setActiveTab('menu')}>
            <span className="material-symbols-outlined">restaurant_menu</span> Menu Management
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <span className="material-symbols-outlined">receipt_long</span> Orders
          </button>
          <button className={activeTab === 'blogs' ? 'active' : ''} onClick={() => setActiveTab('blogs')}>
            <span className="material-symbols-outlined">article</span> Manage Blogs
          </button>
          <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
            <span className="material-symbols-outlined">history</span> Activity Logs
          </button>
          <button onClick={() => window.location.hash = '#/write-blog'}>
            <span className="material-symbols-outlined">edit_document</span> Write New Blog
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {activeTab === 'settings' && (
          <SiteSettings 
            heroBackdrop={heroBackdrop} setHeroBackdrop={setHeroBackdrop}
            menuBackdrop={menuBackdrop} setMenuBackdrop={setMenuBackdrop}
          />
        )}
        {activeTab === 'menu' && (
          <MenuManagement 
            menuSections={menuSections} 
            addCategory={addCategory} 
            deleteCategory={deleteCategory} 
            updateCategory={updateCategory}
            addItemToCategory={addItemToCategory} 
            deleteItemFromCategory={deleteItemFromCategory} 
            updateItemInCategory={updateItemInCategory}
          />
        )}
        {activeTab === 'blogs' && (
          <BlogManagement blogs={blogs} deleteBlog={deleteBlog} />
        )}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'activity' && <AdminActivity />}
      </main>
    </div>
  )
}

function SiteSettings({ heroBackdrop, setHeroBackdrop, menuBackdrop, setMenuBackdrop }) {
  const handleHeroChange = (e) => {
    const { name, value } = e.target
    setHeroBackdrop(prev => ({ ...prev, [name]: value }))
  }

  const handleMenuBackdropChange = (e) => {
    const { name, value } = e.target
    setMenuBackdrop(prev => ({ ...prev, [name]: value }))
  }

  return (
    <section className="admin-section fluid-card">
      <h2>Site Settings</h2>
      <div className="admin-form-group">
        <h3>Home Page Hero Backdrop</h3>
        <label>Type</label>
        <select name="type" value={heroBackdrop.type} onChange={handleHeroChange}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <label>URL</label>
        <input type="text" name="url" value={heroBackdrop.url} onChange={handleHeroChange} placeholder="e.g. /images/hero.png or https://..." />
      </div>

      <div className="admin-form-group">
        <h3>Menu Page Backdrop</h3>
        <label>Type</label>
        <select name="type" value={menuBackdrop.type} onChange={handleMenuBackdropChange}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        <label>URL</label>
        <input type="text" name="url" value={menuBackdrop.url} onChange={handleMenuBackdropChange} placeholder="e.g. /video.mp4 or https://..." />
      </div>
    </section>
  )
}

function MenuManagement({ menuSections, addCategory, deleteCategory, updateCategory, addItemToCategory, deleteItemFromCategory, updateItemInCategory }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(menuSections[0]?.id || '')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Add Category form state
  const [newCatId, setNewCatId] = useState('')
  const [newCatName, setNewCatName] = useState('')

  // Add Item form state
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemImage, setNewItemImage] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')

  const selectedCategory = menuSections.find(s => s.id === selectedCategoryId)

  const handleAddCategory = () => {
    if (!newCatId.trim() || !newCatName.trim()) {
      showToast('Please fill in both Category ID and Name.', 'error')
      return
    }
    if (menuSections.some(s => s.id === newCatId.trim())) {
      showToast('A category with this ID already exists.', 'error')
      return
    }
    addCategory({ id: newCatId.trim(), name: newCatName.trim(), icon: 'restaurant', description: '', items: [] })
    setSelectedCategoryId(newCatId.trim())
    setNewCatId('')
    setNewCatName('')
    setShowAddCategory(false)
    showToast(`Category "${newCatName.trim()}" added!`)
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      showToast('Please enter an item name.', 'error')
      return
    }
    const price = parseFloat(newItemPrice) || 0
    addItemToCategory(selectedCategoryId, {
      id: newItemName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newItemName.trim(),
      price,
      description: newItemDesc.trim(),
      image: newItemImage.trim(),
      customizable: false,
      featured: false,
      tags: []
    })
    setNewItemName('')
    setNewItemPrice('')
    setNewItemImage('')
    setNewItemDesc('')
    setShowAddItem(false)
    showToast(`"${newItemName.trim()}" added to ${selectedCategory?.name}!`)
  }

  const requestDeleteCategory = (catId, catName) => {
    setConfirmAction({
      message: `Are you sure you want to delete the category "${catName}" and all its items?`,
      onConfirm: () => {
        deleteCategory(catId)
        if (selectedCategoryId === catId) {
          setSelectedCategoryId(menuSections[0]?.id || '')
        }
        setConfirmAction(null)
        showToast(`Category "${catName}" deleted.`)
      }
    })
  }

  const requestDeleteItem = (itemId, itemName) => {
    setConfirmAction({
      message: `Remove "${itemName}" from ${selectedCategory?.name}?`,
      onConfirm: () => {
        deleteItemFromCategory(selectedCategoryId, itemId)
        setConfirmAction(null)
        showToast(`"${itemName}" removed.`)
      }
    })
  }

  return (
    <div className="admin-menu-management">
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="admin-menu-sidebar">
        <h3>Categories</h3>
        <ul className="admin-category-list">
          {menuSections.map(cat => (
            <li key={cat.id} className={cat.id === selectedCategoryId ? 'active' : ''}>
              <span onClick={() => setSelectedCategoryId(cat.id)}>{cat.name}</span>
              <button className="icon-btn-small" onClick={() => requestDeleteCategory(cat.id, cat.name)}>
                <span className="material-symbols-outlined">delete</span>
              </button>
            </li>
          ))}
        </ul>

        {showAddCategory ? (
          <div className="admin-inline-form">
            <input
              type="text"
              placeholder="Category ID (e.g. new-category)"
              value={newCatId}
              onChange={e => setNewCatId(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              placeholder="Category Name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary-sm" onClick={handleAddCategory}>Add</button>
              <button className="btn-ghost-sm" onClick={() => { setShowAddCategory(false); setNewCatId(''); setNewCatName('') }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn-primary-sm" onClick={() => setShowAddCategory(true)}>+ Add Category</button>
        )}
      </div>

      <div className="admin-menu-details">
        {selectedCategory ? (
          <>
            <div className="admin-category-header">
              <h3>Items in {selectedCategory.name} <span style={{ opacity: 0.5, fontWeight: 400, fontSize: '14px' }}>({selectedCategory.items.length})</span></h3>
              {showAddItem ? (
                <button className="btn-ghost-sm" style={{ width: 'auto' }} onClick={() => { setShowAddItem(false); setNewItemName(''); setNewItemPrice(''); setNewItemImage(''); setNewItemDesc('') }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span> Cancel
                </button>
              ) : (
                <button className="btn-primary-sm" onClick={() => setShowAddItem(true)}>+ Add Item</button>
              )}
            </div>

            {showAddItem && (
              <div className="admin-add-item-form glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>add_circle</span>
                  Add New Item
                </h4>
                <div className="admin-inline-form-grid">
                  <div>
                    <label>Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Paneer Tikka"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={newItemPrice}
                      onChange={e => setNewItemPrice(e.target.value)}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://cdn.example.com/image.jpg"
                      value={newItemImage}
                      onChange={e => setNewItemImage(e.target.value)}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Short description of the dish"
                      value={newItemDesc}
                      onChange={e => setNewItemDesc(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn-primary-sm" style={{ width: 'auto' }} onClick={handleAddItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>check</span>
                    Add Item
                  </button>
                </div>
              </div>
            )}
            
            <div className="admin-item-grid">
              {selectedCategory.items.map(item => (
                <div key={item.id} className="admin-item-card glass-panel">
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div className="admin-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{item.price}</p>
                    <button className="btn-ghost-sm" onClick={() => requestDeleteItem(item.id, item.name)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select a category to view items.</p>
        )}
      </div>
    </div>
  )
}

function BlogManagement({ blogs, deleteBlog }) {
  const [confirmAction, setConfirmAction] = useState(null)

  const requestDeleteBlog = (blogId, blogTitle) => {
    setConfirmAction({
      message: `Are you sure you want to delete "${blogTitle}"?`,
      onConfirm: () => {
        deleteBlog(blogId)
        setConfirmAction(null)
        showToast(`Blog "${blogTitle}" deleted.`)
      }
    })
  }

  if (!blogs || blogs.length === 0) {
    return (
      <section className="admin-section fluid-card">
        <h2>Manage Blogs</h2>
        <p>No blogs published yet.</p>
      </section>
    )
  }

  return (
    <section className="admin-section fluid-card">
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <h2>Manage Blogs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {blogs.map(blog => (
          <div key={blog.id} className="admin-item-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', width: '100%' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{blog.title}</h4>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>By {blog.author} • {blog.date}</p>
            </div>
            <button className="btn-ghost-sm" style={{ color: '#ff4d4f', borderColor: '#ff4d4f', width: 'auto' }} onClick={() => requestDeleteBlog(blog.id, blog.title)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>delete</span> Delete
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [confirmAction, setConfirmAction] = useState(null)
  
  useEffect(() => {
    fetch(`${API_BASE}/api/orders`, { credentials: 'include' }).then(r => r.json()).then(setOrders).catch(console.error)
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o._id === id ? updated : o))
        showToast(`Order status updated to ${status}`)
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to update order status', 'error')
    }
  }

  const cancelOrder = async (id) => {
    setConfirmAction({
      message: 'Are you sure you want to cancel this order? An email will be sent to the customer.',
      onConfirm: async () => {
        setConfirmAction(null)
        try {
          const res = await fetch(`${API_BASE}/api/orders/${id}/cancel`, { method: 'PUT', credentials: 'include' })
          if (res.ok) {
            const updated = await res.json()
            setOrders(orders.map(o => o._id === id ? updated : o))
            showToast('Order cancelled successfully')
          } else {
            const err = await res.json()
            showToast(err.error || 'Failed to cancel order', 'error')
          }
        } catch (err) {
          console.error(err)
          showToast('Error cancelling order', 'error')
        }
      }
    })
  }

  return (
    <section className="admin-section fluid-card">
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      <h2>Live Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {orders.map(order => (
          <div key={order._id} className="admin-item-card glass-panel" style={{ padding: '16px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Customer: {order.customerName} | Phone: {order.customerPhone}
                </p>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Address: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '18px' }}>₹{order.total}</strong>
                <div style={{ marginTop: '8px' }}>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--glass-border)', padding: '4px 8px', borderRadius: '4px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                {(order.status === 'Pending' || order.status === 'Preparing') && (
                  <button 
                    onClick={() => cancelOrder(order._id)}
                    className="btn-ghost-sm" 
                    style={{ marginTop: '8px', color: 'var(--error)', borderColor: 'var(--error)', padding: '4px 8px', width: 'auto' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: '14px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
              {order.items.map((item, idx) => (
                <div key={idx}>{item.quantity}x {item.name} (₹{item.price})</div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </section>
  )
}

function AdminActivity() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch(`${API_BASE}/api/activity`, { credentials: 'include' }).then(r => r.json()).then(setLogs).catch(console.error)
  }, [])

  return (
    <section className="admin-section fluid-card">
      <h2>Activity Logs</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
        {logs.map(log => (
          <div key={log._id} className="admin-item-card glass-panel" style={{ padding: '12px', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>{log.action}</strong>
              {log.user && <span style={{ marginLeft: '8px', fontSize: '12px', background: 'var(--primary)', color: 'black', padding: '2px 6px', borderRadius: '12px' }}>{log.user.name}</span>}
              <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '4px' }}>
                {JSON.stringify(log.details)}
              </div>
            </div>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
        {logs.length === 0 && <p>No activity yet.</p>}
      </div>
    </section>
  )
}
