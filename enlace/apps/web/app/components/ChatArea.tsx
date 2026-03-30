"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";

interface ChatAreaProps {
  onSendMessage: (content: string) => void;
}

function formatTime(createdAt: string) {
  try {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatArea({ onSendMessage }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const user = useUserStore((s) => s.user);
  const messages = useChatStore((s) => s.messages);
  const room = useChatStore((s) => s.currentRoom);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  if (!room) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="h-12 flex items-center px-4 border-b border-border-subtle gap-2 shrink-0">
        <span className="text-gray-500">#</span>
        <span className="font-semibold text-white text-sm">{room.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <p className="text-4xl mb-2">#</p>
            <p className="font-semibold text-gray-400">Welcome to #{room.name}</p>
            <p className="text-sm mt-1">This is the beginning of the channel.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.userId === user?.id;
          const prev = messages[i - 1];
          const grouped = prev?.userId === msg.userId;

          return (
            <div
              key={msg.id ?? i}
              className={`flex gap-3 ${grouped ? "mt-0.5" : "mt-3"}`}
            >
              {!grouped ? (
                <div className="w-9 h-9 rounded-full bg-primary shrink-0 flex items-center justify-center text-white text-sm font-semibold uppercase">
                  {(msg.userName ?? msg.userId).slice(0, 1)}
                </div>
              ) : (
                <div className="w-9 shrink-0" />
              )}

              <div className="flex flex-col min-w-0">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className={`text-sm font-semibold ${isOwn ? "text-primary" : "text-gray-200"}`}
                    >
                      {msg.userName ?? msg.userId}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-300 break-words">{msg.content}</p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 shrink-0">
        <form onSubmit={handleSubmit}>
          <input
            className="w-full bg-bg-input rounded-lg px-4 py-3 text-white text-sm outline-none placeholder-gray-500 focus:ring-1 focus:ring-primary transition-all"
            placeholder={`Message #${room.name}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
