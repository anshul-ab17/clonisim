import { Router, type Router as ExpressRouter } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { UserService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const router: ExpressRouter = Router();
const userService = new UserService();

const secret = new TextEncoder().encode(process.env["JWT_SECRET"] ?? "");

const authBody = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

function makeToken(id: string, name: string) {
  return new SignJWT({ id, name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

router.post("/signin", async (req, res) => {
  const parsed = authBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "name and password required" });
    return;
  }

  const { name, password } = parsed.data;

  const existing = await userService.getUserByName(name.trim());
  if (existing) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const id = uuidv4();
  const hashed = await bcrypt.hash(password, 10);
  const user = await userService.createUser(id, name.trim(), hashed);
  const token = await makeToken(user.id, user.name);

  res.status(201).json({ user, token });
});

router.post("/signup", async (req, res) => {
  const parsed = authBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "name and password required" });
    return;
  }

  const { name, password } = parsed.data;

  const found = await userService.getUserByName(name.trim());
  if (!found || !found.password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, found.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = await makeToken(found.id, found.name);
  res.json({ user: { id: found.id, name: found.name }, token });
});

export { router as authRoutes };
