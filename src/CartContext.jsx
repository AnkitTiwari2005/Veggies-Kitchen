import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { isNative } from './hooks/useCapacitor'
import { saveCart, getCart } from './services/storage'
import { mediumTap } from './services/haptics'

const CartContext = createContext()

const TAX_RATE = 0.05
const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 300
const MIN_ORDER = 100

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartReady, setCartReady] = useState(false)

  // ── Restore cart from storage on mount ─────────────────────────────────────
  useEffect(() => {
    async function restoreCart() {
      try {
        if (isNative) {
          const stored = await getCart()
          if (stored && Array.isArray(stored)) setCartItems(stored)
        } else {
          const saved = localStorage.getItem('veggies_cart')
          if (saved) setCartItems(JSON.parse(saved))
        }
      } catch {
        /* use empty cart */
      } finally {
        setCartReady(true)
      }
    }
    restoreCart()
  }, [])

  // ── Persist cart whenever it changes ───────────────────────────────────────
  useEffect(() => {
    if (!cartReady) return
    if (isNative) {
      saveCart(cartItems).catch(() => {})
    } else {
      try {
        localStorage.setItem('veggies_cart', JSON.stringify(cartItems))
      } catch { /* storage full */ }
    }
  }, [cartItems, cartReady])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    mediumTap()
    setCartItems(prev => {
      const existing = prev.find(i => i.name === item.name)
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((name, delta) => {
    setCartItems(prev =>
      prev.map(i => {
        if (i.name !== name) return i
        return { ...i, quantity: Math.max(0, i.quantity + delta) }
      }).filter(i => i.quantity > 0)
    )
  }, [])

  const removeFromCart = useCallback((name) => {
    setCartItems(prev => prev.filter(i => i.name !== name))
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const replaceCart = useCallback((items) => setCartItems(items), [])

  // ── Derived values ──────────────────────────────────────────────────────────
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0)

  const cartSubtotal = cartItems.reduce((acc, i) => {
    const price = parseFloat(String(i.price).replace(/[^0-9.]/g, '')) || 0
    return acc + price * i.quantity
  }, 0)

  const taxes = Math.round(cartSubtotal * TAX_RATE * 100) / 100
  const delivery = cartSubtotal > 0 ? (cartSubtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE) : 0
  const cartTotal = cartSubtotal + taxes + delivery
  const isBelowMinOrder = cartSubtotal > 0 && cartSubtotal < MIN_ORDER
  const savingsOnDelivery = cartSubtotal >= FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0

  return (
    <CartContext.Provider value={{
      cartItems,
      cartReady,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      replaceCart,
      cartCount,
      cartSubtotal,
      taxes,
      delivery,
      cartTotal,
      isBelowMinOrder,
      savingsOnDelivery,
      MIN_ORDER,
      FREE_DELIVERY_ABOVE,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
