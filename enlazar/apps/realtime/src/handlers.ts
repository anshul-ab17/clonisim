import { WebSocket } from "ws";
import {
  ClientWsEvent,
  ServerWsEvent,
  generateId,
  now,
  parseJson,
} from "@enlazar/shared";
import { saveMessage, joinRoom as dbJoinRoom, getMessages } from "@enlazar/db";
import { joinRoom, leaveRoom, broadcast } from "./rooms";

function send(ws: WebSocket, event: ServerWsEvent): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

export async function handleMessage(ws: WebSocket, raw: string): Promise<void> {
  const event = parseJson<ClientWsEvent>(raw);

  if (!event?.type) {
    send(ws, { type: "error", payload: { message: "Invalid event format" } });
    return;
  }

  switch (event.type) {
    case "join": {
      const { chatId, payload } = event;
      const { userId, name } = payload;

      joinRoom(chatId, { ws, userId, name });

      // Persist membership in Neo4j
      dbJoinRoom(userId, chatId).catch((err) =>
        console.error("[ws] DB joinRoom error:", err)
      );

      // Send recent history to the joining client
      getMessages(chatId, 50, 0)
        .then((messages) => {
          send(ws, {
            type: "history",
            chatId,
            payload: {
              messages: messages.map((m) => ({
                id: m.id,
                content: m.content,
                createdAt: m.createdAt,
                authorId: m.authorId,
                authorName: m.authorName,
              })),
            },
          });
        })
        .catch((err) => console.error("[ws] History fetch error:", err));

      // Notify others in the room
      broadcast(chatId, { type: "user_joined", chatId, payload: { userId, name } }, ws);
      break;
    }

    case "leave": {
      const { chatId, payload } = event;
      const removed = leaveRoom(chatId, ws);
      if (removed) {
        broadcast(chatId, {
          type: "user_left",
          chatId,
          payload: { userId: removed.userId, name: removed.name },
        });
      }
      break;
    }

    case "message": {
      const { chatId, payload } = event;
      const { content, userId, name } = payload;

      try {
        const message = await saveMessage({
          id: generateId(),
          content,
          createdAt: now(),
          userId,
          chatId,
        });

        const broadcastEvent: ServerWsEvent = {
          type: "message",
          chatId,
          payload: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            authorId: message.authorId,
            authorName: message.authorName,
          },
        };

        // Echo back to sender + broadcast to rest of room
        send(ws, broadcastEvent);
        broadcast(chatId, broadcastEvent, ws);
      } catch (err) {
        console.error("[ws] Save message error:", err);
        send(ws, { type: "error", payload: { message: "Failed to save message" } });
      }
      break;
    }

    default:
      send(ws, { type: "error", payload: { message: "Unknown event type" } });
  }
}
