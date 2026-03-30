import "dotenv/config";
import { createServer } from "http";
import express, { type RequestHandler } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers.js";
import { authRoutes } from "./auth/routes.js";
import { authMiddleware } from "./auth/middleware.js";
import { userRoutes } from "./routes/userRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { dmRoutes } from "./routes/dmRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { friendRoutes } from "./routes/friendRoutes.js";
import { attachWS } from "./ws/wsServer.js";
import { ChatService } from "@repo/db";

const PORT = 3003;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/dm", authMiddleware, dmRoutes);
app.use("/messages", authMiddleware, messageRoutes);
app.use("/friends", authMiddleware, friendRoutes);

const apollo = new ApolloServer({ typeDefs, resolvers });
await apollo.start();

app.use("/graphql", expressMiddleware(apollo) as unknown as RequestHandler);

const server = createServer(app);

attachWS(server);

// Seed global room
await new ChatService().getOrCreateGlobal();

server.listen(PORT, () => {
  console.log(`http  → http://localhost:${PORT}`);
  console.log(`ws    → ws://localhost:${PORT}`);
  console.log(`gql   → http://localhost:${PORT}/graphql`);
});
