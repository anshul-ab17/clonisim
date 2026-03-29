import "dotenv/config";
import { WebSocketServer, WebSocket } from "ws";
import { handleMessage } from "./handlers";
import { leaveAllRooms, broadcast } from "./rooms";
import { startGrpcServer } from "./grpc/server";
import { initConstraints } from "@enlazar/db";

const PORT = Number(process.env.REALTIME_PORT ?? 4001);

async function bootstrap() {
  await initConstraints();
  startGrpcServer();

  const wss = new WebSocketServer({ port: PORT });

  wss.on("connection", (ws: WebSocket, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[ws] Client connected from ${ip}`);

    ws.on("message", (data) => {
      handleMessage(ws, data.toString()).catch((err) =>
        console.error("[ws] Unhandled handler error:", err)
      );
    });

    ws.on("close", () => {
      const left = leaveAllRooms(ws);
      for (const { chatId, conn } of left) {
        broadcast(chatId, {
          type: "user_left",
          chatId,
          payload: { userId: conn.userId, name: conn.name },
        });
      }
      console.log(`[ws] Client disconnected (${ip})`);
    });

    ws.on("error", (err) => {
      console.error("[ws] Socket error:", err);
    });
  });

  console.log(`[realtime] WebSocket server listening on ws://localhost:${PORT}`);
}

bootstrap().catch((err) => {
  console.error("[realtime] Fatal startup error:", err);
  process.exit(1);
});
