import { Router, type Router as ExpressRouter } from "express";
import { ChatService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

const router: ExpressRouter = Router();
const chatService = new ChatService();

router.get("/", async (_req, res) => {
  const rooms = await chatService.getRooms();
  res.json(rooms);
});

router.post("/", async (req, res) => {
  const { name } = req.body as { name: string };
  const chatId = uuidv4();
  const room = await chatService.createRoom(chatId, name);
  res.json(room);
});

router.post("/:chatId/join", async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body as { userId: string };
  const result = await chatService.joinRoom(userId, chatId as string);
  res.json(result);
});

export { router as chatRoutes };
