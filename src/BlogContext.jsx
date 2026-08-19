import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE } from './config'

const BlogContext = createContext()

const STORAGE_KEY = 'veggies_kitchen_blogs'

const INITIAL_BLOGS = [
  {
    id: 'b1',
    title: 'The Secret to Perfect Dal Makhani',
    author: 'Chef Shiv',
    date: 'Oct 15, 2023',
    content: 'Simmering black lentils and kidney beans over a slow charcoal fire for 24 hours is the only way to achieve that authentic, rich creaminess. It requires patience, love, and a touch of artisanal magic. This is how we have always prepared it at Veggies Kitchen, preserving the culinary heritage of our ancestors.'
  },
  {
    id: 'b2',
    title: 'Why Plant-Based Eating is the Future',
    author: 'Aarav Sharma',
    date: 'Nov 02, 2023',
    content: 'Switching to a plant-based diet isn\'t just a trend; it\'s a lifestyle shift that benefits both your health and the environment. I\'ve found that the flavors are richer, the ingredients fresher, and the feeling after a meal is entirely energizing. The Kadhai Paneer at Veggies Kitchen is a prime example of how you don\'t need meat to have a feast.'
  }
]

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      try {
        const res = await fetch(`${API_BASE}/api/blogs`, { signal: controller.signal, cache: 'no-store' })
        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setBlogs(data)
          } else {
            setBlogs(INITIAL_BLOGS)
          }
        } else {
          setBlogs(INITIAL_BLOGS)
        }
      } catch (err) {
        clearTimeout(timeout)
        console.warn("Backend unavailable for blogs, using defaults", err.name === 'AbortError' ? '(timeout)' : err.message)
        setBlogs(INITIAL_BLOGS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const addBlog = async (title, author, content) => {
    const newBlog = {
      id: `b_${Date.now()}`,
      title,
      author,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog)
      })
      if (res.ok) {
        const savedBlog = await res.json()
        setBlogs([savedBlog, ...blogs])
      }
    } catch (err) {
      console.error('Failed to save blog to API', err)
      // Fallback local update
      setBlogs([newBlog, ...blogs])
    }
  }

  const deleteBlog = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        setBlogs(blogs.filter(b => b.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete blog from API', err)
      // Fallback local update
      setBlogs(blogs.filter(b => b.id !== id))
    }
  }

  return (
    <BlogContext.Provider value={{ blogs, addBlog, deleteBlog }}>
      {children}
    </BlogContext.Provider>
  )
}

export function useBlogs() {
  return useContext(BlogContext)
}
