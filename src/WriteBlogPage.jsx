import React, { useState, useEffect } from 'react'
import { useBlogs } from './BlogContext'
import { useAdmin, BackgroundMedia } from './AdminContext'
import './Blogs.css'

export default function WriteBlogPage() {
  const { addBlog } = useBlogs()
  const { menuBackdrop } = useAdmin()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handlePublish = (e) => {
    e.preventDefault()
    if (!title.trim() || !author.trim() || !content.trim()) {
      alert('Please fill out all fields before publishing.')
      return
    }
    
    addBlog(title, author, content)
    window.location.hash = '#/blogs'
  }

  const handleCancel = (e) => {
    e.preventDefault()
    window.location.hash = '#/blogs'
  }

  return (
    <div className="write-blog-page" style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="page-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <BackgroundMedia media={menuBackdrop} />
        <div className="page-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(20, 19, 19, 0.85)', backdropFilter: 'blur(12px)' }} />
      </div>
      <header className="write-blog-header">
        <h1 className="write-blog-title">Write a Blog</h1>
      </header>

      <form className="blog-form" onSubmit={handlePublish}>
        <div className="form-group">
          <label htmlFor="title">Blog Title</label>
          <input 
            type="text" 
            id="title" 
            className="form-input" 
            placeholder="E.g., My Journey to Plant-Based Eating"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="author">Author Name</label>
          <input 
            type="text" 
            id="author" 
            className="form-input" 
            placeholder="E.g., Alex Rivers"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Blog Content</label>
          <textarea 
            id="content" 
            className="form-textarea" 
            placeholder="Write your culinary story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="btn-write-blog">Publish</button>
        </div>
      </form>
    </div>
  )
}
