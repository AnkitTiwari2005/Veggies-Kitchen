// Service area definition for Veggies Kitchen
// Delivery is available in South/Central Delhi only

export const SERVICEABLE_PINCODES = new Set([
  '110001', // Connaught Place, New Delhi
  '110002', // Darya Ganj, New Delhi
  '110003', // Lodi Colony area
  '110005', // Karol Bagh
  '110006', // Paharganj
  '110007', // Civil Lines
  '110013', // Okhla
  '110014', // Jangpura, Bhogal, Ashram
  '110016', // Hauz Khas, Green Park
  '110017', // Malviya Nagar, Panchsheel Park
  '110019', // Kalkaji, Govindpuri
  '110020', // Mehrauli, Qutub
  '110022', // Defence Colony
  '110023', // Lajpat Nagar, Moolchand
  '110024', // Lajpat Nagar 4, Khan Market area (PRIMARY)
  '110025', // East of Kailash, Kailash Colony
  '110030', // Saket, Sheikh Sarai
  '110044', // Jamia Nagar, Okhla Phase 2
  '110048', // Greater Kailash 1 & 2
  '110049', // South Extension
  '110062', // Dwarka Sector areas
  '110065', // Vasant Kunj, Vasant Vihar
  '110070', // Sector 9 Dwarka
  '110076', // Preet Vihar, Laxmi Nagar area
])

export const SERVICE_CITY = 'Delhi'
export const SERVICE_AREA_LABEL = 'South Delhi & nearby areas'

/**
 * Returns true if the pincode is in our delivery zone.
 */
export function isServiceable(pincode) {
  if (!pincode) return false
  const clean = String(pincode).trim().replace(/\D/g, '')
  return SERVICEABLE_PINCODES.has(clean)
}

/**
 * Returns true if the city matches our service area city.
 */
export function isCityServiceable(city) {
  if (!city) return false
  const lower = city.toLowerCase()
  return lower.includes('delhi') || lower.includes('new delhi')
}
