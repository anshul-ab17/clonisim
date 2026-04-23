"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Send, Phone, Video, UserPlus } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useUserStore } from "../store/useUserStore";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";
import { UserProfileModal } from "./UserProfileModal";
import { InviteToChannelModal } from "./InviteToChannelModal";
import type { Room } from "../types";

interface ChatAreaProps {
  onSendMessage: (content: string) => void;
  onStartCall?: (type: "audio" | "video") => void;
  onStartCallWithUser?: (userId: string, userName: string, type: "audio" | "video") => void;
  onOpenDM: (targetUserId: string) => Promise<Room | null>;
}

function formatTime(createdAt: string) {
  try {
    return new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function ChatArea({ onSendMessage, onStartCall, onStartCallWithUser, onOpenDM }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [profileUser, setProfileUser] = useState<{ id: string; name: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const messages = useChatStore((s) => s.messages);
  const room = useChatStore((s) => s.currentRoom);
  const activeSection = useChatStore((s) => s.activeSection);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const isDM = activeSection === "dm";
  const isGlobal = activeSection === "global";
  const isChannel = activeSection === "channel";
  const prefix = isGlobal ? "" : isDM ? "@" : "#";

  if (!room) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{prefix}</span>
          <span className="font-semibold text-white text-sm">{room.name}</span>
        </div>

        <div className="flex gap-1">
          {/* DM call buttons */}
          {onStartCall && isDM && (
            <>
              <Tooltip label="Voice Call">
                <Button variant="ghost" size="icon" onClick={() => onStartCall("audio")}>
                  <Phone size={16} />
                </Button>
              </Tooltip>
              <Tooltip label="Video Call">
                <Button variant="ghost" size="icon" onClick={() => onStartCall("video")}>
                  <Video size={16} />
                </Button>
              </Tooltip>
            </>
          )}

          {/* Channel: call & invite */}
          {isChannel && (
            <>
              <Tooltip label="Voice Call (select a member)">
                <Button variant="ghost" size="icon" disabled>
                  <Phone size={16} />
                </Button>
              </Tooltip>
              <Tooltip label="Video Call (select a member)">
                <Button variant="ghost" size="icon" disabled>
                  <Video size={16} />
                </Button>
              </Tooltip>
              {token && (
                <InviteToChannelModal chatId={room.chatId} channelName={room.name} token={token}>
                  <Tooltip label="Invite to Channel">
                    <Button variant="ghost" size="icon">
                      <UserPlus size={16} />
                    </Button>
                  </Tooltip>
                </InviteToChannelModal>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-0.5">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600 py-20">
            <p className="text-4xl mb-2">{isDM ? "💬" : "#"}</p>
            <p className="font-semibold text-gray-400">
              {isDM ? "Start a conversation" : `Welcome to #${room.name}`}
            </p>
            <p className="text-sm mt-1">
              {isDM ? "Send a message to get started." : "This is the beginning of this channel."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.userId === user?.id;
          const prev = messages[i - 1];
          const grouped = prev?.userId === msg.userId;
          const clickable = !isOwn;
          const hasMention = user
            ? msg.content.toLowerCase().includes(`@${user.name.toLowerCase()}`)
            : false;

          // Render content with highlighted @mention
          const renderContent = () => {
            if (!user || !hasMention) return <span>{msg.content}</span>;
            const parts = msg.content.split(new RegExp(`(@${user.name})`, "gi"));
            return (
              <>
                {parts.map((part, idx) =>
                  part.toLowerCase() === `@${user.name.toLowerCase()}` ? (
                    <span key={idx} className="text-yellow-400 font-medium bg-yellow-400/10 rounded px-0.5">
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </>
            );
          };

          return (
            <div
              key={msg.id ?? i}
              className={`flex gap-3 ${grouped ? "mt-0.5" : "mt-3"} group ${
                hasMention ? "bg-yellow-500/5 -mx-2 px-2 rounded" : ""
              }`}
            >
              {!grouped ? (
                <button
                  onClick={() => clickable && setProfileUser({ id: msg.userId, name: msg.userName ?? msg.userId })}
                  className={clickable ? "cursor-pointer hover:opacity-80 transition-opacity shrink-0" : "shrink-0 cursor-default"}
                >
                  <Avatar name={msg.userName ?? msg.userId} />
                </button>
              ) : (
                <div className="w-9 shrink-0" />
              )}

              <div className="flex flex-col min-w-0 flex-1">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <button
                      onClick={() => clickable && setProfileUser({ id: msg.userId, name: msg.userName ?? msg.userId })}
                      className={`text-sm font-semibold transition-colors ${
                        isOwn
                          ? "text-primary cursor-default"
                          : "text-gray-200 hover:text-white cursor-pointer"
                      }`}
                    >
                      {msg.userName ?? msg.userId}
                    </button>
                    <span className="text-xs text-gray-600">{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <p className="text-sm text-gray-300 break-words">{renderContent()}</p>
              </div>

              {/* Quick action buttons on hover — global/channel only */}
              {!isDM && !isOwn && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 items-start pt-0.5">
                  <Tooltip label="Voice Call">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => onStartCallWithUser?.(msg.userId, msg.userName ?? msg.userId, "audio")}
                    >
                      <Phone size={12} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Video Call">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => onStartCallWithUser?.(msg.userId, msg.userName ?? msg.userId, "video")}
                    >
                      <Video size={12} />
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-bg-input rounded-lg px-4 pr-2 py-1">
          <input
            className="flex-1 bg-transparent py-2.5 text-white text-sm outline-none placeholder-gray-500"
            placeholder={`Message ${prefix}${room.name}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            variant="ghost"
            className="shrink-0 text-gray-400 hover:text-primary"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>

      {/* Profile modal */}
      {profileUser && (
        <UserProfileModal
          userId={profileUser.id}
          userName={profileUser.name}
          open={!!profileUser}
          onClose={() => setProfileUser(null)}
          onStartCall={(uid, uname, type) => onStartCallWithUser?.(uid, uname, type)}
          onOpenDM={onOpenDM}
        />
      )}
    </div>
  );
}
