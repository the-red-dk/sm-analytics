const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

async function http(path, options = {}) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 
      'Content-Type': 'application/json', 
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}) 
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const AuthApi = {
  login: (credentials) => http('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => http('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
};

export const UsersApi = {
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/users?${query}`);
  },
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/users?${query}`);
  },
  getUser: (id) => http(`/api/users/${id}`),
  createUser: (data) => http('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUser: (id, data) => http(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteUser: (id) => http(`/api/users/${id}`, { method: 'DELETE' })
};

export const PostsApi = {
  getAllPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/posts?${query}`);
  },
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/posts?${query}`);
  },
  getPostsByUser: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/posts/user/${userId}?${query}`);
  },
  createPost: (data) => http('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePost: (id, data) => http(`/api/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePost: (id) => http(`/api/posts/${id}`, { method: 'DELETE' })
};

export const LikesApi = {
  likePost: (postId) => http(`/api/likes/post/${postId}`, { method: 'POST' }),
  unlikePost: (postId) => http(`/api/likes/post/${postId}`, { method: 'DELETE' }),
  getPostLikes: (postId) => http(`/api/likes/post/${postId}`)
};

export const FollowersApi = {
  followUser: (userId) => http(`/api/followers/${userId}`, { method: 'POST' }),
  unfollowUser: (userId) => http(`/api/followers/${userId}`, { method: 'DELETE' }),
  getFollowers: (userId) => http(`/api/followers/followers/${userId}`),
  getFollowing: (userId) => http(`/api/followers/following/${userId}`)
};

export const CommentsApi = {
  getPostComments: (postId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return http(`/api/comments/post/${postId}?${query}`);
  },
  createComment: (postId, data) => http(`/api/comments/post/${postId}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteComment: (id) => http(`/api/comments/${id}`, { method: 'DELETE' })
};

export const AnalyticsApi = {
  getSummary: () => http('/api/analytics/summary'),
  getEngagement: () => http('/api/analytics/engagement'),
  getContentPerformance: () => http('/api/analytics/content-performance'),
  getUserGrowth: () => http('/api/analytics/user-growth'),
};

export default { AuthApi, UsersApi, PostsApi, LikesApi, FollowersApi, CommentsApi, AnalyticsApi };
