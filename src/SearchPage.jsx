/* ═══════════════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Native Search Page
   Fast live search with filtering, direct cart additions, and recents.
   ═══════════════════════════════════════════════════════════════════ */
import { useState, useEffect, useRef, useMemo } from 'react'
import { useCart } from './CartContext'
import { useAdmin } from './AdminContext'
import { lightTap, mediumTap } from './services/haptics'
import { saveRecentSearches, getRecentSearches } from './services/storage'
import { VegBadge } from './icons'
import './SearchPage.css'

const QUICK_SEARCH_CHIPS = ['Paneer', 'Dal Makhani', 'Biryani', 'Naan', 'Chaap', 'Combos', 'Thali']

export default function SearchPage({ menuData = [] }) {
  const { addToCart, updateQuantity, cartItems } = useCart()
  const { menuSections } = useAdmin()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'veg' | 'popular'

  // Build searchable index from AdminContext or prop
  const searchIndex = useMemo(() => {
    const rawSections = (menuSections && menuSections.length > 0) ? menuSections : menuData
    const items = []
    if (!Array.isArray(rawSections)) return items

    for (const section of rawSections) {
      if (!Array.isArray(section.items)) continue
      for (const item of section.items) {
        items.push({
          ...item,
          category: section.name,
          categoryId: section.id,
          searchText: `${item.name} ${section.name} ${item.description || ''}`.toLowerCase(),
        })
      }
    }
    return items
  }, [menuSections, menuData])

  // Load recent searches
  useEffect(() => {
    getRecentSearches().then(searches => {
      setRecentSearches(searches || [])
    })
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [])

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    let filtered = searchIndex.filter(item => item.searchText.includes(q))

    if (activeFilter === 'veg') {
      filtered = filtered.filter(item => item.isVeg !== false)
    } else if (activeFilter === 'popular') {
      filtered = filtered.filter(item => item.featured)
    }

    return filtered
  }, [query, searchIndex, activeFilter])

  const saveSearch = async (term) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 6)
    setRecentSearches(updated)
    await saveRecentSearches(updated)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) saveSearch(query.trim())
  }

  const handleChipTap = (term) => {
    lightTap()
    setQuery(term)
    saveSearch(term)
  }

  const handleClear = () => {
    lightTap()
    setQuery('')
    inputRef.current?.focus()
  }

  const handleGoBack = () => {
    lightTap()
    window.history.back()
  }

  const handleAdd = (item) => {
    mediumTap()
    addToCart(item)
  }

  const getItemQuantity = (itemName) => {
    const found = cartItems.find(i => i.name === itemName)
    return found ? found.quantity : 0
  }

  return (
    <div className="search-page-native">
      {/* ── Top Header ───────────────────────────────── */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={handleGoBack} aria-label="Go back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <form className="sp-form" onSubmit={handleSearchSubmit}>
          <div className="sp-input-wrap">
            <span className="material-symbols-outlined sp-search-icon">search</span>
            <input
              ref={inputRef}
              type="text"
              className="sp-input"
              placeholder="Search dishes, curries, breads..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button type="button" className="sp-clear-btn" onClick={handleClear} aria-label="Clear">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Quick Chips ──────────────────────────────── */}
      <div className="sp-chips-bar">
        {QUICK_SEARCH_CHIPS.map(chip => (
          <button
            key={chip}
            className={`sp-chip ${query.toLowerCase() === chip.toLowerCase() ? 'active' : ''}`}
            onClick={() => handleChipTap(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── Main Body ────────────────────────────────── */}
      <div className="sp-body">
        {!query.trim() ? (
          <div className="sp-empty-prompt">
            {recentSearches.length > 0 && (
              <div className="sp-recents">
                <div className="sp-recents-header">
                  <span>Recent Searches</span>
                  <button onClick={() => { setRecentSearches([]); saveRecentSearches([]) }}>Clear</button>
                </div>
                <div className="sp-recents-list">
                  {recentSearches.map(term => (
                    <div key={term} className="sp-recent-item" onClick={() => handleChipTap(term)}>
                      <span className="material-symbols-outlined">history</span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="sp-welcome">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#4CAF50' }}>restaurant</span>
              <p>Type anything to search 100+ dishes</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="sp-no-results">
            <span className="material-symbols-outlined" style={{ fontSize: 54, color: '#666' }}>search_off</span>
            <h3>No dishes found for "{query}"</h3>
            <p>Try searching for Paneer, Dal Makhani, Biryani, or Combos</p>
          </div>
        ) : (
          <div className="sp-results-list">
            <div className="sp-count-bar">{results.length} dishes found</div>
            {results.map((item, idx) => {
              const qty = getItemQuantity(item.name)
              return (
                <div key={`${item.name}-${idx}`} className="sp-card">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="sp-card-img" loading="lazy" />
                  ) : (
                    <div className="sp-card-placeholder">
                      <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#4CAF50' }}>restaurant</span>
                    </div>
                  )}

                  <div className="sp-card-info">
                    <div className="sp-card-top">
                      <VegBadge size={14} />
                      <span className="sp-card-name">{item.name}</span>
                    </div>
                    <span className="sp-card-cat">{item.category}</span>
                    {item.description && (
                      <p className="sp-card-desc">{item.description}</p>
                    )}
                    <div className="sp-card-bottom">
                      <span className="sp-card-price">₹{item.price}</span>

                      {qty > 0 ? (
                        <div className="sp-stepper">
                          <button onClick={() => updateQuantity(item.name, -1)}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => updateQuantity(item.name, 1)}>+</button>
                        </div>
                      ) : (
                        <button className="sp-add-btn" onClick={() => handleAdd(item)}>
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
