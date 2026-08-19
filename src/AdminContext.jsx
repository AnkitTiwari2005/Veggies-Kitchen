import { createContext, useContext, useState, useEffect } from 'react'
import { MENU_SECTIONS as DEFAULT_MENU_SECTIONS } from './menuData'
import { API_BASE } from './config'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  // Local state initialized with defaults
  const [heroBackdrop, setHeroBackdrop] = useState({ type: 'image', url: '/images/hero_food_spread.png' })
  const [menuBackdrop, setMenuBackdrop] = useState({ type: 'video', url: '/Chef_cooks_and_delivers_food_202608071354.mp4' })
  const [menuSections, setMenuSections] = useState(DEFAULT_MENU_SECTIONS)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch from backend on mount (with timeout for static deployments)
  useEffect(() => {
    async function fetchData() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000) // 3s timeout
      try {
        const [settingsRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/api/settings`, { signal: controller.signal, cache: 'no-store' }),
          fetch(`${API_BASE}/api/menu`, { signal: controller.signal, cache: 'no-store' })
        ])
        clearTimeout(timeout)
        
        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          
          const sanitizeUrl = (url) => {
            if (!url) return url;
            let cleaned = url.replace(/\\/g, '/'); // Windows backslashes
            if (cleaned.includes('public/images/')) cleaned = cleaned.replace('public/images/', '/images/');
            if (cleaned.includes('veggie-cyan.vercel.app/public')) cleaned = cleaned.replace(/https?:\/\/veggie-cyan\.vercel\.app\/public/, '');
            return cleaned;
          };

          const hero = settings.find(s => s.key === 'heroBackdrop')
          const menuBg = settings.find(s => s.key === 'menuBackdrop')
          
          if (hero && hero.value) {
            hero.value.url = sanitizeUrl(hero.value.url);
            setHeroBackdrop(hero.value);
          }
          if (menuBg && menuBg.value) {
            menuBg.value.url = sanitizeUrl(menuBg.value.url);
            setMenuBackdrop(menuBg.value);
          }
        }
        
        if (menuRes.ok) {
          const menuData = await menuRes.json()
          if (menuData && menuData.length > 0) {
            setMenuSections(menuData)
          }
        }
      } catch (err) {
        clearTimeout(timeout)
        console.warn("Backend unavailable, using defaults", err.name === 'AbortError' ? '(timeout)' : err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Push all changes to the live database
  const pushChanges = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/seed`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuData: menuSections,
          heroBackdrop,
          menuBackdrop
        })
      });
      if (!res.ok) throw new Error('Failed to push changes');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // -- Menu Management Functions (Local State) --
  const addCategory = (category) => {
    setMenuSections(prev => [...prev, category])
  }

  const deleteCategory = (categoryId) => {
    setMenuSections(prev => prev.filter(s => s.id !== categoryId))
  }

  const updateCategory = (categoryId, updatedCategory) => {
    setMenuSections(prev => prev.map(s => s.id === categoryId ? updatedCategory : s))
  }

  const addItemToCategory = (categoryId, item) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return { ...s, items: [...s.items, item] }
      }
      return s
    }))
  }

  const deleteItemFromCategory = (categoryId, itemId) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return { ...s, items: s.items.filter(i => i.id !== itemId) }
      }
      return s
    }))
  }

  const updateItemInCategory = (categoryId, itemId, updatedItem) => {
    setMenuSections(prev => prev.map(s => {
      if (s.id === categoryId) {
        return {
          ...s,
          items: s.items.map(i => i.id === itemId ? updatedItem : i)
        }
      }
      return s
    }))
  }

  return (
    <AdminContext.Provider value={{
      heroBackdrop, setHeroBackdrop,
      menuBackdrop, setMenuBackdrop,
      menuSections, setMenuSections,
      addCategory, deleteCategory, updateCategory,
      addItemToCategory, deleteItemFromCategory, updateItemInCategory,
      pushChanges, isLoading
    }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}

export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function BackgroundMedia({ media, className = "" }) {
  if (media.type === 'image') {
    return <img src={media.url} alt="Backdrop" className={className} style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
  }

  const ytId = getYoutubeVideoId(media.url);
  if (ytId) {
    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&playsinline=1`}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', border: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.5)' }}
          allow="autoplay; encrypted-media"
        />
      </div>
    )
  }

  return <video src={media.url} className={className} autoPlay muted loop playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
}
