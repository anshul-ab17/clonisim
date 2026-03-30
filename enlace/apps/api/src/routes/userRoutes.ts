import { Router, type Router as ExpressRouter } from "express";
import { UserService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

const router: ExpressRouter = Router();
const userService = new UserService();

router.post("/", async (req, res) => {
  const { name } = req.body as { name: string };
  const id = uuidv4();
  const user = await userService.createUser(id, name);
  res.json(user);
});

router.get("/:id", async (req, res) => {
  const user = await userService.getUser(req.params["id"] as string);
  res.json(user ?? null);
});

export { router as userRoutes };
