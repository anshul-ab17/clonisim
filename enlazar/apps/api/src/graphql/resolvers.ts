import { AuthPayload, generateId, now } from "@enlazar/shared";
import {
  listUsers,
  listRooms,
  getMessages,
  countMessages,
  saveMessage,
  joinRoom,
  findRoomById,
  createRoom,
  findUserById,
} from "@enlazar/db";
import { broadcastMessage } from "../grpc/realtime-client";
import { GraphQLError } from "graphql";

interface Context {
  user?: AuthPayload;
}

function requireAuth(ctx: Context): AuthPayload {
  if (!ctx.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.user;
}

export const resolvers = {
  Query: {
    users: () => listUsers(),

    chats: () => listRooms(),

    messages: async (
      _: unknown,
      { chatId, limit = 50, skip = 0 }: { chatId: string; limit?: number; skip?: number }
    ) => {
      const [messages, total] = await Promise.all([
        getMessages(chatId, limit, skip),
        countMessages(chatId),
      ]);
      return { messages, total, hasMore: skip + messages.length < total };
    },

    me: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.user) return null;
      return findUserById(ctx.user.userId);
    },
  },

  Mutation: {
    sendMessage: async (
      _: unknown,
      { chatId, content }: { chatId: string; content: string },
      ctx: Context
    ) => {
      const user = requireAuth(ctx);

      const room = await findRoomById(chatId);
      if (!room) throw new GraphQLError("Room not found", { extensions: { code: "NOT_FOUND" } });

      const message = await saveMessage({
        id: generateId(),
        content: content.trim(),
        createdAt: now(),
        userId: user.userId,
        chatId,
      });

      broadcastMessage(message).catch((err) =>
        console.warn("[gql] gRPC broadcast failed:", err)
      );

      return message;
    },

    joinRoom: async (
      _: unknown,
      { chatId }: { chatId: string },
      ctx: Context
    ) => {
      const user = requireAuth(ctx);

      const room = await findRoomById(chatId);
      if (!room) throw new GraphQLError("Room not found", { extensions: { code: "NOT_FOUND" } });

      await joinRoom(user.userId, chatId);
      return room;
    },

    createRoom: async (
      _: unknown,
      { name }: { name: string },
      ctx: Context
    ) => {
      const user = requireAuth(ctx);
      const room = await createRoom(generateId(), name.trim());
      await joinRoom(user.userId, room.id);
      return room;
    },
  },
};
