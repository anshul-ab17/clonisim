import { create } from "zustand";
import { User, ChatRoom, Message } from "@enlazar/shared";

interface AppState {
  // Auth
  token: string | null;
  currentUser: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;

  // Rooms
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (room: ChatRoom) => void;
  addRoom: (room: ChatRoom) => void;

  // Messages keyed by chatId
  messages: Record<string, Message[]>;
  appendMessage: (chatId: string, msg: Message) => void;
  setMessages: (chatId: string, msgs: Message[]) => void;

  // Online users in the active room (populated via WS events)
  onlineUsers: Record<string, { userId: string; name: string }[]>;
  setUserJoined: (chatId: string, userId: string, name: string) => void;
  setUserLeft: (chatId: string, userId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem("enlazar_token"),
  currentUser: (() => {
    try {
      const raw = localStorage.getItem("enlazar_user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  })(),

  setAuth: (token, user) => {
    localStorage.setItem("enlazar_token", token);
    localStorage.setItem("enlazar_user", JSON.stringify(user));
    set({ token, currentUser: user });
  },

  logout: () => {
    localStorage.removeItem("enlazar_token");
    localStorage.removeItem("enlazar_user");
    set({ token: null, currentUser: null, activeRoom: null, rooms: [] });
  },

  rooms: [],
  activeRoom: null,
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (room) => set({ activeRoom: room }),
  addRoom: (room) =>
    set((s) => ({ rooms: [...s.rooms.filter((r) => r.id !== room.id), room] })),

  messages: {},
  appendMessage: (chatId, msg) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [...(s.messages[chatId] ?? []), msg],
      },
    })),
  setMessages: (chatId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [chatId]: msgs } })),

  onlineUsers: {},
  setUserJoined: (chatId, userId, name) =>
    set((s) => {
      const existing = s.onlineUsers[chatId] ?? [];
      if (existing.some((u) => u.userId === userId)) return s;
      return {
        onlineUsers: {
          ...s.onlineUsers,
          [chatId]: [...existing, { userId, name }],
        },
      };
    }),
  setUserLeft: (chatId, userId) =>
    set((s) => ({
      onlineUsers: {
        ...s.onlineUsers,
        [chatId]: (s.onlineUsers[chatId] ?? []).filter((u) => u.userId !== userId),
      },
    })),
}));
