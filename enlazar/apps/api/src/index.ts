import "dotenv/config";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import jwt from "jsonwebtoken";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import authRouter from "./routes/auth";
import messagesRouter from "./routes/messages";
import { initConstraints } from "@enlazar/db";
import { AuthPayload } from "@enlazar/shared";

const PORT = Number(process.env.API_PORT ?? 4000);

async function bootstrap() {
  await initConstraints();

  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(json());

  // ── REST Routes ─────────────────────────────────────────────────────────────
  app.use("/auth", authRouter);
  app.use("/messages", messagesRouter);

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "api" }));

  // ── Apollo / GraphQL ─────────────────────────────────────────────────────────
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();

  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: async ({ req }) => {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer ")) return {};

        try {
          const user = jwt.verify(
            header.slice(7),
            process.env.JWT_SECRET ?? "secret"
          ) as AuthPayload;
          return { user };
        } catch {
          return {};
        }
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`[api] REST  → http://localhost:${PORT}`);
    console.log(`[api] GraphQL → http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error("[api] Fatal startup error:", err);
  process.exit(1);
});
