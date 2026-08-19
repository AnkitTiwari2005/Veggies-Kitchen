/* ═══════════════════════════════════════════════════════════
   VEGGIES KITCHEN — Recommendation Engine
   Analyzes cart contents and suggests complementary items
   from the menu based on category affinity.
   ═══════════════════════════════════════════════════════════ */

/**
 * Category affinity map.
 * Key = section ID of a cart item.
 * Value = array of section IDs that complement it.
 */
const CATEGORY_AFFINITY = {
  'todays-specials': ['breads', 'kulcha-naan', 'raita-sides', 'rice-biryani', 'soups'],
  'breakfast':       ['breads', 'kulcha-naan', 'parathas', 'raita-sides'],
  'combos':          ['soups', 'raita-sides', 'chinese'],
  'main-course':     ['breads', 'kulcha-naan', 'rice-biryani', 'raita-sides', 'parathas'],
  'paneer-specials': ['breads', 'kulcha-naan', 'rice-biryani', 'raita-sides', 'parathas'],
  'chaap-specials':  ['breads', 'kulcha-naan', 'rice-biryani', 'raita-sides'],
  'chinese':         ['soups', 'rice-biryani'],
  'rice-biryani':    ['raita-sides', 'paneer-specials', 'main-course', 'chaap-specials'],
  'rolls':           ['soups', 'chinese', 'raita-sides'],
  'tandoor':         ['breads', 'kulcha-naan', 'raita-sides', 'main-course'],
  'breads':          ['paneer-specials', 'main-course', 'chaap-specials'],
  'kulcha-naan':     ['paneer-specials', 'main-course', 'chaap-specials'],
  'parathas':        ['raita-sides', 'paneer-specials', 'main-course'],
  'soups':           ['chinese', 'paneer-specials', 'main-course'],
  'thalis':          ['soups', 'raita-sides'],
  'party-packs':     ['soups', 'raita-sides', 'chinese'],
  'raita-sides':     ['paneer-specials', 'main-course', 'rice-biryani', 'breads'],
}

/**
 * Get complementary recommendations for the current cart.
 *
 * @param {Array} cartItems — items currently in the cart (each has at least { name, sectionId? })
 * @param {Array} allSections — the full MENU_SECTIONS array
 * @param {number} limit — max recommendations to return (default 4)
 * @returns {Array} recommended items (each has { name, price, image, description, sectionId, sectionName })
 */
export function getRecommendations(cartItems, allSections, limit = 4) {
  if (!cartItems || cartItems.length === 0 || !allSections) return []

  const cartItemNames = new Set(cartItems.map(i => i.name.toLowerCase()))

  // Build a flat lookup: item name -> sectionId
  const itemToSection = new Map()
  const sectionNameMap = new Map()
  for (const section of allSections) {
    sectionNameMap.set(section.id, section.name)
    for (const item of section.items) {
      itemToSection.set(item.name.toLowerCase(), section.id)
    }
  }

  // Determine which sections the cart items belong to
  const cartSectionIds = new Set()
  for (const cartItem of cartItems) {
    // Use stored sectionId if available, otherwise look up
    const sectionId = cartItem.sectionId || itemToSection.get(cartItem.name.toLowerCase())
    if (sectionId) cartSectionIds.add(sectionId)
  }

  // Collect complementary section IDs, ranked by frequency of affinity hits
  const complementScores = new Map()
  for (const sid of cartSectionIds) {
    const complements = CATEGORY_AFFINITY[sid] || []
    for (const comp of complements) {
      // Don't recommend from sections already heavily in cart
      if (!cartSectionIds.has(comp)) {
        complementScores.set(comp, (complementScores.get(comp) || 0) + 1)
      }
    }
  }

  // Sort complementary sections by score (most relevant first)
  const rankedSections = [...complementScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([sid]) => sid)

  // If no affinity matches (edge case), fall back to popular sections
  if (rankedSections.length === 0) {
    const fallbackSections = ['raita-sides', 'breads', 'soups', 'chinese']
      .filter(s => !cartSectionIds.has(s))
    rankedSections.push(...fallbackSections)
  }

  // Collect candidate items from ranked sections
  const recommendations = []
  const seen = new Set()

  for (const sectionId of rankedSections) {
    if (recommendations.length >= limit) break

    const section = allSections.find(s => s.id === sectionId)
    if (!section) continue

    // Prefer items with images, then featured items
    const sorted = [...section.items].sort((a, b) => {
      const scoreA = (a.image ? 2 : 0) + (a.featured ? 1 : 0)
      const scoreB = (b.image ? 2 : 0) + (b.featured ? 1 : 0)
      return scoreB - scoreA
    })

    for (const item of sorted) {
      if (recommendations.length >= limit) break
      const key = item.name.toLowerCase()
      if (cartItemNames.has(key)) continue  // already in cart
      if (seen.has(key)) continue            // already recommended

      seen.add(key)
      recommendations.push({
        ...item,
        sectionId,
        sectionName: sectionNameMap.get(sectionId) || sectionId,
      })
    }
  }

  return recommendations
}
