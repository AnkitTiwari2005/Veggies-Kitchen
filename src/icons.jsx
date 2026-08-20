/* ═══════════════════════════════════════════════════════════════════
   SVG Icon Library — High-quality vector icons for native app
   No emojis. Every icon is a crisp, scalable SVG.
   ═══════════════════════════════════════════════════════════════════ */
import { memo } from 'react'

// ── UI Icons ────────────────────────────────────────────────────────

export const SearchIcon = memo(({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
))

export const LocationIcon = memo(({ size = 14, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
))

export const BellIcon = memo(({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
))

export const CartIcon = memo(({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
))

export const PlusIcon = memo(({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
))

export const MinusIcon = memo(({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
))

export const ArrowRightIcon = memo(({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"/>
  </svg>
))

export const ArrowLeftIcon = memo(({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
))

export const ChevronDownIcon = memo(({ size = 12, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
  </svg>
))

export const CheckIcon = memo(({ size = 20, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
))

export const StarFilledIcon = memo(({ size = 10, color = '#FFB300' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
))

export const FireIcon = memo(({ size = 18, color = '#FF6B35' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
))

// ── Veg Badge (FSSAI standard) ──────────────────────────────────
export const VegBadge = memo(({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="3" fill="none" stroke="#4CAF50" strokeWidth="2"/>
    <circle cx="10" cy="10" r="4.5" fill="#4CAF50"/>
  </svg>
))

// ── Category Icons ──────────────────────────────────────────────

export const CurryIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 28c0 8 6.5 12 16 12s16-4 16-12H8z" fill="#FF6B35" opacity="0.9"/>
    <path d="M6 28h36c0 0 0 1-1 1H7c-1 0-1-1-1-1z" fill="#BF360C"/>
    <path d="M18 12c0-2 1-4 0-6" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 10c0-2 1-4 0-6" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 12c0-2 1-4 0-6" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
  </svg>
))

export const BreadIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="26" rx="16" ry="12" fill="#D4A574"/>
    <ellipse cx="24" cy="24" rx="14" ry="10" fill="#E8C9A0"/>
    <path d="M16 22c2-1 4 0 6-1s4 0 6-1 3 1 4 0" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

export const StarterIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <ellipse cx="24" cy="30" rx="18" ry="8" fill="#E0E0E0" opacity="0.3"/>
    <circle cx="18" cy="22" r="6" fill="#66BB6A"/>
    <circle cx="30" cy="22" r="6" fill="#81C784"/>
    <circle cx="24" cy="16" r="5" fill="#4CAF50"/>
    <path d="M24 32v6" stroke="#795548" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 36h4" stroke="#795548" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

export const RiceIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 30c0 6 6 10 14 10s14-4 14-10H10z" fill="#FDD835" opacity="0.85"/>
    <path d="M10 30h28" stroke="#F9A825" strokeWidth="1.5"/>
    <ellipse cx="20" cy="26" rx="2" ry="1" fill="#F57F17" opacity="0.5"/>
    <ellipse cx="28" cy="27" rx="2" ry="1" fill="#F57F17" opacity="0.5"/>
    <path d="M18 16c0-3 2-6 0-9" stroke="#FDD835" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 14c0-3 2-6 0-9" stroke="#FDD835" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

export const ComboIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="12" y="10" width="24" height="6" rx="3" fill="#EF5350" opacity="0.8"/>
    <rect x="10" y="18" width="28" height="6" rx="3" fill="#EF5350" opacity="0.6"/>
    <rect x="8" y="26" width="32" height="6" rx="3" fill="#EF5350" opacity="0.4"/>
    <rect x="12" y="34" width="24" height="6" rx="3" fill="#EF5350" opacity="0.3"/>
    <circle cx="38" cy="10" r="5" fill="#FFB300"/>
    <text x="38" y="13" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">%</text>
  </svg>
))

export const DessertIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="10" fill="#AB47BC" opacity="0.3"/>
    <circle cx="20" cy="22" r="5" fill="#CE93D8"/>
    <circle cx="28" cy="22" r="5" fill="#BA68C8"/>
    <circle cx="24" cy="18" r="4" fill="#AB47BC"/>
    <path d="M15 30c3 4 9 5 9 5s6-1 9-5" stroke="#7B1FA2" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

export const BeverageIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M16 14h16l-2 24H18l-2-24z" fill="#29B6F6" opacity="0.7"/>
    <path d="M16 14h16" stroke="#0288D1" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 14l4-6" stroke="#0288D1" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="24" cy="26" rx="5" ry="2" fill="white" opacity="0.3"/>
  </svg>
))

export const TandoorIcon = memo(({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M14 38h20c2 0 4-2 4-4V20c0-8-6-14-14-14S10 12 10 20v14c0 2 2 4 4 4z" fill="#FF7043" opacity="0.3"/>
    <path d="M18 38V24c0-4 3-7 6-7s6 3 6 7v14" fill="#FF5722" opacity="0.5"/>
    <path d="M20 14c-1-3 0-6 2-6" stroke="#FF6D00" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M24 12c-1-3 0-6 2-6" stroke="#FF6D00" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M28 14c-1-3 0-6 2-6" stroke="#FF6D00" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

// ── Empty State Illustrations ───────────────────────────────────

export const EmptyCartIllustration = memo(() => (
  <svg width="80" height="80" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="50" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="2" strokeDasharray="6 4"/>
    <path d="M40 45h-5l-3-8h-6" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 45l4 20h30l4-15H42" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="72" r="3" stroke="#555" strokeWidth="2"/>
    <circle cx="70" cy="72" r="3" stroke="#555" strokeWidth="2"/>
    <path d="M55 55v4M55 53v0" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 55v4M65 53v0" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
  </svg>
))

export const EmptyOrdersIllustration = memo(() => (
  <svg width="80" height="80" viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="50" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="2"/>
    <rect x="35" y="30" width="50" height="60" rx="6" stroke="#555" strokeWidth="2.5"/>
    <line x1="45" y1="45" x2="75" y2="45" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="55" x2="65" y2="55" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
    <line x1="45" y1="65" x2="70" y2="65" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="75" cy="75" r="12" fill="#1a1a1a" stroke="#4CAF50" strokeWidth="2"/>
    <path d="M72 75h6M75 72v6" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round"/>
  </svg>
))

// ── Utility SVGs ────────────────────────────────────────────────

export const LeafIcon = memo(({ size = 18, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M17.75 2.01C12.65 1.89 6.93 5.1 4.01 10.02 2.09 13.52 2.58 17.74 4.39 20.47c.23.35.72.42 1.05.18.34-.24.4-.72.16-1.06-1.56-2.35-1.98-5.87-.3-8.86C7.84 6.61 12.82 3.89 17.2 4.01c.4.01.73-.32.73-.72.01-.41-.33-.74-.73-.74l.55-.54zM12 20a8 8 0 008-8c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2a8 8 0 008 8z"/>
  </svg>
))

export const TruckIcon = memo(({ size = 18, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5S6.83 15.5 6 15.5 4.5 16.17 4.5 17 5.17 18.5 6 18.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3zM3 6v9h.76c.55-.61 1.35-1 2.24-1 .89 0 1.69.39 2.24 1H15V6H3z"/>
  </svg>
))

export const ShieldCheckIcon = memo(({ size = 18, color = '#4CAF50' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
))

export const SparkleIcon = memo(({ size = 18, color = '#FFB300' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
  </svg>
))

// ── Category icon map ───────────────────────────────────────────
export const CATEGORY_ICONS = {
  curries: { Icon: CurryIcon, bg: 'rgba(255, 107, 53, 0.12)' },
  breads: { Icon: BreadIcon, bg: 'rgba(212, 165, 116, 0.12)' },
  starters: { Icon: StarterIcon, bg: 'rgba(102, 187, 106, 0.12)' },
  rice: { Icon: RiceIcon, bg: 'rgba(253, 216, 53, 0.12)' },
  combos: { Icon: ComboIcon, bg: 'rgba(239, 83, 80, 0.12)' },
  desserts: { Icon: DessertIcon, bg: 'rgba(171, 71, 188, 0.12)' },
  beverages: { Icon: BeverageIcon, bg: 'rgba(41, 182, 246, 0.12)' },
  tandoor: { Icon: TandoorIcon, bg: 'rgba(255, 112, 67, 0.12)' },
}

// Fallback for unknown categories
export const getIconForCategory = (sectionId) => {
  const key = sectionId?.toLowerCase()?.replace(/[^a-z]/g, '')
  if (CATEGORY_ICONS[key]) return CATEGORY_ICONS[key]
  // Try partial match
  for (const [k, v] of Object.entries(CATEGORY_ICONS)) {
    if (key?.includes(k) || k.includes(key)) return v
  }
  return { Icon: CurryIcon, bg: 'rgba(255, 107, 53, 0.12)' }
}
