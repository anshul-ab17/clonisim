import { Router, type Router as ExpressRouter } from "express";
import { ChatService } from "@repo/db";
import { z } from "zod";

const router: ExpressRouter = Router();
const chatService = new ChatService();

const dmBody = z.object({ targetUserId: z.string().min(1) });

router.post("/", async (req, res) => {
  const parsed = dmBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "targetUserId required" });
    return;
  }
  const user = res.locals["user"] as { id: string };
  const room = await chatService.getOrCreateDM(user.id, parsed.data.targetUserId);
  res.json(room);
});

export { router as dmRoutes };
