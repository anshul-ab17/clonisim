import { useEffect, useRef, useCallback } from "react";
import { ServerWsEvent, ClientWsEvent, Message } from "@enlazar/shared";
import { useStore } from "../store";

const WS_URL = `ws://${window.location.hostname}:4001`;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentUser, activeRoom, appendMessage, setMessages, setUserJoined, setUserLeft } =
    useStore();

  const connect = useCallback(() => {
    if (!currentUser) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[ws] Connected");
      if (activeRoom) {
        ws.send(
          JSON.stringify({
            type: "join",
            chatId: activeRoom.id,
            payload: { userId: currentUser.id, name: currentUser.name },
          } satisfies ClientWsEvent)
        );
      }
    };

    ws.onmessage = (e) => {
      const event: ServerWsEvent = JSON.parse(e.data as string);

      switch (event.type) {
        case "history": {
          const msgs: Message[] = event.payload.messages.map((m) => ({
            ...m,
            chatId: event.chatId,
          }));
          setMessages(event.chatId, msgs);
          break;
        }
        case "message": {
          const msg: Message = {
            id: event.payload.id,
            content: event.payload.content,
            createdAt: event.payload.createdAt,
            authorId: event.payload.authorId,
            authorName: event.payload.authorName,
            chatId: event.chatId,
          };
          appendMessage(event.chatId, msg);
          break;
        }
        case "user_joined":
          setUserJoined(event.chatId, event.payload.userId, event.payload.name);
          break;
        case "user_left":
          setUserLeft(event.chatId, event.payload.userId);
          break;
        case "error":
          console.error("[ws] Server error:", event.payload.message);
          break;
      }
    };

    ws.onclose = () => {
      console.log("[ws] Disconnected — reconnecting in 3s");
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error("[ws] Error:", err);
      ws.close();
    };
  }, [currentUser, activeRoom, appendMessage, setMessages, setUserJoined, setUserLeft]);

  useEffect(() => {
    connect();
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const joinRoom = useCallback(
    (chatId: string) => {
      if (!currentUser || wsRef.current?.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({
          type: "join",
          chatId,
          payload: { userId: currentUser.id, name: currentUser.name },
        } satisfies ClientWsEvent)
      );
    },
    [currentUser]
  );

  const sendMessage = useCallback(
    (chatId: string, content: string) => {
      if (!currentUser || wsRef.current?.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          chatId,
          payload: { content, userId: currentUser.id, name: currentUser.name },
        } satisfies ClientWsEvent)
      );
    },
    [currentUser]
  );

  const leaveRoom = useCallback(
    (chatId: string) => {
      if (!currentUser || wsRef.current?.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(
        JSON.stringify({
          type: "leave",
          chatId,
          payload: { userId: currentUser.id },
        } satisfies ClientWsEvent)
      );
    },
    [currentUser]
  );

  return { joinRoom, sendMessage, leaveRoom };
}
