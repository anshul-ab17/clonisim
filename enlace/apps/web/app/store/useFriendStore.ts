"use client";

import { create } from "zustand";
import type { Friend } from "../types";

interface FriendState {
  friends: Friend[];
  pendingIn: Friend[];
  pendingOut: Friend[];
  setFriends: (friends: Friend[]) => void;
  setPendingIn: (users: Friend[]) => void;
  setPendingOut: (users: Friend[]) => void;
  removeFriend: (id: string) => void;
  removePendingIn: (id: string) => void;
  removePendingOut: (id: string) => void;
  addFriend: (friend: Friend) => void;
}

export const useFriendStore = create<FriendState>()((set) => ({
  friends: [],
  pendingIn: [],
  pendingOut: [],
  setFriends: (friends) => set({ friends }),
  setPendingIn: (pendingIn) => set({ pendingIn }),
  setPendingOut: (pendingOut) => set({ pendingOut }),
  removeFriend: (id) => set((s) => ({ friends: s.friends.filter((f) => f.id !== id) })),
  removePendingIn: (id) => set((s) => ({ pendingIn: s.pendingIn.filter((f) => f.id !== id) })),
  removePendingOut: (id) => set((s) => ({ pendingOut: s.pendingOut.filter((f) => f.id !== id) })),
  addFriend: (friend) =>
    set((s) => ({
      friends: s.friends.some((f) => f.id === friend.id) ? s.friends : [...s.friends, friend],
    })),
}));
