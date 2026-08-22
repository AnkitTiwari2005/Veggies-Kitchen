import './NotificationsPage.css'

export default function NotificationsPage() {
  return (
    <div className="notif-page">
      <div className="notif-header">
        <button className="notif-back" onClick={() => window.history.back()} aria-label="Go back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="notif-title">Notifications</h1>
      </div>

      <div className="notif-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="notif-empty__icon">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="notif-empty__title">No notifications yet</p>
        <p className="notif-empty__sub">We'll notify you about your orders,<br/>offers, and updates here.</p>
      </div>
    </div>
  )
}
