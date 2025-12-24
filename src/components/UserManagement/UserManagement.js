import React, { useState, useEffect } from 'react';
import { UsersApi } from '../../api';
import UserModal from '../UserModal/UserModal';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UsersApi.getAllUsers();
      setUsers(usersData);
      setError('');
      console.log('✅ Successfully loaded users from database:', usersData.length, 'users');
    } catch (err) {
      const errorMsg = 'Failed to load users: ' + err.message;
      setError(errorMsg);
      console.error('❌ Error loading users:', err);
      // Fallback to mock data if API fails
      const mockUsers = [
        {
          id: 1,
          username: 'alice',
          email: 'alice@example.com',
          full_name: 'Alice Johnson',
          bio: 'Coffee and code enthusiast',
          created_at: '2024-10-01',
          posts_count: 12,
          followers_count: 156,
          following_count: 89
        },
        {
          id: 2,
          username: 'bob',
          email: 'bob@example.com',
          full_name: 'Bob Smith',
          bio: 'Design thinking practitioner',
          created_at: '2024-09-15',
          posts_count: 8,
          followers_count: 234,
          following_count: 67
        },
        {
          id: 3,
          username: 'charlie',
          email: 'charlie@example.com',
          full_name: 'Charlie Brown',
          bio: 'Tech entrepreneur',
          created_at: '2024-08-20',
          posts_count: 25,
          followers_count: 512,
          following_count: 123
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await UsersApi.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleUserSaved = (savedUser) => {
    if (selectedUser?.id) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === savedUser.id ? savedUser : user
      ));
    } else {
      // Add new user
      setUsers([savedUser, ...users]);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'username':
        return a.username.localeCompare(b.username);
      case 'email':
        return a.email.localeCompare(b.email);
      case 'posts_count':
        return b.posts_count - a.posts_count;
      case 'followers_count':
        return b.followers_count - a.followers_count;
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="user-management">
        <div className="user-management-header">
          <div className="header-left">
            <h2>User Management</h2>
            <p className="subtitle">Manage user accounts and profiles</p>
          </div>
          <button className="add-user-btn" disabled>
            <span className="icon">+</span>
            Add User
          </button>
        </div>

        <div className="user-controls">
          <div className="search-bar">
            <div className="skeleton skeleton-line" style={{height: 44, borderRadius: 8}}></div>
          </div>
          <div className="sort-controls">
            <div className="skeleton skeleton-line" style={{height: 44, width: 180, borderRadius: 8}}></div>
          </div>
        </div>

        <div className="users-stats">
          <div className="skeleton-card">
            <div className="skeleton skeleton-line" style={{height: 24, width: '30%'}}></div>
            <div className="skeleton skeleton-line" style={{height: 12, width: '50%'}}></div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton skeleton-line" style={{height: 24, width: '30%'}}></div>
            <div className="skeleton skeleton-line" style={{height: 12, width: '50%'}}></div>
          </div>
          <div className="skeleton-card">
            <div className="skeleton skeleton-line" style={{height: 24, width: '30%'}}></div>
            <div className="skeleton skeleton-line" style={{height: 12, width: '50%'}}></div>
          </div>
        </div>

        <div className="users-grid">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div className="skeleton-card" key={idx}>
              <div className="skeleton skeleton-circle" style={{width: 60, height: 60, marginBottom: 16}}></div>
              <div className="skeleton skeleton-line" style={{height: 16, width: '40%'}}></div>
              <div className="skeleton skeleton-line" style={{height: 12, width: '60%'}}></div>
              <div className="skeleton skeleton-line" style={{height: 12, width: '80%'}}></div>
              <div className="skeleton skeleton-line" style={{height: 80, width: '100%'}}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <div className="header-left">
          <h2>User Management</h2>
          <p className="subtitle">Manage user accounts and profiles</p>
        </div>
        <button className="add-user-btn" onClick={handleAddUser}>
          <span className="icon">+</span>
          Add User
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="user-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-controls">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Date Created</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
            <option value="posts_count">Posts Count</option>
            <option value="followers_count">Followers</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.reduce((sum, user) => sum + (user.posts_count || 0), 0)}</h3>
          <p>Total Posts</p>
        </div>
        <div className="stat-card">
          <h3>{users.reduce((sum, user) => sum + (user.followers_count || 0), 0)}</h3>
          <p>Total Followers</p>
        </div>
      </div>

      <div className="users-grid">
        {sortedUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=667eea&color=fff`}
                alt={user.full_name || user.username}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=667eea&color=fff`;
                }}
              />
            </div>
            <div className="user-info">
              <h3>{user.full_name || user.username}</h3>
              <p className="username">@{user.username}</p>
              <p className="email">{user.email}</p>
              {user.bio && <p className="bio">{user.bio}</p>}
            </div>
            <div className="user-stats">
              <div className="stat">
                <span className="number">{user.posts_count || 0}</span>
                <span className="label">Posts</span>
              </div>
              <div className="stat">
                <span className="number">{user.followers_count || 0}</span>
                <span className="label">Followers</span>
              </div>
              <div className="stat">
                <span className="number">{user.following_count || 0}</span>
                <span className="label">Following</span>
              </div>
            </div>
            <div className="user-actions">
              <button
                className="edit-btn"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </div>
            <div className="user-meta">
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="no-users">
          <p>No users found matching your search criteria.</p>
        </div>
      )}

      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default UserManagement;