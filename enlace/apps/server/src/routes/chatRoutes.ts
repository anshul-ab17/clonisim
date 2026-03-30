import { Router, type Router as ExpressRouter } from "express";
import { ChatService } from "@repo/db";
import { z } from "zod";

const router: ExpressRouter = Router();
const chatService = new ChatService();

const createChannelBody = z.object({ name: z.string().min(1) });
const joinBody = z.object({ userId: z.string().min(1) });

// Global chat
router.get("/global", async (_req, res) => {
  const room = await chatService.getOrCreateGlobal();
  res.json(room);
});

// Channels
router.get("/channels", async (_req, res) => {
  const channels = await chatService.getChannels();
  res.json(channels);
});

router.post("/channels", async (req, res) => {
  const parsed = createChannelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "name required" });
    return;
  }
  const room = await chatService.createChannel(parsed.data.name);
  res.json(room);
});

router.post("/channels/:chatId/join", async (req, res) => {
  const parsed = joinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const result = await chatService.joinRoom(parsed.data.userId, req.params["chatId"]!);
  res.json(result);
});

export { router as chatRoutes };
