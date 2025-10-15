import React, { useState, useEffect } from 'react';
import { PostsApi, LikesApi } from '../../api';
import PostModal from '../PostModal/PostModal';
import './PostManagement.css';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await PostsApi.getAllPosts();
      setPosts(postsData);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
      // Fallback to mock data if API fails
      const mockPosts = [
        {
          id: 1,
          user_id: 1,
          content: 'Just launched my new project! Excited to share it with the world. #coding #javascript',
          image_url: null,
          status: 'active',
          likes_count: 23,
          comments_count: 5,
          created_at: '2024-11-10T10:30:00Z',
          user: {
            username: 'alice',
            full_name: 'Alice Johnson',
            avatar_url: null
          }
        },
        {
          id: 2,
          user_id: 2,
          content: 'Beautiful sunset today! Nature never fails to inspire me.',
          image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
          status: 'active',
          likes_count: 45,
          comments_count: 12,
          created_at: '2024-11-09T18:15:00Z',
          user: {
            username: 'bob',
            full_name: 'Bob Smith',
            avatar_url: null
          }
        },
        {
          id: 3,
          user_id: 3,
          content: 'Working on some exciting new features for our platform. Stay tuned!',
          image_url: null,
          status: 'draft',
          likes_count: 0,
          comments_count: 0,
          created_at: '2024-11-09T14:20:00Z',
          user: {
            username: 'charlie',
            full_name: 'Charlie Brown',
            avatar_url: null
          }
        }
      ];
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleAddPost = () => {
    setSelectedPost(null);
    setShowPostModal(true);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await PostsApi.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (err) {
        alert('Failed to delete post: ' + err.message);
      }
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await LikesApi.likePost(postId);
      // Update the post's like count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handlePostSaved = (savedPost) => {
    if (selectedPost?.id) {
      // Update existing post
      setPosts(posts.map(post => 
        post.id === savedPost.id ? { ...post, ...savedPost } : post
      ));
    } else {
      // Add new post
      const newPost = {
        ...savedPost,
        user: currentUser,
        likes_count: 0,
        comments_count: 0
      };
      setPosts([newPost, ...posts]);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  if (loading) {
    return (
      <div className="post-management">
        <div className="post-management-header">
          <div className="header-left">
            <h2>Post Management</h2>
            <p className="subtitle">Manage posts and content</p>
          </div>
          <button className="add-post-btn" disabled>
            <span className="icon">+</span>
            Create Post
          </button>
        </div>

        <div className="post-controls">
          <div className="search-bar">
            <div className="skeleton skeleton-line" style={{height: 44, borderRadius: 8}}></div>
          </div>
          <div className="filter-controls">
            <div className="skeleton skeleton-line" style={{height: 44, width: 160, borderRadius: 8}}></div>
          </div>
        </div>

        <div className="posts-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-line" style={{height: 24, width: '30%'}}></div>
              <div className="skeleton skeleton-line" style={{height: 12, width: '50%'}}></div>
            </div>
          ))}
        </div>

        <div className="posts-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="skeleton-card" key={idx}>
              <div className="skeleton skeleton-line" style={{height: 18, width: '40%', marginBottom: 8}}></div>
              <div className="skeleton skeleton-line" style={{height: 12, width: '80%', marginBottom: 6}}></div>
              <div className="skeleton skeleton-line" style={{height: 12, width: '65%', marginBottom: 6}}></div>
              <div className="skeleton skeleton-line" style={{height: 160, width: '100%', marginTop: 12}}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="post-management">
      <div className="post-management-header">
        <div className="header-left">
          <h2>Post Management</h2>
          <p className="subtitle">Manage posts and content</p>
        </div>
        <button className="add-post-btn" onClick={handleAddPost}>
          <span className="icon">+</span>
          Create Post
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="post-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search posts by content or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <label>Filter by status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Posts</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="posts-stats">
        <div className="stat-card">
          <h3>{posts.length}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.filter(p => p.status === 'active').length}</h3>
          <p>Active Posts</p>
        </div>
        <div className="stat-card">
          <h3>{posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}</h3>
          <p>Total Likes</p>
        </div>
        <div className="stat-card">
          <h3>{posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)}</h3>
          <p>Total Comments</p>
        </div>
      </div>

      <div className="posts-grid">
        {sortedPosts.map(post => (
          <div key={post.id} className={`post-card ${post.status}`}>
            <div className="post-header">
              <div className="post-author">
                <img
                  src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user?.full_name || post.user?.username || 'User')}&background=667eea&color=fff`}
                  alt={post.user?.full_name || post.user?.username}
                  className="author-avatar"
                />
                <div className="author-info">
                  <span className="author-name">{post.user?.full_name || post.user?.username}</span>
                  <span className="author-username">@{post.user?.username}</span>
                </div>
              </div>
              <div className="post-status">
                <span className={`status-badge ${post.status}`}>
                  {post.status}
                </span>
              </div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
              {post.image_url && (
                <div className="post-image">
                  <img src={post.image_url} alt="Post content" />
                </div>
              )}
            </div>

            <div className="post-stats">
              <div className="stat">
                <span className="icon">❤️</span>
                <span className="number">{post.likes_count || 0}</span>
                <span className="label">Likes</span>
              </div>
              <div className="stat">
                <span className="icon">💬</span>
                <span className="number">{post.comments_count || 0}</span>
                <span className="label">Comments</span>
              </div>
            </div>

            <div className="post-actions">
              <button
                className="like-btn"
                onClick={() => handleLikePost(post.id)}
                disabled={!currentUser}
              >
                Like
              </button>
              <button
                className="edit-btn"
                onClick={() => handleEditPost(post)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeletePost(post.id)}
              >
                Delete
              </button>
            </div>

            <div className="post-meta">
              <span>{new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="no-posts">
          <p>No posts found matching your criteria.</p>
          <button className="create-first-post" onClick={handleAddPost}>
            Create your first post
          </button>
        </div>
      )}

      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        post={selectedPost}
        onPostSaved={handlePostSaved}
        currentUser={currentUser}
      />
    </div>
  );
};

export default PostManagement;