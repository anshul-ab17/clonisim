import { WebSocketServer } from "ws";
import { RoomManager } from "./roomManager.js";
import { MessageService } from "@repo/db/src/services/message.service";
import { v4 as uuidv4 } from "uuid";

export class WSServer {
  private wss;
  private roomManager = new RoomManager();
  private messageService = new MessageService();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.init();
  }

  private init() {
    this.wss.on("connection", (ws: any) => {
      console.log("Client connected");

      ws.on("message", async (msg: string) => {
        try {
          const data = JSON.parse(msg);

          // 🔗 JOIN
          if (data.type === "join") {
            this.roomManager.join(data.chatId, ws);
            return;
          }

          // 💬 MESSAGE
          if (data.type === "message") {
            const messageId = uuidv4();

            const saved = await this.messageService.sendMessage(
              messageId,
              data.userId,
              data.chatId,
              data.content
            );

            this.roomManager.broadcast(data.chatId, {
              type: "message",
              payload: saved
            });
          }
        } catch (err) {
          console.error("WS error:", err);
        }
      });
    });
  }
}