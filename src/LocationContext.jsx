/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Location Context
   Manages user delivery address with GPS auto-detection & selection
   ═══════════════════════════════════════════════════════════════════ */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAddressFromLocation, requestPermission } from './services/geolocation'

const LocationContext = createContext()

const STORAGE_KEY = 'veggies_location'

const DEFAULT_ADDRESS = {
  street: 'Lajpat Nagar 4',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110024',
  fullAddress: 'Lajpat Nagar 4, New Delhi, Delhi',
}

export function LocationProvider({ children }) {
  const [address, setAddressState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && (parsed.fullAddress || parsed.street)) return parsed
      }
    } catch (_e) {}
    return DEFAULT_ADDRESS
  })

  const [locationStatus, setLocationStatus] = useState('idle') // 'idle' | 'detecting' | 'detected' | 'error'
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Auto detect location on first load if default is used
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      detectLocation(false)
    }
  }, [])

  const detectLocation = useCallback(async (openModalOnError = true) => {
    setLocationStatus('detecting')
    try {
      // First ensure permission
      await requestPermission()
      const loc = await getAddressFromLocation()
      if (loc && (loc.street || loc.city)) {
        const detected = {
          street: loc.street || loc.city || 'Detected Location',
          city: loc.city || 'New Delhi',
          state: loc.state || 'Delhi',
          pincode: loc.pincode || '',
          fullAddress: loc.fullAddress || `${loc.street || ''}, ${loc.city || ''}`.trim(),
          lat: loc.lat,
          lng: loc.lng,
        }
        setAddressState(detected)
        setLocationStatus('detected')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(detected))
        return detected
      } else {
        throw new Error('Could not resolve address')
      }
    } catch (err) {
      console.warn('Location detection failed:', err)
      setLocationStatus('error')
      if (openModalOnError) {
        setIsModalOpen(true)
      }
      return null
    }
  }, [])

  const setAddress = useCallback((newAddress) => {
    const formatted = typeof newAddress === 'string' 
      ? { ...DEFAULT_ADDRESS, street: newAddress, fullAddress: newAddress }
      : { ...DEFAULT_ADDRESS, ...newAddress }
    
    setAddressState(formatted)
    setLocationStatus('manual')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted))
    setIsModalOpen(false)
  }, [])

  return (
    <LocationContext.Provider value={{
      address,
      setAddress,
      locationStatus,
      detectLocation,
      isModalOpen,
      setIsModalOpen,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}
