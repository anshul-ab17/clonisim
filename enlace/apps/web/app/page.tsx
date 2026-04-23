"use client";

import { useEffect, useCallback, useRef } from "react";
import { useUserStore } from "./store/useUserStore";
import { useChatStore } from "./store/useChatStore";
import { useFriendStore } from "./store/useFriendStore";
import { useNotificationStore } from "./store/useNotificationStore";
import { useWS } from "./hooks/useWS";
import { useWebRTC } from "./hooks/useWebRTC";
import { HeroSection } from "./components/HeroSection";
import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { FriendsPanel } from "./components/FriendsPanel";
import { CallOverlay } from "./components/CallOverlay";
import { NotificationToast } from "./components/NotificationToast";
import { TooltipProvider } from "./components/ui/tooltip";
import type { Friend, Room } from "./types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";

export default function Home() {
  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);

  const {
    globalRoom, channels,
    currentRoom, activeSection,
    setGlobalRoom, setChannels, addDM,
    setCurrentRoom, setMessages,
  } = useChatStore();

  const { setFriends, setPendingIn, setPendingOut } = useFriendStore();
  const pendingIn = useFriendStore((s) => s.pendingIn);
  const addNotification = useNotificationStore((s) => s.add);
  const prevPendingInCountRef = useRef(0);

  const { send, joinRoom } = useWS(token, user?.name);
  const { localVideoRef, remoteVideoRef, startCall, acceptCall, rejectCall, endCall } = useWebRTC(send);

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  // Load initial data
  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_URL}/chats/global`).then((r) => r.json()).then(setGlobalRoom).catch(console.error);
    fetch(`${API_URL}/chats/channels`).then((r) => r.json()).then(setChannels).catch(console.error);
    loadFriends();
  }, [user?.id, token]);

  // Notify on new friend requests
  useEffect(() => {
    if (pendingIn.length > prevPendingInCountRef.current) {
      const newest = pendingIn[pendingIn.length - 1];
      if (newest) {
        addNotification({
          type: "friend_request",
          title: "Friend Request",
          body: `${newest.name} sent you a friend request`,
        });
      }
    }
    prevPendingInCountRef.current = pendingIn.length;
  }, [pendingIn.length]);

  const loadFriends = useCallback(async () => {
    const h = authHeaders();
    const [friends, pendingIn, pendingOut] = await Promise.all([
      fetch(`${API_URL}/friends`, { headers: h }).then((r) => r.json()),
      fetch(`${API_URL}/friends/requests`, { headers: h }).then((r) => r.json()),
      fetch(`${API_URL}/friends/requests/sent`, { headers: h }).then((r) => r.json()),
    ]);
    setFriends(friends as Friend[]);
    setPendingIn(pendingIn as Friend[]);
    setPendingOut(pendingOut as Friend[]);
  }, [authHeaders]);

  // Join room + load history whenever the room changes
  useEffect(() => {
    if (!currentRoom || !user || !token) return;
    let cancelled = false;

    joinRoom(currentRoom.chatId);

    fetch(`${API_URL}/messages/${currentRoom.chatId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((msgs) => { if (!cancelled) setMessages(msgs); })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [currentRoom?.chatId, user?.id, token]);

  // Auto-select global room once loaded
  useEffect(() => {
    if (globalRoom && !currentRoom) setCurrentRoom(globalRoom);
  }, [globalRoom]);

  const handleSendMessage = (content: string) => {
    if (!currentRoom || !user) return;
    send({ type: "message", chatId: currentRoom.chatId, userId: user.id, userName: user.name, content });
  };

  const handleCreateChannel = async (name: string) => {
    const res = await fetch(`${API_URL}/chats/channels`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    const room = (await res.json()) as Room;
    setChannels([...channels, room]);
    setCurrentRoom(room);
    useChatStore.getState().setActiveSection("channel");
  };

  const handleOpenDM = async (targetUserId: string, targetUserName?: string): Promise<Room | null> => {
    try {
      const res = await fetch(`${API_URL}/dm`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) return null;
      const raw = (await res.json()) as Room;
      const room: Room = { ...raw, name: targetUserName ?? raw.name, participantId: targetUserId };
      addDM(room);
      setCurrentRoom(room);
      useChatStore.getState().setActiveSection("dm");
      return room;
    } catch {
      return null;
    }
  };

  const handleStartCall = (userId: string, userName: string, type: "audio" | "video") => {
    startCall(userId, userName, type).catch(console.error);
  };

  const handleStartCallFromRoom = (type: "audio" | "video") => {
    if (!currentRoom?.participantId || !currentRoom.name) return;
    handleStartCall(currentRoom.participantId, currentRoom.name, type);
  };

  if (!user || !token) {
    return (
      <TooltipProvider>
        <HeroSection />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-bg-base text-white overflow-hidden">
        <Sidebar onCreateChannel={handleCreateChannel} onOpenDM={handleOpenDM} />

        <div className="flex-1 flex min-w-0">
          {activeSection === "friends" ? (
            <FriendsPanel
              token={token}
              onOpenDM={handleOpenDM}
              onStartCall={handleStartCall}
              onRefresh={loadFriends}
            />
          ) : currentRoom ? (
            <ChatArea
              onSendMessage={handleSendMessage}
              onStartCall={activeSection === "dm" ? handleStartCallFromRoom : undefined}
              onStartCallWithUser={handleStartCall}
              onOpenDM={handleOpenDM}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
              Select a channel to get started
            </div>
          )}
        </div>

        <CallOverlay
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onAccept={() => acceptCall().catch(console.error)}
          onReject={rejectCall}
          onEnd={endCall}
        />

        <NotificationToast />
      </div>
    </TooltipProvider>
  );
}
