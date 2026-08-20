/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Location Picker Modal
   Allows GPS location auto-detect or manual area selection.
   ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react'
import { useLocation } from './LocationContext'
import { lightTap, successVibration } from './services/haptics'

const POPULAR_LOCATIONS = [
  { name: 'Lajpat Nagar 4', desc: 'Near Moolchand Metro' },
  { name: 'Defence Colony', desc: 'South Delhi' },
  { name: 'Greater Kailash 1', desc: 'M Block Market Area' },
  { name: 'South Extension 2', desc: 'Near AIIMS & Ring Road' },
  { name: 'Amar Colony', desc: 'Main Market Area' },
  { name: 'East of Kailash', desc: 'Near ISKCON Temple' },
  { name: 'Malviya Nagar', desc: 'Main Market' },
  { name: 'Saket', desc: 'Near Select Citywalk' },
]

export default function LocationPickerModal() {
  const { isModalOpen, setIsModalOpen, address, setAddress, detectLocation, locationStatus } = useLocation()
  const [customInput, setCustomInput] = useState('')

  if (!isModalOpen) return null

  const handleClose = () => {
    lightTap()
    setIsModalOpen(false)
  }

  const handleUseGPS = async () => {
    lightTap()
    const result = await detectLocation(false)
    if (result) {
      successVibration()
      setIsModalOpen(false)
    }
  }

  const handleSelectArea = (loc) => {
    lightTap()
    setAddress({
      street: loc.name,
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      fullAddress: `${loc.name}, ${loc.desc}, New Delhi`,
    })
    successVibration()
    setIsModalOpen(false)
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    if (!customInput.trim()) return
    lightTap()
    setAddress({
      street: customInput.trim(),
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '',
      fullAddress: `${customInput.trim()}, New Delhi`,
    })
    successVibration()
    setIsModalOpen(false)
  }

  return (
    <div className="loc-modal-backdrop" onClick={handleClose}>
      <div className="loc-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="loc-modal-handle" />
        
        <div className="loc-modal-header">
          <h3 className="loc-modal-title">Select Delivery Location</h3>
          <button className="loc-modal-close" onClick={handleClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* GPS Auto-detect Button */}
        <button 
          className="loc-gps-btn" 
          onClick={handleUseGPS}
          disabled={locationStatus === 'detecting'}
        >
          <span className="material-symbols-outlined loc-gps-icon">my_location</span>
          <div className="loc-gps-text">
            <strong>
              {locationStatus === 'detecting' ? 'Detecting GPS Location...' : 'Use Current Location'}
            </strong>
            <span>GPS location auto-detection</span>
          </div>
          {locationStatus === 'detecting' && (
            <div className="loc-spinner" />
          )}
        </button>

        {/* Custom Location Search */}
        <form className="loc-search-form" onSubmit={handleCustomSubmit}>
          <div className="loc-search-input-wrap">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search or enter area, building, locality..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
            />
            {customInput && (
              <button type="submit" className="loc-submit-btn">Set</button>
            )}
          </div>
        </form>

        {/* Popular Delivery Areas */}
        <div className="loc-popular-section">
          <span className="loc-popular-title">Popular Delivery Hubs</span>
          <div className="loc-popular-list">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected = address?.street?.toLowerCase() === loc.name.toLowerCase()
              return (
                <div
                  key={loc.name}
                  className={`loc-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectArea(loc)}
                >
                  <span className="material-symbols-outlined loc-item-pin">location_on</span>
                  <div className="loc-item-info">
                    <span className="loc-item-name">{loc.name}</span>
                    <span className="loc-item-desc">{loc.desc}</span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined loc-check-icon">check_circle</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
