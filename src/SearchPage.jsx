import { useState, useEffect, useRef } from 'react'
import { useCart } from './CartContext'
import { lightTap, mediumTap } from './services/haptics'
import { saveRecentSearches, getRecentSearches } from './services/storage'
import './SearchPage.css'

const navigate = (to) => { window.location.hash = `#${to}` }


// Flatten all menu items for searching
function buildSearchIndex(menuData) {
  const items = []
  if (!Array.isArray(menuData)) return items
  for (const category of menuData) {
    if (!Array.isArray(category.items)) continue
    for (const item of category.items) {
      items.push({
        ...item,
        category: category.name,
        categoryId: category.id,
        searchText: `${item.name} ${category.name} ${item.description || ''}`.toLowerCase(),
      })
    }
  }
  return items
}

export default function SearchPage({ menuData = [] }) {
  const { addToCart, cartItems } = useCart()
  const inputRef = useRef(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'veg' | 'popular'
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [isSearching, setIsSearching] = useState(false)

  const searchIndex = buildSearchIndex(menuData)

  // ── Load recent searches ────────────────────────────────────────────────────
  useEffect(() => {
    getRecentSearches().then(searches => {
      setRecentSearches(searches || [])
    })
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // ── Search logic with debounce ──────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timer = setTimeout(() => {
      const q = query.toLowerCase().trim()
      let filtered = searchIndex.filter(item => item.searchText.includes(q))

      if (activeFilter === 'veg') {
        filtered = filtered.filter(item => item.isVeg !== false)
      }

      const [minP, maxP] = priceRange
      filtered = filtered.filter(item => {
        const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0
        return price >= minP && price <= maxP
      })

      setResults(filtered)
      setIsSearching(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, activeFilter, priceRange])

  // ── Save search to recents ──────────────────────────────────────────────────
  async function saveSearch(term) {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    await saveRecentSearches(updated)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) saveSearch(query.trim())
  }

  function handleRecentTap(term) {
    lightTap()
    setQuery(term)
  }

  function handleClear() {
    setQuery('')
    inputRef.current?.focus()
  }

  function handleAddToCart(item) {
    mediumTap()
    addToCart(item)
  }

  function getCartQuantity(itemName) {
    return cartItems.find(i => i.name === itemName)?.quantity || 0
  }

  return (
    <div className="search-page">
      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="search-header">
        <button className="search-back-btn" onClick={() => { lightTap(); navigate(-1) }} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrap">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="search"
              className="search-input"
              placeholder="Search dishes, categories..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="search"
            />
            {query && (
              <button type="button" className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      {query && (
        <div className="search-filters">
          {['all', 'veg', 'popular'].map(f => (
            <button
              key={f}
              className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => { lightTap(); setActiveFilter(f) }}
            >
              {f === 'all' ? '🍽 All' : f === 'veg' ? '🥗 Veg' : '⭐ Popular'}
            </button>
          ))}
        </div>
      )}

      {/* ── Results / Empty state / Recents ────────────────────────────── */}
      <div className="search-body">
        {!query ? (
          /* Recent searches */
          <div className="recents-section">
            {recentSearches.length > 0 && (
              <>
                <div className="section-header">
                  <span className="section-title">Recent Searches</span>
                  <button className="section-action" onClick={async () => { setRecentSearches([]); await saveRecentSearches([]) }}>Clear</button>
                </div>
                <div className="recent-tags">
                  {recentSearches.map(term => (
                    <button key={term} className="recent-tag" onClick={() => handleRecentTap(term)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="search-prompt">
              <div className="search-prompt-icon">🔍</div>
              <p>Search for your favourite dishes</p>
            </div>
          </div>
        ) : isSearching ? (
          <div className="search-loading">
            <div className="search-spinner" />
            <span>Searching...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="search-empty">
            <div className="search-empty-icon">😕</div>
            <h3>No results for "{query}"</h3>
            <p>Try a different spelling or browse the menu</p>
            <button className="browse-menu-btn" onClick={() => navigate('/#menu')}>Browse Menu</button>
          </div>
        ) : (
          <div className="search-results">
            <p className="results-count">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
            <div className="results-list">
              {results.map((item, idx) => {
                const qty = getCartQuantity(item.name)
                const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0
                return (
                  <div key={`${item.name}-${idx}`} className="result-card">
                    {item.image && (
                      <div className="result-image">
                        <img src={item.image} alt={item.name} loading="lazy" />
                      </div>
                    )}
                    <div className="result-info">
                      <div className="result-category">{item.category}</div>
                      <h4 className="result-name">{item.name}</h4>
                      {item.description && <p className="result-desc">{item.description}</p>}
                      <div className="result-footer">
                        <span className="result-price">₹{price}</span>
                        <div className="result-cart-control">
                          {qty > 0 ? (
                            <div className="qty-control">
                              <button className="qty-btn" onClick={() => handleAddToCart({ ...item, quantity: -1 })}>−</button>
                              <span className="qty-num">{qty}</span>
                              <button className="qty-btn" onClick={() => handleAddToCart(item)}>+</button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={() => handleAddToCart(item)}>
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
