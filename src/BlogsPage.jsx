import React, { useEffect } from 'react'
import { useBlogs } from './BlogContext'
import { useAdmin, BackgroundMedia } from './AdminContext'
import './Blogs.css'

export default function BlogsPage() {
  const { blogs } = useBlogs()
  const { menuBackdrop } = useAdmin()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const goWriteBlog = (e) => {
    e.preventDefault()
    window.location.hash = '#/write-blog'
  }

  return (
    <div className="blogs-page-root" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} />
        <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
      </div>
      <div className="blogs-page">
        <header className="blogs-header">
          <div>
            <h1 className="blogs-title">Community Blogs</h1>
            <p className="blogs-subtitle">Discover culinary secrets, plant-based lifestyle tips, and stories from our community.</p>
          </div>
          <div className="blogs-action-container">
            <button className="btn-write-blog" onClick={goWriteBlog}>
              <span className="material-symbols-outlined">edit_square</span>
              Write a Blog
            </button>
            <div className="blogging-animation-wrapper">
              <img src="/32lOrJFMmR.svg" alt="Blogging Animation" className="blogging-animation" />
            </div>
          </div>
        </header>

      <div className="blogs-grid">
        {blogs.map(blog => (
          <article key={blog.id} className="blog-card">
            <div className="blog-card-meta">
              <span>{blog.date}</span>
            </div>
            <h2 className="blog-card-title">{blog.title}</h2>
            <p className="blog-card-excerpt">
              {blog.content.length > 150 ? `${blog.content.substring(0, 150)}...` : blog.content}
            </p>
            <div className="blog-card-footer">
              <div className="blog-author-avatar">
                {blog.author.charAt(0).toUpperCase()}
              </div>
              <span className="blog-author-name">{blog.author}</span>
            </div>
          </article>
        ))}
      </div>
      </div>
    </div>
  )
}
