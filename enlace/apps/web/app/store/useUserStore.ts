"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface UserState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      clearUser: () => set({ user: null, token: null }),
    }),
    { name: "enlazar_user" }
  )
);
