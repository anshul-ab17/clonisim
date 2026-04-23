import { WebSocketServer, type WebSocket } from "ws";
import type { IncomingMessage, Server } from "http";
import { jwtVerify } from "jose";
import { RoomManager } from "./roomManager.js";
import { MessageService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const roomManager = new RoomManager();
const messageService = new MessageService();
const secret = new TextEncoder().encode(process.env["JWT_SECRET"] ?? "");

// user id → websocket (for p2p signaling)
const userSockets = new Map<string, WebSocket>();

const rtcPayload = z.object({}).passthrough();

const wsMessage = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join"), chatId: z.string().min(1) }),
  z.object({
    type: z.literal("message"),
    chatId: z.string().min(1),
    userId: z.string().min(1),
    userName: z.string().min(1),
    content: z.string().min(1),
  }),
  z.object({
    type: z.literal("call-offer"),
    targetUserId: z.string().min(1),
    callType: z.enum(["audio", "video"]),
    offer: rtcPayload,
  }),
  z.object({
    type: z.literal("call-answer"),
    targetUserId: z.string().min(1),
    answer: rtcPayload,
  }),
  z.object({ type: z.literal("call-reject"), targetUserId: z.string().min(1) }),
  z.object({ type: z.literal("call-end"), targetUserId: z.string().min(1) }),
  z.object({
    type: z.literal("ice-candidate"),
    targetUserId: z.string().min(1),
    candidate: rtcPayload,
  }),
]);

function relay(targetUserId: string, payload: object) {
  const target = userSockets.get(targetUserId);
  if (target?.readyState === 1) {
    target.send(JSON.stringify(payload));
  }
}

export function attachWS(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "Unauthorized");
      return;
    }

    let userId: string;
    let userName: string;

    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload["id"] as string;
      userName = payload["name"] as string;
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    userSockets.set(userId, ws);

    ws.on("close", () => {
      userSockets.delete(userId);
    });

    ws.on("message", async (raw) => {
      try {
        const parsed = wsMessage.safeParse(JSON.parse(raw.toString()));
        if (!parsed.success) return;

        const data = parsed.data;

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
            payload: { ...saved, userName: data.userName },
          });
          return;
        }

        // WebRTC signaling — relay to target user
        if (data.type === "call-offer") {
          relay(data.targetUserId, {
            type: "call-offer",
            fromUserId: userId,
            callType: data.callType,
            offer: data.offer,
          });
          return;
        }

        if (data.type === "call-answer") {
          relay(data.targetUserId, {
            type: "call-answer",
            fromUserId: userId,
            answer: data.answer,
          });
          return;
        }

        if (data.type === "call-reject") {
          relay(data.targetUserId, { type: "call-reject", fromUserId: userId });
          return;
        }

        if (data.type === "call-end") {
          relay(data.targetUserId, { type: "call-end", fromUserId: userId });
          return;
        }

        if (data.type === "ice-candidate") {
          relay(data.targetUserId, {
            type: "ice-candidate",
            fromUserId: userId,
            candidate: data.candidate,
          });
          return;
        }
      } catch (err) {
        console.error("ws error:", err);
      }
    });

    // suppress unused warning
    void userName;
  });
}
