import React, { useState } from 'react';
import './PostModal.css';
import { PostsApi } from '../../api';

const PostModal = ({ isOpen, onClose, post, onPostSaved, currentUser }) => {
  const [formData, setFormData] = useState({
    content: post?.content || '',
    image_url: post?.image_url || '',
    status: post?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedPost;
      if (post?.id) {
        // Update existing post
        savedPost = await PostsApi.updatePost(post.id, formData);
      } else {
        // Create new post
        const postData = {
          ...formData,
          user_id: currentUser?.id || 1 // Use current user or default to user 1
        };
        savedPost = await PostsApi.createPost(postData);
      }
      
      onPostSaved(savedPost);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="post-modal-header">
          <h2>{post?.id ? 'Edit Post' : 'Create New Post'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              placeholder="What's on your mind?"
              required
            />
            <div className="char-count">
              {formData.content.length}/500
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div className="image-preview">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="post-preview">
            <h4>Preview:</h4>
            <div className="preview-card">
              <div className="preview-header">
                <div className="preview-avatar">
                  <img 
                    src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'User')}&background=667eea&color=fff`} 
                    alt="Your avatar" 
                  />
                </div>
                <div className="preview-user">
                  <span className="preview-name">{currentUser?.full_name || 'Your Name'}</span>
                  <span className="preview-username">@{currentUser?.username || 'username'}</span>
                </div>
              </div>
              <div className="preview-content">
                {formData.content || 'Your post content will appear here...'}
              </div>
              {formData.image_url && (
                <div className="preview-image">
                  <img src={formData.image_url} alt="Post" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading || !formData.content.trim()}>
              {loading ? 'Saving...' : (post?.id ? 'Update Post' : 'Create Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;