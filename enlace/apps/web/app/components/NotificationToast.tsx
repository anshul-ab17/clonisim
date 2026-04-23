"use client";

import { useEffect } from "react";
import { MessageCircle, AtSign, UserPlus, X } from "lucide-react";
import { useNotificationStore, type AppNotification } from "../store/useNotificationStore";

const ICONS = {
  dm: MessageCircle,
  mention: AtSign,
  friend_request: UserPlus,
};

const COLORS = {
  dm: "text-blue-400",
  mention: "text-yellow-400",
  friend_request: "text-green-400",
};

function Toast({ n }: { n: AppNotification }) {
  const remove = useNotificationStore((s) => s.remove);

  useEffect(() => {
    const t = setTimeout(() => remove(n.id), 5000);
    return () => clearTimeout(t);
  }, [n.id]);

  const Icon = ICONS[n.type];

  return (
    <div className="flex items-start gap-3 bg-bg-surface border border-border-subtle rounded-lg px-4 py-3 shadow-xl w-72 transition-all">
      <Icon size={16} className={`shrink-0 mt-0.5 ${COLORS[n.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-semibold truncate">{n.title}</p>
        <p className="text-gray-400 text-xs truncate">{n.body}</p>
      </div>
      <button onClick={() => remove(n.id)} className="text-gray-500 hover:text-gray-300 shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

export function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {notifications.map((n) => (
        <Toast key={n.id} n={n} />
      ))}
    </div>
  );
}
