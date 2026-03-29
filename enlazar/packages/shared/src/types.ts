// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  createdAt?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  chatId: string;
}

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface AuthPayload {
  userId: string;
  name: string;
}

export interface LoginRequest {
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
}

export interface PaginatedMessages {
  messages: Message[];
  total: number;
  hasMore: boolean;
}
