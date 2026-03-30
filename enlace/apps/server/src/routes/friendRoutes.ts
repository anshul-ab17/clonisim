import { Router, type Router as ExpressRouter } from "express";
import { FriendService } from "@repo/db";
import { z } from "zod";

const router: ExpressRouter = Router();
const friendService = new FriendService();

const userIdParam = z.string().min(1);

router.get("/", async (req, res) => {
  const user = res.locals["user"] as { id: string };
  const friends = await friendService.getFriends(user.id);
  res.json(friends);
});

router.get("/requests", async (req, res) => {
  const user = res.locals["user"] as { id: string };
  const requests = await friendService.getPendingRequests(user.id);
  res.json(requests);
});

router.get("/requests/sent", async (req, res) => {
  const user = res.locals["user"] as { id: string };
  const sent = await friendService.getSentRequests(user.id);
  res.json(sent);
});

router.post("/request/:targetId", async (req, res) => {
  const parsed = userIdParam.safeParse(req.params["targetId"]);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid targetId" });
    return;
  }
  const user = res.locals["user"] as { id: string };
  if (user.id === parsed.data) {
    res.status(400).json({ error: "cannot send request to yourself" });
    return;
  }
  const result = await friendService.sendRequest(user.id, parsed.data);
  res.json(result);
});

router.post("/accept/:requesterId", async (req, res) => {
  const parsed = userIdParam.safeParse(req.params["requesterId"]);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid requesterId" });
    return;
  }
  const user = res.locals["user"] as { id: string };
  const result = await friendService.acceptRequest(parsed.data, user.id);
  res.json(result);
});

router.delete("/:friendId", async (req, res) => {
  const parsed = userIdParam.safeParse(req.params["friendId"]);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid friendId" });
    return;
  }
  const user = res.locals["user"] as { id: string };
  await friendService.removeFriend(user.id, parsed.data);
  res.status(204).end();
});

export { router as friendRoutes };
