import { Router, type Router as ExpressRouter } from "express";
import { MessageService } from "@repo/db";

const router: ExpressRouter = Router();
const messageService = new MessageService();

router.get("/:chatId", async (req, res) => {
  const messages = await messageService.getMessages(req.params["chatId"] as string);
  res.json(messages);
});

export { router as messageRoutes };
