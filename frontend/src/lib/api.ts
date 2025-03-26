import axios from 'axios';
import { AuthResponse, Post, User, Comment, SearchResults, Activity, Hashtag, Follower } from '../types';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string) => 
    api.post<AuthResponse>('/auth/register', { username, email, password }),
  
  login: (email: string, password: string) => 
    api.post<AuthResponse>('/auth/login', { email, password }),
};

// Posts API
export const postsAPI = {
  getAllPosts: () => 
    api.get<Post[]>('/posts'),
  
  getFeed: () => 
    api.get<Post[]>('/posts/feed'),
  
  getPopularPosts: () => 
    api.get<Post[]>('/posts/popular'),
  
  getTrendingPosts: () => 
    api.get<Post[]>('/posts/trending'),
  
  createPost: (content: string, image?: string) => 
    api.post<Post>('/posts', { content, image }),
  
  likePost: (postId: string) => 
    api.put<Post>(`/posts/${postId}/like`),
  
  savePost: (postId: string) => 
    api.post<Post>(`/posts/${postId}/save`),
  
  sharePost: (postId: string) => 
    api.post<Post>(`/posts/${postId}/share`),
  
  addComment: (postId: string, text: string) => 
    api.post<Comment>(`/comments/${postId}`, { text }),

  getUserPosts: (userId: string) =>
    api.get<Post[]>(`/posts/user/${userId}`),
  
};

// Users API
export const usersAPI = {
  getUser: (userId: string) => 
    api.get<User>(`/users/${userId}`),

  followUser: (userId: string) => 
    api.put<User>(`/users/${userId}/follow`),

  unfollowUser: (userId: string) => 
    api.put<User>(`/users/${userId}/unfollow`),

  getUserFollowing: (userId: string) =>
    api.get<Follower[]>(`/users/${userId}/following`),
  
  getUserFollowers: (userId: string) =>
    api.get<Follower[]>(`/users/${userId}/followers`),

  getSuggestions: () => 
    api.get<User[]>('/users/suggestions'),

  updateUser: (userId: string, payload: object) =>
    api.put<User>(`/users/${userId}`, payload),
  
  getActivity: () => 
    api.get<Activity[]>('/users/activity'),
  
  getFriends: () => 
    api.get<User[]>('/users/friends'),
};

// Search API
export const searchAPI = {
  search: (query: string) => 
    api.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`),
};

// Hashtags API
export const hashtagsAPI = {
  getTrending: () => 
    api.get<Hashtag[]>('/posts/trending/topics'),
  
  getByTag: (tag: string) => 
    api.get<Post[]>(`/hashtags/${tag}`),
};

export default api;