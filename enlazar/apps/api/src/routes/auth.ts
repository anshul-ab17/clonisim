import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateId } from "@enlazar/shared";
import { createUser, findUserByName } from "@enlazar/db";

const router = Router();

/**
 * POST /auth/login
 * Simple username-based auth. Creates the user on first login.
 */
router.post("/login", async (req: Request, res: Response) => {
  const { name } = req.body as { name?: string };

  if (!name || name.trim().length < 2) {
    res.status(400).json({ message: "Name must be at least 2 characters" });
    return;
  }

  try {
    let user = await findUserByName(name.trim());
    if (!user) {
      user = await createUser(generateId(), name.trim());
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name } satisfies import("@enlazar/shared").AuthPayload,
      process.env.JWT_SECRET ?? "secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("[auth] Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
