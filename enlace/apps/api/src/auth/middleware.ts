import { jwtVerify } from "jose";
import type { NextFunction, Request, Response } from "express";

const secret = new TextEncoder().encode(process.env["JWT_SECRET"] ?? "");

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const token = header.slice(7);
    const { payload } = await jwtVerify(token, secret);
    res.locals["user"] = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
