import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage, Server } from "http";
import { jwtVerify } from "jose";
import { RoomManager } from "./roomManager.js";
import { MessageService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

const roomManager = new RoomManager();
const messageService = new MessageService();
const secret = new TextEncoder().encode(process.env["JWT_SECRET"] ?? "");

export function attachWS(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Unauthorized");
      return;
    }

    try {
      await jwtVerify(token, secret);
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    ws.on("message", async (raw) => {
      try {
        const data = JSON.parse(raw.toString()) as {
          type: string;
          chatId: string;
          userId: string;
          userName: string;
          content: string;
        };

        if (data.type === "join") {
          roomManager.join(data.chatId, ws);
          return;
        }

        if (data.type === "message") {
          const saved = await messageService.sendMessage(
            uuidv4(),
            data.userId,
            data.chatId,
            data.content
          );

          roomManager.broadcast(data.chatId, {
            type: "message",
            payload: {
              ...saved,
              userName: data.userName,
              createdAt: new Date().toISOString(),
            },
          });
        }
      } catch (err) {
        console.error("ws error:", err);
      }
    });
  });
}
