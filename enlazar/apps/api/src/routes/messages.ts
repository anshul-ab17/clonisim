import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { getMessages, countMessages, saveMessage, joinRoom, findRoomById, createRoom } from "@enlazar/db";
import { generateId, now } from "@enlazar/shared";
import { broadcastMessage } from "../grpc/realtime-client";

const router = Router();

/**
 * GET /messages/:chatId
 * Returns paginated messages for a room.
 */
router.get("/:chatId", authenticate, async (req: AuthRequest, res: Response) => {
  const { chatId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const skip = Number(req.query.skip) || 0;

  try {
    const [messages, total] = await Promise.all([
      getMessages(chatId, limit, skip),
      countMessages(chatId),
    ]);

    res.json({ messages, total, hasMore: skip + messages.length < total });
  } catch (err) {
    console.error("[messages] Fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /messages/:chatId
 * Send a message via REST (also broadcasts via gRPC to Realtime).
 */
router.post("/:chatId", authenticate, async (req: AuthRequest, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body as { content?: string };
  const user = req.user!;

  if (!content?.trim()) {
    res.status(400).json({ message: "Message content cannot be empty" });
    return;
  }

  try {
    let room = await findRoomById(chatId);
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }

    const message = await saveMessage({
      id: generateId(),
      content: content.trim(),
      createdAt: now(),
      userId: user.userId,
      chatId,
    });

    // Best-effort broadcast via gRPC; don't fail the request if realtime is down
    broadcastMessage(message).catch((err) =>
      console.warn("[messages] gRPC broadcast failed:", err)
    );

    res.status(201).json({ message });
  } catch (err) {
    console.error("[messages] Send error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /messages/rooms
 * Create a new room.
 */
router.post("/rooms/create", authenticate, async (req: AuthRequest, res: Response) => {
  const { name } = req.body as { name?: string };
  const user = req.user!;

  if (!name?.trim()) {
    res.status(400).json({ message: "Room name is required" });
    return;
  }

  try {
    const room = await createRoom(generateId(), name.trim());
    await joinRoom(user.userId, room.id);
    res.status(201).json({ room });
  } catch (err) {
    console.error("[rooms] Create error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
