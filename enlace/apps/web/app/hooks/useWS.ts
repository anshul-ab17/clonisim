"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useNotificationStore } from "../store/useNotificationStore";
import type { Message } from "../types";

const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:3003";

export function useWS(token: string | null, currentUserName?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const addMessage = useChatStore((s) => s.addMessage);
  const { setIncoming, setPendingAnswer, addPendingCandidate, clear } = useCallStore();
  const addNotification = useNotificationStore((s) => s.add);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as Record<string, unknown>;

      switch (data["type"]) {
        case "message": {
          const msg = data["payload"] as Message;
          const state = useChatStore.getState();
          const isCurrentRoom = state.currentRoom?.chatId === msg.chatId;

          // Check for @mention of current user
          if (
            currentUserName &&
            msg.content.toLowerCase().includes(`@${currentUserName.toLowerCase()}`) &&
            msg.userId !== state.currentRoom?.participantId // not own message check via userName
          ) {
            addNotification({
              type: "mention",
              title: `${msg.userName} mentioned you`,
              body: msg.content,
            });
          }

          // DM from a room that is not currently active
          if (msg.chatId && !isCurrentRoom) {
            const dm = state.dms.find((d) => d.chatId === msg.chatId);
            if (dm) {
              addNotification({
                type: "dm",
                title: `New message from ${msg.userName}`,
                body: msg.content,
              });
            }
          }

          addMessage(msg);
          break;
        }
        case "call-offer":
          setIncoming({
            fromUserId: data["fromUserId"] as string,
            fromUserName: (data["fromUserName"] as string) ?? (data["fromUserId"] as string),
            callType: data["callType"] as "audio" | "video",
            offer: data["offer"] as RTCSessionDescriptionInit,
          });
          break;
        case "call-answer":
          setPendingAnswer(data["answer"] as RTCSessionDescriptionInit);
          break;
        case "call-reject":
        case "call-end":
          clear();
          break;
        case "ice-candidate":
          addPendingCandidate(data["candidate"] as RTCIceCandidateInit);
          break;
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const joinRoom = useCallback(
    (chatId: string) => {
      const doJoin = () => send({ type: "join", chatId });
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        doJoin();
      } else if (wsRef.current) {
        wsRef.current.addEventListener("open", doJoin, { once: true });
      }
    },
    [send]
  );

  return { send, joinRoom, wsRef };
}
