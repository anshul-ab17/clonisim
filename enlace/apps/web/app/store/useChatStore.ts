"use client";

import { create } from "zustand";
import type { Message, Room } from "../types";

interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  setRooms: (rooms) => set({ rooms }),
  setCurrentRoom: (room) => set({ currentRoom: room, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
