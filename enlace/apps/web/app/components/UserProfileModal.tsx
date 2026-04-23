"use client";

import { useState, useEffect } from "react";
import { Phone, Video, MessageCircle, UserPlus, UserCheck, UserX } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { useFriendStore } from "../store/useFriendStore";
import { useUserStore } from "../store/useUserStore";
import type { Room } from "../types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

interface UserProfileModalProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
  onStartCall: (userId: string, userName: string, type: "audio" | "video") => void;
  onOpenDM: (targetUserId: string, targetUserName?: string) => Promise<Room | null>;
}

type FriendStatus = "none" | "friends" | "sent" | "incoming";

export function UserProfileModal({
  userId,
  userName,
  open,
  onClose,
  onStartCall,
  onOpenDM,
}: UserProfileModalProps) {
  const currentUser = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const { friends, pendingIn, pendingOut, addFriend, removeFriend, removePendingIn, removePendingOut, setPendingOut } =
    useFriendStore();

  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState<string | null>(null);

  const isSelf = currentUser?.id === userId;

  const friendStatus: FriendStatus = (() => {
    if (friends.some((f) => f.id === userId)) return "friends";
    if (pendingOut.some((f) => f.id === userId)) return "sent";
    if (pendingIn.some((f) => f.id === userId)) return "incoming";
    return "none";
  })();

  // Load profile bio
  useEffect(() => {
    if (!open) return;
    fetch(`${API_URL}/users/${userId}`)
      .then((r) => r.json())
      .then((d: { bio?: string }) => setBio(d.bio ?? null))
      .catch(() => setBio(null));
  }, [open, userId]);

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/friends/request/${userId}`, { method: "POST", headers: authHeaders });
      setPendingOut([...pendingOut, { id: userId, name: userName }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/friends/accept/${userId}`, { method: "POST", headers: authHeaders });
      addFriend({ id: userId, name: userName });
      removePendingIn(userId);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/friends/${userId}`, { method: "DELETE", headers: authHeaders });
      removeFriend(userId);
      removePendingOut(userId);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    await onOpenDM(userId, userName);
    onClose();
  };

  const handleCall = (type: "audio" | "video") => {
    onStartCall(userId, userName, type);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary/50 via-primary/30 to-bg-server" />

        {/* Content */}
        <div className="px-5 pb-5">
          {/* Avatar overlapping banner */}
          <div className="-mt-8 mb-3">
            <Avatar name={userName} size="lg" className="w-16 h-16 text-xl border-4 border-bg-surface" />
          </div>

          <h2 className="text-white font-bold text-lg leading-tight">{userName}</h2>
          <p className="text-gray-500 text-xs font-mono mt-0.5 mb-3 truncate">{userId}</p>

          {bio && (
            <div className="bg-bg-base rounded-lg px-3 py-2.5 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">About me</p>
              <p className="text-gray-300 text-sm">{bio}</p>
            </div>
          )}

          {!isSelf && (
            <div className="flex flex-col gap-2">
              {/* Friend action */}
              {friendStatus === "none" && (
                <Button onClick={handleSendRequest} disabled={loading} className="w-full">
                  <UserPlus size={14} /> Add Friend
                </Button>
              )}
              {friendStatus === "sent" && (
                <Button variant="secondary" onClick={handleRemove} disabled={loading} className="w-full">
                  <UserX size={14} /> Cancel Request
                </Button>
              )}
              {friendStatus === "incoming" && (
                <div className="flex gap-2">
                  <Button variant="success" onClick={handleAccept} disabled={loading} className="flex-1">
                    <UserCheck size={14} /> Accept
                  </Button>
                  <Button variant="danger" onClick={handleRemove} disabled={loading} className="flex-1">
                    <UserX size={14} /> Reject
                  </Button>
                </div>
              )}
              {friendStatus === "friends" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-bg-base rounded-lg text-sm">
                  <UserCheck size={14} className="text-green-400" />
                  <span className="flex-1 text-green-400">Friends</span>
                  <button onClick={handleRemove} className="text-gray-500 hover:text-red-400 transition-colors text-xs">
                    Remove
                  </button>
                </div>
              )}

              {/* Communication */}
              <div className="flex gap-2 mt-1">
                <Button variant="secondary" className="flex-1" onClick={handleMessage}>
                  <MessageCircle size={14} /> Message
                </Button>
                <Button variant="secondary" size="icon" title="Voice Call" onClick={() => handleCall("audio")}>
                  <Phone size={14} />
                </Button>
                <Button variant="secondary" size="icon" title="Video Call" onClick={() => handleCall("video")}>
                  <Video size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
