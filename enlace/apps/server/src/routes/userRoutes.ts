import { Router, type Router as ExpressRouter } from "express";
import { UserService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const router: ExpressRouter = Router();
const userService = new UserService();

const createUserBody = z.object({ name: z.string().min(1) });

router.post("/", async (req, res) => {
  const parsed = createUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "name required" });
    return;
  }
  const user = await userService.createUser(uuidv4(), parsed.data.name);
  res.json(user);
});

router.get("/:id", async (req, res) => {
  const user = await userService.getUser(req.params["id"]!);
  res.json(user ?? null);
});

export { router as userRoutes };
