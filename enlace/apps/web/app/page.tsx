"use client";

import { useEffect, useRef } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { ServerSidebar } from "./components/ServerSidebar";
import { ChannelSidebar } from "./components/ChannelSidebar";
import { ChatArea } from "./components/ChatArea";
import { useUserStore } from "./store/useUserStore";
import { useChatStore } from "./store/useChatStore";
import type { Message, Room } from "./types";

const API_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3003";
const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:3003";

export default function Home() {
  const user = useUserStore((s) => s.user);
  const token = useUserStore((s) => s.token);
  const { setRooms, setCurrentRoom, setMessages, addMessage, currentRoom } =
    useChatStore();
  const wsRef = useRef<WebSocket | null>(null);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  useEffect(() => {
    if (!user || !token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as {
        type: string;
        payload: Message;
      };
      if (data.type === "message") {
        addMessage(data.payload);
      }
    };

    fetch(`${API_URL}/chats`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data: Room[]) => {
        setRooms(data);
        if (data.length > 0) setCurrentRoom(data[0] ?? null);
      })
      .catch(console.error);

    return () => ws.close();
  }, [user, token]);

  useEffect(() => {
    if (!currentRoom || !user || !token) return;

    setMessages([]);

    const join = () => {
      wsRef.current?.send(
        JSON.stringify({ type: "join", chatId: currentRoom.chatId, userId: user.id })
      );
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      join();
    } else if (wsRef.current) {
      wsRef.current.addEventListener("open", join, { once: true });
    }

    fetch(`${API_URL}/messages/${currentRoom.chatId}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data: Message[]) => setMessages(data))
      .catch(console.error);
  }, [currentRoom?.chatId, user?.id]);

  const handleSendMessage = (content: string) => {
    if (!wsRef.current || !currentRoom || !user) return;
    wsRef.current.send(
      JSON.stringify({
        type: "message",
        chatId: currentRoom.chatId,
        userId: user.id,
        userName: user.name,
        content,
      })
    );
  };

  if (!user || !token) {
    return <LoginScreen apiUrl={API_URL} />;
  }

  return (
    <div className="flex h-screen bg-bg-base text-white overflow-hidden">
      <ServerSidebar />
      <ChannelSidebar />
      {currentRoom ? (
        <ChatArea onSendMessage={handleSendMessage} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          No channels available
        </div>
      )}
    </div>
  );
}
