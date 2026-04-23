"use client";

import { type FormEvent, useState } from "react";
import { UserPlus, MessageCircle, Phone, Video, X, Check } from "lucide-react";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip } from "./ui/tooltip";
import type { Friend, Room } from "../types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

type Tab = "all" | "pending" | "add";

interface FriendsPanelProps {
  token: string;
  onOpenDM: (targetUserId: string) => Promise<Room | null>;
  onStartCall: (userId: string, userName: string, type: "audio" | "video") => void;
  onRefresh: () => void;
}

export function FriendsPanel({ token, onOpenDM, onStartCall, onRefresh }: FriendsPanelProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [addName, setAddName] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const { friends, pendingIn, pendingOut, removeFriend, removePendingIn, removePendingOut, addFriend } =
    useFriendStore();
  const setActiveSection = useChatStore((s) => s.setActiveSection);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const handleOpenDM = async (friend: Friend) => {
    const room = await onOpenDM(friend.id);
    if (room) setActiveSection("dm");
  };

  const handleAccept = async (requesterId: string) => {
    await fetch(`${API_URL}/friends/accept/${requesterId}`, { method: "POST", headers: authHeaders });
    const accepted = pendingIn.find((f) => f.id === requesterId);
    if (accepted) {
      addFriend(accepted);
      removePendingIn(requesterId);
    }
    onRefresh();
  };

  const handleReject = async (requesterId: string) => {
    await fetch(`${API_URL}/friends/${requesterId}`, { method: "DELETE", headers: authHeaders });
    removePendingIn(requesterId);
  };

  const handleRemoveFriend = async (friendId: string) => {
    await fetch(`${API_URL}/friends/${friendId}`, { method: "DELETE", headers: authHeaders });
    removeFriend(friendId);
  };

  const handleAddFriend = async (e: FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddError("");
    setAddLoading(true);
    try {
      // Look up user by name to get their id
      const userRes = await fetch(`${API_URL}/users/by-name/${encodeURIComponent(addName.trim())}`, { headers: authHeaders });
      if (!userRes.ok) {
        setAddError("User not found");
        return;
      }
      const targetUser = (await userRes.json()) as { id: string; name: string };
      const res = await fetch(`${API_URL}/friends/request/${targetUser.id}`, {
        method: "POST",
        headers: authHeaders,
      });
      if (res.ok) {
        setAddName("");
        setAddError("");
        onRefresh();
      } else {
        const body = (await res.json()) as { error?: string };
        setAddError(body.error ?? "Failed to send request");
      }
    } finally {
      setAddLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All Friends", count: friends.length },
    { key: "pending", label: "Pending", count: pendingIn.length },
    { key: "add", label: "Add Friend" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-12 flex items-center gap-4 px-4 border-b border-border-subtle shrink-0">
        <span className="font-semibold text-white text-sm">Friends</span>
        <div className="flex gap-1">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                tab === key ? "bg-bg-input text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* All Friends */}
        {tab === "all" && (
          <div className="flex flex-col gap-1">
            {friends.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-12">No friends yet. Add some!</p>
            )}
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-surface transition-colors group"
              >
                <Avatar name={friend.name} />
                <span className="flex-1 text-white text-sm font-medium">{friend.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip label="Message">
                    <Button variant="secondary" size="icon" onClick={() => handleOpenDM(friend)}>
                      <MessageCircle size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Voice Call">
                    <Button variant="secondary" size="icon" onClick={() => onStartCall(friend.id, friend.name, "audio")}>
                      <Phone size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Video Call">
                    <Button variant="secondary" size="icon" onClick={() => onStartCall(friend.id, friend.name, "video")}>
                      <Video size={15} />
                    </Button>
                  </Tooltip>
                  <Tooltip label="Remove Friend">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveFriend(friend.id)}>
                      <X size={15} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending */}
        {tab === "pending" && (
          <div className="flex flex-col gap-4">
            {pendingIn.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Incoming — {pendingIn.length}
                </p>
                {pendingIn.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-surface">
                    <Avatar name={req.name} />
                    <span className="flex-1 text-white text-sm font-medium">{req.name}</span>
                    <Tooltip label="Accept">
                      <Button variant="success" size="icon" onClick={() => handleAccept(req.id)}>
                        <Check size={15} />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Reject">
                      <Button variant="danger" size="icon" onClick={() => handleReject(req.id)}>
                        <X size={15} />
                      </Button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
            {pendingOut.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Sent — {pendingOut.length}
                </p>
                {pendingOut.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-surface">
                    <Avatar name={req.name} />
                    <span className="flex-1 text-white text-sm font-medium">{req.name}</span>
                    <span className="text-xs text-gray-500">Pending</span>
                    <Button variant="ghost" size="icon" onClick={() => removePendingOut(req.id)}>
                      <X size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {pendingIn.length === 0 && pendingOut.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-12">No pending requests.</p>
            )}
          </div>
        )}

        {/* Add Friend */}
        {tab === "add" && (
          <div className="max-w-md">
            <p className="text-gray-400 text-sm mb-4">
              You can add friends by their username.
            </p>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <Input
                placeholder="Enter a username"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                autoFocus
              />
              <Button type="submit" disabled={addLoading || !addName.trim()}>
                <UserPlus size={16} />
                Send
              </Button>
            </form>
            {addError && <p className="text-red-400 text-sm mt-2">{addError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
