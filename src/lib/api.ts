const API_BASE = "http://localhost:3000";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "API Error");
  }
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request("/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { username: string; password: string }) =>
    request<{ token: string }>("/login", { method: "POST", body: JSON.stringify(data) }),
};

// Tweets
export interface Tweet {
  id: number;
  content: string;
  userId: number;
  username?: string;
  createdAt?: string;
  comments?: Comment[];
  likes?: Like[];
  retweets?: Retweet[];
  likeCount?: number;
  commentCount?: number;
  retweetCount?: number;
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  username?: string;
  tweetId: number;
  createdAt?: string;
}

export interface Like {
  id: number;
  userId: number;
  tweetId: number;
}

export interface Retweet {
  id: number;
  userId: number;
  tweetId: number;
  createdAt?: string;
}

export const tweetApi = {
  create: (data: { content: string; userId: number }) =>
    request<Tweet>("/tweet", { method: "POST", body: JSON.stringify(data) }),
  findByUserId: (userId: number) =>
    request<Tweet[]>(`/tweet/findByUserId?userId=${userId}`),
  findById: (id: number) =>
    request<Tweet>(`/tweet/findById?id=${id}`),
  update: (id: number, data: Partial<Tweet>) =>
    request<Tweet>(`/tweet/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/tweet/${id}`, { method: "DELETE" }),
};

export const commentApi = {
  create: (data: { content: string; userId: number; tweetId: number }) =>
    request<Comment>("/comment", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: { content: string }) =>
    request<Comment>(`/comment/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/comment/${id}`, { method: "DELETE" }),
};

export const likeApi = {
  like: (data: { userId: number; tweetId: number }) =>
    request<Like>("/like", { method: "POST", body: JSON.stringify(data) }),
  dislike: (data: { userId: number; tweetId: number }) =>
    request<void>("/dislike", { method: "POST", body: JSON.stringify(data) }),
};

export const retweetApi = {
  create: (data: { userId: number; tweetId: number }) =>
    request<Retweet>("/retweet", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<void>(`/retweet/${id}`, { method: "DELETE" }),
};
