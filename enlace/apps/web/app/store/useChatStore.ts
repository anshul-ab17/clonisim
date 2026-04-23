"use client";

import { create } from "zustand";
import type { Message, Room } from "../types";

type ActiveSection = "global" | "channel" | "dm" | "friends";

interface ChatState {
  globalRoom: Room | null;
  channels: Room[];
  dms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  activeSection: ActiveSection;
  setGlobalRoom: (room: Room) => void;
  setChannels: (rooms: Room[]) => void;
  setDMs: (rooms: Room[]) => void;
  addDM: (room: Room) => void;
  setCurrentRoom: (room: Room | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setActiveSection: (section: ActiveSection) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  globalRoom: null,
  channels: [],
  dms: [],
  currentRoom: null,
  messages: [],
  activeSection: "global",
  setGlobalRoom: (room) => set({ globalRoom: room }),
  setChannels: (channels) => set({ channels }),
  setDMs: (dms) => set({ dms }),
  addDM: (room) => set((s) => ({ dms: [...s.dms.filter((d) => d.chatId !== room.chatId), room] })),
  setCurrentRoom: (room) => set({ currentRoom: room, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((s) => {
      if (message.chatId && s.currentRoom && message.chatId !== s.currentRoom.chatId) return s;
      return { messages: [...s.messages, message] };
    }),
  setActiveSection: (activeSection) => set({ activeSection }),
}));
