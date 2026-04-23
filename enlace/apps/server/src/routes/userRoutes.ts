import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../auth/middleware.js";
import { UserService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const router: ExpressRouter = Router();
const userService = new UserService();

const createUserBody = z.object({ name: z.string().min(1) });
const updateProfileBody = z.object({ bio: z.string().max(200) });

router.post("/", async (req, res) => {
  const parsed = createUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "name required" }); return; }
  const user = await userService.createUser(uuidv4(), parsed.data.name);
  res.json(user);
});

// Update own profile (auth required — middleware applied in index.ts)
router.patch("/me", authMiddleware, async (req, res) => {
  const parsed = updateProfileBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid bio" }); return; }
  const user = res.locals["user"] as { id: string };
  const result = await userService.updateProfile(user.id, parsed.data.bio);
  res.json(result);
});

router.get("/by-name/:name", async (req, res) => {
  const user = await userService.getUserByName(req.params["name"]!);
  if (!user) { res.status(404).json({ error: "not found" }); return; }
  res.json({ id: user.id, name: user.name });
});

router.get("/:id", async (req, res) => {
  const user = await userService.getUser(req.params["id"]!);
  res.json(user ?? null);
});

export { router as userRoutes };
