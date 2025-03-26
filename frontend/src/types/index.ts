export interface Follower {
  _id: string;
  username: string;
  avatar: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers?: string[];
  following?: string[];
  createdAt?: string;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  author: User;
  likes: string[];
  comments: Comment[];
  shares?: number;
  saved?: boolean;
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface SearchResults {
  users: User[];
  posts: Post[];
  hashtags: string[];
}

export interface Activity {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  author: User;
  post?: Post;
  createdAt: string;
}

export interface Hashtag {
  tag: string;
  count: number;
}