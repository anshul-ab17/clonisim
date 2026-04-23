"use client";

import { create } from "zustand";

export type NotificationType = "mention" | "dm" | "friend_request";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
}

interface NotificationState {
  notifications: AppNotification[];
  add: (n: Omit<AppNotification, "id" | "timestamp">) => void;
  remove: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  add: (n) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { ...n, id: Math.random().toString(36).slice(2), timestamp: Date.now() },
      ],
    })),
  remove: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
