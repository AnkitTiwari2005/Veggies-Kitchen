/* ═══════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Location Context
   Manages user address/location state with auto-detection.
   ═══════════════════════════════════════════════════════════ */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LocationContext = createContext()

const STORAGE_KEY = 'veggies_location'

const EMPTY_ADDRESS = {
  street: '',
  city: '',
  state: '',
  pincode: '',
  fullAddress: '',
}

/**
 * locationStatus values:
 *  'idle'       — initial, no attempt yet
 *  'detecting'  — geolocation in progress
 *  'detected'   — auto-detected successfully
 *  'saved'      — loaded from localStorage
 *  'manual'     — user entered manually or detection failed
 */

export function LocationProvider({ children }) {
  const [address, setAddressState] = useState(EMPTY_ADDRESS)
  const [locationStatus, setLocationStatus] = useState('idle')
  const [hasAttempted, setHasAttempted] = useState(false)

  // Load saved address on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.fullAddress) {
          setAddressState(parsed)
          setLocationStatus('saved')
          setHasAttempted(true)
          return
        }
      }
    } catch (_e) {
      // ignore parse errors
    }
    // No saved address — attempt detection once
    if (!hasAttempted) {
      attemptDetection()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const attemptDetection = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('manual')
      setHasAttempted(true)
      return
    }

    setLocationStatus('detecting')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )

          if (!response.ok) throw new Error('Geocode failed')

          const data = await response.json()

          const detected = {
            street: data.locality || data.city || '',
            city: data.city || data.principalSubdivision || '',
            state: data.principalSubdivision || '',
            pincode: data.postcode || '',
            fullAddress: [data.locality, data.city, data.principalSubdivision, data.countryName].filter(Boolean).join(', '),
          }

          setAddressState(detected)
          setLocationStatus('detected')
          localStorage.setItem(STORAGE_KEY, JSON.stringify(detected))
        } catch (_e) {
          setLocationStatus('manual')
        }
        setHasAttempted(true)
      },
      (_error) => {
        // Permission denied, timeout, or unavailable
        setLocationStatus('manual')
        setHasAttempted(true)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    )
  }, [])

  const setAddress = useCallback((newAddress) => {
    setAddressState(newAddress)
    setLocationStatus('manual')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddress))
  }, [])

  const detectLocation = useCallback(() => {
    attemptDetection()
  }, [attemptDetection])

  return (
    <LocationContext.Provider value={{
      address,
      setAddress,
      locationStatus,
      detectLocation,
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}
