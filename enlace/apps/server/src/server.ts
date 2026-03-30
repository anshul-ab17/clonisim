import { WebSocketServer } from "ws";
import { RoomManager } from "./roomManager.js";
import { ChatGrpcClient } from "./grpcClient.js";
import { v4 as uuidv4 } from "uuid";

export class WSServer {
  private wss;
  private roomManager = new RoomManager();
  private grpcClient = new ChatGrpcClient();

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

          if (data.type === "join") {
            this.roomManager.join(data.chatId, ws);
            return;
          }

          if (data.type === "message") {
            const saved = await this.grpcClient.sendMessage({
              messageId: uuidv4(),
              userId: data.userId as string,
              chatId: data.chatId as string,
              content: data.content as string,
              userName: data.userName as string,
            });

            this.roomManager.broadcast(data.chatId, {
              type: "message",
              payload: saved,
            });
          }
        } catch (err) {
          console.error("WS error:", err);
        }
      });
    });
  }
}
